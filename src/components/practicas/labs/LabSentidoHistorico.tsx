"use client";

/**
 * Laboratorio — El sentido histórico: por qué el pasado importa en el presente
 * Práctica experimental para CH-II-P03 (Conciencia Histórica II):
 * «El sentido histórico, la memoria colectiva y la relación pasado-presente».
 *
 * EXPERIMENTO CENTRAL: «Museo del pueblo». San Telmo es un pueblo FICTICIO
 * (simulación) que arma la línea del tiempo de su museo comunitario. El alumno
 * toma una situación del presente (tarjeta con imagen) y la CUELGA del proceso
 * del pasado que la explica: el hilo se enciende, su arco crece según cuánta
 * duración acumulada tiene ese proceso y el medidor de «comprensión del
 * presente» sube. Si cuelga mal, el museo explica qué situación sí explica
 * ese proceso (datos verbatim de A1/A4, ver `sentido-historico-sim.ts`).
 *
 * Cuatro modos, montados en el esqueleto `LabShell`:
 *  1. «Museo del pueblo» — el simulador (relación pasado-presente A1/A4).
 *  2. «¿Qué forma de mirar el pasado?» — clasifica ocho casos en sentido
 *     histórico, presentismo o memoria acrítica (dentro de `Mesa`).
 *  3. «Escribe el término» — definición verbatim (A5) → escribe el término.
 *  4. «Completa el texto» — fill_blanks verbatim de la progresión.
 *  + Cuestionario de comprensión (V/F verbatim de A4) en la pestaña Reto.
 *
 * DOM puro (sin three.js). Contenido VERBATIM de CH-II·P03; la teoría vive en
 * la pestaña «Teoría». Las imágenes salen de /media/labs-sim/sentido-historico
 * y, si aún no existen, se ve el degradado con su ícono.
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { SENTIDO_HISTORICO_HUECOS } from "./sentido-historico-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { SENTIDO_HISTORICO_FICHA } from "./sentido-historico-ficha";
import {
  CASOS,
  TIPO_MIRADA_INFO,
  RAICES,
  PARES,
  QUIZ,
  DATO_SENTIDO,
  type TipoMirada,
} from "./sentido-historico-data";
import { LINEA, POS_HOY, evaluarConexion, comprension, arcoHilo, type Conexiones, type Retro } from "./sentido-historico-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-sentido-historico-reto";
const RUTA_FOTOS = "/media/labs-sim/sentido-historico";

type Modo = "museo" | "miradas" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "museo", label: "Museo del pueblo", icono: "fa-timeline" },
  { id: "miradas", label: "¿Qué forma de mirar el pasado?", icono: "fa-eye" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Imagen y ícono de cada situación del presente (la clave es el id de `RAICES`). */
const ESCENA: Record<string, { foto: string; icono: string }> = {
  "ra-tierra": { foto: "parcelas-valle", icono: "fa-wheat-awn" },
  "ra-castas": { foto: "mercado-pueblo", icono: "fa-people-group" },
  "ra-constitucion": { foto: "libro-escritorio", icono: "fa-book" },
  "ra-norte-sur": { foto: "dos-caminos", icono: "fa-road" },
  "ra-lenguas": { foto: "portal-conversacion", icono: "fa-comments" },
  "ra-12oct": { foto: "plaza-estatua", icono: "fa-monument" },
};

/** Imagen con reserva: degradado + ícono detrás; si el webp no existe, se oculta. */
function Foto({ clave, icono, className }: { clave: string; icono: string; className?: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span className={`sh-foto ${className ?? ""}`}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </span>
  );
}

