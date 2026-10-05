"use client";

/**
 * Laboratorio — Concordancia y conectores: el hilo del texto.
 * Práctica experimental para LC-I-P06-A4 (Lengua y Comunicación I).
 *
 * SIMULADOR: el alumno EDITA mensajes ficticios y ve, literalmente, qué
 * entiende el lector.
 *  1. «Escribe el aviso» — un aviso del grupo a la tutora. Cada forma que el
 *     alumno elige (fue/fueron/fuimos…) cambia la imagen mental del lector:
 *     una concordancia rota deja un «¿?» visible y baja la claridad del aviso.
 *  2. «Mensajes con sentido» — cuatro mensajes con un hueco de conector. Un
 *     conector equivocado VOLTEA el sentido (porque / aunque / por lo tanto)
 *     y el lector lo interpreta al pie de la letra.
 *  3. «Escribe el término» (glosario) y 4. «Completa el texto» (huecos).
 *  + Reto de comprensión y Teoría en el panel.
 *
 * DOM puro. Contenido VERBATIM de LC-I·P06 (A1 lectura, A2 quiz, A4
 * fill_blanks, A5 V/F, A6 glosario). Personas y escuela FICTICIAS.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CONCORDANCIA_CONECTORES_HUECOS } from "./concordancia-conectores-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CONCORDANCIA_CONECTORES_FICHA } from "./concordancia-conectores-ficha";
import {
  REPARACIONES,
  FRASES,
  GLOSARIO,
  QUIZ,
  DATO_CONCORDANCIA,
  AVISOS,
  AVISO_LECTOR,
  AVISO_GRUPO,
  ESCENAS_CONECTOR,
  RELACION_INFO,
} from "./concordancia-conectores-data";

const NO = "#FF5E5E";
const AVISO_COL = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-concordancia-conectores-reto";
const RUTA_FOTOS = "/media/labs-sim/concordancia-conectores";

type Modo = "reparar" | "conectores" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "reparar", label: "Escribe el aviso", icono: "fa-pen-ruler" },
  { id: "conectores", label: "Mensajes con sentido", icono: "fa-link" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Estado inicial del aviso: cada oración llega con el error de A1. */
const AVISO_INICIAL = (): Record<string, string> => Object.fromEntries(REPARACIONES.map((r) => [r.id, r.mal]));

