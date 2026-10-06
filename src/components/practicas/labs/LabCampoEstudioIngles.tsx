"use client";

/**
 * Laboratorio — My field of study: describir un campo de estudio en inglés.
 * Práctica experimental para IN-V-P01 (Inglés V · «Explora y describe el área
 * de estudio, ocupación o interés del grupo»).
 *
 * «Career fair» es el simulador. En la feria de carreras (ficticia) hay cuatro
 * estaciones misteriosas, cada una un lugar de trabajo con cuatro objetos. El
 * alumno los observa, deduce qué campo es y arma la descripción con las seis
 * frases del glosario A5 (My field of study is… / This area involves… /
 * Professionals in this field work in… / They use… / It is related to… / One
 * of the main goals of this field is to…). Tres visitantes escuchan, cada uno
 * atento a dos datos: si la descripción es precisa se registran (la hoja se
 * llena); si mezcla campos se confunden y si rompe una regla dudan, y cada uno
 * dice por qué. El modelo es determinista y está en `campo-estudio-ingles-sim.ts`.
 *
 * Modos:
 *  · «Career fair»: el simulador.
 *  · «On stage»: la charla de Valeria; cada conector mal elegido deja a dos
 *    personas del público sin el hilo (conectores de A1).
 *  · «Escribe el término»: los siete campos del vocabulario de A1.
 *  · «Completa el texto»: los dos fill_blanks (A2 y A6), verbatim.
 *  + Reto V/F (A4) en la pestaña «Reto»; toda la teoría verbatim en «Teoría».
 *
 * DOM puro (sin three.js). Personas, escuela y empresas ficticias.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CAMPO_ESTUDIO_INGLES_FICHA } from "./campo-estudio-ingles-ficha";
import { CAMPO_ESTUDIO_HUECOS_A2, CAMPO_ESTUDIO_HUECOS_A6 } from "./campo-estudio-ingles-huecos";
import {
  LECTURA_A1,
  COMPRENSION_A1,
  CONECTORES_A1,
  PARES_CAMPOS,
  CONSIGNA_A3,
  RETO_QUIZ,
  GLOSARIO_A5,
  ACTIVIDAD_FINAL_A5,
  AUTOEVALUACION_A7,
  VIDEO_A8,
} from "./campo-estudio-ingles-data";
import {
  ESTACIONES,
  ESTACION,
  RANURAS,
  VISITANTES,
  CHARLA,
  CHARLA_APERTURA,
  PUBLICO,
  PERDIDOS_POR_ERROR,
  META_PUBLICO,
  UMBRAL_REGISTRO,
  PUNTOS_RANURA,
  CASTIGO_MEZCLA,
  opcionesDe,
  calidadDe,
  reaccionDe,
  type Animo,
  type CampoId,
  type Eleccion,
  type OpcionConector,
  type RanuraId,
} from "./campo-estudio-ingles-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-campo-estudio-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/campo-estudio-ingles";
/** Objetos que hay que observar para abrir la descripción de una estación. */
const MIN_OBSERVAR = 3;

