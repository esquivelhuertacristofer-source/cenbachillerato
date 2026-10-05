"use client";

/**
 * Laboratorio — Possession: mine or yours?
 * Práctica experimental para IN-I-P08-A4 (Inglés I).
 *
 * SIMULADOR: la oficina de objetos perdidos de una escuela ficticia. La
 * etiqueta que escribe el alumno decide A QUIÉN le entrega el objeto el
 * empleado; una forma equivocada lo manda con la persona incorrecta o lo deja
 * en la caja.
 *  1. «Saxon genitive» — completa la etiqueta con 's, ' o nada: solo la forma
 *     correcta devuelve el objeto a su dueño.
 *  2. «Complete the sentence» — elige el posesivo de cada oración: señala a
 *     una persona distinta o no se entiende.
 *  3. «Adjective or pronoun?» — prueba cada palabra en dos etiquetas
 *     («___ backpack» / «The backpack is ___») y ve cuál se lee bien.
 *  4. «Complete the text» — escribe los huecos (verbatim de la progresión).
 *  + Reto y Teoría en el panel.
 *
 * DOM puro. Contenido VERBATIM de IN-I·P08 (A1 lectura, A2 fill_blanks, A4
 * quiz, A5 V/F, A6 glosario). Personas y escuela FICTICIAS.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { POSESIVOS_INGLES_HUECOS } from "./posesivos-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { POSESIVOS_INGLES_FICHA } from "./posesivos-ingles-ficha";
import {
  GENITIVOS,
  MARCADORES,
  ORACIONES,
  POSESIVOS,
  BIN_INFO,
  QUIZ,
  DATO_POSESION,
  OFICINA,
  OBJETOS,
  CASOS_ORACION,
  OBJETO_GENITIVO,
  motivoMarcador,
  PLANTILLA_ADJ,
  PLANTILLA_PRON,
  type BinPos,
  type ObjetoPerdido,
  type Persona,
} from "./posesivos-ingles-data";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const RETO_KEY = "cen-posesivos-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/posesivos-ingles";

type Modo = "genitivo" | "oraciones" | "clasifica" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "genitivo", label: "Saxon genitive", icono: "fa-quote-right" },
  { id: "oraciones", label: "Complete the sentence", icono: "fa-pen-fancy" },
  { id: "clasifica", label: "Adjective or pronoun?", icono: "fa-table-columns" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

type MarcaGen = "'s" | "'" | "";

export function LabPosesivosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("genitivo");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
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

  const [toco, setToco] = useState(false);

  // ── modo 1: genitivo sajón ────────────────────────────────────────────
  const [genSel, setGenSel] = useState<Record<string, MarcaGen | undefined>>({});
  const genBien = (id: string) => genSel[id] === GENITIVOS.find((g) => g.id === id)!.marker;
  const genitivoDone = GENITIVOS.every((g) => genBien(g.id));
  const elegirGen = (id: string, m: MarcaGen) => {
    if (genSel[id] === m) return;
    const sig = { ...genSel, [id]: m };
    setGenSel(sig);
    setToco(true);
    if (m === GENITIVOS.find((g) => g.id === id)!.marker) sfxPlace();
    else sfxNo();
    if (GENITIVOS.every((g) => sig[g.id] === g.marker) && !genitivoDone) {
      sfxOk();
      persistMejor(true, oracionesDone, clasificaDone);
    }
  };
  const resetGenitivo = () => setGenSel({});

  // ── modo 2: oraciones ─────────────────────────────────────────────────
  const [oraSel, setOraSel] = useState<Record<string, string | undefined>>({});
  const oraBien = (id: string) => oraSel[id] === ORACIONES.find((o) => o.id === id)!.resp;
  const oracionesDone = ORACIONES.every((o) => oraBien(o.id));
  const elegirOra = (id: string, w: string) => {
    if (oraSel[id] === w) return;
    const sig = { ...oraSel, [id]: w };
    setOraSel(sig);
    setToco(true);
    if (w === ORACIONES.find((o) => o.id === id)!.resp) sfxPlace();
    else sfxNo();
    if (ORACIONES.every((o) => sig[o.id] === o.resp) && !oracionesDone) {
      sfxOk();
      persistMejor(genitivoDone, true, clasificaDone);
    }
  };
  const resetOraciones = () => setOraSel({});

  // ── modo 3: adjetivo o pronombre (la etiqueta se prueba en dos lugares) ─
  const [clasSel, setClasSel] = useState<Record<string, BinPos | undefined>>({});
  const clasBien = (id: string) => clasSel[id] === POSESIVOS.find((p) => p.id === id)!.bin;
  const nClas = POSESIVOS.filter((p) => clasBien(p.id)).length;
  const clasificaDone = nClas >= POSESIVOS.length;
  const probar = (id: string, bin: BinPos) => {
    if (clasSel[id] === bin) return;
    const sig = { ...clasSel, [id]: bin };
    setClasSel(sig);
    if (bin === POSESIVOS.find((p) => p.id === id)!.bin) sfxPlace();
    else sfxNo();
    if (POSESIVOS.every((p) => sig[p.id] === p.bin) && !clasificaDone) {
      sfxOk();
      persistMejor(genitivoDone, oracionesDone, true);
    }
  };
  const resetClasifica = () => setClasSel({});

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const nGen = GENITIVOS.filter((g) => genBien(g.id)).length;
  const nOra = ORACIONES.filter((o) => oraBien(o.id)).length;
  const modosHechos = (genitivoDone ? 1 : 0) + (oracionesDone ? 1 : 0) + (clasificaDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Elige una forma y mira a quién le da el objeto el empleado", done: toco },
    { txt: "Forma los 4 genitivos sajones con el marcador correcto", done: genitivoDone },
    { txt: "Completa las 8 oraciones con el posesivo adecuado", done: oracionesDone },
    { txt: "Clasifica los 10 posesivos (adjetivo / pronombre)", done: clasificaDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "genitivo" ? resetGenitivo : modo === "oraciones" ? resetOraciones : resetClasifica;

  const lectura =
    modo === "genitivo" ? (
      <>Objetos devueltos: {nGen}/{GENITIVOS.length}</>
    ) : modo === "oraciones" ? (
      <>Objetos con su dueño: {nOra}/{ORACIONES.length}</>
    ) : modo === "clasifica" ? (
      <>Etiquetas bien leídas: {nClas}/{POSESIVOS.length}</>
    ) : (
      <>Repaso de la teoría de la práctica</>
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

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={POSESIVOS_INGLES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "genitivo" && (
            <>
              <Oficina titulo={`${OFICINA.nombre}. Cierra cada etiqueta con la marca correcta.`} />
              <div className="pos-lista">
                {GENITIVOS.map((g) => {
                  const sel = genSel[g.id];
                  const ok = sel === g.marker;
                  const obj = OBJETOS[OBJETO_GENITIVO[g.id] ?? "libro"]!;
                  const dueno: Persona = { id: "dueno", nombre: g.dueno, icono: g.plural ? "fa-users" : "fa-user" };
                  const etiqueta = `${g.dueno}${sel ?? "…"} ${g.noun}`;
                  return (
                    <CasoObjeto
                      key={g.id}
                      objeto={obj}
                      personas={[dueno]}
                      duenoId="dueno"
                      holder={sel === undefined ? undefined : ok ? "dueno" : "caja"}
                      frase={
                        <>
                          <span className="pos-es">{g.es}</span>
                          <span className="pos-etiqueta">
                            {g.dueno}
                            <span className="pos-opts" role="radiogroup" aria-label="Marca de posesión">
                              {([...MARCADORES.map((m) => m.label), ""] as MarcaGen[]).map((m) => (
                                <button key={m || "nada"} type="button" role="radio" aria-checked={sel === m} className="pos-opt" data-on={sel === m} onClick={() => elegirGen(g.id, m)}>
                                  {m === "" ? "—" : m}
                                </button>
                              ))}
                            </span>
                            {g.noun}
                          </span>
                        </>
                      }
                      lectura={
                        sel === undefined
                          ? "Elige cómo cierra la palabra del dueño y mira qué hace el empleado."
                          : ok
                            ? `Lee «${etiqueta}» y entrega el objeto a su dueño. ${g.regla}`
                            : `«${etiqueta}» no se entiende. ${motivoMarcador(g, sel)} Lo deja en la caja.`
                      }
                      ok={ok}
                      elegido={sel !== undefined}
                    />
                  );
                })}
              </div>
            </>
          )}

          {modo === "oraciones" && (
            <>
              <Oficina titulo={`${OFICINA.nombre}. El posesivo que elijas señala a una persona.`} />
              <div className="pos-lista">
                {CASOS_ORACION.map((c) => {
                  const o = ORACIONES.find((x) => x.id === c.id)!;
                  const sel = oraSel[c.id];
                  const op = c.opciones.find((x) => x.w === sel);
                  const ok = sel === o.resp;
                  const obj = OBJETOS[c.objeto]!;
                  const holder = !op ? undefined : op.apunta ?? "caja";
                  const apunta = op?.apunta ? c.personas.find((p) => p.id === op.apunta) : undefined;
                  return (
                    <CasoObjeto
                      key={c.id}
                      objeto={obj}
                      personas={c.personas}
                      duenoId={c.dueno}
                      holder={holder}
                      frase={
                        <span className="pos-etiqueta">
                          {o.antes}
                          <span className="pos-opts" role="radiogroup" aria-label="Palabra del hueco">
                            {c.opciones.map((x) => (
                              <button key={x.w} type="button" role="radio" aria-checked={sel === x.w} className="pos-opt" data-on={sel === x.w} onClick={() => elegirOra(c.id, x.w)}>
                                {x.w}
                              </button>
                            ))}
                          </span>
                          {o.despues}
                        </span>
                      }
                      lectura={
                        !op
                          ? "Elige una palabra y mira a quién se lo entrega el empleado."
                          : ok
                            ? `«${op.w}» señala a ${apunta?.nombre}: el empleado entrega el objeto a su dueño. (${o.nota})`
                            : apunta
                              ? `«${op.w}» señala a ${apunta.nombre}: el empleado le entrega el objeto a quien no es su dueño.`
                              : `${op.motivo}: la etiqueta no se entiende y el objeto se queda en la caja.`
                      }
                      ok={ok}
                      elegido={!!op}
                    />
                  );
                })}
              </div>
            </>
          )}

          {modo === "clasifica" && (
            <>
              <Oficina titulo={`${OFICINA.nombre}. Prueba cada palabra en las dos etiquetas posibles.`} />
              <div className="pos-lista">
                {POSESIVOS.map((p) => {
                  const sel = clasSel[p.id];
                  const ok = sel === p.bin;
                  const frase = sel === "adj" ? PLANTILLA_ADJ(p.palabra) : sel === "pron" ? PLANTILLA_PRON(p.palabra) : undefined;
                  return (
                    <div key={p.id} className="pos-caso" data-ok={sel ? ok : undefined} data-mal={!!sel && !ok}>
                      <div className="pos-clas-cab">
                        <strong className="pos-palabra">{p.palabra}</strong>
                        <span className="pos-es">{p.es}</span>
                      </div>
                      <div className="pos-opts" role="radiogroup" aria-label={`¿Dónde va «${p.palabra}»?`}>
                        <button type="button" role="radio" aria-checked={sel === "adj"} className="pos-opt pos-opt-largo" data-on={sel === "adj"} onClick={() => probar(p.id, "adj")}>
                          «___ backpack»
                        </button>
                        <button type="button" role="radio" aria-checked={sel === "pron"} className="pos-opt pos-opt-largo" data-on={sel === "pron"} onClick={() => probar(p.id, "pron")}>
                          «The backpack is ___»
                        </button>
                      </div>
                      <div className="pos-lector" data-ok={sel ? ok : undefined}>
                        <span className="pos-etq" data-mal={!!sel && !ok}>
                          <i className={`fa-solid ${!sel ? "fa-tag" : ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />
                          {frase ?? "Elige dónde la pones"}
                        </span>
                        <span className="pos-lee">
                          {!sel
                            ? "La etiqueta se imprime con la palabra en el lugar que elijas."
                            : ok
                              ? `Se lee bien: ${BIN_INFO[p.bin].titulo.toLowerCase()}, ${BIN_INFO[p.bin].subtitulo.toLowerCase()}.`
                              : p.bin === "adj"
                                ? `«${p.palabra}» no puede quedarse solo: es adjetivo y necesita un sustantivo después.`
                                : `«${p.palabra}» ya sustituye al sustantivo: es pronombre y va solo, no antes de «backpack».`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
                  <Dato label="Genitivos" value={`${nGen}/${GENITIVOS.length}`} col={genitivoDone ? OK : undefined} />
                  <Dato label="Oraciones" value={`${nOra}/${ORACIONES.length}`} col={oracionesDone ? OK : undefined} />
                  <Dato label="Posesivos" value={`${nClas}/${POSESIVOS.length}`} col={clasificaDone ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Dominas los posesivos!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "genitivo" && "Poseedor singular → 's. Plural terminado en s → solo '. Prueba las tres opciones y mira qué hace el empleado."}
                  {modo === "oraciones" && "Si la palabra va antes de un sustantivo es adjetivo (my, his, their…); si va sola es pronombre (mine, hers…)."}
                  {modo === "clasifica" && "Adjetivo: va ANTES de un sustantivo. Pronombre: va SOLO, sin sustantivo."}
                  {modo === "texto" && "Completa cada hueco escribiendo la palabra que falta."}
                </p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Genitivo sajón" icono="fa-quote-right">
                {GENITIVOS.map((g) => (
                  <p key={g.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.es}.</strong> {g.regla}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Adjetivo o pronombre" icono="fa-table-columns">
                {(["adj", "pron"] as BinPos[]).map((b) => (
                  <p key={b} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{BIN_INFO[b].titulo}</strong> ({BIN_INFO[b].subtitulo}). {BIN_INFO[b].ejemplo}.
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  {POSESIVOS.map((p) => `${p.palabra} = ${p.es}`).join(" · ")}
                </p>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_POSESION}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={POSESIVOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/** Banner de la oficina; si la imagen aún no existe queda el degradado con el ícono. */
