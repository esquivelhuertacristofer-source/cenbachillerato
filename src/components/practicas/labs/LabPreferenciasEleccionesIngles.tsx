"use client";

/**
 * Laboratorio — Elige y justifica (Inglés IV · IN-IV-P02).
 * «Expresa y justifica preferencias de forma respetuosa (compara elecciones
 * personales en contextos cotidianos)».
 *
 * EXPERIMENTO CENTRAL — «Student council»: el comité estudiantil de una prepa
 * ficticia elige el viaje de fin de semestre. El alumno escoge su opción y la
 * defiende en cuatro turnos, armando cada intervención con tres piezas
 * (apertura · preferencia · razón). Cada pieza mueve tres medidores —claridad,
 * respeto y convencimiento—, la cara de cada personaje y su intención de voto.
 * Una frase grosera cierra al grupo (lo que digas ya no convence); una razón
 * falsa la desmiente la ficha del viaje. Al final se vota. Personajes, escuela,
 * lugares y cifras son ficticios (simulación).
 *
 * Modos:
 *  · «Student council» — el simulador.
 *  · «Write your reply» — el alumno ESCRIBE su respuesta a un amigo; un
 *    analizador detecta las estructuras del glosario (A5), los errores de la
 *    progresión y la grosería, y el amigo reacciona. El glosario cuenta aquí.
 *  · «Complete the text» — fill_blanks IN-IV-P02-A6 verbatim.
 *  + Reto (A4 + A2 verbatim) en la pestaña «Reto»; la teoría vive en «Teoría».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de IN-IV-P02 (A1–A7, A9).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { PREFERENCIAS_ELECCIONES_INGLES_HUECOS } from "./preferencias-elecciones-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { PREFERENCIAS_ELECCIONES_INGLES_FICHA } from "./preferencias-elecciones-ingles-ficha";
import {
  GLOSARIO,
  GLOSARIO_ACTIVIDAD_FINAL,
  LECTURA_SABIAS,
  LECTURA_PREGUNTAS,
  QUIZ,
  QUIZ_MINIMO,
  REFLEXION,
  AUTOEVALUACION,
  AUTOEVALUACION_REFLEXION,
  VIDEO_TITULO,
  VIDEO_DESCRIPCION,
  VIDEO_PREGUNTAS,
  type EstructuraId,
} from "./preferencias-elecciones-ingles-data";
import {
  OPCIONES,
  PRONOSTICO,
  PERSONAJES,
  ORDEN_PERSONAJES,
  ANIMO_INFO,
  TURNOS,
  INICIO,
  UMBRAL_CIERRE,
  CONDICION_VOTO,
  DANI_PROMPTS,
  DANI_RESPUESTAS,
  ARRANQUES,
  otraOpcion,
  frase,
  evaluaTurno,
  animosTras,
  inclinacion,
  votos,
  finalDe,
  analizaFrase,
  type OpcionId,
  type Medidores,
  type ResultadoTurno,
  type PersonajeId,
  type Animo,
  type AnalisisFrase,
  type Tono,
} from "./preferencias-elecciones-ingles-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const ORO = "#FFC75A";
const RETO_KEY = "cen-ingles-preferencias-elecciones-reto";
const RUTA_FOTOS = "/media/labs-sim/preferencias-elecciones-ingles";

type Modo = "comite" | "escribe" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "comite", label: "Student council", icono: "fa-people-group" },
  { id: "escribe", label: "Write your reply", icono: "fa-keyboard" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

const ANIMOS_INICIO: Record<PersonajeId, Animo> = { sofia: "atento", marco: "atento", lupita: "atento", rios: "atento" };

const TONO_COLOR: Record<Tono, string> = { bien: OK, debil: ORO, vacia: ORO, gramatica: "#FF9F5A", falsa: "#FF9F5A", grosera: NO };

interface Dicho {
  turno: number;
  texto: string;
  tono: Tono;
}

interface Mensaje {
  de: "dani" | "tu";
  en: string;
  es?: string;
  efecto?: AnalisisFrase["efecto"];
}

const chatInicial = (): Mensaje[] => [{ de: "dani", en: DANI_PROMPTS[0]!.en, es: DANI_PROMPTS[0]!.es }];

export function LabPreferenciasEleccionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("comite");

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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── simulador: Student council ────────────────────────────────────────
  const [opcion, setOpcion] = useState<OpcionId | null>(null);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [sel, setSel] = useState<(string | null)[]>([null, null, null]);
  const [resultado, setResultado] = useState<ResultadoTurno | null>(null);
  const [medidores, setMedidores] = useState<Medidores>(INICIO);
  const [animos, setAnimos] = useState<Record<PersonajeId, Animo>>(ANIMOS_INICIO);
  const [cerradoAlgunaVez, setCerradoAlgunaVez] = useState(false);
  const [dichos, setDichos] = useState<Dicho[]>([]);
  const [respondioBien, setRespondioBien] = useState(false);
  const [simFin, setSimFin] = useState(false);
  const [simWin, setSimWin] = useState(false);
  const [mejorVotos, setMejorVotos] = useState(0);

  const enFinal = turnoIdx >= TURNOS.length;
  const turno = TURNOS[Math.min(turnoIdx, TURNOS.length - 1)]!;
  const piezasSel = turno.piezas.map((lista, i) => lista.find((p) => p.id === sel[i]));
  const listo = piezasSel.every(Boolean);
  const cerradoAhora = medidores.resp < UMBRAL_CIERRE;
  const votosAhora = votos(medidores, cerradoAlgunaVez);
  const aFavor = Object.values(votosAhora).filter(Boolean).length;

  const elegirOpcion = (op: OpcionId) => {
    setOpcion(op);
    sfxBlip();
  };
  const elegirPieza = (slot: number, id: string) => {
    if (resultado || enFinal) return;
    setSel((s) => s.map((v, i) => (i === slot ? id : v)));
    sfxBlip();
  };
  const decir = () => {
    if (!opcion || !listo || resultado || enFinal) return;
    const piezas = piezasSel.filter((p): p is NonNullable<typeof p> => !!p);
    const r = evaluaTurno(turno, piezas, opcion, medidores);
    const nuevoCerrado = cerradoAlgunaVez || r.cerrado;
    setResultado(r);
    setMedidores(r.despues);
    setCerradoAlgunaVez(nuevoCerrado);
    setAnimos(animosTras(turno, r, nuevoCerrado));
    setDichos((d) => [...d.filter((x) => x.turno !== turnoIdx), { turno: turnoIdx, texto: frase(piezas, opcion), tono: r.tono }]);
    if (turnoIdx === 0 && r.tono === "bien") setRespondioBien(true);
    const malas = r.notas.filter((n) => n.tono === "mal").length;
    if (malas > 0) for (let i = 0; i < malas; i++) sfxNo();
    else if (r.tono === "bien") sfxPlace();
    else sfxBlip();
  };
  const siguiente = () => {
    if (!resultado) return;
    setResultado(null);
    setSel([null, null, null]);
    if (turnoIdx + 1 >= TURNOS.length) {
      setTurnoIdx(TURNOS.length);
      setSimFin(true);
      const v = votos(medidores, cerradoAlgunaVez);
      const n = Object.values(v).filter(Boolean).length;
      if (n > mejorVotos) setMejorVotos(n);
      if (n >= 3 && !cerradoAlgunaVez) {
        setSimWin(true);
        sfxOk();
        persistMejor(true, glosarioDone, textoDone);
      }
    } else {
      setTurnoIdx((i) => i + 1);
    }
  };
  const resetComite = () => {
    setOpcion(null);
    setTurnoIdx(0);
    setSel([null, null, null]);
    setResultado(null);
    setMedidores(INICIO);
    setAnimos(ANIMOS_INICIO);
    setCerradoAlgunaVez(false);
    setDichos([]);
  };

  // ── modo Write your reply (glosario en uso) ───────────────────────────
  const [daniIdx, setDaniIdx] = useState(0);
  const [borrador, setBorrador] = useState("");
  const [chat, setChat] = useState<Mensaje[]>(chatInicial);
  const [ultimo, setUltimo] = useState<AnalisisFrase | null>(null);
  const [usadas, setUsadas] = useState<Set<EstructuraId>>(() => new Set<EstructuraId>());
  const [convencidas, setConvencidas] = useState(0);
  const [daniAnimo, setDaniAnimo] = useState<Animo>("atento");
  const glosarioDone = usadas.size >= GLOSARIO.length;

  const enviar = () => {
    const a = analizaFrase(borrador);
    setUltimo(a);
    if (a.efecto === "vacio") return;
    const r = DANI_RESPUESTAS[a.efecto];
    const nuevas = new Set(usadas);
    a.estructuras.forEach((e) => nuevas.add(e));
    const avanza = a.efecto === "convence" || a.efecto === "pregunta";
    const sigIdx = (daniIdx + 1) % DANI_PROMPTS.length;
    setChat((c) => [
      ...c,
      { de: "tu", en: borrador.trim(), efecto: a.efecto },
      { de: "dani", en: r.en, es: r.es },
      ...(avanza ? [{ de: "dani" as const, en: DANI_PROMPTS[sigIdx]!.en, es: DANI_PROMPTS[sigIdx]!.es }] : []),
    ]);
    if (avanza) setDaniIdx(sigIdx);
    setDaniAnimo(r.animo);
    setUsadas(nuevas);
    setBorrador("");
    if (a.efecto === "convence") setConvencidas((n) => n + 1);
    if (a.efecto === "gramatica" || a.efecto === "grosera") sfxNo();
    else if (avanza) sfxPlace();
    else sfxBlip();
    if (!glosarioDone && nuevas.size >= GLOSARIO.length) {
      sfxOk();
      persistMejor(simWin, true, textoDone);
    }
  };
  const otroTema = () => {
    const sigIdx = (daniIdx + 1) % DANI_PROMPTS.length;
    setDaniIdx(sigIdx);
    setChat((c) => [...c, { de: "dani", en: DANI_PROMPTS[sigIdx]!.en, es: DANI_PROMPTS[sigIdx]!.es }]);
    setDaniAnimo("atento");
    setUltimo(null);
  };
  const resetGlosario = () => {
    setDaniIdx(0);
    setBorrador("");
    setChat(chatInicial());
    setUltimo(null);
    setUsadas(new Set<EstructuraId>());
    setConvencidas(0);
    setDaniAnimo("atento");
  };

  // ── modo Complete the text ────────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const modosHechos = (simWin ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 3);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (w: boolean, g: boolean, x: boolean) => {
    registraEstrellas(partida.estrellasCon((w ? 1 : 0) + (g ? 1 : 0) + (x ? 1 : 0), 3));
  };

  const objetivos = [
    { txt: "Elige tu opción y responde a Sofía con preferencia + razón", done: respondioBien, modo: "comite" },
    { txt: "Termina la reunión del comité: 4 turnos y la votación", done: simFin, modo: "comite" },
    { txt: "Gana la votación (3 de 4 votos) sin que el grupo se cierre", done: simWin, modo: "comite" },
    { txt: "Convence a Dani con 3 respuestas escritas (preferencia + razón)", done: convencidas >= 3, modo: "escribe" },
    { txt: "Usa bien las 6 estructuras del glosario al escribir", done: glosarioDone, modo: "escribe" },
    { txt: "Completa el diálogo de preferencias (Complete the text)", done: textoDone, modo: "texto" },
    { txt: "Consigue 3★ (los tres modos, con 2 errores o menos)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el reto (70 % o más)", done: quizAprobado },
  ];

  const resetActual = modo === "comite" ? resetComite : modo === "escribe" ? resetGlosario : resetHuecos;

  const lectura =
    modo === "comite" ? (
      !opcion ? (
        <>Elige qué opción vas a defender</>
      ) : enFinal ? (
        <>Votos a favor: {aFavor} de 4</>
      ) : (
        <>Respeto {medidores.resp} · Convence {medidores.conv} · turno {turnoIdx + 1}/4</>
      )
    ) : modo === "escribe" ? (
      <>Glosario usado {usadas.size}/6 · convenciste {Math.min(convencidas, 3)}/3</>
    ) : (
      <>Completa el diálogo de preferencias</>
    );

  const SIN_TXT = (etiqueta: string | undefined) => `(sin ${(etiqueta ?? "pieza").toLowerCase()})`;

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
        <div className="pe-raiz">
          <style>{css(accent, color.rgba)}</style>

          {/* ═══ MODO — Student council (simulador) ═══ */}
          {modo === "comite" && (
            <>
              <div className="pe-pasos" aria-label="Avance de la reunión">
                {TURNOS.map((t, i) => {
                  const d = dichos.find((x) => x.turno === i);
                  return <span key={t.id} className="pe-paso" data-on={i === turnoIdx && !enFinal && !!opcion} style={d ? { background: TONO_COLOR[d.tono], borderColor: TONO_COLOR[d.tono] } : undefined} />;
                })}
                <span className="pe-paso pe-paso-voto" data-on={enFinal}>
                  <i className="fa-solid fa-check-to-slot" aria-hidden /> Vote
                </span>
              </div>

              {!opcion ? (
                <>
                  <div className="pe-intro">
                    <Eyebrow>
                      <i className="fa-solid fa-people-group" style={{ marginRight: 8, color: accent }} />
                      Student council · Prepa Arboledas (ficticia)
                    </Eyebrow>
                    <p>
                      El comité decide el viaje de fin de semestre y tú vas a defender una opción <strong>en inglés</strong>. En cada turno armas tu frase con tres piezas;
                      lo que digas moverá la <strong>claridad</strong>, el <strong>respeto</strong> y el <strong>convencimiento</strong> del grupo. Al final, se vota.
                    </p>
                    <p className="pe-pronostico">
                      <i className="fa-solid fa-cloud-rain" aria-hidden /> {PRONOSTICO}
                    </p>
                  </div>
                  <div className="pe-opciones">
                    {(Object.keys(OPCIONES) as OpcionId[]).map((id) => {
                      const o = OPCIONES[id];
                      return (
                        <div key={id} className="pe-opcion">
                          <div className="pe-foto">
                            <i className={`fa-solid ${o.icono}`} aria-hidden />
                            <ImgSim key={o.foto} src={`${RUTA_FOTOS}/${o.foto}.webp`} />
                          </div>
                          <div className="pe-opcion-cuerpo">
                            <strong>{o.nombre}</strong>
                            <ul className="pe-datos">
                              {o.datos.map((d) => (
                                <li key={d.texto}>
                                  <i className={`fa-solid ${d.icono}`} aria-hidden /> {d.texto}
                                </li>
                              ))}
                            </ul>
                            <button type="button" className="pe-btn pe-btn-pri" onClick={() => elegirOpcion(id)}>
                              <i className="fa-solid fa-hand" aria-hidden /> Defiendo esta opción
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="pe-nota">Precios y tiempos: simulación.</p>
                </>
              ) : (
                <>
                  {/* La sala: caras e intención de voto */}
                  <div className="pe-sala" data-cerrado={cerradoAhora}>
                    <div className="pe-sala-fondo">
                      <i className="fa-solid fa-people-roof" aria-hidden />
                      <ImgSim src={`${RUTA_FOTOS}/sala-comite.webp`} />
                    </div>
                    <div className="pe-elenco">
                      {ORDEN_PERSONAJES.map((id) => {
                        const p = PERSONAJES[id];
                        const animo: Animo = enFinal
                          ? id === "rios"
                            ? cerradoAhora ? "cerrado" : "atento"
                            : votosAhora[id as Exclude<PersonajeId, "rios">] ? "convencido" : cerradoAhora ? "cerrado" : "dudoso"
                          : animos[id];
                        const ai = ANIMO_INFO[animo];
                        const habla = !enFinal && turno.habla === id;
                        const voto = id === "rios" ? null : inclinacion(id, medidores, cerradoAlgunaVez);
                        return (
                          <div key={id} className="pe-pj" data-habla={habla} style={{ ["--ac" as string]: ai.color }}>
                            <div className="pe-retrato" data-animo={animo}>
                              <i className={`fa-solid ${ai.icono}`} aria-hidden />
                              <ImgSim key={p.foto} src={`${RUTA_FOTOS}/${p.foto}.webp`} />
                            </div>
                            <span className="pe-pj-nombre">{p.nombre}</span>
                            <span className="pe-pj-animo">
                              <i className={`fa-solid ${ai.icono}`} aria-hidden /> {ai.etiqueta}
                            </span>
                            <span className="pe-pj-voto" data-si={voto === true} data-mod={voto === null}>
                              {voto === null ? "Modera" : voto ? "Votaría por ti" : "Aún no"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {cerradoAhora && (
                      <div className="pe-cerrado" role="status">
                        <i className="fa-solid fa-lock" aria-hidden /> El grupo se cerró (respeto &lt; {UMBRAL_CIERRE}): lo que digas ya no convence.
                      </div>
                    )}
                  </div>

                  {/* Medidores */}
                  <div className="pe-medidores">
                    <Medidor etiqueta="Claridad" icono="fa-bullseye" valor={medidores.clar} delta={resultado?.delta.clar} color="#5BA8FF" />
                    <Medidor etiqueta="Respeto" icono="fa-handshake" valor={medidores.resp} delta={resultado?.delta.resp} color="#34D399" umbral={UMBRAL_CIERRE} />
                    <Medidor etiqueta="Convencimiento" icono="fa-scale-balanced" valor={medidores.conv} delta={resultado?.delta.conv} color={ORO} />
                    <span className="pe-nota">Puntajes: simulación.</span>
                  </div>

                  {/* Ficha del viaje: contra esto se comprueban tus razones */}
                  <div className="pe-ficha-viaje">
                    {([opcion, otraOpcion(opcion)] as OpcionId[]).map((id) => (
                      <div key={id} className="pe-ficha-fila" data-tuya={id === opcion}>
                        <strong>
                          <i className={`fa-solid ${OPCIONES[id].icono}`} aria-hidden /> {id === opcion ? "Tu opción" : "La otra"}: {OPCIONES[id].en}
                        </strong>
                        <span>{OPCIONES[id].datos.map((d) => d.texto).join(" · ")}</span>
                      </div>
                    ))}
                    <span className="pe-pronostico">
                      <i className="fa-solid fa-cloud-rain" aria-hidden /> {PRONOSTICO}
                    </span>
                  </div>

                  {!enFinal ? (
                    <>
                      <div className="pe-burbuja" aria-live="polite">
                        <strong>
                          {PERSONAJES[turno.habla].nombre} ({PERSONAJES[turno.habla].rol}) dice:
                        </strong>
                        <div className="pe-ing">“{turno.linea[opcion]}”</div>
                        <div className="pe-esp">{turno.traduccion[opcion]}</div>
                      </div>

                      <div className="pe-constructor">
                        {turno.piezas.map((lista, slot) => (
                          <div key={`${turno.id}-${slot}`} className="pe-slot">
                            <span className="pe-slot-tit">
                              {slot + 1}. {turno.etiquetas[slot]}
                            </span>
                            <div className="pe-chips">
                              {lista.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="pe-chip"
                                  data-on={sel[slot] === p.id}
                                  data-vacia={p.texto === ""}
                                  disabled={!!resultado}
                                  onClick={() => elegirPieza(slot, p.id)}
                                >
                                  {p.texto === "" ? SIN_TXT(turno.etiquetas[slot]) : p.texto.replace(/\{X\}/g, OPCIONES[opcion].en).replace(/\{Y\}/g, OPCIONES[otraOpcion(opcion)].en)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="pe-preview">
                          <span>Tu frase:</span>
                          <strong>{listo ? frase(piezasSel, opcion) : "Elige una pieza en cada fila…"}</strong>
                        </div>
                        {!resultado && (
                          <button type="button" className="pe-btn pe-btn-pri" disabled={!listo} onClick={decir}>
                            <i className="fa-solid fa-comment" aria-hidden /> Say it
                          </button>
                        )}
                      </div>

                      {resultado && (
                        <div className="pe-retro" style={{ ["--rc" as string]: TONO_COLOR[resultado.tono] }}>
                          <div className="pe-retro-resp">
                            <strong>{PERSONAJES[turno.habla].nombre}:</strong> “{resultado.respuesta.en}”
                            <span>{resultado.respuesta.es}</span>
                          </div>
                          <ul className="pe-notas">
                            {resultado.notas.map((n, i) => (
                              <li key={i} data-tono={n.tono}>
                                <i className={`fa-solid ${n.tono === "bien" ? "fa-circle-check" : n.tono === "mal" ? "fa-circle-xmark" : "fa-circle-minus"}`} aria-hidden />
                                <span>
                                  <strong>«{n.texto}»</strong> {n.porque}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {resultado.cerrado && (
                            <p className="pe-aviso-cierre">
                              <i className="fa-solid fa-lock" aria-hidden /> Con el respeto bajo {UMBRAL_CIERRE}, tu razón ya no sumó convencimiento. Para reabrir al grupo, discrepa con cortesía en el siguiente turno.
                            </p>
                          )}
                          <button type="button" className="pe-btn pe-btn-pri" onClick={siguiente}>
                            <i className="fa-solid fa-arrow-right" aria-hidden /> {turnoIdx + 1 >= TURNOS.length ? "Go to the vote" : "Next turn"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Votacion medidores={medidores} cerradoAlgunaVez={cerradoAlgunaVez} opcion={opcion} onReiniciar={resetComite} />
                  )}
                </>
              )}
            </>
          )}

          {/* ═══ MODO — Write your reply (glosario en uso) ═══ */}
          {modo === "escribe" && (
            <>
              <div className="pe-dani" style={{ ["--ac" as string]: ANIMO_INFO[daniAnimo].color }}>
                <div className="pe-retrato" data-animo={daniAnimo}>
                  <i className={`fa-solid ${ANIMO_INFO[daniAnimo].icono}`} aria-hidden />
                  <ImgSim src={`${RUTA_FOTOS}/dani.webp`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong className="pe-dani-nombre">Dani · tu amigo (ficticio)</strong>
                  <span className="pe-pj-animo" style={{ display: "inline-flex" }}>
                    <i className={`fa-solid ${ANIMO_INFO[daniAnimo].icono}`} aria-hidden /> {ANIMO_INFO[daniAnimo].etiqueta}
                  </span>
                  <p className="pe-meta">
                    <i className="fa-solid fa-flag" aria-hidden /> Meta: {DANI_PROMPTS[daniIdx]!.meta}
                  </p>
                </div>
              </div>

              <div className="pe-chat" aria-live="polite">
                {chat.slice(-6).map((m, i) => (
                  <div key={`${chat.length}-${i}`} className="pe-msg" data-de={m.de} data-efecto={m.efecto}>
                    <span className="pe-msg-en">{m.en}</span>
                    {m.es && <span className="pe-msg-es">{m.es}</span>}
                  </div>
                ))}
              </div>

              <div className="pe-escribir">
                <label htmlFor="pe-borrador" className="pe-slot-tit">
                  Tu respuesta en inglés
                </label>
                <textarea
                  id="pe-borrador"
                  className="pe-textarea"
                  rows={2}
                  value={borrador}
                  placeholder="Ej.: That sounds fun, but I'd rather…"
                  onChange={(e) => setBorrador(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviar();
                    }
                  }}
                />
                <div className="pe-chips">
                  {ARRANQUES.map((a) => (
                    <button key={a} type="button" className="pe-chip pe-chip-mini" onClick={() => setBorrador((b) => (b && !b.endsWith(" ") ? `${b} ${a}` : `${b}${a}`))}>
                      {a.trim()}…
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="pe-btn pe-btn-pri" disabled={borrador.trim() === ""} onClick={enviar}>
                    <i className="fa-solid fa-paper-plane" aria-hidden /> Send
                  </button>
                  <button type="button" className="pe-btn" onClick={otroTema}>
                    <i className="fa-solid fa-shuffle" aria-hidden /> Otro tema
                  </button>
                </div>
              </div>

              {ultimo && <AnalisisCard a={ultimo} />}

              <div>
                <div className="pe-slot-tit" style={{ marginBottom: 8 }}>
                  Tu caja de herramientas (glosario A5): {usadas.size}/6 usadas bien
                </div>
                <div className="pe-glosario">
                  {GLOSARIO.map((g) => (
                    <div key={g.id} className="pe-term" data-on={usadas.has(g.id)}>
                      <strong>
                        <i className={`fa-solid ${usadas.has(g.id) ? "fa-circle-check" : "fa-circle"}`} aria-hidden /> {g.termino}
                      </strong>
                      <span>{g.definicion}</span>
                      <em>{g.ejemplo}</em>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ MODO — Complete the text (fill_blanks verbatim A6) ═══ */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={PREFERENCIAS_ELECCIONES_INGLES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
                persistMejor(simWin, glosarioDone, true);
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
                  <Dato label="Claridad" value={`${medidores.clar}`} col="#5BA8FF" />
                  <Dato label="Respeto" value={`${medidores.resp}`} col={cerradoAhora ? NO : OK} />
                  <Dato label="Convencimiento" value={`${medidores.conv}`} col={ORO} />
                  <Dato label="Mejor votación" value={`${mejorVotos}/4`} col={simWin ? OK : undefined} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? ORO : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Justificas tus preferencias con respeto!" : "Completa los tres modos para 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Lo que dijiste en el comité" icono="fa-comments">
                {TURNOS.map((t, i) => {
                  const d = dichos.find((x) => x.turno === i);
                  return (
                    <p key={t.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>{i + 1}.</strong>{" "}
                      {d ? <span style={{ color: TONO_COLOR[d.tono] }}>«{d.texto}»</span> : <span style={{ color: T.text3 }}>pendiente</span>}
                    </p>
                  );
                })}
              </Bloque>
              <Bloque titulo="Cómo se convence aquí" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una preferencia sola es un gusto. Con <strong style={{ color: T.text }}>because / since</strong> y un dato verdadero se vuelve una razón; con{" "}
                  <strong style={{ color: T.text }}>That sounds good, but…</strong> el otro siente que lo escuchaste. Si el respeto baja de {UMBRAL_CIERRE}, el grupo se
                  cierra y ninguna razón suma.
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
              <Bloque titulo="Glossary — Preferences, justifications & polite disagreement" icono="fa-spell-check">
                {GLOSARIO.map((g) => (
                  <p key={g.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.termino}.</strong> {g.definicion} <em>«{g.ejemplo}»</em>
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Actividad final:</strong> {GLOSARIO_ACTIVIDAD_FINAL}
                </p>
              </Bloque>
              <Bloque titulo="Did you know?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{LECTURA_SABIAS}</p>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión (lectura A1)" icono="fa-circle-question">
                {LECTURA_PREGUNTAS.map((q) => (
                  <p key={q.pregunta} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{q.pregunta}</strong> <span style={{ color: T.text3 }}>Guía: {q.guia}</span>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo={REFLEXION.titulo} icono="fa-pen-nib">
                {REFLEXION.prompt.split("\n\n").map((p) => (
                  <p key={p} style={{ margin: 0, color: T.text2 }}>
                    {p}
                  </p>
                ))}
                <ul style={{ margin: 0, paddingLeft: 20, color: T.text2 }}>
                  {REFLEXION.pistas.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>Criterios: {REFLEXION.criterios.join(" · ")}</p>
              </Bloque>
              <Bloque titulo="Self-check — Justifying preferences respectfully" icono="fa-list-check">
                <ul style={{ margin: 0, paddingLeft: 20, color: T.text2 }}>
                  {AUTOEVALUACION.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>{AUTOEVALUACION_REFLEXION}</p>
              </Bloque>
              <Bloque titulo={`Video: ${VIDEO_TITULO}`} icono="fa-circle-play">
                <p style={{ margin: 0, color: T.text2 }}>{VIDEO_DESCRIPCION}</p>
                {VIDEO_PREGUNTAS.map((q) => (
                  <p key={q.pregunta} style={{ margin: 0, color: T.text2 }}>
                    • {q.pregunta}
                    {q.respuesta && <span style={{ color: T.text3 }}> — {q.respuesta}</span>}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PREFERENCIAS_ELECCIONES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: si el archivo aún no existe se oculta y queda el degradado + ícono. */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

function Medidor({ etiqueta, icono, valor, delta, color, umbral }: { etiqueta: string; icono: string; valor: number; delta?: number; color: string; umbral?: number }) {
  const bajo = umbral !== undefined && valor < umbral;
  return (
    <div className="pe-medidor">
      <span className="pe-medidor-tit">
        <i className={`fa-solid ${icono}`} style={{ color }} aria-hidden /> {etiqueta}
      </span>
      <div className="pe-barra" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} aria-label={etiqueta}>
        <div style={{ width: `${valor}%`, background: bajo ? NO : color }} />
        {umbral !== undefined && <span className="pe-umbral" style={{ left: `${umbral}%` }} title="Por debajo, el grupo se cierra" />}
      </div>
      <span className="pe-medidor-val">
        {valor}
        {delta !== undefined && delta !== 0 && (
          <em style={{ color: delta > 0 ? OK : NO }}>
            {delta > 0 ? "+" : ""}
            {delta}
          </em>
        )}
      </span>
    </div>
  );
}

function Votacion({ medidores, cerradoAlgunaVez, opcion, onReiniciar }: { medidores: Medidores; cerradoAlgunaVez: boolean; opcion: OpcionId; onReiniciar: () => void }) {
  const v = votos(medidores, cerradoAlgunaVez);
  const n = Object.values(v).filter(Boolean).length;
  const fin = finalDe(n, cerradoAlgunaVez);
  const tuya = OPCIONES[opcion];
  const otra = OPCIONES[otraOpcion(opcion)];
  const filas: { id: keyof typeof v; nombre: string; condicion: string }[] = [
    { id: "tu", nombre: "Tú", condicion: "votas por tu opción" },
    { id: "sofia", nombre: "Sofía", condicion: CONDICION_VOTO.sofia },
    { id: "lupita", nombre: "Lupita", condicion: CONDICION_VOTO.lupita },
    { id: "marco", nombre: "Marco", condicion: CONDICION_VOTO.marco },
  ];
  return (
    <div className="pe-votacion">
      <div className="pe-urnas">
        {filas.map((f) => {
          const si = v[f.id];
          const op = si ? tuya : otra;
          return (
            <div key={f.id} className="pe-urna" data-si={si}>
              <i className={`fa-solid ${op.icono}`} aria-hidden />
              <strong>{f.nombre}</strong>
              <span>{op.en}</span>
              <small>Vota por ti si: {f.condicion}</small>
            </div>
          );
        })}
      </div>
      <div className="pe-retro" style={{ ["--rc" as string]: fin.color }}>
        <strong>
          <i className={`fa-solid ${fin.icono}`} style={{ marginRight: 8, color: fin.color }} aria-hidden />
          {fin.titulo} · {n}/4
        </strong>
        <span>{fin.texto}</span>
        <button type="button" className="pe-btn" onClick={onReiniciar}>
          <i className="fa-solid fa-rotate-left" aria-hidden /> Repetir la reunión
        </button>
      </div>
    </div>
  );
}

const NOMBRE_ESTRUCTURA = Object.fromEntries(GLOSARIO.map((g) => [g.id, g.termino])) as Record<EstructuraId, string>;

const EFECTO_TXT: Record<AnalisisFrase["efecto"], string> = {
  convence: "Preferencia + razón, sin errores ni groserías: convence.",
  pregunta: "Preguntaste por la preferencia del otro: abre la conversación.",
  sinrazon: "Dijiste qué prefieres, pero no por qué: agrega «because» o «since» y una razón.",
  gramatica: "Hay un error que confunde a Dani (abajo te decimos cuál). Las estructuras no cuentan hasta que la frase salga limpia.",
  grosera: "Una expresión grosera cierra la conversación: aunque tengas razón, Dani deja de escucharte.",
  otro: "No se nota tu preferencia. Usa «I prefer X to Y», «I'd rather…» o «In my opinion…».",
  vacio: "Escribe una frase completa (al menos tres palabras).",
};

function AnalisisCard({ a }: { a: AnalisisFrase }) {
  const color = a.efecto === "convence" || a.efecto === "pregunta" ? OK : a.efecto === "grosera" ? NO : a.efecto === "gramatica" ? "#FF9F5A" : ORO;
  return (
    <div className="pe-retro" style={{ ["--rc" as string]: color }}>
      <strong>{EFECTO_TXT[a.efecto]}</strong>
      {a.efecto !== "vacio" && (
        <div className="pe-mini">
          <MiniBarra etiqueta="Claridad" valor={a.clar} color="#5BA8FF" />
          <MiniBarra etiqueta="Respeto" valor={a.resp} color={OK} />
          <MiniBarra etiqueta="Razón" valor={a.razon} color={ORO} />
        </div>
      )}
      {a.estructuras.length > 0 && (
        <div className="pe-chips">
          {a.estructuras.map((e) => (
            <span key={e} className="pe-tag">
              <i className="fa-solid fa-check" aria-hidden /> {NOMBRE_ESTRUCTURA[e]}
            </span>
          ))}
        </div>
      )}
      {a.errores.map((e) => (
        <span key={e.id} className="pe-error">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden /> {e.porque}
        </span>
      ))}
      {a.groserias.length > 0 && (
        <span className="pe-error">
          <i className="fa-solid fa-hand" aria-hidden /> Suena grosero: «{a.groserias.join("», «")}». Ataca a la persona o a su gusto en lugar de dar una razón.
        </span>
      )}
    </div>
  );
}

function MiniBarra({ etiqueta, valor, color }: { etiqueta: string; valor: number; color: string }) {
  return (
    <div className="pe-minibarra">
      <span>{etiqueta}</span>
      <div className="pe-barra">
        <div style={{ width: `${valor}%`, background: color }} />
      </div>
      <strong>{valor}</strong>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto: A4 (verdadero/falso) + A2 (opción múltiple), verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */
function QuizCard({ accent, rgba, aprobado, onAprobado, playSfx }: { accent: string; rgba: string; aprobado: boolean; onAprobado: () => void; playSfx?: (ok: boolean) => void }) {
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos / total >= QUIZ_MINIMO;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };
  const comprobar = () => {
    setComprobado(true);
    playSfx?.(aprobadoAhora);
    if (aprobadoAhora) onAprobado();
  };
  const reintentar = () => {
    setResp(QUIZ.map(() => null));
    setComprobado(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Check your English
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco afirmaciones de verdadero o falso sobre cómo justificar preferencias y cinco preguntas de comparativos y superlativos. Aprueba con 70 % o más.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.enunciado}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 9 }}>
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
                    <button key={oi} type="button" className="pe-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span className="pe-q-letra" style={{ borderColor: sel || (comprobado && esCorrecta) ? "currentColor" : T.line }}>
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
          <button type="button" className="pe-btn pe-btn-pri" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button type="button" className="pe-btn" onClick={reintentar}>
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

const css = (accent: string, rgba: string) => `
  @keyframes peShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes peBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
  @keyframes peIn { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
  .pe-raiz { display:flex; flex-direction:column; gap:14px; min-width:0; font-size:15px; color:${T.text}; }
  .pe-raiz p { margin:0; line-height:1.5; }
  .pe-nota { font-size:14px; color:${T.text3}; }

  .pe-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; justify-self:start; align-self:flex-start; }
  .pe-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .pe-btn:disabled { opacity:.45; cursor:not-allowed; }
  .pe-btn-pri { background:${accent}; color:#04121f; border-color:${accent}; }
  .pe-btn:focus-visible, .pe-chip:focus-visible, .pe-q:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  .pe-pasos { display:flex; gap:6px; align-items:center; }
  .pe-paso { flex:1; height:10px; border-radius:6px; background:${T.inset}; border:1px solid ${T.line}; }
  .pe-paso[data-on="true"] { border-color:${accent}; box-shadow:0 0 0 1px ${accent}; }
  .pe-paso-voto { flex:0 0 auto; height:auto; padding:3px 10px; font-size:14px; font-weight:800; color:${T.text3}; display:inline-flex; gap:6px; align-items:center; }
  .pe-paso-voto[data-on="true"] { color:#04121f; background:${accent}; }

  .pe-intro { display:grid; gap:10px; padding:16px 18px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
  .pe-pronostico { display:inline-flex; gap:8px; align-items:center; font-size:14px; font-weight:700; color:#9CC8FF; }
  .pe-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:14px; }
  .pe-opcion { border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; background:${T.glass}; display:flex; flex-direction:column; }
  .pe-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,18,36,0.95)); }
  .pe-foto > i { font-size:46px; color:rgba(255,255,255,0.28); }
  .pe-foto img, .pe-sala-fondo img, .pe-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .pe-opcion-cuerpo { padding:14px 16px; display:grid; gap:10px; }
  .pe-opcion-cuerpo > strong { font-size:16px; }
  .pe-datos { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:6px; font-size:14px; color:${T.text2}; }
  .pe-datos i { color:${accent}; width:18px; }

  .pe-sala { position:relative; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line}; min-height:170px;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,18,36,0.95)); transition:filter .3s; }
  .pe-sala[data-cerrado="true"] { border-color:${NO}; }
  .pe-sala-fondo { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .pe-sala-fondo > i { font-size:54px; color:rgba(255,255,255,0.14); }
  .pe-elenco { position:relative; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; padding:16px 8px 10px;
    background:linear-gradient(180deg, rgba(2,10,24,.2), rgba(2,10,24,.82) 55%); }
  .pe-pj { display:flex; flex-direction:column; align-items:center; gap:4px; min-width:0; text-align:center; }
  .pe-pj[data-habla="true"] .pe-retrato { box-shadow:0 0 0 3px ${accent}, 0 0 18px -2px ${accent}; }
  .pe-retrato { position:relative; width:72px; height:72px; flex-shrink:0; border-radius:50%; overflow:hidden; border:3px solid var(--ac,#8FA3BF);
    background:linear-gradient(135deg, rgba(${rgba},0.4), rgba(8,18,36,0.95)); display:flex; align-items:center; justify-content:center; transition:border-color .3s; }
  .pe-retrato > i { font-size:30px; color:var(--ac,#8FA3BF); }
  .pe-retrato[data-animo="confundido"] { animation:peShake .5s 1; }
  .pe-retrato[data-animo="convencido"] { animation:peBob 1.4s ease-in-out infinite; }
  .pe-retrato[data-animo="cerrado"] { filter:grayscale(.75); }
  .pe-pj-nombre { padding:2px 9px; border-radius:999px; background:rgba(2,12,28,.85); color:#fff; font-size:14px; font-weight:800; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pe-pj-animo { align-items:center; gap:5px; padding:2px 9px; border-radius:999px; background:rgba(2,12,28,.85); font-size:14px; font-weight:700; color:var(--ac,#8FA3BF); }
  .pe-pj .pe-pj-animo { display:inline-flex; }
  .pe-pj-voto { font-size:14px; font-weight:800; padding:2px 8px; border-radius:8px; color:${T.text3}; background:rgba(2,12,28,.7); }
  .pe-pj-voto[data-si="true"] { color:#04121f; background:${OK}; }
  .pe-pj-voto[data-mod="true"] { color:${T.text2}; }
  .pe-cerrado { position:relative; margin:0 8px 10px; padding:8px 12px; border-radius:10px; background:rgba(60,8,12,.88); border:1px solid ${NO};
    color:#fff; font-size:14px; font-weight:800; display:flex; gap:8px; align-items:center; animation:peIn .3s ease; }
  .pe-cerrado i { color:${NO}; }

  .pe-medidores { display:grid; gap:8px; padding:12px 14px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; }
  .pe-medidor { display:grid; grid-template-columns:minmax(0, 150px) minmax(0,1fr) auto; gap:10px; align-items:center; }
  .pe-medidor-tit { font-size:14px; font-weight:800; color:${T.text2}; display:inline-flex; gap:7px; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pe-barra { position:relative; height:12px; border-radius:8px; background:${T.inset}; border:1px solid ${T.line}; overflow:visible; }
  .pe-barra > div { height:100%; border-radius:8px; transition:width .45s ease, background .3s; }
  .pe-umbral { position:absolute; top:-4px; bottom:-4px; width:2px; background:${NO}; border-radius:2px; }
  .pe-medidor-val { font-size:15px; font-weight:900; font-variant-numeric:tabular-nums; min-width:62px; text-align:right; display:inline-flex; gap:6px; justify-content:flex-end; }
  .pe-medidor-val em { font-style:normal; font-size:14px; animation:peIn .3s ease; }

  .pe-ficha-viaje { display:grid; gap:6px; padding:10px 14px; border-radius:14px; border:1px dashed ${T.lineStrong}; background:${T.inset}; }
  .pe-ficha-fila { display:grid; gap:2px; font-size:14px; color:${T.text2}; }
  .pe-ficha-fila strong { color:${T.text}; font-size:14px; }
  .pe-ficha-fila[data-tuya="true"] strong { color:${accent}; }

  .pe-burbuja { border-radius:16px; padding:12px 16px; background:${T.glass}; border:1.5px solid ${T.line}; animation:peIn .3s ease; }
  .pe-burbuja strong { display:block; font-size:14px; color:${T.text3}; margin-bottom:3px; }
  .pe-ing { font-size:18px; font-weight:800; color:#fff; line-height:1.35; }
  .pe-esp { font-size:14px; color:${T.text3}; margin-top:3px; }

  .pe-constructor { display:grid; gap:12px; padding:14px; border-radius:16px; border:1.5px solid rgba(${rgba},0.35); background:rgba(${rgba},0.06); }
  .pe-slot { display:grid; gap:7px; }
  .pe-slot-tit { font-size:14px; font-weight:900; letter-spacing:.04em; color:${T.text2}; }
  .pe-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .pe-chip { cursor:pointer; padding:10px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:700; line-height:1.3; text-align:left; transition:all .14s; max-width:100%; }
  .pe-chip:hover:not(:disabled) { border-color:${accent}; transform:translateY(-1px); }
  .pe-chip:disabled { cursor:default; }
  .pe-chip[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 14px -5px ${accent}; }
  .pe-chip[data-vacia="true"] { font-style:italic; color:${T.text2}; }
  .pe-chip-mini { padding:7px 11px; font-size:14px; }
  .pe-preview { display:grid; gap:4px; padding:10px 12px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
  .pe-preview span { font-size:14px; color:${T.text3}; font-weight:700; }
  .pe-preview strong { font-size:16px; line-height:1.4; }

  .pe-retro { display:flex; flex-direction:column; gap:10px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:15px; line-height:1.5; color:${T.text2};
    border:1.5px solid var(--rc); background:${T.glass}; animation:peIn .3s ease; }
  .pe-retro > strong { color:#fff; font-size:15px; }
  .pe-retro-resp { display:grid; gap:2px; color:#fff; font-size:16px; }
  .pe-retro-resp span { font-size:14px; color:${T.text3}; }
  .pe-notas { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .pe-notas li { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; }
  .pe-notas li strong { color:#fff; }
  .pe-notas li[data-tono="bien"] > i { color:${OK}; }
  .pe-notas li[data-tono="regular"] > i { color:${ORO}; }
  .pe-notas li[data-tono="mal"] > i { color:${NO}; }
  .pe-notas li > i { margin-top:3px; }
  .pe-aviso-cierre { font-size:14px; color:#ffd2d2; display:flex; gap:8px; align-items:flex-start; }

  .pe-votacion { display:grid; gap:12px; }
  .pe-urnas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .pe-urna { display:grid; gap:4px; justify-items:center; text-align:center; padding:14px 10px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; animation:peIn .35s ease; }
  .pe-urna > i { font-size:26px; color:${T.text3}; }
  .pe-urna[data-si="true"] { border-color:${OK}; background:${OK}14; }
  .pe-urna[data-si="true"] > i { color:${OK}; }
  .pe-urna strong { font-size:15px; }
  .pe-urna span { font-size:14px; color:${T.text2}; }
  .pe-urna small { font-size:14px; color:${T.text3}; line-height:1.35; }

  .pe-dani { display:flex; gap:14px; align-items:center; padding:12px 14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
  .pe-dani-nombre { display:block; font-size:15px; margin-bottom:4px; }
  .pe-meta { margin-top:6px !important; font-size:14px; color:${accent}; font-weight:700; }
  .pe-chat { display:flex; flex-direction:column; gap:8px; }
  .pe-msg { display:grid; gap:2px; max-width:min(100%, 520px); padding:10px 13px; border-radius:14px; animation:peIn .25s ease; }
  .pe-msg[data-de="dani"] { align-self:flex-start; background:${T.glassSoft}; border:1px solid ${T.line}; border-bottom-left-radius:4px; }
  .pe-msg[data-de="tu"] { align-self:flex-end; background:rgba(${rgba},0.18); border:1px solid rgba(${rgba},0.45); border-bottom-right-radius:4px; }
  .pe-msg[data-efecto="grosera"] { border-color:${NO}; }
  .pe-msg[data-efecto="gramatica"] { border-color:#FF9F5A; }
  .pe-msg-en { font-size:15px; font-weight:700; color:#fff; }
  .pe-msg-es { font-size:14px; color:${T.text3}; }
  .pe-escribir { display:grid; gap:10px; padding:14px; border-radius:16px; border:1.5px solid rgba(${rgba},0.35); background:rgba(${rgba},0.06); }
  .pe-textarea { width:100%; box-sizing:border-box; resize:vertical; min-height:64px; padding:11px 13px; border-radius:12px; border:1.5px solid ${T.lineStrong};
    background:${T.inset}; color:#fff; font:inherit; font-size:16px; line-height:1.4; }
  .pe-textarea:focus { outline:none; border-color:${accent}; }
  .pe-mini { display:grid; gap:6px; width:100%; }
  .pe-minibarra { display:grid; grid-template-columns:minmax(0, 110px) minmax(0,1fr) 40px; gap:10px; align-items:center; font-size:14px; }
  .pe-minibarra strong { text-align:right; color:#fff; font-variant-numeric:tabular-nums; }
  .pe-tag { display:inline-flex; gap:6px; align-items:center; padding:4px 10px; border-radius:999px; font-size:14px; font-weight:800; color:#04121f; background:${OK}; }
  .pe-error { display:flex; gap:8px; align-items:flex-start; font-size:14px; color:#ffd9c2; }
  .pe-error i { color:#FF9F5A; margin-top:3px; }
  .pe-glosario { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:10px; }
  .pe-term { display:grid; gap:4px; padding:11px 13px; border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.glass}; font-size:14px; color:${T.text2}; transition:all .25s; }
  .pe-term strong { color:#fff; font-size:15px; display:flex; gap:7px; align-items:center; }
  .pe-term strong i { color:${T.text3}; font-size:14px; }
  .pe-term em { color:${T.text3}; }
  .pe-term[data-on="true"] { border-style:solid; border-color:${OK}; background:${OK}12; }
  .pe-term[data-on="true"] strong i { color:${OK}; }

  .pe-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px; border:1.5px solid ${T.line};
    background:${T.glass}; color:${T.text2}; font-size:15px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .pe-q:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .pe-q:disabled { cursor:default; }
  .pe-q-letra { width:24px; height:24px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; border:1.5px solid; }

  @media (max-width: 560px) {
    .pe-elenco { grid-template-columns:repeat(2, minmax(0,1fr)); row-gap:12px; }
    .pe-medidor { grid-template-columns:minmax(0,1fr) auto; }
    .pe-medidor .pe-barra { grid-column:1 / -1; grid-row:2; }
    .pe-datos { grid-template-columns:1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pe-retrato[data-animo="confundido"], .pe-retrato[data-animo="convencido"], .pe-burbuja, .pe-retro, .pe-urna, .pe-msg, .pe-cerrado, .pe-medidor-val em { animation:none; }
    .pe-barra > div, .pe-chip, .pe-chip:hover:not(:disabled) { transition:none; transform:none; }
  }
`;