type Modo = "feria" | "charla" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "feria", label: "Career fair", icono: "fa-store" },
  { id: "charla", label: "On stage", icono: "fa-microphone-lines" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const ANIMO: Record<Animo | "espera", { icono: string; col: string; txt: string }> = {
  feliz: { icono: "fa-face-smile-beam", col: OK, txt: "Signed up" },
  duda: { icono: "fa-face-meh", col: AMBAR, txt: "Not sure" },
  confuso: { icono: "fa-face-frown-open", col: NO, txt: "Confused" },
  espera: { icono: "fa-face-smile", col: "rgba(255,255,255,0.45)", txt: "Listening" },
};

function porCampo<V>(f: () => V): Record<CampoId, V> {
  return Object.fromEntries(ESTACIONES.map((e) => [e.id, f()])) as Record<CampoId, V>;
}

/** El conector correcto no siempre va en el mismo lugar. */
function opcionesCharla(i: number): OpcionConector[] {
  const ops = CHARLA[i]!.opciones;
  const giro = (i + 1) % ops.length;
  return [...ops.slice(giro), ...ops.slice(0, giro)];
}

export function LabCampoEstudioIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const rgba = color.rgba;
  const [modo, setModo] = useState<Modo>("feria");

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

  // ── modo 1: Career fair (simulador) ──────────────────────────────────
  const [estId, setEstId] = useState<CampoId>("nursing");
  const [observados, setObservados] = useState<Record<CampoId, string[]>>(() => porCampo<string[]>(() => []));
  const [elecciones, setElecciones] = useState<Record<CampoId, Eleccion>>(() => porCampo<Eleccion>(() => ({})));
  const [presentado, setPresentado] = useState<Record<CampoId, boolean>>(() => porCampo(() => false));
  const [registros, setRegistros] = useState<Record<CampoId, number>>(() => porCampo(() => 0));
  const [presentaciones, setPresentaciones] = useState(0);

  const est = ESTACION[estId];
  const obs = observados[estId];
  const abierta = obs.length >= MIN_OBSERVAR;
  const eleccion = elecciones[estId];
  const completa = RANURAS.every((r) => eleccion[r.id] !== undefined);
  const reacciones = presentado[estId] ? VISITANTES.map((v) => reaccionDe(v, estId, eleccion)) : null;
  const inscritos = reacciones ? reacciones.filter((r) => r.registra).length : 0;
  const interesProm = reacciones ? Math.round(reacciones.reduce((s, r) => s + r.interes, 0) / reacciones.length) : 0;
  const ganadas = ESTACIONES.filter((e) => registros[e.id] >= VISITANTES.length).length;
  const algunaObservada = ESTACIONES.some((e) => observados[e.id].length >= MIN_OBSERVAR);

  const observar = (objId: string) => {
    if (obs.includes(objId)) return;
    setObservados((o) => ({ ...o, [estId]: [...o[estId], objId] }));
    sfxBlip();
  };
  const elegir = (ranura: RanuraId, idx: number) => {
    setElecciones((e) => ({ ...e, [estId]: { ...e[estId], [ranura]: idx } }));
    setPresentado((p) => ({ ...p, [estId]: false }));
    sfxBlip();
  };
  const presentar = () => {
    if (!completa || !abierta) return;
    const n = VISITANTES.map((v) => reaccionDe(v, estId, eleccion)).filter((r) => r.registra).length;
    setPresentado((p) => ({ ...p, [estId]: true }));
    setPresentaciones((x) => x + 1);
    setRegistros((r) => ({ ...r, [estId]: Math.max(r[estId], n) }));
    if (n >= VISITANTES.length) {
      sfxBien();
      sfxOk();
    } else {
      sfxNo();
    }
  };
  const resetFeria = () => {
    setEstId("nursing");
    setObservados(porCampo<string[]>(() => []));
    setElecciones(porCampo<Eleccion>(() => ({})));
    setPresentado(porCampo(() => false));
    setRegistros(porCampo(() => 0));
    setPresentaciones(0);
  };

  // ── modo 2: On stage (conectores) ────────────────────────────────────
  const [cPaso, setCPaso] = useState(0);
  const [cIntentos, setCIntentos] = useState<Record<string, string[]>>({});
  const [cUltimo, setCUltimo] = useState<OpcionConector | null>(null);
  const charlaFin = cPaso >= CHARLA.length;
  const cErrores = CHARLA.reduce(
    (s, o) => s + (cIntentos[o.id] ?? []).filter((t) => !o.opciones.find((x) => x.texto === t)?.ok).length,
    0
  );
  const atentos = Math.max(0, PUBLICO - PERDIDOS_POR_ERROR * cErrores);
  const charlaMeta = charlaFin && atentos >= META_PUBLICO;
  const oracion = CHARLA[Math.min(cPaso, CHARLA.length - 1)]!;
  const probadas = cIntentos[oracion.id] ?? [];
  const correctaActual = oracion.opciones.find((o) => o.ok)!;
  const resuelta = probadas.includes(correctaActual.texto);

  const elegirConector = (op: OpcionConector) => {
    if (charlaFin || resuelta || probadas.includes(op.texto)) return;
    setCIntentos((c) => ({ ...c, [oracion.id]: [...(c[oracion.id] ?? []), op.texto] }));
    setCUltimo(op);
    if (op.ok) sfxBien();
    else sfxNo();
  };
  const siguienteOracion = () => {
    if (!resuelta) return;
    setCUltimo(null);
    setCPaso((p) => p + 1);
    if (cPaso + 1 >= CHARLA.length) sfxOk();
  };
  const resetCharla = () => {
    setCPaso(0);
    setCIntentos({});
    setCUltimo(null);
  };

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

  // ── reto (A4) ────────────────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ─────────────────────────────────────────────────────────
  const modosHechos = (ganadas >= ESTACIONES.length ? 1 : 0) + (charlaMeta ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const objetivos = [
    { txt: "Observa 3 objetos de una estación para abrir su descripción", done: algunaObservada, modo: "feria" },
    { txt: "Presenta un campo a los visitantes y mira cómo reaccionan", done: presentaciones > 0, modo: "feria" },
    { txt: "Logra que los 3 visitantes de una estación se registren", done: ganadas >= 1, modo: "feria" },
    { txt: "Llena las hojas de registro de las 4 estaciones", done: ganadas >= ESTACIONES.length, modo: "feria" },
    { txt: "Termina la charla de Valeria eligiendo cada conector", done: charlaFin, modo: "charla" },
    { txt: `Termina la charla con al menos ${META_PUBLICO} de ${PUBLICO} personas atentas`, done: charlaMeta, modo: "charla" },
    { txt: "Escribe en inglés los 7 campos de estudio de la lectura", done: glosarioDone, modo: "glosario" },
    { txt: "Completa los textos de Sofia (A2) y de ciencias de la salud (A6)", done: textoDone, modo: "texto" },
    { txt: "Aprueba el reto verdadero o falso (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "feria" ? resetFeria : modo === "charla" ? resetCharla : modo === "glosario" ? resetGlosario : resetTexto;

  const lectura =
    modo === "feria" ? (
      reacciones ? (
        <>Interest {interesProm}% · sign-ups {inscritos}/{VISITANTES.length}</>
      ) : (
        <>Station {est.letra} · objects observed {obs.length}/{est.objetos.length}</>
      )
    ) : modo === "charla" ? (
      <>Audience listening: {atentos}/{PUBLICO}</>
    ) : modo === "glosario" ? (
      <>Write each field in English</>
    ) : (
      <>Fill in the missing words</>
    );

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
        <div className="ce" style={{ ["--ce-a" as string]: accent, ["--ce-r" as string]: rgba }}>
          <style>{CSS}</style>

          {modo === "feria" && (
            <div className="ce-col">
              <p className="ce-intro">
                <i className="fa-solid fa-store" aria-hidden /> Feria de carreras del Bachillerato Sierra Azul <span>(simulación)</span>. Observa
                cada estación, deduce qué campo es y descríbelo en inglés a los tres visitantes.
              </p>

              <div className="ce-estaciones" role="tablist" aria-label="Estaciones de la feria">
                {ESTACIONES.map((e) => {
                  const ganada = registros[e.id] >= VISITANTES.length;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      role="tab"
                      aria-selected={e.id === estId}
                      className="ce-est"
                      data-on={e.id === estId}
                      data-ganada={ganada}
                      onClick={() => setEstId(e.id)}
                    >
                      <span className="ce-est-letra">{e.letra}</span>
                      <span className="ce-est-nombre">{ganada ? e.nombre : `Station ${e.letra}`}</span>
                      <span className="ce-est-reg">
                        <i className="fa-solid fa-user-check" aria-hidden /> {registros[e.id]}/{VISITANTES.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="ce-lugar-foto">
                <i className="fa-solid fa-location-dot" aria-hidden />
                <ImgSim key={est.id} src={`${RUTA_FOTOS}/estacion-${est.id}.webp`} />
                <span className="ce-tag">
                  Station {est.letra} · Host: {est.anfitrion}
                </span>
                <span className="ce-tag ce-tag-abajo">{est.escena}</span>
              </div>

              {/* Paso 1 · observar */}
              <section className="ce-paso">
                <h3>
                  <span className="ce-num">1</span> Observe <small>Toca los objetos ({obs.length}/{est.objetos.length})</small>
                </h3>
                <div className="ce-objetos">
                  {est.objetos.map((o, i) => {
                    const visto = obs.includes(o.id);
                    return (
                      <button key={o.id} type="button" className="ce-obj" data-visto={visto} onClick={() => observar(o.id)}>
                        <i className={`fa-solid ${o.icono}`} aria-hidden />
                        {visto ? (
                          <span className="ce-obj-txt">
                            <strong>{o.en}</strong>
                            <span>{o.es}</span>
                            <em>{o.uso}</em>
                          </span>
                        ) : (
                          <span className="ce-obj-txt">
                            <strong>Object {i + 1}</strong>
                            <span>Toca para observarlo</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Paso 2 · describir */}
              <section className="ce-paso">
                <h3>
                  <span className="ce-num">2</span> Describe the field <small>Una opción por frase</small>
                </h3>
                {!abierta ? (
                  <div className="ce-candado">
                    <i className="fa-solid fa-lock" aria-hidden /> Observa al menos {MIN_OBSERVAR} objetos: sin ver el lugar no sabes qué campo
                    describes.
                  </div>
                ) : (
                  <div className="ce-ranuras">
                    {RANURAS.map((r) => {
                      const ops = opcionesDe(estId, r.id);
                      const sel = eleccion[r.id];
                      return (
                        <div key={r.id} className="ce-ranura">
                          <div className="ce-ranura-cab">
                            <strong>{r.conector ? `${r.conector} ${r.antes}` : r.antes} …</strong>
                            <span>{r.pregunta}</span>
                          </div>
                          <div className="ce-ops">
                            {ops.map((op, i) => (
                              <button
                                key={op.texto}
                                type="button"
                                className="ce-op"
                                data-sel={sel === i}
                                data-c={presentado[estId] && sel === i ? op.calidad : undefined}
                                onClick={() => elegir(r.id, i)}
                              >
                                {op.texto}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ce-vista">
                  <span className="ce-vista-tit">Your description</span>
                  <p>
                    {RANURAS.map((r) => {
                      const op = calidadDe(estId, r.id, eleccion);
                      const ini = r.conector ? `${r.conector} ${r.antes}` : r.antes;
                      return (
                        <span key={r.id}>
                          {ini}{" "}
                          {op ? (
                            <mark data-c={presentado[estId] ? op.calidad : "neutro"}>{op.texto}</mark>
                          ) : (
                            <span className="ce-hueco">______</span>
                          )}
                          .{" "}
                        </span>
                      );
                    })}
                  </p>
                  <button type="button" className="ce-presentar" disabled={!completa || !abierta || presentado[estId]} onClick={presentar}>
                    <i className="fa-solid fa-bullhorn" aria-hidden />
                    {presentado[estId] ? "Change a sentence to present again" : completa ? "Present to the visitors" : "Complete the six sentences"}
                  </button>
                </div>
              </section>

              {/* Paso 3 · visitantes */}
              <section className="ce-paso">
                <h3>
                  <span className="ce-num">3</span> The visitors react <small>Se registran con {UMBRAL_REGISTRO}% de interés</small>
                </h3>
                <div className="ce-visitantes">
                  {VISITANTES.map((v, i) => {
                    const r = reacciones?.[i];
                    const a = ANIMO[r?.animo ?? "espera"];
                    return (
                      <article key={v.id} className="ce-vis" data-animo={r?.animo ?? "espera"} style={{ ["--ce-v" as string]: a.col }}>
                        <div className="ce-vis-cab">
                          <div className="ce-retrato">
                            <i className={`fa-solid ${v.icono}`} aria-hidden />
                            <ImgSim src={`${RUTA_FOTOS}/visitante-${v.id}.webp`} />
                          </div>
                          <div className="ce-vis-nombre">
                            <strong>{v.nombre}</strong>
                            <span>{v.rol}</span>
                          </div>
                          <span className="ce-cara" title={a.txt}>
                            <i className={`fa-solid ${a.icono}`} aria-hidden />
                            <span>{a.txt}</span>
                          </span>
                        </div>
                        <div className="ce-barra" aria-label={`Interés ${r?.interes ?? 0}%`}>
                          <div style={{ width: `${r?.interes ?? 0}%` }} />
                          <span style={{ left: `${UMBRAL_REGISTRO}%` }} aria-hidden />
                        </div>
                        <p className="ce-dice">«{r ? r.dice : v.quiere}»</p>
                        <p className="ce-porque">{r ? r.porque : `Quiere saber: ${v.quiereEs}`}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="ce-hoja" aria-label="Hoja de registro">
                  <span className="ce-vista-tit">
                    <i className="fa-solid fa-clipboard-list" aria-hidden /> Sign-up sheet · Station {est.letra}
                  </span>
                  {VISITANTES.map((v, i) => {
                    const r = reacciones?.[i];
                    return (
                      <div key={v.id} className="ce-hoja-fila" data-on={r?.registra ?? false}>
                        <i className={`fa-solid ${r?.registra ? "fa-square-check" : "fa-square"}`} aria-hidden />
                        <span>{r?.registra ? v.nombre : "—"}</span>
                      </div>
                    );
                  })}
                  {reacciones && inscritos >= VISITANTES.length && (
                    <p className="ce-ok">
                      <i className="fa-solid fa-trophy" aria-hidden /> ¡Hoja llena! La estación {est.letra} era <strong>{est.nombre}</strong> (
                      {est.nombreEs}). Prueba otra estación.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {modo === "charla" && (
            <div className="ce-col">
              <div className="ce-escenario-foto">
                <i className="fa-solid fa-microphone-lines" aria-hidden />
                <ImgSim src={`${RUTA_FOTOS}/escenario-charla.webp`} />
                <span className="ce-tag">Valeria Soto · sports medicine</span>
              </div>

              <div className="ce-publico" aria-label={`${atentos} de ${PUBLICO} personas atentas`}>
                {Array.from({ length: PUBLICO }, (_, i) => (
                  <span key={i} className="ce-butaca" data-atento={i < atentos}>
                    <i className={`fa-solid ${i < atentos ? "fa-user" : "fa-user-slash"}`} aria-hidden />
                  </span>
                ))}
              </div>
              <div className="ce-medidor">
                <span>Audience listening</span>
                <div className="ce-barra ce-barra-ancha">
                  <div style={{ width: `${(atentos / PUBLICO) * 100}%` }} />
                  <span style={{ left: `${(META_PUBLICO / PUBLICO) * 100}%` }} aria-hidden />
                </div>
                <strong style={{ color: atentos >= META_PUBLICO ? OK : AMBAR }}>
                  {atentos}/{PUBLICO}
                </strong>
              </div>
              <p className="ce-intro">
                Valeria presenta su campo en la feria. Elige el conector de cada oración: cada conector equivocado deja a {PERDIDOS_POR_ERROR}{" "}
                personas sin el hilo de la charla.
              </p>

              <div className="ce-guion">
                <p className="ce-linea" data-hecha="true">
                  {CHARLA_APERTURA}
                </p>
                {CHARLA.slice(0, cPaso).map((o) => (
                  <p key={o.id} className="ce-linea" data-hecha="true">
                    {o.antes}
                    <strong>{o.opciones.find((x) => x.ok)!.texto}</strong>
                    {o.despues}
                  </p>
                ))}

                {!charlaFin ? (
                  <div className="ce-actual">
                    <span className="ce-vista-tit">
                      Sentence {cPaso + 1} of {CHARLA.length}
                    </span>
                    <p className="ce-linea ce-linea-grande">
                      {oracion.antes}
                      <span className="ce-hueco" data-ok={resuelta}>
                        {resuelta ? correctaActual.texto : "______"}
                      </span>
                      {oracion.despues}
                    </p>
                    <div className="ce-ops">
                      {opcionesCharla(cPaso).map((op) => {
                        const probada = probadas.includes(op.texto);
                        return (
                          <button
                            key={op.texto}
                            type="button"
                            className="ce-op ce-op-con"
                            data-c={probada ? (op.ok ? "ok" : "mezcla") : undefined}
                            disabled={probada || resuelta}
                            onClick={() => elegirConector(op)}
                          >
                            {op.texto}
                          </button>
                        );
                      })}
                    </div>
                    {cUltimo && (
                      <div className="ce-retro" style={{ ["--rc" as string]: cUltimo.ok ? OK : NO }}>
                        <strong>
                          <i className={`fa-solid ${cUltimo.ok ? "fa-circle-check" : "fa-user-slash"}`} aria-hidden />{" "}
                          {cUltimo.ok ? "The audience follows you." : `${PERDIDOS_POR_ERROR} people lost the thread.`}
                        </strong>
                        <span>{cUltimo.porque}</span>
                      </div>
                    )}
                    {resuelta && (
                      <button type="button" className="ce-btn" onClick={siguienteOracion}>
                        {cPaso + 1 >= CHARLA.length ? "Finish the talk" : "Next sentence"} <i className="fa-solid fa-arrow-right" aria-hidden />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="ce-retro" style={{ ["--rc" as string]: charlaMeta ? OK : AMBAR }}>
                    <strong>
                      {charlaMeta ? "Great talk! The audience followed every idea." : `The talk is over, but only ${atentos} of ${PUBLICO} people followed it.`}
                    </strong>
                    <span>
                      {charlaMeta
                        ? "Los conectores ordenaron la charla: First abre, because da la razón, also y Moreover suman, Finally cierra con la meta."
                        : `Necesitas al menos ${META_PUBLICO} personas atentas: se permite un solo conector equivocado. Reinicia la charla y vuelve a intentarlo.`}
                    </span>
                    <button type="button" className="ce-btn" onClick={resetCharla}>
                      <i className="fa-solid fa-rotate-left" aria-hidden /> Give the talk again
                    </button>
                  </div>
                )}
              </div>

              <div className="ce-chips" aria-label="Conectores de la lectura A1">
                {CONECTORES_A1.map((c) => (
                  <span key={c.conector} className="ce-chip">
                    <strong>{c.conector}</strong> {c.es}
                  </span>
                ))}
              </div>
            </div>
          )}

          {modo === "glosario" && (
            <div className="ce-caja">
              <h3 className="ce-caja-tit">
                <i className="fa-solid fa-spell-check" aria-hidden /> Los campos de la lectura · IN-V-P01-A1
              </h3>
              <EscribeTermino
                key={glosarioIntento}
                pares={PARES_CAMPOS}
                accent={accent}
                rgba={rgba}
                completado={glosarioDone}
                instrucciones="Lee la traducción y la oración de la lectura A1 con el hueco, y escribe en inglés el nombre del campo. Se ignoran acentos y mayúsculas."
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
            <div className="ce-col">
              <div className="ce-caja">
                <h3 className="ce-caja-tit">
                  <i className="fa-solid fa-leaf" aria-hidden /> Sofia · environmental science (A2)
                </h3>
                <CompletaTexto
                  key={`a2-${textoIntento}`}
                  data={CAMPO_ESTUDIO_HUECOS_A2}
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
              <div className="ce-caja">
                <h3 className="ce-caja-tit">
                  <i className="fa-solid fa-heart-pulse" aria-hidden /> Health sciences (A6)
                </h3>
                <CompletaTexto
                  key={`a6-${textoIntento}`}
                  data={CAMPO_ESTUDIO_HUECOS_A6}
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
                  <Dato label="Hojas llenas" value={`${ganadas}/${ESTACIONES.length}`} col={ganadas >= ESTACIONES.length ? OK : undefined} />
                  <Dato label="Presentaciones" value={`${presentaciones}`} />
                  <Dato label="Público atento" value={`${atentos}/${PUBLICO}`} col={charlaMeta ? OK : undefined} />
                  <Dato label="Estrellas" value={`${estrellas}/3`} col={estrellas >= 3 ? AMBAR : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="Cómo reaccionan los visitantes" icono="fa-people-group">
                <p style={{ margin: 0, color: T.text2 }}>
                  A cada visitante le importan dos frases. Por cada una gana interés: correcta y del campo correcto{" "}
                  <strong style={{ color: OK }}>+{PUNTOS_RANURA.ok}</strong>, del campo correcto pero con la regla rota{" "}
                  <strong style={{ color: AMBAR }}>+{PUNTOS_RANURA.regla}</strong>, de otro campo <strong style={{ color: NO }}>+{PUNTOS_RANURA.mezcla}</strong>.
                  Cada frase de otro campo en el resto de la descripción le resta {CASTIGO_MEZCLA}. Se registra con {UMBRAL_REGISTRO} o más.
                </p>
                {VISITANTES.map((v) => (
                  <p key={v.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{v.nombre}:</strong> {v.quiereEs}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Tus notas de la feria" icono="fa-pen-to-square">
                {ESTACIONES.every((e) => observados[e.id].length === 0) ? (
                  <p style={{ margin: 0, color: T.text3 }}>Todavía no observas ningún objeto.</p>
                ) : (
                  ESTACIONES.filter((e) => observados[e.id].length > 0).map((e) => (
                    <p key={e.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>Station {e.letra}:</strong>{" "}
                      {e.objetos
                        .filter((o) => observados[e.id].includes(o.id))
                        .map((o) => `${o.en} (${o.es})`)
                        .join(" · ")}
                    </p>
                  ))
                )}
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
              mensajeAprobado="Ya distingues interested IN, related TO, involves + -ing y la concordancia de «my field of study IS»."
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
              <Bloque titulo="Importante" icono="fa-circle-exclamation">
                <p style={{ margin: 0, color: T.text2 }}>{LECTURA_A1.callout}</p>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión · A1" icono="fa-circle-question">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} className="ce-det">
                    <summary>{c.pregunta}</summary>
                    <p>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Glosario · A5 (y A9)" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <div key={g.termino} className="ce-glos">
                    <strong>{g.termino}</strong>
                    <span>{g.definicion}</span>
                    <em>{g.ejemplo}</em>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Actividad final:</strong> {ACTIVIDAD_FINAL_A5}
                </p>
              </Bloque>
              <Bloque titulo={`La tarea que viene · A3`} icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text }}>{CONSIGNA_A3.titulo}</p>
                <p style={{ margin: 0, color: T.text2 }}>{CONSIGNA_A3.prompt}</p>
                {CONSIGNA_A3.pistas.map((p) => (
                  <p key={p} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {p}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>Criterios: {CONSIGNA_A3.criterios.join(" · ")}</p>
              </Bloque>
              <Bloque titulo={`Video · A8 · ${VIDEO_A8.titulo}`} icono="fa-circle-play">
                <p style={{ margin: 0, color: T.text2 }}>{VIDEO_A8.descripcion}</p>
                {VIDEO_A8.preguntas.map((p) => (
                  <p key={p} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} aria-hidden />
                    {p}
                  </p>
                ))}
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
                  <strong style={{ color: T.text2 }}>Verbatim de IN-V-P01:</strong> la lectura A1 con sus preguntas y su nota, los dos textos con
                  huecos (A2 y A6), la consigna de A3, el reto verdadero/falso (A4), el glosario (A5, que A9 reconstruye), la autoevaluación (A7)
                  y las preguntas del video (A8). <strong style={{ color: T.text2 }}>Escrito para este laboratorio:</strong> la feria de carreras,
                  sus cuatro estaciones, los anfitriones, los tres visitantes y la charla de Valeria. Escuela, personas y cifras de interés son{" "}
                  <strong style={{ color: T.text2 }}>ficticias</strong> (simulación). Inglés estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CAMPO_ESTUDIO_INGLES_FICHA} accent={accent} rgba={rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
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
.ce { display:flex; flex-direction:column; gap:14px; min-width:0; color:${T.text}; font-size:15px; }
.ce-col { display:flex; flex-direction:column; gap:14px; min-width:0; }
.ce-intro { margin:0; color:${T.text2}; font-size:15px; line-height:1.5; }
.ce-intro i { color:var(--ce-a); margin-right:6px; }
.ce-intro span { color:${T.text3}; }

.ce-estaciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:8px; }
.ce-est { cursor:pointer; display:grid; grid-template-columns:auto minmax(0,1fr); grid-template-areas:"l n" "l r"; gap:2px 10px; align-items:center;
  padding:10px 12px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; text-align:left; transition:all .15s; }
.ce-est:hover { border-color:${T.lineStrong}; }
.ce-est[data-on="true"] { border-color:var(--ce-a); background:rgba(var(--ce-r),0.14); }
.ce-est[data-ganada="true"] .ce-est-letra { background:${OK}; color:#04121f; }
.ce-est-letra { grid-area:l; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  background:rgba(var(--ce-r),0.25); font-weight:900; font-size:17px; }
.ce-est-nombre { grid-area:n; font-size:15px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ce-est-reg { grid-area:r; font-size:14px; color:${T.text3}; font-weight:700; }

.ce-lugar-foto, .ce-escenario-foto { position:relative; min-height:170px; aspect-ratio:16/7; border-radius:16px; overflow:hidden;
  border:1.5px solid ${T.line}; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(90% 90% at 30% 20%, rgba(var(--ce-r),0.35) 0%, transparent 60%), linear-gradient(135deg, #11283d 0%, #08131f 100%); }
.ce-lugar-foto > i, .ce-escenario-foto > i { font-size:58px; color:rgba(255,255,255,0.16); }
.ce-lugar-foto img, .ce-escenario-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.ce-tag { position:absolute; left:10px; top:10px; padding:5px 11px; border-radius:999px; background:rgba(2,12,28,.82); color:#fff;
  font-size:14px; font-weight:800; max-width:calc(100% - 20px); }
.ce-tag-abajo { top:auto; bottom:10px; font-weight:600; color:${T.text2}; }

.ce-paso { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.ce-paso h3 { margin:0; display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:17px; font-weight:900; }
.ce-paso h3 small { font-size:14px; font-weight:600; color:${T.text3}; }
.ce-num { width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:var(--ce-a);
  color:#04121f; font-size:15px; font-weight:900; }

.ce-objetos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:8px; }
.ce-obj { cursor:pointer; display:flex; align-items:flex-start; gap:10px; padding:12px; border-radius:13px; border:1.5px dashed ${T.lineStrong};
  background:${T.inset}; color:${T.text}; text-align:left; transition:all .15s; min-width:0; }
.ce-obj:hover { border-color:var(--ce-a); }
.ce-obj > i { font-size:24px; color:var(--ce-a); width:30px; text-align:center; flex-shrink:0; margin-top:2px; }
.ce-obj[data-visto="true"] { border-style:solid; border-color:rgba(var(--ce-r),0.6); background:rgba(var(--ce-r),0.1); cursor:default; animation:cePop .3s ease; }
.ce-obj-txt { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ce-obj-txt strong { font-size:15px; }
.ce-obj-txt span { font-size:14px; color:${T.text3}; }
.ce-obj-txt em { font-size:14px; color:${T.text2}; font-style:normal; line-height:1.4; }

.ce-candado { display:flex; align-items:center; gap:10px; padding:14px; border-radius:12px; border:1.5px dashed ${T.lineStrong};
  color:${T.text2}; font-size:15px; background:${T.inset}; }
.ce-candado i { color:${AMBAR}; }
.ce-ranuras { display:flex; flex-direction:column; gap:12px; }
.ce-ranura { display:flex; flex-direction:column; gap:7px; }
.ce-ranura-cab { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 10px; }
.ce-ranura-cab strong { font-size:15px; }
.ce-ranura-cab span { font-size:14px; color:${T.text3}; }
.ce-ops { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap:8px; }
.ce-op { cursor:pointer; text-align:left; padding:10px 13px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
  color:#fff; font-size:15px; font-weight:700; line-height:1.35; transition:all .14s; }
.ce-op:hover:not(:disabled) { border-color:var(--ce-a); }
.ce-op:disabled { cursor:default; }
.ce-op[data-sel="true"] { border-color:var(--ce-a); background:rgba(var(--ce-r),0.2); }
.ce-op[data-c="ok"] { border-color:${OK}; background:${OK}22; }
.ce-op[data-c="regla"] { border-color:${AMBAR}; background:${AMBAR}1c; }
.ce-op[data-c="mezcla"] { border-color:${NO}; background:${NO}1c; animation:ceShake .4s; }
.ce-op-con { text-align:center; font-size:16px; }

.ce-vista { display:flex; flex-direction:column; gap:10px; padding:13px 15px; border-radius:14px; border:1px solid rgba(var(--ce-r),0.4);
  background:rgba(var(--ce-r),0.07); }
.ce-vista-tit { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:var(--ce-a); display:flex; gap:8px; align-items:center; }
.ce-vista p { margin:0; font-size:16px; line-height:1.65; color:${T.text}; }
.ce-vista mark { background:rgba(var(--ce-r),0.22); color:#fff; padding:1px 5px; border-radius:6px; font-weight:700; }
.ce-vista mark[data-c="ok"] { background:${OK}33; }
.ce-vista mark[data-c="regla"] { background:${AMBAR}38; text-decoration:underline wavy ${AMBAR}; }
.ce-vista mark[data-c="mezcla"] { background:${NO}38; text-decoration:line-through ${NO}; }
.ce-hueco { display:inline-block; min-width:60px; padding:0 6px; border-bottom:2px dashed ${T.lineStrong}; color:${T.text3}; }
.ce-hueco[data-ok="true"] { border-bottom-color:${OK}; color:${OK}; font-weight:800; }
.ce-presentar { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:11px 18px; border-radius:12px;
  border:none; background:var(--ce-a); color:#04121f; font-size:15px; font-weight:900; transition:all .15s; }
.ce-presentar:disabled { cursor:default; background:${T.inset}; color:${T.text3}; border:1px solid ${T.line}; }

.ce-visitantes { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:10px; }
.ce-vis { display:flex; flex-direction:column; gap:8px; padding:12px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset};
  transition:border-color .2s; }
.ce-vis[data-animo="feliz"] { border-color:${OK}88; }
.ce-vis[data-animo="duda"] { border-color:${AMBAR}88; }
.ce-vis[data-animo="confuso"] { border-color:${NO}88; }
.ce-vis[data-animo="confuso"] .ce-retrato { animation:ceShake .5s 1; }
.ce-vis[data-animo="feliz"] .ce-retrato { animation:ceBob 1.4s ease-in-out infinite; }
.ce-vis-cab { display:flex; align-items:center; gap:10px; min-width:0; }
.ce-retrato { position:relative; width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; border:3px solid var(--ce-v);
  display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(var(--ce-r),0.4), #08131f); }
.ce-retrato > i { font-size:22px; color:var(--ce-v); }
.ce-retrato img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.ce-vis-nombre { display:flex; flex-direction:column; min-width:0; flex:1; }
.ce-vis-nombre strong { font-size:15px; }
.ce-vis-nombre span { font-size:14px; color:${T.text3}; }
.ce-cara { display:flex; flex-direction:column; align-items:center; gap:2px; color:var(--ce-v); font-size:14px; font-weight:800; }
.ce-cara i { font-size:22px; }
.ce-barra { position:relative; height:12px; border-radius:8px; background:${T.glassSoft}; border:1px solid ${T.line}; overflow:visible; }
.ce-barra > div { height:100%; border-radius:8px; background:linear-gradient(90deg, #FF8FAB, ${AMBAR}, ${OK}); transition:width .45s ease; }
.ce-barra > span { position:absolute; top:-4px; bottom:-4px; width:2px; background:#fff; opacity:.7; }
.ce-dice { margin:0; font-size:15px; font-weight:700; color:#fff; line-height:1.4; }
.ce-porque { margin:0; font-size:14px; color:${T.text2}; line-height:1.5; }

.ce-hoja { display:flex; flex-direction:column; gap:6px; padding:12px 14px; border-radius:14px; border:1px dashed ${T.lineStrong};
  background:repeating-linear-gradient(180deg, transparent 0 33px, rgba(255,255,255,0.05) 33px 34px), ${T.inset}; }
.ce-hoja-fila { display:flex; align-items:center; gap:10px; font-size:15px; color:${T.text3}; min-height:28px; }
.ce-hoja-fila[data-on="true"] { color:#fff; font-weight:800; animation:cePop .35s ease; }
.ce-hoja-fila[data-on="true"] i { color:${OK}; }
.ce-ok { margin:4px 0 0; font-size:15px; color:${OK}; line-height:1.45; }

.ce-publico { display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); gap:6px; padding:10px; border-radius:14px; background:${T.inset};
  border:1px solid ${T.line}; }
.ce-butaca { display:flex; align-items:center; justify-content:center; height:40px; border-radius:10px 10px 4px 4px; font-size:19px;
  background:rgba(var(--ce-r),0.22); color:#fff; transition:all .35s; }
.ce-butaca[data-atento="false"] { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.3); }
.ce-medidor { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; font-size:14px; font-weight:800; color:${T.text2}; }
.ce-medidor strong { font-size:17px; font-family:ui-monospace, monospace; }
.ce-guion { display:flex; flex-direction:column; gap:8px; }
.ce-linea { margin:0; font-size:15px; line-height:1.55; color:${T.text}; }
.ce-linea[data-hecha="true"] { color:${T.text2}; padding-left:12px; border-left:3px solid rgba(var(--ce-r),0.5); }
.ce-linea[data-hecha="true"] strong { color:#fff; }
.ce-linea-grande { font-size:18px; font-weight:700; }
.ce-actual { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:16px; border:1.5px solid rgba(var(--ce-r),0.5);
  background:rgba(var(--ce-r),0.08); }
.ce-retro { display:flex; flex-direction:column; gap:6px; align-items:flex-start; padding:12px 14px; border-radius:13px; font-size:14.5px;
  line-height:1.5; color:${T.text2}; border:1.5px solid var(--rc); background:${T.glass}; }
.ce-retro strong { color:#fff; font-size:15px; }
.ce-retro strong i { color:var(--rc); }
.ce-btn { cursor:pointer; align-self:flex-start; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
  border:1.5px solid var(--ce-a); background:rgba(var(--ce-r),0.16); color:#fff; font-size:15px; font-weight:800; }
.ce-chips { display:flex; flex-wrap:wrap; gap:6px; }
.ce-chip { padding:6px 11px; border-radius:999px; border:1px solid ${T.line}; background:${T.glass}; font-size:14px; color:${T.text2}; }
.ce-chip strong { color:#fff; }

.ce-caja { display:flex; flex-direction:column; gap:12px; padding:16px; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; }
.ce-caja-tit { margin:0; font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px; }
.ce-caja-tit i { color:var(--ce-a); }

.ce-det { border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; padding:10px 13px; }
.ce-det summary { cursor:pointer; font-weight:700; color:${T.text2}; line-height:1.45; }
.ce-det p { margin:9px 0 0; color:${T.text3}; }
.ce-glos { display:flex; flex-direction:column; gap:3px; padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; }
.ce-glos strong { color:#fff; }
.ce-glos span { color:${T.text2}; }
.ce-glos em { color:${T.text3}; font-style:normal; }

@keyframes ceShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
@keyframes ceBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
@keyframes cePop { 0%{transform:scale(.94);opacity:.4;} 100%{transform:scale(1);opacity:1;} }
@media (max-width: 560px) {
  .ce-publico { grid-template-columns:repeat(4, minmax(0,1fr)); }
  .ce-lugar-foto, .ce-escenario-foto { aspect-ratio:16/9; }
}
@media (prefers-reduced-motion: reduce) {
  .ce-op[data-c="mezcla"], .ce-vis[data-animo] .ce-retrato, .ce-obj[data-visto="true"], .ce-hoja-fila[data-on="true"] { animation:none; }
  .ce-barra > div, .ce-butaca { transition:none; }
}
`;