function Oficina({ titulo }: { titulo: string }) {
  const [hay, setHay] = useState(true);
  return (
    <div className="pos-foto">
      <i className="fa-solid fa-box-open" aria-hidden />
      {hay && <img src={`${RUTA_FOTOS}/objetos-perdidos.webp`} alt="" loading="lazy" onError={() => setHay(false)} />}
      <span>{titulo}</span>
    </div>
  );
}

function ObjetoImg({ objeto }: { objeto: ObjetoPerdido }) {
  const [hay, setHay] = useState(true);
  return (
    <span className="pos-obj" title={objeto.nombre}>
      <i className={`fa-solid ${objeto.icono}`} aria-hidden />
      {hay && objeto.clave && <img src={`${RUTA_FOTOS}/${objeto.clave}.webp`} alt="" loading="lazy" onError={() => setHay(false)} />}
    </span>
  );
}

/**
 * Un objeto y quien lo tiene: la caja de perdidos o una de las personas. El
 * objeto SE MUEVE hacia el avatar que la etiqueta señala.
 */
function CasoObjeto({ objeto, personas, duenoId, holder, frase, lectura, ok, elegido }: {
  objeto: ObjetoPerdido;
  personas: Persona[];
  duenoId: string;
  holder: string | undefined;
  frase: ReactNode;
  lectura: string;
  ok: boolean;
  elegido: boolean;
}) {
  const lugares: Persona[] = [{ id: "caja", nombre: "Caja de perdidos", icono: "fa-box-open" }, ...personas];
  const donde = holder ?? "caja";
  return (
    <div className="pos-caso" data-ok={elegido ? ok : undefined} data-mal={elegido && !ok}>
      <div className="pos-frase">{frase}</div>
      <div className="pos-lugares">
        {lugares.map((l) => {
          const aqui = donde === l.id;
          return (
            <span key={l.id} className="pos-lugar" data-aqui={aqui} data-dueno={l.id === duenoId} data-bien={aqui && l.id === duenoId}>
              <span className="pos-av"><i className={`fa-solid ${l.icono}`} aria-hidden /></span>
              <span className="pos-nom">{l.nombre}</span>
              {aqui && <ObjetoImg objeto={objeto} />}
            </span>
          );
        })}
      </div>
      <div className="pos-lector" data-ok={elegido ? ok : undefined}>
        <span className="pos-lee"><em>{OFICINA.empleado}</em>{lectura}</span>
      </div>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  .pos-foto { position:relative; height:clamp(84px, 16vw, 130px); border-radius:14px; overflow:hidden; display:flex; align-items:flex-end;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.95)); border:1px solid ${T.line}; }
  .pos-foto > i { position:absolute; right:18px; top:50%; transform:translateY(-50%); font-size:46px; color:rgba(255,255,255,0.18); }
  .pos-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .pos-foto span { position:relative; padding:8px 12px; font-size:14px; font-weight:800; color:#fff; width:100%;
    background:linear-gradient(0deg, rgba(3,8,18,0.88), transparent); text-shadow:0 1px 6px rgba(0,0,0,0.8); }
  .pos-lista { display:grid; gap:12px; }
  .pos-caso { display:grid; gap:10px; padding:14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; transition:border-color .2s, background .2s; }
  .pos-caso[data-ok="true"] { border-color:${OK}66; background:${OK}0d; }
  .pos-caso[data-mal="true"] { border-color:${NO}66; }
  .pos-frase { display:grid; gap:6px; font-size:16px; line-height:1.6; color:#fff; font-weight:600; }
  .pos-es { font-size:14px; color:${T.text3}; font-weight:700; }
  .pos-etiqueta { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
  .pos-opts { display:inline-flex; flex-wrap:wrap; gap:6px; }
  .pos-opt { cursor:pointer; padding:8px 14px; border-radius:999px; border:1.5px solid ${T.lineStrong}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:800; min-height:40px; min-width:44px; font-family:ui-monospace, monospace; transition:all .14s; }
  .pos-opt-largo { font-family:inherit; font-size:14px; }
  .pos-opt:hover { border-color:${accent}; }
  .pos-opt[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.28); box-shadow:0 0 14px -5px ${accent}; }
  .pos-lugares { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:8px; }
  .pos-lugar { position:relative; display:flex; align-items:center; gap:8px; padding:8px 10px; min-height:60px; border-radius:12px;
    border:1.5px dashed ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; transition:all .25s; }
  .pos-lugar[data-aqui="true"] { border-style:solid; border-color:${NO}88; background:${NO}12; color:#fff; }
  .pos-lugar[data-bien="true"] { border-color:${OK}; background:${OK}1a; }
  .pos-lugar[data-dueno="true"] .pos-av { color:${accent}; }
  .pos-av { font-size:18px; display:flex; }
  .pos-nom { flex:1; min-width:0; line-height:1.2; }
  .pos-obj { position:relative; width:44px; height:44px; flex-shrink:0; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,0.1); font-size:20px; color:#fff; animation:posLlega .35s ease; }
  .pos-obj img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  @keyframes posLlega { from { transform:translateY(-16px) scale(.7); opacity:0; } to { transform:none; opacity:1; } }
  .pos-lector { padding:10px 12px; border-radius:12px; background:${T.inset}; border-left:4px solid ${T.lineStrong}; display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
  .pos-lector[data-ok="true"] { border-left-color:${OK}; }
  .pos-lector[data-ok="false"] { border-left-color:${NO}; }
  .pos-lee { flex:1 1 200px; min-width:0; display:grid; gap:3px; font-size:14px; color:${T.text2}; line-height:1.45; }
  .pos-lee em { font-style:normal; font-weight:800; color:${T.text3}; }
  .pos-clas-cab { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
  .pos-palabra { font-size:20px; color:#fff; font-family:ui-monospace, monospace; }
  .pos-etq { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; background:#fff; color:#10202f; font-size:15px; font-weight:800; }
  .pos-etq[data-mal="true"] { background:${NO}22; color:#fff; text-decoration:line-through; }
  .pos-etq i { color:${OK}; }
  .pos-etq[data-mal="true"] i { color:${NO}; }
  .pos-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .pos-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .pos-q:disabled{ cursor:default; }
  .pos-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .pos-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){ .pos-obj { animation:none; } .pos-lugar, .pos-caso { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión
 * ═══════════════════════════════════════════════════════════════════════════ */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };
  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };
  const reintentar = () => {
    setResp(QUIZ.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "16px 16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre el genitivo sajón y los pronombres posesivos. Responde y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button key={oi} className="pos-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="pos-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pos-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
