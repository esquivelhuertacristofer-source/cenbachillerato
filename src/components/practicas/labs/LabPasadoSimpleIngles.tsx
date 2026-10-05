"use client";

/**
 * Laboratorio — Past Simple: el lunes con Dan (diálogo ramificado)
 * Práctica experimental para IN-III-P01-A4 (Inglés III).
 *
 * Es lunes y Dan (compañero FICTICIO) pregunta qué hiciste el fin de semana.
 * El alumno no clasifica verbos: CUENTA su fin de semana. En cuatro escenas
 * elige qué hizo (tarjetas con imagen), el marcador de tiempo (yesterday,
 * last…, …ago) y el verbo en pasado. Dan reacciona:
 *  · marcador de futuro («Next Friday») → «¡pero eso aún no pasa!»;
 *  · forma equivocada (goed, eated, studyed…) → se confunde y se explica por qué;
 *  · frase correcta → contesta con algo distinto según lo que elegiste y la
 *    escena se agrega a la línea de tiempo del fin de semana.
 * Dos escenas más piden lo aprendido: el negativo («I didn't go») sobre la
 * actividad que descartaste el viernes, y la pregunta («Did you play…?»).
 * Las consecuencias salen de `pasado-simple-ingles-sim.ts`.
 *
 * Modos: «El lunes con Dan» (simulador) y «Complete the text» (se escribe).
 * La teoría verbatim (verbos regulares/irregulares, formas, oraciones, dato)
 * vive en la pestaña «Teoría». DOM puro (sin three.js).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { PASADO_SIMPLE_INGLES_HUECOS } from "./pasado-simple-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { PASADO_SIMPLE_INGLES_FICHA } from "./pasado-simple-ingles-ficha";
import { VERBOS, TIPO_INFO, FORMAS, ORACIONES, QUIZ, DATO_PASADO, type TipoVerbo } from "./pasado-simple-ingles-data";
import {
  ESCENAS,
  CONSIGNA_PREGUNTA,
  OPCIONES_PREGUNTA,
  RESPUESTA_DAN,
  evaluarRelato,
  fichasVerbo,
  fraseRelato,
  opcionesNegativo,
  preguntaNegativo,
  type Actividad,
  type OpcionFrase,
  type ResultadoRelato,
} from "./pasado-simple-ingles-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const AZUL = "#5BC8FF";
const RETO_KEY = "cen-pasado-simple-reto";
const RUTA_SIM = "/media/labs-sim/pasado-simple-ingles";
const TOTAL_PASOS = ESCENAS.length + 2;

type Modo = "lunes" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "lunes", label: "El lunes con Dan", icono: "fa-comments" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

type Tono = "ok" | "mal" | "duda" | "neutro";
const COLOR_TONO: Record<Tono, string> = { ok: OK, mal: NO, duda: AMBAR, neutro: "rgba(255,255,255,0.7)" };
const ICONO_TONO: Record<Tono, string> = { ok: "fa-face-smile-beam", mal: "fa-face-frown", duda: "fa-face-meh", neutro: "fa-face-smile" };

interface Linea {
  actId: string;
  frase: string;
}

export function LabPasadoSimpleIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("lunes");

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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── estado del simulador ──────────────────────────────────────────────
  const [paso, setPaso] = useState(0);
  const [actSel, setActSel] = useState<string | null>(null);
  const [marcador, setMarcador] = useState<string | null>(null);
  const [verbo, setVerbo] = useState<string | null>(null);
  const [reac, setReac] = useState<ResultadoRelato | null>(null);
  /** El fin de semana que se va armando: id de escena → lo que contaste. */
  const [linea, setLinea] = useState<Record<string, Linea>>({});
  const [tipos, setTipos] = useState<TipoVerbo[]>([]);
  const [negDone, setNegDone] = useState(false);
  const [preDone, setPreDone] = useState(false);
  /** Reacción de Dan en las escenas 5 y 6. */
  const [reacFrase, setReacFrase] = useState<OpcionFrase | null>(null);

  const escenasHechas = Object.keys(linea).length;
  const pasosHechos = [...ESCENAS.map((e) => !!linea[e.id]), negDone, preDone];
  const simDone = pasosHechos.every(Boolean);

  const actividadElegida = (escId: string): Actividad | undefined => {
    const esc = ESCENAS.find((e) => e.id === escId);
    return esc?.opciones.find((o) => o.id === linea[escId]?.actId);
  };

  const resetSim = () => {
    setPaso(0);
    setActSel(null);
    setMarcador(null);
    setVerbo(null);
    setReac(null);
    setLinea({});
    setTipos([]);
    setNegDone(false);
    setPreDone(false);
    setReacFrase(null);
    partida.reiniciar();
    setModo("lunes");
  };
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : resetSim;

  const irAPaso = (i: number) => {
    sfxClick();
    setPaso(i);
    setActSel(null);
    setMarcador(null);
    setVerbo(null);
    setReac(null);
    setReacFrase(null);
  };

  const esc = paso < ESCENAS.length ? ESCENAS[paso]! : null;
  const actual: Actividad | null = esc ? (esc.opciones.find((o) => o.id === (linea[esc.id]?.actId ?? actSel)) ?? null) : null;

  const contar = () => {
    if (!esc || !actual || !marcador || !verbo || linea[esc.id]) return;
    const res = evaluarRelato(esc, actual, marcador, verbo);
    setReac(res);
    if (res.veredicto === "bien") {
      sfxPlace();
      setLinea((l) => ({ ...l, [esc.id]: { actId: actual.id, frase: res.frase ?? fraseRelato(marcador, verbo, actual) } }));
      setTipos((t) => (t.includes(actual.tipo) ? t : [...t, actual.tipo]));
    } else {
      sfxNo();
    }
  };

  const responderFrase = (op: OpcionFrase) => {
    if (op.ok) {
      sfxPlace();
      if (paso === ESCENAS.length) setNegDone(true);
      else setPreDone(true);
    } else {
      sfxNo();
    }
    setReacFrase(op);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modosHechos = (simDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los dos modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 2);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Cuéntale a Dan tu fin de semana: 4 escenas con el pasado correcto", done: escenasHechas >= ESCENAS.length },
    { txt: "Usa un verbo regular y uno irregular", done: tipos.includes("regular") && tipos.includes("irregular") },
    { txt: "Contesta con didn't y pregunta con Did", done: negDone && preDone },
    { txt: "Consigue 3★ (simulador y texto, con pocos errores)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const lectura =
    modo === "lunes"
      ? `${pasosHechos.filter(Boolean).length}/${TOTAL_PASOS} respuestas · ${bestEstrellas}★`
      : `${textoDone ? "Texto completo" : "Escribe cada hueco"} · ${bestEstrellas}★`;

  // ── lo que dice Dan ───────────────────────────────────────────────────
  const rechazada = (() => {
    const e1 = ESCENAS[0]!;
    const hecha = linea[e1.id];
    return hecha ? e1.opciones.find((o) => o.id !== hecha.actId) : undefined;
  })();
  const ecoPrevio = paso > 0 && paso < ESCENAS.length ? actividadElegida(ESCENAS[paso - 1]!.id)?.eco : undefined;

  let danTexto = "";
  let danEs = "";
  let tono: Tono = "neutro";
  if (esc) {
    if (reac) {
      danTexto = reac.ingles;
      danEs = reac.es;
      tono = reac.veredicto === "bien" ? "ok" : reac.veredicto === "marcador" ? "duda" : "mal";
    } else {
      danTexto = `${ecoPrevio ? `${ecoPrevio} ` : ""}${esc.pregunta}`;
      danEs = `${esc.momento}: elige qué hiciste y cuéntaselo.`;
    }
  } else if (paso === ESCENAS.length) {
    if (reacFrase) {
      danTexto = reacFrase.ok ? "Oh, I see! Thanks for telling me." : "Sorry? I don't understand.";
      danEs = reacFrase.porque;
      tono = reacFrase.ok ? "ok" : "mal";
    } else {
      danTexto = rechazada ? preguntaNegativo(rechazada) : "Complete Friday first.";
      danEs = "Dan pregunta por lo que NO hiciste el viernes. Contéstale que no.";
    }
  } else {
    if (reacFrase) {
      danTexto = reacFrase.ok ? RESPUESTA_DAN : "Sorry? What do you mean?";
      danEs = reacFrase.porque;
      tono = reacFrase.ok ? "ok" : "mal";
    } else {
      danTexto = CONSIGNA_PREGUNTA;
      danEs = "Ahora tú preguntas: arma la pregunta en pasado.";
    }
  }

  const nReg = Object.keys(linea).filter((k) => actividadElegida(k)?.tipo === "regular").length;
  const nIrr = escenasHechas - nReg;

  // ── escena ────────────────────────────────────────────────────────────
  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "lunes" && (
        <>
          <div className="pas-pasos" role="tablist" aria-label="Escenas del fin de semana">
            {ESCENAS.map((e, i) => (
              <button key={e.id} type="button" role="tab" aria-selected={paso === i} className="pas-paso" data-on={paso === i} data-done={pasosHechos[i]} disabled={i > 0 && !pasosHechos[i - 1]} onClick={() => irAPaso(i)}>
                <i className={`fa-solid ${pasosHechos[i] ? "fa-circle-check" : e.icono}`} aria-hidden />
                {e.titulo}
              </button>
            ))}
            <button type="button" role="tab" aria-selected={paso === ESCENAS.length} className="pas-paso" data-on={paso === ESCENAS.length} data-done={negDone} disabled={!pasosHechos[ESCENAS.length - 1]} onClick={() => irAPaso(ESCENAS.length)}>
              <i className={`fa-solid ${negDone ? "fa-circle-check" : "fa-ban"}`} aria-hidden /> No, I didn&apos;t
            </button>
            <button type="button" role="tab" aria-selected={paso === ESCENAS.length + 1} className="pas-paso" data-on={paso === ESCENAS.length + 1} data-done={preDone} disabled={!negDone} onClick={() => irAPaso(ESCENAS.length + 1)}>
              <i className={`fa-solid ${preDone ? "fa-circle-check" : "fa-circle-question"}`} aria-hidden /> Did you…?
            </button>
          </div>

          <div className="pas-dan" role="status">
            <div className="pas-avatar" style={{ borderColor: COLOR_TONO[tono], color: COLOR_TONO[tono] }}>
              <i className={`fa-solid ${ICONO_TONO[tono]}`} aria-hidden />
            </div>
            <div className="pas-burbuja" style={{ borderColor: tono === "neutro" ? undefined : `${COLOR_TONO[tono]}88` }}>
              <div className="pas-nombre">Dan</div>
              <div className="pas-ing">{danTexto}</div>
              <div className="pas-es">{danEs}</div>
            </div>
          </div>

          {esc && (
            <div className="pas-bloque">
              <div className="pas-opciones">
                {esc.opciones.map((o) => {
                  const hecha = linea[esc.id]?.actId === o.id;
                  const bloqueada = !!linea[esc.id] && !hecha;
                  return (
                    <button key={o.id} type="button" className="pas-op" data-sel={(actSel ?? linea[esc.id]?.actId) === o.id} data-hecha={hecha} disabled={bloqueada} aria-pressed={(actSel ?? linea[esc.id]?.actId) === o.id} onClick={() => {
                      sfxClick();
                      setActSel(o.id);
                      setVerbo(null);
                      setReac(null);
                    }}>
                      <Foto clave={o.clave} icono={o.icono} />
                      <span className="pas-op-txt">{o.es}</span>
                    </button>
                  );
                })}
              </div>

              {actual && (
                <div className="pas-constructor">
                  <div className="pas-etq">1. ¿Cuándo? Elige el marcador de tiempo</div>
                  <div className="pas-fichas" role="group" aria-label="Marcador de tiempo">
                    {esc.marcadores.map((mk) => (
                      <button key={mk.texto} type="button" className="pas-ficha" data-sel={marcador === mk.texto} disabled={!!linea[esc.id]} onClick={() => {
                        sfxClick();
                        setMarcador(mk.texto);
                      }}>
                        {mk.texto}
                      </button>
                    ))}
                  </div>
                  <div className="pas-etq">
                    2. ¿Qué verbo? Pasado de <em>{actual.base}</em>
                  </div>
                  <div className="pas-fichas" role="group" aria-label="Verbo en pasado">
                    {fichasVerbo(actual).map((f) => (
                      <button key={f} type="button" className="pas-ficha" data-sel={verbo === f} disabled={!!linea[esc.id]} onClick={() => {
                        sfxClick();
                        setVerbo(f);
                      }}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="pas-frase" aria-live="polite">
                    <strong>{linea[esc.id]?.frase ?? `${marcador ?? "…"}, I ${verbo ?? "____"} ${actual.compl}.`}</strong>
                  </div>
                  <div className="pas-acciones">
                    {!linea[esc.id] && (
                      <button type="button" className="pas-decir" disabled={!marcador || !verbo} onClick={contar}>
                        <i className="fa-solid fa-comment-dots" aria-hidden /> Tell Dan
                      </button>
                    )}
                    {linea[esc.id] && (
                      <button type="button" className="pas-sig" onClick={() => irAPaso(paso + 1)}>
                        Next question <i className="fa-solid fa-arrow-right" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!esc && (
            <div className="pas-bloque">
              <div className="pas-etq">{paso === ESCENAS.length ? "Contesta a Dan" : "Haz la pregunta"}</div>
              <div className="pas-lista">
                {(paso === ESCENAS.length ? (rechazada ? opcionesNegativo(rechazada) : []) : OPCIONES_PREGUNTA).map((op) => (
                  <button key={op.texto} type="button" className="pas-resp" data-ok={reacFrase?.texto === op.texto ? op.ok : undefined} disabled={paso === ESCENAS.length ? negDone : preDone} onClick={() => responderFrase(op)}>
                    {op.texto}
                  </button>
                ))}
              </div>
              {paso === ESCENAS.length && negDone && (
                <div className="pas-acciones">
                  <button type="button" className="pas-sig" onClick={() => irAPaso(paso + 1)}>
                    Next question <i className="fa-solid fa-arrow-right" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pas-tiempo" aria-label="Tu fin de semana">
            <div className="pas-etq">Tu fin de semana</div>
            <div className="pas-tl">
              {ESCENAS.map((e) => {
                const l = linea[e.id];
                const a = l ? e.opciones.find((o) => o.id === l.actId) : undefined;
                const col = a?.tipo === "regular" ? AZUL : AMBAR;
                return (
                  <div key={e.id} className="pas-tl-item" data-llena={!!l} style={l ? { borderColor: `${col}88` } : undefined}>
                    <div className="pas-tl-top">
                      <i className={`fa-solid ${a?.icono ?? e.icono}`} aria-hidden style={{ color: l ? col : undefined }} />
                      <span>{e.momento}</span>
                    </div>
                    <div className="pas-tl-frase">{l ? l.frase : "…"}</div>
                    {a && <span className="pas-tag" style={{ color: col, borderColor: `${col}66` }}>{a.tipo === "regular" ? `regular · ${a.base} → ${a.pasado}` : `irregular · ${a.base} → ${a.pasado}`}</span>}
                  </div>
                );
              })}
            </div>
            {simDone && (
              <div className="pas-resumen">
                <i className="fa-solid fa-trophy" aria-hidden /> Dan: «What a weekend!» Usaste {nReg} verbo(s) regular(es) y {nIrr} irregular(es), y supiste negar y preguntar en pasado.
              </div>
            )}
          </div>
        </>
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={PASADO_SIMPLE_INGLES_HUECOS}
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
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    lunes: "Regular → solo agrega -ed (walk → walked; study → studied). Irregular → forma especial que se memoriza (go → went). Marcadores de pasado: yesterday, last…, …ago. Para negar y preguntar: didn't / Did + verbo base.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escena}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "texto" ? "Reiniciar este modo" : "Reiniciar la plática"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "You mastered the Past Simple!" : "Termina la plática con Dan y el texto para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-clipboard-question",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Teoría de la práctica" icono="fa-book-open">
                <FichaTeorica data={PASADO_SIMPLE_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Regular o irregular" icono="fa-table-columns">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(["regular", "irregular"] as TipoVerbo[]).map((t) => (
                    <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>
                        {TIPO_INFO[t].titulo} · {TIPO_INFO[t].subtitulo}.
                      </strong>{" "}
                      {VERBOS.filter((v) => v.tipo === t)
                        .map((v) => `${v.base} → ${v.pasado} (${v.es})`)
                        .join(", ")}
                      . <em style={{ color: T.text3 }}>{TIPO_INFO[t].ejemplo}</em>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Formas que hay que evitar" icono="fa-screwdriver-wrench">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FORMAS.map((f) => (
                    <div key={f.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>
                        {f.base} → {f.pasado}.
                      </strong>{" "}
                      {f.nota}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Oraciones con marcadores de tiempo" icono="fa-pen-fancy">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ORACIONES.map((o) => (
                    <div key={o.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      {o.antes} <strong style={{ color: OK }}>{o.resp}</strong> {o.despues} <em style={{ color: T.text3 }}>({o.nota})</em>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_PASADO}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas de la escena
 * ═══════════════════════════════════════════════════════════════════════════ */

function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <span className="pas-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </span>
  );
}

const ESTILOS = (accent: string, rgba: string) => `
  .pas-pasos { display:flex; flex-wrap:wrap; gap:8px; }
  .pas-paso { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:11px; font-size:14px; font-weight:800;
    border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; }
  .pas-paso:disabled { opacity:.45; cursor:not-allowed; }
  .pas-paso[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
  .pas-paso[data-done="true"] i { color:${OK}; }
  .pas-dan { display:flex; gap:12px; align-items:flex-start; }
  .pas-avatar { flex-shrink:0; width:52px; height:52px; border-radius:50%; border:2px solid; display:flex; align-items:center; justify-content:center;
    font-size:26px; background:rgba(2,12,28,0.6); transition:all .2s; }
  .pas-burbuja { flex:1; min-width:0; padding:11px 14px; border-radius:6px 16px 16px 16px; border:1.5px solid ${T.line}; background:${T.glass}; display:grid; gap:4px; }
  .pas-nombre { font-size:13px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
  .pas-ing { font-size:16px; font-weight:800; color:#fff; line-height:1.35; }
  .pas-es { font-size:14px; color:${T.text2}; line-height:1.45; }
  .pas-bloque { display:grid; gap:12px; }
  .pas-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:12px; }
  .pas-op { cursor:pointer; text-align:left; display:flex; flex-direction:column; border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; color:#fff;
    padding:0; overflow:hidden; font:inherit; min-width:0; transition:border-color .15s, box-shadow .15s; }
  .pas-op:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .pas-op:disabled { opacity:.4; cursor:not-allowed; }
  .pas-op[data-sel="true"] { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.22); }
  .pas-op[data-hecha="true"] { border-color:${OK}; background:${OK}14; }
  .pas-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:36px; color:rgba(255,255,255,0.35); overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); }
  .pas-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .pas-op-txt { padding:11px 14px 13px; font-size:15px; font-weight:800; line-height:1.3; }
  .pas-constructor { display:grid; gap:10px; padding:14px; border-radius:16px; border:1.5px solid ${T.line}; background:${T.inset}; }
  .pas-etq { font-size:13px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:${T.text3}; }
  .pas-etq em { color:#fff; font-style:normal; }
  .pas-fichas { display:flex; flex-wrap:wrap; gap:8px; }
  .pas-ficha { cursor:pointer; min-height:44px; padding:10px 16px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:800; transition:all .14s; }
  .pas-ficha:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .pas-ficha:disabled { opacity:.6; cursor:default; }
  .pas-ficha[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 14px -5px ${accent}; }
  .pas-frase { font-size:18px; color:#fff; line-height:1.4; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.05); }
  .pas-acciones { display:flex; flex-wrap:wrap; gap:10px; }
  .pas-decir, .pas-sig { cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:9px; padding:10px 18px; border-radius:11px; font-size:15px; font-weight:900; border:none; }
  .pas-decir { background:${accent}; color:#04121f; }
  .pas-decir:disabled { opacity:.4; cursor:not-allowed; }
  .pas-sig { background:${OK}22; color:${OK}; border:1.5px solid ${OK}88; }
  .pas-lista { display:grid; gap:8px; }
  .pas-resp { cursor:pointer; text-align:left; min-height:44px; padding:11px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; font-weight:700; }
  .pas-resp:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .pas-resp[data-ok="true"] { border-color:${OK}; background:${OK}1c; }
  .pas-resp[data-ok="false"] { border-color:${NO}; background:${NO}1c; }
  .pas-resp:disabled { cursor:default; }
  .pas-tiempo { display:grid; gap:10px; }
  .pas-tl { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:10px; }
  .pas-tl-item { display:grid; gap:6px; align-content:start; padding:11px 12px; border-radius:14px; border:1.5px dashed ${T.line}; background:${T.glass}; min-width:0; }
  .pas-tl-item[data-llena="true"] { border-style:solid; }
  .pas-tl-top { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .pas-tl-frase { font-size:15px; color:#fff; line-height:1.4; }
  .pas-tag { justify-self:start; font-size:13px; font-weight:800; padding:2px 9px; border-radius:999px; border:1px solid; }
  .pas-resumen { padding:12px 14px; border-radius:14px; background:${OK}14; border:1px solid ${OK}66; font-size:15px; line-height:1.45; color:#fff; }
  .pas-resumen i { color:${OK}; margin-right:6px; }
  .pas-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; }
  .pas-q:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .pas-q:disabled { cursor:default; }
  .pas-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; border-radius:11px; border:1.5px solid ${T.line};
    background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; }
  .pas-btn:disabled { opacity:.4; cursor:not-allowed; }
  @media (prefers-reduced-motion: reduce){ .pas-avatar { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (pestaña Reto)
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
    <div style={{ display: "grid", gap: 16 }}>
      <Bloque titulo="Comprueba lo aprendido" icono="fa-clipboard-question">
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Cinco afirmaciones sobre el pasado simple. Decide si son verdaderas o falsas y pulsa «Comprobar».
          {aprobado && (
            <span style={{ marginLeft: 8, color: OK, fontWeight: 800 }}>
              <i className="fa-solid fa-circle-check" /> Aprobado
            </span>
          )}
        </div>
      </Bloque>

      {QUIZ.map((q, qi) => {
        const elegida = resp[qi];
        return (
          <div key={qi}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 10, display: "flex", gap: 10 }}>
              <span style={{ color: accent }}>{qi + 1}.</span>
              <span>{q.pregunta}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 9 }}>
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
                  <button key={oi} className="pas-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                    <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                      {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                  </button>
                );
              })}
            </div>
            {comprobado && (
              <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 3 }} />
                <span>{q.retro}</span>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="pas-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pas-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 14px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas</span>}
          </div>
        )}
      </div>
    </div>
  );
}