export function LabSentidoHistorico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("museo");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
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
  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
  // `sfxOk` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo miradas (clasifica por actitud frente al pasado) ──────────────
  const [ubicMirada, setUbicMirada] = useState<Record<string, TipoMirada>>({});
  const [selMirada, setSelMirada] = useState<string | null>(null);
  const [shakeMirada, setShakeMirada] = useState<TipoMirada | null>(null);
  const miradasLibres = CASOS.filter((c) => !ubicMirada[c.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarMirada = (casoId: string, bin: TipoMirada) => {
    if (ubicMirada[casoId]) return;
    const c = CASOS.find((x) => x.id === casoId);
    if (c && c.tipo === bin) {
      setUbicMirada((e) => ({ ...e, [casoId]: bin }));
      setSelMirada(null);
      sfxPlace();
      if (Object.keys(ubicMirada).length + 1 >= CASOS.length) {
        sfxOk();
        persistMejor(true, raicesDone, glosarioDone);
      }
    } else {
      setShakeMirada(bin);
      sfxNo();
      window.setTimeout(() => setShakeMirada(null), 420);
    }
  };
  const resetMiradas = () => {
    setUbicMirada({});
    setSelMirada(null);
  };

  // ── modo museo (simulador: cuelga cada situación de su raíz) ───────────
  const [conex, setConex] = useState<Conexiones>({});
  const [selPres, setSelPres] = useState<string | null>(null);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [shakeNodo, setShakeNodo] = useState<string | null>(null);
  const nConex = Object.keys(conex).length;
  const { pct, nivel } = comprension(nConex, RAICES.length);

  const colgarEnNodo = (raizId: string) => {
    if (!selPres) {
      setRetro({ ok: false, texto: "Primero toca una situación del pueblo y luego el proceso del pasado que la explica." });
      return;
    }
    if (conex[selPres]) return;
    const r = evaluarConexion(selPres, raizId);
    setRetro(r);
    if (r.ok) {
      setConex((e) => ({ ...e, [selPres]: true }));
      setSelPres(null);
      sfxPlace();
      if (nConex + 1 >= RAICES.length) {
        sfxOk();
        persistMejor(miradasDone, true, glosarioDone);
      }
    } else {
      setShakeNodo(raizId);
      sfxNo();
      window.setTimeout(() => setShakeNodo(null), 420);
    }
  };
  const resetMuseo = () => {
    setConex({});
    setSelPres(null);
    setRetro(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const miradasDone = Object.keys(ubicMirada).length >= CASOS.length;
  const raicesDone = nConex >= RAICES.length;
  const modosHechos = (miradasDone ? 1 : 0) + (raicesDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Cuelga 3 situaciones del pueblo de su raíz y mira subir el medidor", done: nConex >= 3 },
    { txt: "Empareja los 6 fenómenos con su raíz histórica", done: raicesDone },
    { txt: "Clasifica los 8 casos por su forma de mirar el pasado", done: miradasDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
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

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "miradas" ? resetMiradas : modo === "museo" ? resetMuseo : resetGlosario;

  const pistaDe: Record<Modo, string> = {
    museo: "Elige una situación del pueblo y pregúntate cómo llegó a ser lo que es: el pasado no es accidente ni destino, deja huellas de larga duración. Cuanto más antiguo el proceso, más alto el arco del hilo.",
    miradas: "El sentido histórico contextualiza antes de juzgar; el presentismo juzga el pasado con los valores de hoy; la memoria acrítica repite la versión oficial sin cuestionarla.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const lectura =
    modo === "museo"
      ? `Comprensión del presente: ${pct} % · ${nivel}`
      : modo === "miradas"
        ? `${Object.keys(ubicMirada).length}/${CASOS.length} casos clasificados`
        : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const ANCHO = 700;
  const Y_EJE = 138;
  const xDe = (pos: number) => 40 + pos * (ANCHO - 80);
  const pendientes = RAICES.filter((r) => !conex[r.id]);

  const escena = (
    <div className="sh-escena">
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "museo" && (
        <Mesa>
          {/* Banco: las situaciones del pueblo que aún no tienen raíz */}
          <div className="sh-banco">
            <div className="sh-titulo">
              <span>Situaciones del pueblo</span>
              <strong data-ok={raicesDone}>{nConex}/{RAICES.length}</strong>
            </div>
            {pendientes.length === 0 ? (
              <div className="sh-listo">
                <i className="fa-solid fa-circle-check" aria-hidden /> ¡Todas las situaciones de San Telmo tienen raíz en la línea!
              </div>
            ) : (
              <div className="sh-cartas">
                {pendientes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="sh-carta"
                    data-sel={selPres === r.id}
                    onClick={() => {
                      setSelPres((s) => (s === r.id ? null : r.id));
                      setRetro(null);
                    }}
                  >
                    <Foto clave={ESCENA[r.id]!.foto} icono={ESCENA[r.id]!.icono} />
                    <span>{r.presente}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destino: la línea del tiempo del museo */}
          <div className="sh-destino">
            <div className="sh-cabecera">
              <Foto clave="pueblo-atardecer" icono="fa-house-flag" className="sh-hero" />
              <div className="sh-cabecera-txt">
                <strong>Museo comunitario de San Telmo</strong>
                <span>Pueblo ficticio · simulación</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${ANCHO} 160`} className="sh-linea" role="img" aria-label="Línea del tiempo del museo, de lo más antiguo a hoy">
              <line x1={30} y1={Y_EJE} x2={ANCHO - 30} y2={Y_EJE} stroke="rgba(255,255,255,0.28)" strokeWidth={4} strokeLinecap="round" />
              {LINEA.map((n) =>
                conex[n.id] ? <path key={`a-${n.id}`} className="sh-hilo" d={arcoHilo(n.pos, ANCHO, Y_EJE)} fill="none" stroke={OK} strokeWidth={5} strokeLinecap="round" /> : null
              )}
              {LINEA.map((n, i) => (
                <g key={n.id}>
                  <circle cx={xDe(n.pos)} cy={Y_EJE} r={21} fill={conex[n.id] ? OK : "#10243a"} stroke={conex[n.id] ? OK : "rgba(255,255,255,0.45)"} strokeWidth={3} />
                  <text x={xDe(n.pos)} y={Y_EJE + 9} textAnchor="middle" fontSize={26} fontWeight={900} fill={conex[n.id] ? "#04121f" : "#fff"}>{i + 1}</text>
                </g>
              ))}
              <circle cx={xDe(POS_HOY)} cy={Y_EJE} r={24} fill={accent} stroke="#fff" strokeWidth={3} />
              <text x={xDe(POS_HOY)} y={Y_EJE + 9} textAnchor="middle" fontSize={22} fontWeight={900} fill="#04121f">Hoy</text>
            </svg>

            <div className="sh-medidor-fila">
              <span>Comprensión del presente</span>
              <strong>{pct} %</strong>
            </div>
            <div className="sh-medidor" role="meter" aria-label="Comprensión del presente" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="sh-medidor-fill" style={{ width: `${pct}%` }} />
            </div>

            <div className="sh-titulo">
              <span>{selPres ? "Ahora toca el proceso del pasado que la explica" : "Procesos del pasado, del más antiguo al más reciente"}</span>
            </div>
            <div className="sh-nodos">
              {LINEA.map((n, i) => {
                const r = RAICES.find((x) => x.id === n.id)!;
                const hecho = !!conex[n.id];
                return (
                  <button
                    key={n.id}
                    type="button"
                    className="sh-nodo"
                    data-done={hecho}
                    data-shake={shakeNodo === n.id}
                    data-armed={!!selPres && !hecho}
                    onClick={() => colgarEnNodo(n.id)}
                  >
                    <span className="sh-num">{i + 1}</span>
                    <span className="sh-nodo-txt">
                      <small>{n.epoca}</small>
                      <b>{r.raiz}</b>
                      {hecho && (
                        <em>
                          <i className="fa-solid fa-link" aria-hidden /> {r.presente}
                        </em>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sh-retro" data-ok={retro?.ok ?? undefined} role="status">
              <i className={`fa-solid ${retro ? (retro.ok ? "fa-circle-check" : "fa-circle-xmark") : "fa-lightbulb"}`} aria-hidden />
              <span>{retro ? retro.texto : "Toca una tarjeta del pueblo y cuélgala del proceso que la explica."}</span>
            </div>
          </div>
        </Mesa>
      )}

      {modo === "miradas" && (
        <Mesa>
          <div className="sh-banco">
            <div className="sh-titulo">
              <span>Arrastra cada caso a su forma de mirar el pasado</span>
              <strong data-ok={miradasDone}>{Object.keys(ubicMirada).length}/{CASOS.length}</strong>
            </div>
            {miradasLibres.length === 0 ? (
              <div className="sh-listo">
                <i className="fa-solid fa-circle-check" aria-hidden /> ¡Clasificaste los {CASOS.length} casos!
              </div>
            ) : (
              miradasLibres.map((c) => (
                <button key={c.id} type="button" className="sh-chip" data-sel={selMirada === c.id} onClick={() => setSelMirada((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                  {c.texto}
                </button>
              ))
            )}
          </div>
          <BinsMiradas selMirada={selMirada} shakeMirada={shakeMirada} ubicMirada={ubicMirada} onMatch={intentarMirada} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO — glosario */}
      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
          onCompletado={() => {
            setGlosarioDone(true);
            sfxOk();
            persistMejor(miradasDone, raicesDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={SENTIDO_HISTORICO_HUECOS}
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
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
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
              {modo === "museo" && (
                <Bloque titulo="Tu museo" icono="fa-gauge-high">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                    <Dato label="Situaciones con raíz" value={`${nConex}/${RAICES.length}`} col={raicesDone ? OK : undefined} />
                    <Dato label="Comprensión" value={`${pct} %`} col={accent} />
                  </div>
                </Bloque>
              )}
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 22, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "¡Miras el presente con sentido histórico!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
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
                <FichaTeorica data={SENTIDO_HISTORICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Tres formas de mirar el pasado" icono="fa-eye">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(Object.keys(TIPO_MIRADA_INFO) as TipoMirada[]).map((k) => (
                    <div key={k} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{TIPO_MIRADA_INFO[k].titulo}.</strong> {TIPO_MIRADA_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Del pasado al presente" icono="fa-timeline">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RAICES.map((r) => (
                    <div key={r.id} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{r.presente}</strong> ← {r.raiz}.
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{r.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PARES.map((p) => (
                    <div key={p.id} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{p.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>{DATO_SENTIDO}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */
const ESTILOS = (accent: string, rgba: string) => `
  @keyframes shShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes shPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes shHilo { from { stroke-dashoffset:900; } to { stroke-dashoffset:0; } }
  .sh-escena { display:grid; gap:14px; min-width:0; }
  .sh-banco, .sh-destino { display:flex; flex-direction:column; gap:10px; min-width:0; }
  .sh-titulo { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:14px; font-weight:800; color:${T.text2}; line-height:1.35; }
  .sh-titulo strong { color:${T.text3}; white-space:nowrap; }
  .sh-titulo strong[data-ok="true"] { color:${OK}; }
  .sh-listo { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:700; color:${OK}; }
  .sh-cartas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:9px; }
  .sh-carta { cursor:pointer; display:flex; flex-direction:column; gap:8px; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; line-height:1.3; text-align:left; transition:all .14s; min-width:0; }
  .sh-carta:hover { border-color:${T.lineStrong}; }
  .sh-carta[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .sh-foto { position:relative; display:grid; place-items:center; aspect-ratio:16/10; width:100%; border-radius:10px; overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.38), rgba(10,28,48,0.9)); color:rgba(255,255,255,0.75); font-size:26px; }
  .sh-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .sh-hero { aspect-ratio:auto; height:84px; border-radius:14px; }
  .sh-cabecera { position:relative; }
  .sh-cabecera-txt { position:absolute; left:0; right:0; bottom:0; padding:22px 14px 10px; display:grid; gap:2px;
    background:linear-gradient(0deg, rgba(3,8,18,0.85), transparent); border-radius:0 0 14px 14px; }
  .sh-cabecera-txt strong { font-size:16px; font-weight:900; color:#fff; }
  .sh-cabecera-txt span { font-size:14px; color:${T.text2}; }
  .sh-linea { width:100%; height:auto; display:block; }
  .sh-hilo { stroke-dasharray:900; animation:shHilo .9s ease-out; }
  .sh-medidor-fila { display:flex; justify-content:space-between; gap:10px; font-size:14px; font-weight:800; color:${T.text2}; }
  .sh-medidor-fila strong { color:#fff; font-variant-numeric:tabular-nums; }
  .sh-medidor { height:14px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
  .sh-medidor-fill { height:100%; border-radius:99px; background:linear-gradient(90deg, ${accent}, ${OK}); transition:width .6s ease; }
  .sh-nodos { display:grid; gap:8px; }
  .sh-nodo { cursor:pointer; display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glass}; color:#fff; text-align:left; font-size:14px; line-height:1.3; transition:all .14s; min-width:0; }
  .sh-nodo[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .sh-nodo[data-done="true"] { border-color:${OK}66; background:${OK}14; cursor:default; }
  .sh-nodo[data-shake="true"] { animation:shShake .4s; border-color:${NO}; }
  .sh-num { flex-shrink:0; width:30px; height:30px; border-radius:50%; display:grid; place-items:center; font-size:15px; font-weight:900;
    background:rgba(255,255,255,0.12); }
  .sh-nodo[data-done="true"] .sh-num { background:${OK}; color:#04121f; }
  .sh-nodo-txt { display:grid; gap:2px; min-width:0; }
  .sh-nodo-txt small { font-size:14px; font-weight:800; color:${T.text3}; }
  .sh-nodo-txt b { font-size:15px; font-weight:800; }
  .sh-nodo-txt em { font-size:14px; font-style:normal; color:${OK}; }
  .sh-retro { display:flex; gap:10px; align-items:flex-start; padding:11px 13px; border-radius:13px; border:1px solid ${T.line};
    background:${T.inset}; font-size:14px; line-height:1.45; color:${T.text2}; }
  .sh-retro i { margin-top:3px; color:${accent}; }
  .sh-retro[data-ok="true"] { border-color:${OK}66; background:${OK}12; color:#fff; }
  .sh-retro[data-ok="true"] i { color:${OK}; }
  .sh-retro[data-ok="false"] { border-color:${NO}66; background:${NO}12; color:#fff; }
  .sh-retro[data-ok="false"] i { color:${NO}; }
  .sh-chip { cursor:grab; display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:14px; width:100%;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; text-align:left; line-height:1.4; }
  .sh-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .sh-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .sh-chip[data-arrastrando="true"] { opacity:.45; }
  .sh-chip:active { cursor:grabbing; }
  .sh-bin { position:relative; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; }
  .sh-bin[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .sh-bin[data-shake="true"] { animation:shShake .4s; border-color:${NO}; }
  .sh-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .sh-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .sh-q:disabled{ cursor:default; }
  .sh-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .sh-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){
    .sh-nodo[data-shake="true"], .sh-bin[data-shake="true"], .sh-hilo { animation:none; }
    .sh-medidor-fill { transition:none; }
  }
`;

/* Rótulo pequeño de las tarjetas (14 px, no 11). */
const Ceja = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, margin: "0 0 12px" }}>{children}</p>
);

/* ═══ Paneles de cada modo ═══ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsMiradas({
  selMirada,
  shakeMirada,
  ubicMirada,
  onMatch,
  dropProps,
}: {
  selMirada: string | null;
  shakeMirada: TipoMirada | null;
  ubicMirada: Record<string, TipoMirada>;
  onMatch: (casoId: string, bin: TipoMirada) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoMirada[] = ["sentido", "presentismo", "acritica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_MIRADA_INFO[bin];
        const dentro = CASOS.filter((c) => ubicMirada[c.id] === bin);
        return (
          <div
            key={bin}
            className="sh-bin"
            data-shake={shakeMirada === bin}
            onClick={() => selMirada && onMatch(selMirada, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={bin === "sentido" ? OK : bin === "presentismo" ? NO : T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((c) => (
                  <span key={c.id} style={{ animation: "shPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {c.texto}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
    <div style={{ ...card, padding: "4px 0 8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Ceja>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Ceja>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco afirmaciones sobre el sentido histórico, la memoria colectiva y la relación entre el pasado y el presente. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
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
                    <button key={oi} className="sh-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="sh-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="sh-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 15, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
