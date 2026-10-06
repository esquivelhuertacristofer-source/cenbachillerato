"use client";

/**
 * Laboratorio — I'm worried about…: opinar y expresar preocupación en inglés.
 * Práctica experimental para IN-V-P04 (Inglés V · «Expresa opiniones,
 * preferencias y preocupaciones sobre temas relacionados con el campo de
 * estudio o la comunidad»).
 *
 * «Town hall» es el simulador. El Foro Ciudadano de Bahía Serena (ficticio)
 * revisa tres planes: cruceros en Puerto Calma, fumigación con drones en Valle
 * Ocotal y una aplicación de IA en la Clínica Las Lomas. El alumno lee el
 * expediente del caso y arma una intervención en inglés: responde al orador
 * anterior, dice qué le preocupa, decide QUÉ TAN SEGURO suena (might / could /
 * will), elige la evidencia y cierra con una propuesta. La balanza compara lo
 * que afirma con lo que prueba; al hablar, tres medidores (credibilidad,
 * respeto, claridad) mueven el voto de seis integrantes y el termómetro de la
 * decisión. Exagerar sin datos hunde la credibilidad; responder con grosería,
 * el respeto; y cada integrante dice por qué. El modelo es determinista y está
 * en `opiniones-preocupaciones-ingles-sim.ts`.
 *
 * Modos:
 *  · «Town hall»: el simulador.
 *  · «Both sides»: la columna de Ximena; cada conector decide en qué lado del
 *    mapa del argumento cae la oración (however, although, despite, on the
 *    other hand… de A1).
 *  · «Escribe el término»: los cuatro modales y los cuatro conectores de A1.
 *  · «Completa el texto»: los dos fill_blanks (A2 y A6), verbatim.
 *  + Reto V/F (A3 + A4) en la pestaña «Reto»; toda la teoría verbatim en «Teoría».
 *
 * DOM puro (sin three.js). Personas, lugares, instituciones y cifras ficticios.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { OPINIONES_PREOCUPACIONES_INGLES_FICHA } from "./opiniones-preocupaciones-ingles-ficha";
import { OPINIONES_HUECOS_A2, OPINIONES_HUECOS_A6 } from "./opiniones-preocupaciones-ingles-huecos";
import {
  LECTURA_A1,
  COMPRENSION_A1,
  FRASES_EVIDENCIA_A1,
  PARES_MODALES,
  RETO_QUIZ,
  GLOSARIO_A5,
  ACTIVIDAD_FINAL_A5,
  A9,
  AUTOEVALUACION_A7,
  VIDEO_A8,
} from "./opiniones-preocupaciones-ingles-data";
import {
  CASOS,
  CASO,
  APERTURAS,
  NIVELES,
  TIPOS_EVIDENCIA,
  FORO,
  MEDIDORES,
  ZONAS,
  VOTOS_PARA_CAMBIAR,
  TRAMPA,
  SIN_EVIDENCIA,
  COLUMNA,
  COLUMNA_TITULO,
  COLUMNA_AUTORA,
  COLUMNA_APERTURA,
  LECTORES,
  COSTO_LADO,
  COSTO_GRAMATICA,
  META_LECTORES,
  evaluar,
  intervencionCompleta,
  opcionesPreocupacion,
  partesIntervencion,
  lectoresTras,
  type CasoId,
  type Intervencion,
  type Lado,
  type Medidor,
  type Nivel,
  type OpcionConector,
  type Zona,
} from "./opiniones-preocupaciones-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-opiniones-preocupaciones-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/opiniones-preocupaciones-ingles";
/** Evidencias que hay que leer para poder hablar en el foro. */
const MIN_LEER = 3;