export function LabConcordanciaConectores({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("reparar");

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

  // ── simulador 1: el aviso ─────────────────────────────────────────────
  const [aviso, setAviso] = useState<Record<string, string>>(AVISO_INICIAL);
  const [tocoAviso, setTocoAviso] = useState(false);
  const bienAviso = (id: string) => aviso[id] === REPARACIONES.find((r) => r.id === id)!.bien;
  const nBienAviso = REPARACIONES.filter((r) => bienAviso(r.id)).length;
  const reparadoDone = nBienAviso >= REPARACIONES.length;

  const elegirAviso = (id: string, forma: string) => {
    if (aviso[id] === forma) return;
    const sig = { ...aviso, [id]: forma };
    setAviso(sig);
    setTocoAviso(true);
    const ok = forma === REPARACIONES.find((r) => r.id === id)!.bien;
    if (ok) sfxPlace();
    else sfxNo();
    const todas = REPARACIONES.every((r) => sig[r.id] === r.bien);
    if (todas && !reparadoDone) {
      sfxOk();
      persistMejor(true, conectoresDone, glosarioDone);
    }
  };
  const resetReparar = () => setAviso(AVISO_INICIAL());

  // ── simulador 2: mensajes con conector ────────────────────────────────
  const [conSel, setConSel] = useState<Record<string, string | undefined>>({});
  const [volteoSentido, setVolteoSentido] = useState(false);
  const conBien = (id: string) => conSel[id] === FRASES.find((f) => f.id === id)!.conector;
  const nBienCon = FRASES.filter((f) => conBien(f.id)).length;
  const conectoresDone = nBienCon >= FRASES.length;

  const elegirCon = (id: string, conector: string) => {
    if (conSel[id] === conector) return;
    const sig = { ...conSel, [id]: conector };
    setConSel(sig);
    const ok = conector === FRASES.find((f) => f.id === id)!.conector;
    if (ok) sfxPlace();
    else {
      setVolteoSentido(true);
      sfxNo();
    }
    const todas = FRASES.every((f) => sig[f.id] === f.conector);
    if (todas && !conectoresDone) {
      sfxOk();
      persistMejor(reparadoDone, true, glosarioDone);
    }
  };
  const resetConectores = () => setConSel({});

  // ── glosario ──────────────────────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modosHechos = (reparadoDone ? 1 : 0) + (conectoresDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Cambia una forma del aviso y mira cómo lo lee la tutora", done: tocoAviso },
    { txt: "Repara las 4 oraciones con error de concordancia", done: reparadoDone },
    { txt: "Elige un conector que voltee el sentido y lee la reacción", done: volteoSentido },
    { txt: "Coloca los 4 conectores en su lugar", done: conectoresDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "reparar" ? resetReparar : modo === "conectores" ? resetConectores : resetGlosario;

  const claridad = Math.round((nBienAviso / REPARACIONES.length) * 100);
  const lectura =
    modo === "reparar" ? (
      <>Claridad del aviso: {claridad}%</>
    ) : modo === "conectores" ? (
      <>Mensajes bien entendidos: {nBienCon}/{FRASES.length}</>
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
              data={CONCORDANCIA_CONECTORES_HUECOS}
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

          {modo === "reparar" && (
            <>
              <Foto clave="aviso-tablero" icono="fa-clipboard" titulo={AVISO_GRUPO} />
              <div className="cc-medidor" data-bajo={claridad < 100}>
                <span className="cc-med-cara">
                  <i className={`fa-solid ${claridad === 100 ? "fa-face-smile-beam" : claridad >= 50 ? "fa-face-meh" : "fa-face-frown-open"}`} aria-hidden />
                </span>
                <span className="cc-med-cuerpo">
                  <span>
                    <strong>{AVISO_LECTOR.nombre}</strong> · {claridad === 100 ? "«Entendido, gracias por avisar.»" : claridad >= 50 ? "«Entiendo la mitad… ¿me lo puedes aclarar?»" : "«No entiendo nada de este aviso.»"}
                  </span>
                  <span className="cc-barra"><span style={{ width: `${claridad}%` }} /></span>
                </span>
                <strong className="cc-med-pct">{claridad}%</strong>
              </div>
              <div className="cc-lista">
                {REPARACIONES.map((r) => {
                  const esc = AVISOS.find((a) => a.id === r.id)!;
                  const actual = esc.opciones.find((o) => o.forma === aviso[r.id])!;
                  const ok = aviso[r.id] === r.bien;
                  return (
                    <div key={r.id} className="cc-caso" data-ok={ok}>
                      <div className="cc-frase">
                        <span>{r.antes}</span>
                        <span className="cc-opts" role="radiogroup" aria-label="Forma de la palabra">
                          {esc.opciones.map((o) => (
                            <button key={o.forma} type="button" role="radio" aria-checked={aviso[r.id] === o.forma} className="cc-opt" data-on={aviso[r.id] === o.forma} onClick={() => elegirAviso(r.id, o.forma)}>
                              {o.forma}
                            </button>
                          ))}
                        </span>
                        <span>{r.despues}</span>
                      </div>
                      <div className="cc-lector" data-ok={ok}>
                        <span className="cc-imagen" aria-hidden>
                          {Array.from({ length: actual.vis.n }).map((_, i) => (
                            <i key={i} className={`fa-solid ${actual.vis.icono}`} />
                          ))}
                          {actual.vis.duda && <b>?</b>}
                        </span>
                        <span className="cc-lee">
                          <em>Lo que imagina {AVISO_LECTOR.nombre}</em>
                          {actual.lectura}
                          {ok && <small>{r.regla}</small>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {modo === "conectores" && (
            <>
              <Foto clave="autobus-descompuesto" icono="fa-bus" titulo="Mensajes del grupo: cada conector cambia lo que entiende quien los lee" />
              <div className="cc-lista">
                {ESCENAS_CONECTOR.map((e) => {
                  const f = FRASES.find((x) => x.id === e.id)!;
                  const sel = conSel[e.id];
                  const op = e.opciones.find((o) => o.conector === sel);
                  const ok = sel === f.conector;
                  const rel = op ? RELACION_INFO[op.relacion] : undefined;
                  return (
                    <div key={e.id} className="cc-caso" data-ok={ok} data-mal={!!op && !ok}>
                      <div className="cc-frase">
                        <span>{f.antes}</span>
                        <span className="cc-opts" role="radiogroup" aria-label="Conector">
                          {e.opciones.map((o) => (
                            <button key={o.conector} type="button" role="radio" aria-checked={sel === o.conector} className="cc-opt" data-on={sel === o.conector} onClick={() => elegirCon(e.id, o.conector)}>
                              {o.conector}
                            </button>
                          ))}
                        </span>
                        <span>{f.despues}</span>
                      </div>
                      <div className="cc-flujo" data-ok={ok}>
                        <span className="cc-idea">{e.ideaA}</span>
                        <span className="cc-rel" data-vacio={!op}>
                          <i className={`fa-solid ${rel ? rel.icono : "fa-question"}`} aria-hidden />
                          {rel ? rel.etiqueta : "¿cómo se relacionan?"}
                        </span>
                        <span className="cc-idea">{e.ideaB}</span>
                      </div>
                      <div className="cc-lector" data-ok={ok}>
                        <span className="cc-lee">
                          <em>{op ? `Así lo lee ${e.quien}` : e.quien}</em>
                          {op ? op.lectura : "Sin conector, las dos ideas quedan sueltas: no sabe cómo se relacionan."}
                          {ok && <small>Tipo de relación: {f.tipo}.</small>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={GLOSARIO}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(reparadoDone, conectoresDone, true);
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
                  <Dato label="Aviso claro" value={`${nBienAviso}/${REPARACIONES.length}`} col={reparadoDone ? OK : undefined} />
                  <Dato label="Sentido bien" value={`${nBienCon}/${FRASES.length}`} col={conectoresDone ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Dominas la concordancia y los conectores!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "reparar" && "Sustantivo y adjetivo concuerdan en género y número; sujeto y verbo, en número y persona. Prueba cada forma y mira el «?» del lector."}
                  {modo === "conectores" && "porque = causa · además = adición · como = comparación. Cambia el conector y mira cómo se voltea la relación entre las dos ideas."}
                  {modo === "glosario" && "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial."}
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
              <Bloque titulo="Las cuatro reglas del aviso" icono="fa-screwdriver-wrench">
                {REPARACIONES.map((r) => (
                  <p key={r.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{r.antes} {r.bien} {r.despues}</strong> {r.regla}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Conectores del ejercicio" icono="fa-link">
                {FRASES.map((f) => (
                  <p key={f.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{f.conector}</strong> ({f.tipo}): {f.antes} {f.conector} {f.despues}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_CONCORDANCIA}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONCORDANCIA_CONECTORES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/** Imagen de escena con respaldo: si el archivo aún no existe, queda el degradado y el ícono. */
function Foto({ clave, icono, titulo }: { clave: string; icono: string; titulo: string }) {
  const [hay, setHay] = useState(true);
  return (
    <div className="cc-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {hay && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setHay(false)} />}
      <span>{titulo}</span>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  .cc-foto { position:relative; height:clamp(84px, 16vw, 130px); border-radius:14px; overflow:hidden; display:flex; align-items:flex-end;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.95)); border:1px solid ${T.line}; }
  .cc-foto > i { position:absolute; right:18px; top:50%; transform:translateY(-50%); font-size:46px; color:rgba(255,255,255,0.18); }
  .cc-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cc-foto span { position:relative; padding:8px 12px; font-size:14px; font-weight:800; color:#fff; width:100%;
    background:linear-gradient(0deg, rgba(3,8,18,0.88), transparent); text-shadow:0 1px 6px rgba(0,0,0,0.8); }
  .cc-medidor { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; border:1.5px solid ${OK}66; background:${OK}12; }
  .cc-medidor[data-bajo="true"] { border-color:${AVISO_COL}66; background:${AVISO_COL}10; }
  .cc-med-cara { font-size:30px; color:${OK}; display:flex; }
  .cc-medidor[data-bajo="true"] .cc-med-cara { color:${AVISO_COL}; }
  .cc-med-cuerpo { flex:1; min-width:0; display:grid; gap:6px; font-size:14px; color:${T.text2}; line-height:1.4; }
  .cc-med-cuerpo strong { color:#fff; }
  .cc-barra { display:block; height:8px; border-radius:99px; background:rgba(255,255,255,0.14); overflow:hidden; }
  .cc-barra > span { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg, ${AVISO_COL}, ${OK}); transition:width .35s ease; }
  .cc-med-pct { font-size:20px; font-variant-numeric:tabular-nums; color:#fff; }
  .cc-lista { display:grid; gap:12px; }
  .cc-caso { display:grid; gap:10px; padding:14px; border-radius:14px; border:1.5px solid ${AVISO_COL}55; background:${T.glass}; transition:border-color .2s, background .2s; }
  .cc-caso[data-ok="true"] { border-color:${OK}66; background:${OK}0d; }
  .cc-caso[data-mal="true"] { border-color:${NO}66; }
  .cc-frase { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:16px; line-height:1.6; color:#fff; font-weight:600; }
  .cc-opts { display:inline-flex; flex-wrap:wrap; gap:6px; }
  .cc-opt { cursor:pointer; padding:8px 14px; border-radius:999px; border:1.5px solid ${T.lineStrong}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:800; min-height:40px; transition:all .14s; }
  .cc-opt:hover { border-color:${accent}; }
  .cc-opt[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.28); box-shadow:0 0 14px -5px ${accent}; }
  .cc-lector { display:flex; gap:12px; align-items:center; flex-wrap:wrap; padding:10px 12px; border-radius:12px; background:${T.inset}; border-left:4px solid ${AVISO_COL}; }
  .cc-lector[data-ok="true"] { border-left-color:${OK}; }
  .cc-imagen { display:inline-flex; flex-wrap:wrap; gap:4px; align-items:center; min-width:48px; font-size:20px; color:rgba(255,255,255,0.85); }
  .cc-imagen b { font-size:22px; color:${AVISO_COL}; margin-left:4px; }
  .cc-lee { flex:1 1 200px; min-width:0; display:grid; gap:3px; font-size:14px; color:${T.text2}; line-height:1.45; }
  .cc-lee em { font-style:normal; font-size:14px; font-weight:800; color:${T.text3}; }
  .cc-lee small { font-size:14px; color:${OK}; font-weight:700; }
  .cc-flujo { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); gap:8px; align-items:center; }
  .cc-idea { padding:8px 10px; border-radius:10px; background:${T.glassSoft}; border:1px solid ${T.line}; font-size:14px; font-weight:700; color:#fff; text-align:center; }
  .cc-rel { display:inline-flex; flex-direction:column; align-items:center; gap:2px; padding:6px 10px; border-radius:10px; font-size:14px; font-weight:800;
    color:${AVISO_COL}; border:1px dashed ${AVISO_COL}88; text-align:center; max-width:150px; line-height:1.25; }
  .cc-rel i { font-size:17px; }
  .cc-flujo[data-ok="true"] .cc-rel { color:${OK}; border-color:${OK}88; border-style:solid; }
  .cc-rel[data-vacio="true"] { color:${T.text3}; border-color:${T.lineStrong}; }
  @media (max-width: 560px) { .cc-flujo { grid-template-columns:1fr; } .cc-rel { max-width:none; flex-direction:row; justify-content:center; } }
  .cc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .cc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .cc-q:disabled{ cursor:default; }
  .cc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .cc-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){ .cc-barra > span, .cc-opt, .cc-caso { transition:none; } }
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
        Cinco preguntas sobre concordancia gramatical y uso de conectores. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="cc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cc-btn" onClick={reintentar}>
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