type Modo = "foro" | "lados" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "foro", label: "Town hall", icono: "fa-landmark" },
  { id: "lados", label: "Both sides", icono: "fa-scale-unbalanced" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ZONA_COLOR: Record<Zona, string> = { aprobado: NO, pendiente: AMBAR, cambiado: OK };

const LADOS: { id: Exclude<Lado, "cierre">; titulo: string; es: string; icono: string }[] = [
  { id: "pro", titulo: "For the solar farm", es: "A favor", icono: "fa-solar-panel" },
  { id: "contra", titulo: "Concerns", es: "Preocupaciones", icono: "fa-triangle-exclamation" },
];

function porCaso<V>(f: () => V): Record<CasoId, V> {
  return Object.fromEntries(CASOS.map((c) => [c.id, f()])) as Record<CasoId, V>;
}

const NUEVA: Intervencion = { nivel: 2 };

/** Color de la retroalimentación: verde si cae bien, rojo si cae del otro lado, ámbar si la gramática falla. */
function colorTipo(tipo: OpcionConector["tipo"]): string {
  return tipo === "ok" ? OK : tipo === "lado" ? NO : AMBAR;
}

export function LabOpinionesPreocupacionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const rgba = color.rgba;
  const [modo, setModo] = useState<Modo>("foro");

  // ── sonido y partida ─────────────────────────────────────────────────
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
  // Todos los aciertos y fallos del laboratorio pasan por aquí: la partida se lleva en un solo lugar.
  const sfxOk = () => {
    if (sonido) audioRef.current?.correcto();
  };
  const sfxNo = () => {
    partida.error();
    if (sonido) audioRef.current?.incorrecto();
  };
  const sfxBien = () => {
    partida.acierto();
    if (sonido) audioRef.current?.blip();
  };
  const sfxBlip = () => {
    if (sonido) audioRef.current?.blip();
  };

  // ── modo 1: Town hall (simulador) ────────────────────────────────────
  const [casoId, setCasoId] = useState<CasoId>("bahia");
  const [leidas, setLeidas] = useState<Record<CasoId, string[]>>(() => porCaso<string[]>(() => []));
  const [interv, setInterv] = useState<Record<CasoId, Intervencion>>(() => porCaso<Intervencion>(() => ({ ...NUEVA })));
  const [hablado, setHablado] = useState<Record<CasoId, boolean>>(() => porCaso(() => false));
  const [mejores, setMejores] = useState<Record<CasoId, { votos: number; cambiado: boolean }>>(() =>
    porCaso(() => ({ votos: 0, cambiado: false }))
  );
  const [intervenciones, setIntervenciones] = useState(0);
  const [sobreafirmo, setSobreafirmo] = useState(false);

  const caso = CASO[casoId];
  const leido = leidas[casoId];
  const abierto = leido.length >= MIN_LEER;
  const iv = interv[casoId];
  const completa = intervencionCompleta(iv);
  const resultado = completa ? evaluar(caso, { ...iv, evidencia: iv.evidencia === SIN_EVIDENCIA ? undefined : iv.evidencia }) : null;
  const visto = hablado[casoId] ? resultado : null;
  const cambiados = CASOS.filter((c) => mejores[c.id].cambiado).length;
  const unanimes = CASOS.filter((c) => mejores[c.id].votos >= FORO.length).length;
  const algunExpediente = CASOS.some((c) => leidas[c.id].length >= MIN_LEER);
  const giro = CASOS.findIndex((c) => c.id === casoId) + 1;
  const expediente = [...caso.evidencias.slice(giro), ...caso.evidencias.slice(0, giro)];

  // Balanza: lo que afirmas contra lo que pruebas (en vivo, antes de hablar).
  const evSel = caso.evidencias.find((e) => e.id === iv.evidencia) ?? null;
  const preoSel = iv.preocupacion === TRAMPA ? caso.trampa.de : iv.preocupacion;
  const evOtra = evSel !== null && evSel.sobre !== null && preoSel !== undefined && evSel.sobre !== preoSel;
  const pesoVivo = evSel && !evOtra ? TIPOS_EVIDENCIA[evSel.tipo].peso : 0;
  const idealVivo = Math.max(1, pesoVivo);
  const desbalance = iv.evidencia === undefined ? 0 : iv.nivel - idealVivo;

  const leer = (id: string) => {
    if (leido.includes(id)) return;
    setLeidas((l) => ({ ...l, [casoId]: [...l[casoId], id] }));
    sfxBlip();
  };
  const poner = (cambio: Partial<Intervencion>) => {
    setInterv((x) => ({ ...x, [casoId]: { ...x[casoId], ...cambio } }));
    setHablado((h) => ({ ...h, [casoId]: false }));
    sfxBlip();
  };
  const hablar = () => {
    if (!resultado || !abierto) return;
    setHablado((h) => ({ ...h, [casoId]: true }));
    setIntervenciones((n) => n + 1);
    if (resultado.exceso > 0) setSobreafirmo(true);
    setMejores((m) => ({
      ...m,
      [casoId]: { votos: Math.max(m[casoId].votos, resultado.aFavor), cambiado: m[casoId].cambiado || resultado.zona === "cambiado" },
    }));
    if (resultado.zona === "cambiado") {
      sfxBien();
      sfxOk();
    } else {
      sfxNo();
    }
  };
  const resetForo = () => {
    setCasoId("bahia");
    setLeidas(porCaso<string[]>(() => []));
    setInterv(porCaso<Intervencion>(() => ({ ...NUEVA })));
    setHablado(porCaso(() => false));
    setMejores(porCaso(() => ({ votos: 0, cambiado: false })));
    setIntervenciones(0);
    setSobreafirmo(false);
  };

  // ── modo 2: Both sides (mapa del argumento) ──────────────────────────
  const [lPaso, setLPaso] = useState(0);
  const [lIntentos, setLIntentos] = useState<Record<string, string[]>>({});
  const [lUltimo, setLUltimo] = useState<OpcionConector | null>(null);
  const mapaFin = lPaso >= COLUMNA.length;
  const lectores = lectoresTras(lIntentos);
  const mapaMeta = mapaFin && lectores >= META_LECTORES;
  const oracion = COLUMNA[Math.min(lPaso, COLUMNA.length - 1)]!;
  const probadas = lIntentos[oracion.id] ?? [];
  const correcta = oracion.opciones.find((o) => o.tipo === "ok")!;
  const resuelta = probadas.includes(correcta.texto);

  const elegirConector = (op: OpcionConector) => {
    if (mapaFin || resuelta || probadas.includes(op.texto)) return;
    setLIntentos((c) => ({ ...c, [oracion.id]: [...(c[oracion.id] ?? []), op.texto] }));
    setLUltimo(op);
    if (op.tipo === "ok") sfxBien();
    else sfxNo();
  };
  const siguienteOracion = () => {
    if (!resuelta) return;
    setLUltimo(null);
    setLPaso((p) => p + 1);
    if (lPaso + 1 >= COLUMNA.length) sfxOk();
  };
  const resetMapa = () => {
    setLPaso(0);
    setLIntentos({});
    setLUltimo(null);
  };
  // Tarjetas del mapa: las oraciones resueltas en su lado, y el último intento fallido como fantasma.
  const colocadas = COLUMNA.slice(0, mapaFin ? COLUMNA.length : lPaso + (resuelta ? 1 : 0)).map((o) => ({
    id: o.id,
    lado: o.lado,
    texto: `${o.opciones.find((x) => x.tipo === "ok")!.texto}${o.resto}`,
  }));
  const fantasma = !mapaFin && lUltimo && lUltimo.tipo !== "ok" ? { lado: lUltimo.cae, texto: `${lUltimo.texto}${oracion.resto}`, tipo: lUltimo.tipo } : null;

  // ── modo 3: escribe el término ───────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
  };

  // ── modo 4: completa el texto (A2 y A6) ──────────────────────────────
  const [a2Done, setA2Done] = useState(false);
  const [a6Done, setA6Done] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const textoDone = a2Done && a6Done;
  const resetTexto = () => {
    setA2Done(false);
    setA6Done(false);
    setTextoIntento((n) => n + 1);
  };

  // ── reto (A3 + A4) ───────────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ─────────────────────────────────────────────────────────
  const modosHechos = (cambiados >= CASOS.length ? 1 : 0) + (mapaMeta ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const objetivos = [
    { txt: `Lee al menos ${MIN_LEER} evidencias del expediente de un caso`, done: algunExpediente, modo: "foro" },
    { txt: "Habla en el foro y mira cómo vota cada integrante", done: intervenciones > 0, modo: "foro" },
    { txt: "Afirma más de lo que prueba tu evidencia y mira qué le pasa a tu credibilidad", done: sobreafirmo, modo: "foro" },
    { txt: "Logra que el foro cambie un plan con tu propuesta", done: cambiados >= 1, modo: "foro" },
    { txt: "Consigue los 6 votos en un caso: evidencia fuerte y sin exagerar", done: unanimes >= 1, modo: "foro" },
    { txt: "Cambia los 3 planes del foro", done: cambiados >= CASOS.length, modo: "foro" },
    { txt: "Termina la columna de Ximena eligiendo cada conector", done: mapaFin, modo: "lados" },
    { txt: `Termina la columna con al menos ${META_LECTORES} de ${LECTORES} lectores que te siguen`, done: mapaMeta, modo: "lados" },
    { txt: "Escribe los 4 modales y los 4 conectores de contraste de la lectura", done: glosarioDone, modo: "glosario" },
    { txt: "Completa los textos de opinión A2 y A6", done: textoDone, modo: "texto" },
    { txt: "Aprueba el reto verdadero o falso (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "foro" ? resetForo : modo === "lados" ? resetMapa : modo === "glosario" ? resetGlosario : resetTexto;

  const lectura =
    modo === "foro" ? (
      visto ? (
        <>Votes {visto.aFavor}/{FORO.length} · credibility {visto.cred}</>
      ) : (
        <>{caso.lugar} · evidence read {leido.length}/{caso.evidencias.length}</>
      )
    ) : modo === "lados" ? (
      <>Readers following: {lectores}/{LECTORES}</>
    ) : modo === "glosario" ? (
      <>Write each modal and connector</>
    ) : (
      <>Fill in the missing words</>
    );

  const partes = partesIntervencion(caso, iv);

  return (
    <LabShell
      accent={accent}
      rgba={rgba}
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
        <div className="op" style={{ ["--op-a" as string]: accent, ["--op-r" as string]: rgba }}>
          <style>{CSS}</style>

          {modo === "foro" && (
            <div className="op-col">
              <p className="op-intro">
                <i className="fa-solid fa-landmark" aria-hidden /> Foro Ciudadano de Bahía Serena <span>(simulación)</span>. Elige un plan, lee
                el expediente y di en inglés qué te preocupa. Seis integrantes votan si el plan cambia.
              </p>

              <div className="op-casos" role="tablist" aria-label="Planes del foro">
                {CASOS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={c.id === casoId}
                    className="op-caso"
                    data-on={c.id === casoId}
                    data-ok={mejores[c.id].cambiado}
                    onClick={() => setCasoId(c.id)}
                  >
                    <i className={`fa-solid ${mejores[c.id].cambiado ? "fa-circle-check" : c.icono}`} aria-hidden />
                    <span className="op-caso-txt">
                      <strong>{c.lugar}</strong>
                      <span>Best: {mejores[c.id].votos}/{FORO.length} votes</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="op-plan-foto">
                <i className={`fa-solid ${caso.icono}`} aria-hidden />
                <ImgSim key={caso.id} src={`${RUTA_FOTOS}/caso-${caso.id}.webp`} />
                <span className="op-tag">{caso.plan}</span>
              </div>
              <p className="op-intro">{caso.planEs}</p>

              <div className="op-orador">
                <div className="op-retrato">
                  <i className="fa-solid fa-user-tie" aria-hidden />
                  <ImgSim key={`o-${caso.id}`} src={`${RUTA_FOTOS}/orador-${caso.id}.webp`} />
                </div>
                <div className="op-globo">
                  <span className="op-globo-quien">
                    {caso.orador.nombre} · {caso.orador.rol}
                  </span>
                  <strong>«{caso.orador.dice}»</strong>
                  <span>{caso.orador.diceEs}</span>
                </div>
              </div>

              {/* Paso 1 · expediente */}
              <section className="op-paso">
                <h3>
                  <span className="op-num">1</span> Read the file <small>Toca cada documento ({leido.length}/{caso.evidencias.length})</small>
                </h3>
                <div className="op-expediente">
                  {expediente.map((e, i) => {
                    const ya = leido.includes(e.id);
                    const t = TIPOS_EVIDENCIA[e.tipo];
                    return (
                      <button key={e.id} type="button" className="op-doc" data-leido={ya} onClick={() => leer(e.id)}>
                        <i className={`fa-solid ${ya ? t.icono : "fa-file-lines"}`} aria-hidden />
                        {ya ? (
                          <span className="op-doc-txt">
                            <span className="op-doc-tipo">
                              {t.en} · {t.es}
                              <span className="op-pesas" aria-label={`Peso ${t.peso} de 3`}>
                                {[1, 2, 3].map((k) => (
                                  <span key={k} data-on={k <= t.peso} />
                                ))}
                              </span>
                            </span>
                            <em>{e.texto}</em>
                          </span>
                        ) : (
                          <span className="op-doc-txt">
                            <strong>Document {i + 1}</strong>
                            <span>Toca para leerlo</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Paso 2 · intervención */}
              <section className="op-paso">
                <h3>
                  <span className="op-num">2</span> Build your turn <small>Opinión + evidencia + conclusión</small>
                </h3>
                {!abierto ? (
                  <div className="op-candado">
                    <i className="fa-solid fa-lock" aria-hidden /> Lee al menos {MIN_LEER} documentos: sin conocer el caso no puedes opinar con
                    evidencia.
                  </div>
                ) : (
                  <div className="op-piezas">
                    <div className="op-pieza">
                      <div className="op-pieza-cab">
                        <strong>a · Answer {caso.orador.nombre}</strong>
                        <span>¿Cómo respondes a lo que dijo?</span>
                      </div>
                      <div className="op-ops">
                        {APERTURAS.map((a) => (
                          <button key={a.id} type="button" className="op-op" data-sel={iv.apertura === a.id} onClick={() => poner({ apertura: a.id })}>
                            {a.texto || <span className="op-nada">(no answer, go straight to your point)</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="op-pieza">
                      <div className="op-pieza-cab">
                        <strong>b · Your concern</strong>
                        <span>¿Qué te preocupa?</span>
                      </div>
                      <div className="op-ops">
                        {opcionesPreocupacion(caso).map((p) => (
                          <button key={p.id} type="button" className="op-op" data-sel={iv.preocupacion === p.id} onClick={() => poner({ preocupacion: p.id })}>
                            {p.texto}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="op-pieza">
                      <div className="op-pieza-cab">
                        <strong>c · How sure do you sound?</strong>
                        <span>will &gt; could &gt; might</span>
                      </div>
                      <Deslizador
                        label="Strength of your claim"
                        icon="fa-gauge-high"
                        colr={accent}
                        valor={NIVELES[iv.nivel].modal}
                        min={1}
                        max={3}
                        step={1}
                        value={iv.nivel}
                        onChange={(v) => poner({ nivel: v as Nivel })}
                        hintL="might · menos seguro"
                        hintR="will · certeza alta"
                      />
                    </div>

                    <div className="op-pieza">
                      <div className="op-pieza-cab">
                        <strong>d · Your evidence</strong>
                        <span>Sólo los documentos que leíste</span>
                      </div>
                      <div className="op-ops">
                        {expediente
                          .filter((e) => leido.includes(e.id))
                          .map((e) => (
                            <button key={e.id} type="button" className="op-op" data-sel={iv.evidencia === e.id} onClick={() => poner({ evidencia: e.id })}>
                              {e.texto}
                            </button>
                          ))}
                        <button type="button" className="op-op" data-sel={iv.evidencia === SIN_EVIDENCIA} onClick={() => poner({ evidencia: SIN_EVIDENCIA })}>
                          <span className="op-nada">(no evidence: just my opinion)</span>
                        </button>
                      </div>
                    </div>

                    <div className="op-pieza">
                      <div className="op-pieza-cab">
                        <strong>e · Your proposal</strong>
                        <span>La conclusión: ¿qué pides?</span>
                      </div>
                      <div className="op-ops">
                        {caso.propuestas.map((p) => (
                          <button key={p.id} type="button" className="op-op" data-sel={iv.propuesta === p.id} onClick={() => poner({ propuesta: p.id })}>
                            {p.texto}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* La balanza: lo que afirmas contra lo que pruebas */}
                <Balanza
                  nivel={iv.nivel}
                  peso={pesoVivo}
                  sinEvidencia={iv.evidencia === undefined}
                  otra={evOtra}
                  desbalance={desbalance}
                  tipoEs={evSel ? TIPOS_EVIDENCIA[evSel.tipo].es : iv.evidencia === SIN_EVIDENCIA ? "Sin evidencia" : "Elige una evidencia"}
                />

                <div className="op-vista">
                  <span className="op-vista-tit">Your turn at the forum</span>
                  <p>
                    {partes.map((p) => (
                      <span key={p.parte}>
                        {p.texto === null ? <span className="op-hueco">______</span> : p.texto ? <mark data-p={p.parte}>{p.texto}</mark> : null}{" "}
                      </span>
                    ))}
                  </p>
                  <button type="button" className="op-hablar" disabled={!completa || !abierto || hablado[casoId]} onClick={hablar}>
                    <i className="fa-solid fa-microphone" aria-hidden />
                    {hablado[casoId] ? "Change a piece to speak again" : completa ? "Speak at the forum" : "Choose all five pieces"}
                  </button>
                </div>
              </section>

              {/* Paso 3 · el foro reacciona */}
              <section className="op-paso">
                <h3>
                  <span className="op-num">3</span> The forum votes <small>El plan cambia con {VOTOS_PARA_CAMBIAR} votos y una propuesta concreta</small>
                </h3>

                <div className="op-medidores">
                  {(Object.keys(MEDIDORES) as Medidor[]).map((m) => {
                    const v = visto ? visto[m] : 0;
                    return (
                      <div key={m} className="op-medidor">
                        <span className="op-medidor-cab">
                          <span>
                            <i className={`fa-solid ${MEDIDORES[m].icono}`} aria-hidden /> {MEDIDORES[m].en} · {MEDIDORES[m].es}
                          </span>
                          <strong>{visto ? v : "—"}</strong>
                        </span>
                        <div className="op-barra" aria-label={`${MEDIDORES[m].es} ${v}`}>
                          <div style={{ width: `${v}%` }} />
                          <span style={{ left: "65%" }} aria-hidden />
                          <span style={{ left: "80%" }} aria-hidden />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="op-termo">
                  <div className="op-termo-cab">
                    <span>
                      <i className="fa-solid fa-temperature-half" aria-hidden /> Decision
                    </span>
                    <strong style={{ color: visto ? ZONA_COLOR[visto.zona] : T.text3 }}>{visto ? ZONAS[visto.zona].en : "Waiting for your turn"}</strong>
                  </div>
                  <div className="op-termo-tubo">
                    <span className="op-termo-z" data-z="aprobado" />
                    <span className="op-termo-z" data-z="pendiente" />
                    <span className="op-termo-z" data-z="cambiado" />
                    <span className="op-termo-marca" style={{ left: `${((visto?.aFavor ?? 0) / FORO.length) * 100}%` }} aria-hidden />
                  </div>
                  <div className="op-termo-pie">
                    <span>0</span>
                    <span>votes in favor of your proposal</span>
                    <span>{FORO.length}</span>
                  </div>
                  {visto && <p className="op-termo-es">{ZONAS[visto.zona].es}</p>}
                </div>

                <div className="op-foro">
                  {FORO.map((m, i) => {
                    const v = visto?.votos[i];
                    const estado = !v ? "espera" : v.aFavor ? "si" : "no";
                    return (
                      <article key={m.id} className="op-miembro" data-estado={estado}>
                        <div className="op-miembro-cab">
                          <span className="op-avatar">
                            <i className={`fa-solid ${m.icono}`} aria-hidden />
                          </span>
                          <span className="op-miembro-nombre">
                            <strong>{m.nombre}</strong>
                            <span>
                              {m.rol} · {MEDIDORES[m.medidor].es} ≥ {m.umbral}
                            </span>
                          </span>
                          <span className="op-voto">
                            <i className={`fa-solid ${estado === "si" ? "fa-hand" : estado === "no" ? "fa-hand-back-fist" : "fa-ellipsis"}`} aria-hidden />
                            {estado === "si" ? "Yes" : estado === "no" ? "No" : "…"}
                          </span>
                        </div>
                        {v && (
                          <>
                            <p className="op-dice">«{v.dice}»</p>
                            <p className="op-porque">{v.porque}</p>
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
                {visto?.zona === "cambiado" && (
                  <p className="op-ok">
                    <i className="fa-solid fa-gavel" aria-hidden /> ¡El plan de {caso.lugar} cambia con tu propuesta!{" "}
                    {visto.aFavor < FORO.length ? "Revisa quién votó en contra y por qué: aún puedes lograr los 6 votos." : "Seis de seis: prueba otro plan."}
                  </p>
                )}
              </section>
            </div>
          )}

          {modo === "lados" && (
            <div className="op-col">
              <div className="op-plan-foto">
                <i className="fa-solid fa-solar-panel" aria-hidden />
                <ImgSim src={`${RUTA_FOTOS}/columna-salinas.webp`} />
                <span className="op-tag">
                  {COLUMNA_TITULO} · {COLUMNA_AUTORA}
                </span>
              </div>
              <p className="op-intro">
                Ximena escribe una columna de opinión para el periódico escolar <span>(ficticia)</span>. Elige el conector de cada oración: decide en
                qué lado del mapa cae la idea. Un conector del lado equivocado cuesta {COSTO_LADO} lectores; uno de contraste mal construido, {COSTO_GRAMATICA}.
              </p>

              <div className="op-lectores" aria-label={`${lectores} de ${LECTORES} lectores siguen la columna`}>
                {Array.from({ length: LECTORES }, (_, i) => (
                  <span key={i} className="op-lector" data-on={i < lectores}>
                    <i className={`fa-solid ${i < lectores ? "fa-book-open-reader" : "fa-user-slash"}`} aria-hidden />
                  </span>
                ))}
                <strong style={{ color: lectores >= META_LECTORES ? OK : AMBAR }}>
                  {lectores}/{LECTORES}
                </strong>
              </div>

              {!mapaFin ? (
                <div className="op-actual">
                  <span className="op-vista-tit">
                    Sentence {lPaso + 1} of {COLUMNA.length}
                  </span>
                  <p className="op-linea">
                    <span className="op-hueco" data-ok={resuelta}>
                      {resuelta ? correcta.texto : "______"}
                    </span>
                    {oracion.resto}
                  </p>
                  <div className="op-ops op-ops-con">
                    {oracion.opciones.map((op) => {
                      const probada = probadas.includes(op.texto);
                      return (
                        <button
                          key={op.texto}
                          type="button"
                          className="op-op op-op-con"
                          data-c={probada ? op.tipo : undefined}
                          disabled={probada || resuelta}
                          onClick={() => elegirConector(op)}
                        >
                          {op.texto}
                        </button>
                      );
                    })}
                  </div>
                  {lUltimo && (
                    <div className="op-retro" style={{ ["--rc" as string]: colorTipo(lUltimo.tipo) }}>
                      <strong>
                        <i
                          className={`fa-solid ${lUltimo.tipo === "ok" ? "fa-circle-check" : lUltimo.tipo === "lado" ? "fa-arrows-left-right" : "fa-spell-check"}`}
                          aria-hidden
                        />{" "}
                        {lUltimo.tipo === "ok"
                          ? "The idea lands on the right side."
                          : lUltimo.tipo === "lado"
                            ? `Contradiction! ${COSTO_LADO} readers lost the thread.`
                            : `Right side, broken sentence: ${COSTO_GRAMATICA} reader lost.`}
                      </strong>
                      <span>{lUltimo.porque}</span>
                    </div>
                  )}
                  {resuelta && (
                    <button type="button" className="op-btn" onClick={siguienteOracion}>
                      {lPaso + 1 >= COLUMNA.length ? "Publish the column" : "Next sentence"} <i className="fa-solid fa-arrow-right" aria-hidden />
                    </button>
                  )}
                </div>
              ) : (
                <div className="op-retro" style={{ ["--rc" as string]: mapaMeta ? OK : AMBAR }}>
                  <strong>
                    {mapaMeta ? "Published! Readers can follow both sides." : `Published, but only ${lectores} of ${LECTORES} readers followed it.`}
                  </strong>
                  <span>
                    {mapaMeta
                      ? "Moreover y Also suman del mismo lado; However y On the other hand cambian de lado; Although va con oración completa y Despite con sustantivo; In conclusion cierra."
                      : `Necesitas al menos ${META_LECTORES} lectores. Reinicia la columna y fíjate de qué lado está cada idea antes de elegir.`}
                  </span>
                  <button type="button" className="op-btn" onClick={resetMapa}>
                    <i className="fa-solid fa-rotate-left" aria-hidden /> Write it again
                  </button>
                </div>
              )}

              <div className="op-mapa" aria-label="Mapa del argumento">
                {LADOS.map((l) => (
                  <div key={l.id} className="op-lado" data-lado={l.id}>
                    <span className="op-lado-tit">
                      <i className={`fa-solid ${l.icono}`} aria-hidden /> {l.titulo} <small>{l.es}</small>
                    </span>
                    {l.id === "pro" && <div className="op-tarjeta" data-t="op">{COLUMNA_APERTURA}</div>}
                    {colocadas
                      .filter((c) => c.lado === l.id)
                      .map((c) => (
                        <div key={c.id} className="op-tarjeta" data-t="ok">
                          {c.texto}
                        </div>
                      ))}
                    {fantasma && fantasma.lado === l.id && (
                      <div className="op-tarjeta" data-t={fantasma.tipo}>
                        {fantasma.texto}
                      </div>
                    )}
                  </div>
                ))}
                <div className="op-lado op-cierre" data-lado="cierre">
                  <span className="op-lado-tit">
                    <i className="fa-solid fa-flag-checkered" aria-hidden /> Conclusion <small>Conclusión</small>
                  </span>
                  {colocadas
                    .filter((c) => c.lado === "cierre")
                    .map((c) => (
                      <div key={c.id} className="op-tarjeta" data-t="ok">
                        {c.texto}
                      </div>
                    ))}
                  {fantasma && fantasma.lado === "cierre" && (
                    <div className="op-tarjeta" data-t={fantasma.tipo}>
                      {fantasma.texto}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {modo === "glosario" && (
            <div className="op-caja">
              <h3 className="op-caja-tit">
                <i className="fa-solid fa-spell-check" aria-hidden /> Modales y conectores de contraste · IN-V-P04-A1
              </h3>
              <EscribeTermino
                key={glosarioIntento}
                pares={PARES_MODALES}
                accent={accent}
                rgba={rgba}
                completado={glosarioDone}
                instrucciones="Lee la función y la oración de la lectura A1 con el hueco, y escribe el modal o el conector en inglés. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  sfxOk();
                }}
                onAcierto={sfxBien}
                onError={sfxNo}
              />
            </div>
          )}

          {modo === "texto" && (
            <div className="op-col">
              <div className="op-caja">
                <h3 className="op-caja-tit">
                  <i className="fa-solid fa-earth-americas" aria-hidden /> Giving opinions with evidence (A2)
                </h3>
                <CompletaTexto
                  key={`a2-${textoIntento}`}
                  data={OPINIONES_HUECOS_A2}
                  accent={accent}
                  rgba={rgba}
                  completado={a2Done}
                  onCompletado={() => {
                    setA2Done(true);
                    sfxOk();
                  }}
                  onAcierto={sfxBien}
                  onError={sfxNo}
                />
              </div>
              <div className="op-caja">
                <h3 className="op-caja-tit">
                  <i className="fa-solid fa-school" aria-hidden /> Expressing opinions and concerns (A6)
                </h3>
                <CompletaTexto
                  key={`a6-${textoIntento}`}
                  data={OPINIONES_HUECOS_A6}
                  accent={accent}
                  rgba={rgba}
                  completado={a6Done}
                  onCompletado={() => {
                    setA6Done(true);
                    sfxOk();
                  }}
                  onAcierto={sfxBien}
                  onError={sfxNo}
                />
              </div>
            </div>
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
                <MarcadorPartida partida={partida} accent={accent} rgba={rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Planes cambiados" value={`${cambiados}/${CASOS.length}`} col={cambiados >= CASOS.length ? OK : undefined} />
                  <Dato label="Intervenciones" value={`${intervenciones}`} />
                  <Dato label="Lectores" value={`${lectores}/${LECTORES}`} col={mapaMeta ? OK : undefined} />
                  <Dato label="Estrellas" value={`${estrellas}/3`} col={estrellas >= 3 ? AMBAR : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="La balanza: afirma lo que pruebas" icono="fa-scale-balanced">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cada evidencia pesa: estudio o medición <strong style={{ color: OK }}>3</strong>, registro o encuesta{" "}
                  <strong style={{ color: OK }}>2</strong>, ejemplo personal <strong style={{ color: AMBAR }}>1</strong>, rumor o nada{" "}
                  <strong style={{ color: NO }}>0</strong>. Con peso 3 puedes decir «will»; con 2, «could»; con 1 o menos, sólo «might».
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  Afirmar de más baja la <strong style={{ color: T.text }}>credibilidad</strong> 25 puntos por escalón; quedarte corto baja la{" "}
                  <strong style={{ color: T.text }}>claridad</strong> 12. Una evidencia de otro tema no cuenta y resta 20.
                </p>
              </Bloque>
              <Bloque titulo="Cómo vota el foro" icono="fa-people-group">
                <p style={{ margin: 0, color: T.text2 }}>
                  Dos integrantes miran cada medidor: uno vota a favor desde 65 y el otro desde 80. El plan cambia con {VOTOS_PARA_CAMBIAR} votos o
                  más y una propuesta concreta que resuelva tu preocupación.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Respeto:</strong> responder con «I see your point, but…» suma; «That makes no sense» resta
                  mucho; una propuesta extrema también.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Claridad:</strong> preocupación bien construida (worried about + sustantivo o -ing),
                  evidencia y una propuesta concreta de tu tema.
                </p>
              </Bloque>
              <Bloque titulo="Frases para presentar evidencia · A1" icono="fa-quote-left">
                {FRASES_EVIDENCIA_A1.map((f) => (
                  <p key={f.en} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{f.en}</strong> ({f.es})
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
              quiz={RETO_QUIZ}
              accent={accent}
              rgba={rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Ya distingues opinión y evidencia, la escala will > should > could > might, los conectores de contraste y worried about + -ing."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo={`Lectura A1 · ${LECTURA_A1.titulo}`} icono="fa-book-open-reader">
                <div style={{ color: T.text2, whiteSpace: "pre-line", lineHeight: 1.6 }}>{LECTURA_A1.texto}</div>
                <p style={{ margin: 0, color: T.text3 }}>Fuente: {LECTURA_A1.fuente}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que…?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{LECTURA_A1.callout}</p>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión · A1" icono="fa-circle-question">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} className="op-det">
                    <summary>{c.pregunta}</summary>
                    <p>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Glosario · A5" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <div key={g.termino} className="op-glos">
                    <strong>{g.termino}</strong>
                    <span>{g.definicion}</span>
                    <em>{g.ejemplo}</em>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Actividad final:</strong> {ACTIVIDAD_FINAL_A5}
                </p>
              </Bloque>
              <Bloque titulo={`A9 · ${A9.titulo}`} icono="fa-arrows-left-right">
                <p style={{ margin: 0, color: T.text2 }}>{A9.instrucciones}</p>
                <p style={{ margin: 0, color: T.text3 }}>
                  Las parejas son cinco términos del glosario A5 con su definición. Definición distractora: «{A9.distractor}»
                </p>
              </Bloque>
              <Bloque titulo={`Video · A8 · ${VIDEO_A8.titulo}`} icono="fa-circle-play">
                <p style={{ margin: 0, color: T.text2 }}>{VIDEO_A8.descripcion}</p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.abierta}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  {VIDEO_A8.opcionMultiple.pregunta}{" "}
                  <strong style={{ color: OK }}>{VIDEO_A8.opcionMultiple.opciones[VIDEO_A8.opcionMultiple.correcta]}</strong>
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  {VIDEO_A8.verdaderoFalso.enunciado} <strong style={{ color: OK }}>{VIDEO_A8.verdaderoFalso.respuesta ? "Verdadero" : "Falso"}</strong>
                </p>
              </Bloque>
              <Bloque titulo="Autoevaluación · A7" icono="fa-list-check">
                <p style={{ margin: 0, color: T.text3 }}>
                  {AUTOEVALUACION_A7.instrucciones} Escala: {AUTOEVALUACION_A7.escala.join(" · ")}.
                </p>
                {AUTOEVALUACION_A7.criterios.map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-regular fa-square-check" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {c}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>{AUTOEVALUACION_A7.reflexion}</p>
              </Bloque>
              <Bloque titulo="Qué es verbatim" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de IN-V-P04:</strong> la lectura A1 con sus preguntas y su nota, los dos textos con
                  huecos (A2 y A6), los dos verdadero/falso (A3 y A4, el reto), el glosario (A5, que A9 reconstruye), la autoevaluación (A7) y
                  las preguntas del video (A8). <strong style={{ color: T.text2 }}>Escrito para este laboratorio:</strong> el Foro Ciudadano de
                  Bahía Serena, sus tres planes, los oradores, los expedientes y la columna de Ximena. Lugares, personas, instituciones y cifras
                  son <strong style={{ color: T.text2 }}>ficticios</strong> (simulación). Inglés estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={OPINIONES_PREOCUPACIONES_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La balanza: a la izquierda lo que afirmas (might / could / will), a la
 * derecha lo que pruebas (el peso de la evidencia). Si afirmas de más, se
 * hunde la izquierda y se pone roja; si te quedas corto, se inclina a la
 * derecha en ámbar; en equilibrio, verde.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Balanza({ nivel, peso, sinEvidencia, otra, desbalance, tipoEs }: {
  nivel: Nivel;
  peso: number;
  sinEvidencia: boolean;
  otra: boolean;
  desbalance: number;
  tipoEs: string;
}) {
  const ang = sinEvidencia ? 0 : -desbalance * 11;
  const col = sinEvidencia ? "rgba(255,255,255,0.45)" : desbalance > 0 ? NO : desbalance < 0 ? AMBAR : OK;
  const rad = (ang * Math.PI) / 180;
  const brazo = 105;
  const izq = { x: 160 - brazo * Math.cos(rad), y: 44 - brazo * Math.sin(rad) };
  const der = { x: 160 + brazo * Math.cos(rad), y: 44 + brazo * Math.sin(rad) };
  const estado = sinEvidencia
    ? "Elige tu evidencia para pesar tu afirmación."
    : desbalance > 0
      ? `Afirmas de más: con esta evidencia lo honesto es «${NIVELES[Math.max(1, peso) as Nivel].modal}».`
      : desbalance < 0
        ? `Te quedas corto: tu evidencia permite «${NIVELES[Math.max(1, peso) as Nivel].modal}».`
        : "En equilibrio: afirmas justo lo que pruebas.";
  return (
    <div className="op-balanza" style={{ ["--bc" as string]: col }}>
      <svg viewBox="0 0 320 150" role="img" aria-label={estado}>
        <polygon points="160,44 145,140 175,140" fill="rgba(255,255,255,0.18)" />
        <rect x="120" y="136" width="80" height="8" rx="4" fill="rgba(255,255,255,0.22)" />
        <line x1={izq.x} y1={izq.y} x2={der.x} y2={der.y} stroke={col} strokeWidth="7" strokeLinecap="round" style={{ transition: "all .45s ease" }} />
        <circle cx="160" cy="44" r="8" fill={col} />
        {/* plato izquierdo: lo que afirmas */}
        <g style={{ transition: "transform .45s ease" }} transform={`translate(${izq.x} ${izq.y})`}>
          <line x1="0" y1="0" x2="-26" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <line x1="0" y1="0" x2="26" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M -38 40 Q 0 66 38 40 Z" fill="rgba(255,255,255,0.14)" stroke={col} strokeWidth="2.5" />
          <text x="0" y="36" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff">
            {NIVELES[nivel].modal}
          </text>
        </g>
        {/* plato derecho: lo que pruebas */}
        <g style={{ transition: "transform .45s ease" }} transform={`translate(${der.x} ${der.y})`}>
          <line x1="0" y1="0" x2="-26" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <line x1="0" y1="0" x2="26" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M -38 40 Q 0 66 38 40 Z" fill="rgba(255,255,255,0.14)" stroke={col} strokeWidth="2.5" />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={-27 + k * 19} y={k < peso ? 22 : 30} width="16" height={k < peso ? 18 : 10} rx="3" fill={k < peso ? col : "rgba(255,255,255,0.12)"} />
          ))}
        </g>
      </svg>
      <div className="op-balanza-datos">
        <span>
          <small>What you claim</small>
          <strong>
            {NIVELES[nivel].modal} · {NIVELES[nivel].es}
          </strong>
        </span>
        <span>
          <small>What you prove</small>
          <strong>
            {tipoEs} · {otra ? "otro tema (0)" : `peso ${peso}`}
          </strong>
        </span>
      </div>
      <p className="op-balanza-estado">{estado}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: si el archivo aún no existe se oculta y queda el
 * degradado con el ícono que va detrás.
 * ═══════════════════════════════════════════════════════════════════════════ */
function ImgSim({ src }: { src: string }) {
  const [rota, setRota] = useState(false);
  if (rota) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setRota(true)} />;
}

const CSS = `
.op { display:flex; flex-direction:column; gap:14px; min-width:0; color:${T.text}; font-size:15px; }
.op-col { display:flex; flex-direction:column; gap:14px; min-width:0; }
.op-intro { margin:0; color:${T.text2}; font-size:15px; line-height:1.5; }
.op-intro i { color:var(--op-a); margin-right:6px; }
.op-intro span { color:${T.text3}; }

.op-casos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap:8px; }
.op-caso { cursor:pointer; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:14px; border:1.5px solid ${T.line};
  background:${T.glass}; color:${T.text}; text-align:left; transition:all .15s; min-width:0; }
.op-caso:hover { border-color:${T.lineStrong}; }
.op-caso[data-on="true"] { border-color:var(--op-a); background:rgba(var(--op-r),0.14); }
.op-caso > i { font-size:20px; color:var(--op-a); width:26px; text-align:center; flex-shrink:0; }
.op-caso[data-ok="true"] > i { color:${OK}; }
.op-caso-txt { display:flex; flex-direction:column; min-width:0; }
.op-caso-txt strong { font-size:15px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.op-caso-txt span { font-size:14px; color:${T.text3}; }

.op-plan-foto { position:relative; min-height:160px; aspect-ratio:16/7; border-radius:16px; overflow:hidden; border:1.5px solid ${T.line};
  display:flex; align-items:center; justify-content:center;
  background:radial-gradient(90% 90% at 30% 20%, rgba(var(--op-r),0.35) 0%, transparent 60%), linear-gradient(135deg, #11283d 0%, #08131f 100%); }
.op-plan-foto > i { font-size:58px; color:rgba(255,255,255,0.16); }
.op-plan-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.op-tag { position:absolute; left:10px; right:10px; bottom:10px; padding:7px 12px; border-radius:12px; background:rgba(2,12,28,.84); color:#fff;
  font-size:15px; font-weight:800; line-height:1.35; }

.op-orador { display:flex; gap:12px; align-items:flex-start; min-width:0; }
.op-retrato { position:relative; width:58px; height:58px; border-radius:50%; overflow:hidden; flex-shrink:0; border:3px solid ${AMBAR};
  display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(var(--op-r),0.4), #08131f); }
.op-retrato > i { font-size:24px; color:${AMBAR}; }
.op-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.op-globo { position:relative; display:flex; flex-direction:column; gap:4px; padding:11px 14px; border-radius:4px 16px 16px 16px; min-width:0;
  background:${T.glassSoft}; border:1px solid ${T.lineStrong}; }
.op-globo-quien { font-size:14px; font-weight:800; color:${AMBAR}; }
.op-globo strong { font-size:16px; line-height:1.4; }
.op-globo > span:last-child { font-size:14px; color:${T.text3}; }

.op-paso { display:flex; flex-direction:column; gap:12px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.op-paso h3 { margin:0; display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:17px; font-weight:900; }
.op-paso h3 small { font-size:14px; font-weight:600; color:${T.text3}; }
.op-num { width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:var(--op-a);
  color:#04121f; font-size:15px; font-weight:900; }

.op-expediente { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:8px; }
.op-doc { cursor:pointer; display:flex; align-items:flex-start; gap:10px; padding:12px; border-radius:13px; border:1.5px dashed ${T.lineStrong};
  background:${T.inset}; color:${T.text}; text-align:left; transition:all .15s; min-width:0; }
.op-doc:hover { border-color:var(--op-a); }
.op-doc > i { font-size:22px; color:var(--op-a); width:28px; text-align:center; flex-shrink:0; margin-top:2px; }
.op-doc[data-leido="true"] { border-style:solid; border-color:rgba(var(--op-r),0.55); background:rgba(var(--op-r),0.08); cursor:default; animation:opPop .3s ease; }
.op-doc-txt { display:flex; flex-direction:column; gap:4px; min-width:0; }
.op-doc-txt strong { font-size:15px; }
.op-doc-txt > span { font-size:14px; color:${T.text3}; }
.op-doc-txt em { font-size:15px; color:${T.text}; font-style:normal; line-height:1.4; }
.op-doc-tipo { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; font-size:14px !important; font-weight:800; color:${T.text2} !important; }
.op-pesas { display:inline-flex; gap:3px; }
.op-pesas span { width:12px; height:12px; border-radius:3px; background:rgba(255,255,255,0.12); }
.op-pesas span[data-on="true"] { background:var(--op-a); }

.op-candado { display:flex; align-items:center; gap:10px; padding:14px; border-radius:12px; border:1.5px dashed ${T.lineStrong};
  color:${T.text2}; font-size:15px; background:${T.inset}; }
.op-candado i { color:${AMBAR}; }
.op-piezas { display:flex; flex-direction:column; gap:14px; }
.op-pieza { display:flex; flex-direction:column; gap:7px; }
.op-pieza-cab { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 10px; }
.op-pieza-cab strong { font-size:15px; }
.op-pieza-cab span { font-size:14px; color:${T.text3}; }
.op-ops { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:8px; }
.op-op { cursor:pointer; text-align:left; padding:10px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
  color:#fff; font-size:15px; font-weight:700; line-height:1.35; transition:all .14s; }
.op-op:hover:not(:disabled) { border-color:var(--op-a); }
.op-op:disabled { cursor:default; }
.op-op[data-sel="true"] { border-color:var(--op-a); background:rgba(var(--op-r),0.22); }
.op-op[data-c="ok"] { border-color:${OK}; background:${OK}22; }
.op-op[data-c="gramatica"] { border-color:${AMBAR}; background:${AMBAR}1c; }
.op-op[data-c="lado"] { border-color:${NO}; background:${NO}1c; animation:opShake .4s; }
.op-op-con { text-align:center; font-size:16px; }
.op-nada { color:${T.text3}; font-style:italic; font-weight:600; }

.op-balanza { display:flex; flex-direction:column; gap:8px; padding:12px; border-radius:14px; border:1.5px solid var(--bc); background:${T.inset};
  transition:border-color .3s; }
.op-balanza svg { width:100%; max-width:420px; height:auto; align-self:center; overflow:visible; }
.op-balanza-datos { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
.op-balanza-datos span { display:flex; flex-direction:column; gap:2px; min-width:0; }
.op-balanza-datos small { font-size:14px; color:${T.text3}; font-weight:700; }
.op-balanza-datos strong { font-size:15px; }
.op-balanza-datos span:last-child { text-align:right; }
.op-balanza-estado { margin:0; font-size:15px; font-weight:800; color:var(--bc); line-height:1.4; }

.op-vista { display:flex; flex-direction:column; gap:10px; padding:13px 15px; border-radius:14px; border:1px solid rgba(var(--op-r),0.4);
  background:rgba(var(--op-r),0.07); }
.op-vista-tit { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:var(--op-a); display:flex; gap:8px; align-items:center; }
.op-vista p { margin:0; font-size:16px; line-height:1.65; color:${T.text}; }
.op-vista mark { color:#fff; padding:1px 5px; border-radius:6px; font-weight:700; background:rgba(var(--op-r),0.2); }
.op-vista mark[data-p="fuerza"] { background:rgba(255,199,90,0.22); }
.op-vista mark[data-p="evidencia"] { background:rgba(52,211,153,0.2); }
.op-hueco { display:inline-block; min-width:60px; padding:0 6px; border-bottom:2px dashed ${T.lineStrong}; color:${T.text3}; }
.op-hueco[data-ok="true"] { border-bottom-color:${OK}; color:${OK}; font-weight:800; }
.op-hablar { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:11px 18px; border-radius:12px;
  border:none; background:var(--op-a); color:#04121f; font-size:15px; font-weight:900; transition:all .15s; }
.op-hablar:disabled { cursor:default; background:${T.inset}; color:${T.text3}; border:1px solid ${T.line}; }

.op-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:10px; }
.op-medidor { display:flex; flex-direction:column; gap:6px; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; }
.op-medidor-cab { display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
.op-medidor-cab i { color:var(--op-a); }
.op-medidor-cab strong { font-size:18px; color:#fff; font-family:ui-monospace, monospace; }
.op-barra { position:relative; height:12px; border-radius:8px; background:${T.glassSoft}; border:1px solid ${T.line}; overflow:visible; }
.op-barra > div { height:100%; border-radius:8px; background:linear-gradient(90deg, #FF8FAB, ${AMBAR}, ${OK}); transition:width .5s ease; }
.op-barra > span { position:absolute; top:-4px; bottom:-4px; width:2px; background:#fff; opacity:.6; }

.op-termo { display:flex; flex-direction:column; gap:8px; padding:12px 14px; border-radius:14px; border:1px solid ${T.lineStrong}; background:${T.inset}; }
.op-termo-cab { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:6px 12px; font-size:15px; font-weight:800; }
.op-termo-cab i { color:var(--op-a); }
.op-termo-cab strong { font-size:16px; }
.op-termo-tubo { position:relative; display:grid; grid-template-columns:2.5fr 2fr 1.5fr; height:18px; border-radius:999px; overflow:visible; }
.op-termo-z { height:100%; opacity:.55; }
.op-termo-z[data-z="aprobado"] { background:${NO}; border-radius:999px 0 0 999px; }
.op-termo-z[data-z="pendiente"] { background:${AMBAR}; }
.op-termo-z[data-z="cambiado"] { background:${OK}; border-radius:0 999px 999px 0; }
.op-termo-marca { position:absolute; top:-6px; width:8px; height:30px; margin-left:-4px; border-radius:4px; background:#fff;
  box-shadow:0 0 10px rgba(255,255,255,0.7); transition:left .6s cubic-bezier(.3,1.4,.5,1); }
.op-termo-pie { display:flex; justify-content:space-between; gap:8px; font-size:14px; color:${T.text3}; }
.op-termo-es { margin:0; font-size:15px; color:${T.text2}; }

.op-foro { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; }
.op-miembro { display:flex; flex-direction:column; gap:7px; padding:12px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset};
  transition:border-color .25s; }
.op-miembro[data-estado="si"] { border-color:${OK}88; }
.op-miembro[data-estado="no"] { border-color:${NO}88; }
.op-miembro[data-estado="si"] .op-avatar { animation:opBob 1.4s ease-in-out infinite; }
.op-miembro[data-estado="no"] .op-avatar { animation:opShake .5s 1; }
.op-miembro-cab { display:flex; align-items:center; gap:10px; min-width:0; }
.op-avatar { width:44px; height:44px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:19px;
  background:linear-gradient(135deg, rgba(var(--op-r),0.4), #08131f); color:#fff; }
.op-miembro-nombre { display:flex; flex-direction:column; min-width:0; flex:1; }
.op-miembro-nombre strong { font-size:15px; }
.op-miembro-nombre span { font-size:14px; color:${T.text3}; }
.op-voto { display:flex; flex-direction:column; align-items:center; gap:2px; font-size:14px; font-weight:900; color:${T.text3}; }
.op-voto i { font-size:20px; }
.op-miembro[data-estado="si"] .op-voto { color:${OK}; }
.op-miembro[data-estado="no"] .op-voto { color:${NO}; }
.op-dice { margin:0; font-size:15px; font-weight:700; color:#fff; line-height:1.4; }
.op-porque { margin:0; font-size:14px; color:${T.text2}; line-height:1.5; }
.op-ok { margin:0; font-size:15px; color:${OK}; line-height:1.45; }

.op-lectores { display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:10px; border-radius:14px; background:${T.inset}; border:1px solid ${T.line}; }
.op-lector { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; font-size:17px;
  background:rgba(var(--op-r),0.22); color:#fff; transition:all .35s; }
.op-lector[data-on="false"] { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.3); }
.op-lectores strong { margin-left:auto; font-size:18px; font-family:ui-monospace, monospace; }
.op-actual { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1.5px solid rgba(var(--op-r),0.5);
  background:rgba(var(--op-r),0.08); }
.op-linea { margin:0; font-size:18px; font-weight:700; line-height:1.55; }
.op-retro { display:flex; flex-direction:column; gap:6px; align-items:flex-start; padding:12px 14px; border-radius:13px; font-size:15px;
  line-height:1.5; color:${T.text2}; border:1.5px solid var(--rc); background:${T.glass}; }
.op-retro strong { color:#fff; font-size:15px; }
.op-retro strong i { color:var(--rc); }
.op-btn { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
  border:1.5px solid var(--op-a); background:rgba(var(--op-r),0.16); color:#fff; font-size:15px; font-weight:800; }

.op-mapa { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px; }
.op-lado { display:flex; flex-direction:column; gap:8px; padding:12px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; min-height:120px; min-width:0; }
.op-lado[data-lado="pro"] { border-color:rgba(52,211,153,0.4); }
.op-lado[data-lado="contra"] { border-color:rgba(255,199,90,0.4); }
.op-cierre { grid-column:1 / -1; min-height:70px; border-color:rgba(var(--op-r),0.5); }
.op-lado-tit { font-size:14px; font-weight:900; letter-spacing:.04em; text-transform:uppercase; color:${T.text2}; display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.op-lado-tit small { font-size:14px; font-weight:600; text-transform:none; letter-spacing:0; color:${T.text3}; }
.op-lado[data-lado="pro"] .op-lado-tit i { color:${OK}; }
.op-lado[data-lado="contra"] .op-lado-tit i { color:${AMBAR}; }
.op-tarjeta { padding:9px 11px; border-radius:10px; font-size:14px; line-height:1.45; color:${T.text}; background:${T.glassSoft};
  border:1.5px solid ${T.line}; animation:opPop .35s ease; }
.op-tarjeta[data-t="op"] { border-color:rgba(var(--op-r),0.6); font-weight:700; }
.op-tarjeta[data-t="ok"] { border-color:${OK}88; }
.op-tarjeta[data-t="lado"] { border-color:${NO}; background:${NO}1f; border-style:dashed; animation:opShake .45s; }
.op-tarjeta[data-t="gramatica"] { border-color:${AMBAR}; background:${AMBAR}1a; border-style:dashed; text-decoration:underline wavy ${AMBAR}; }

.op-caja { display:flex; flex-direction:column; gap:12px; padding:16px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.op-caja-tit { margin:0; font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px; }
.op-caja-tit i { color:var(--op-a); }

.op-det { border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; padding:10px 13px; }
.op-det summary { cursor:pointer; font-weight:700; color:${T.text2}; line-height:1.45; }
.op-det p { margin:9px 0 0; color:${T.text3}; }
.op-glos { display:flex; flex-direction:column; gap:3px; padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; }
.op-glos strong { color:#fff; }
.op-glos span { color:${T.text2}; }
.op-glos em { color:${T.text3}; font-style:normal; }

@keyframes opShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
@keyframes opBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
@keyframes opPop { 0%{transform:scale(.94);opacity:.4;} 100%{transform:scale(1);opacity:1;} }
@media (max-width: 560px) {
  .op-mapa { grid-template-columns:1fr; }
  .op-plan-foto { aspect-ratio:16/9; }
  .op-balanza-datos { grid-template-columns:1fr; }
  .op-balanza-datos span:last-child { text-align:left; }
}
@media (prefers-reduced-motion: reduce) {
  .op-op[data-c="lado"], .op-miembro[data-estado] .op-avatar, .op-doc[data-leido="true"], .op-tarjeta { animation:none; }
  .op-barra > div, .op-lector, .op-termo-marca { transition:none; }
}
`;
