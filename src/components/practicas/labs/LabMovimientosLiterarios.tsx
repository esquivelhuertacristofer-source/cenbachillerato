"use client";

/**
 * Laboratorio — Movimientos literarios: del Barroco a las Vanguardias
 * Práctica experimental para LC-III-P02-A2 (Lenguaje y Comunicación III).
 *
 * El alumno es CURADOR de una exposición (simulación): examina piezas
 * —fragmentos inventados de autores ficticios— y las coloca en la línea del
 * tiempo de los movimientos. Cada decisión enciende un medidor con los rasgos
 * del movimiento que sí aparecen en la pieza; si se equivoca, el medidor dice
 * qué rasgo contradice al movimiento elegido. Hay piezas de frontera con
 * rasgos de dos movimientos.
 *
 * Modos (todos colocan sobre la misma línea del tiempo, salvo el refuerzo):
 *  1. «Curaduría» — el simulador (modelo en movimientos-literarios-sim.ts).
 *  2. «Obras y autores» — diez obras representativas (verbatim A5/A1).
 *  3. «El rasgo de cada movimiento» — rasgos verbatim del quiz A2.
 *  4. «Escribe el término» y 5. «Completa el texto» — refuerzo verbatim.
 *  + Cuestionario de comprensión (opción múltiple verbatim de A2) en «Reto».
 *
 * DOM + SVG (sin three.js). Contenido VERBATIM de LC-III·P02, movido a «Teoría».
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { MOVIMIENTOS_LITERARIOS_HUECOS } from "./movimientos-literarios-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { MOVIMIENTOS_LITERARIOS_FICHA } from "./movimientos-literarios-ficha";
import {
  OBRAS,
  MOVIMIENTO_INFO,
  RASGOS,
  PARES,
  QUIZ,
  DATO_MOVIMIENTOS,
  type Movimiento,
} from "./movimientos-literarios-data";
import {
  MOVS,
  BANDAS,
  FRAGMENTOS,
  esFrontera,
  evaluar,
  rasgosDe,
  rasgoPorId,
  type Evaluacion,
  type Fragmento,
} from "./movimientos-literarios-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-movimientos-literarios-reto";
const RUTA_FOTOS = "/media/labs-sim/movimientos-literarios";

type Modo = "curaduria" | "obras" | "rasgos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "curaduria", label: "Curaduría", icono: "fa-landmark" },
  { id: "obras", label: "Obras y autores", icono: "fa-book" },
  { id: "rasgos", label: "El rasgo de cada movimiento", icono: "fa-list-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const NOMBRES = Object.fromEntries(MOVS.map((m) => [m, MOVIMIENTO_INFO[m].titulo])) as Record<Movimiento, string>;
const CLAVE_DE_TITULO = Object.fromEntries(MOVS.map((m) => [MOVIMIENTO_INFO[m].titulo, m])) as Record<string, Movimiento>;

interface Resultado {
  bin: Movimiento;
  ok: boolean;
  mensaje: string;
  encendidos: string[];
}

export function LabMovimientosLiterarios({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("curaduria");

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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── modo curaduría (el simulador) ──────────────────────────────────────
  const [colF, setColF] = useState<Record<string, Movimiento>>({});
  const [selF, setSelF] = useState<string | null>(null);
  const [resF, setResF] = useState<Resultado | null>(null);
  const [vioFrontera, setVioFrontera] = useState(false);
  const fragSel = FRAGMENTOS.find((f) => f.id === selF) ?? null;
  const fragLibres = FRAGMENTOS.filter((f) => !colF[f.id]);

  const elegirFrag = (id: string) => {
    sfxClick();
    setResF(null);
    setSelF((v) => (v === id ? null : id));
  };
  const colocarFrag = (bin: Movimiento) => {
    if (!fragSel) return;
    const ev: Evaluacion = evaluar(fragSel, bin, NOMBRES);
    setResF({ bin, ok: ev.ok, mensaje: ev.mensaje, encendidos: ev.encendidos });
    if (ev.ok) {
      setColF((c) => ({ ...c, [fragSel.id]: bin }));
      sfxPlace();
      if (esFrontera(fragSel)) setVioFrontera(true);
      if (Object.keys(colF).length + 1 >= FRAGMENTOS.length) sfxOk();
      setSelF(null);
    } else {
      sfxNo();
    }
  };
  const resetCuraduria = () => {
    setColF({});
    setSelF(null);
    setResF(null);
  };

  // ── modo obras (clasifica por movimiento) ──────────────────────────────
  const [ubicObra, setUbicObra] = useState<Record<string, Movimiento>>({});
  const [selObra, setSelObra] = useState<string | null>(null);
  const [resObra, setResObra] = useState<Resultado | null>(null);
  const obrasLibres = OBRAS.filter((o) => !ubicObra[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const colocarObra = (bin: Movimiento) => {
    if (!selObra || ubicObra[selObra]) return;
    const o = OBRAS.find((x) => x.id === selObra);
    if (o && o.movimiento === bin) {
      setUbicObra((e) => ({ ...e, [selObra]: bin }));
      setSelObra(null);
      setResObra({ bin, ok: true, mensaje: `Correcto: está en ${NOMBRES[bin]}. ${MOVIMIENTO_INFO[bin].subtitulo}`, encendidos: [] });
      sfxPlace();
      if (Object.keys(ubicObra).length + 1 >= OBRAS.length) sfxOk();
    } else {
      setResObra({ bin, ok: false, mensaje: `No encaja en ${NOMBRES[bin]}: ${MOVIMIENTO_INFO[bin].subtitulo} Esa descripción no corresponde a esta obra.`, encendidos: [] });
      sfxNo();
    }
  };
  const resetObras = () => {
    setUbicObra({});
    setSelObra(null);
    setResObra(null);
  };

  // ── modo rasgos (empareja rasgo → movimiento) ──────────────────────────
  const [empRasgo, setEmpRasgo] = useState<Record<string, Movimiento>>({});
  const [selRasgo, setSelRasgo] = useState<string | null>(null);
  const [resRasgo, setResRasgo] = useState<Resultado | null>(null);
  const rasgosLibres = RASGOS.filter((r) => !empRasgo[r.id]).slice().sort((a, b) => a.rasgo.localeCompare(b.rasgo, "es"));

  const colocarRasgo = (bin: Movimiento) => {
    if (!selRasgo || empRasgo[selRasgo]) return;
    const r = RASGOS.find((x) => x.id === selRasgo);
    if (r && CLAVE_DE_TITULO[r.movimiento] === bin) {
      setEmpRasgo((e) => ({ ...e, [selRasgo]: bin }));
      setSelRasgo(null);
      setResRasgo({ bin, ok: true, mensaje: `Correcto. ${r.ejemplo}`, encendidos: [] });
      sfxPlace();
      if (Object.keys(empRasgo).length + 1 >= RASGOS.length) sfxOk();
    } else {
      setResRasgo({ bin, ok: false, mensaje: `${NOMBRES[bin]} se define por otra cosa: ${MOVIMIENTO_INFO[bin].subtitulo}`, encendidos: [] });
      sfxNo();
    }
  };
  const resetRasgos = () => {
    setEmpRasgo({});
    setSelRasgo(null);
    setResRasgo(null);
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
  const curaduriaDone = Object.keys(colF).length >= FRAGMENTOS.length;
  const obrasDone = Object.keys(ubicObra).length >= OBRAS.length;
  const rasgosDone = Object.keys(empRasgo).length >= RASGOS.length;
  const modosHechos =
    (curaduriaDone ? 1 : 0) + (obrasDone ? 1 : 0) + (rasgosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Cataloga las 8 piezas de la exposición en su movimiento", done: curaduriaDone },
    { txt: "Resuelve una pieza de frontera (con rasgos de dos movimientos)", done: vioFrontera },
    { txt: "Clasifica las 10 obras por su movimiento", done: obrasDone },
    { txt: "Empareja los 5 rasgos con su movimiento", done: rasgosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual =
    modo === "texto" ? resetTexto : modo === "curaduria" ? resetCuraduria : modo === "obras" ? resetObras : modo === "rasgos" ? resetRasgos : resetGlosario;

  const lectura =
    modo === "curaduria"
      ? `${Object.keys(colF).length} de ${FRAGMENTOS.length} piezas catalogadas`
      : `${modosHechos}/5 modos · ${bestEstrellas}★`;

  // Cuántas piezas hay ya en cada movimiento, según el modo.
  const contar = (m: Record<string, Movimiento>) => {
    const c: Partial<Record<Movimiento, number>> = {};
    for (const v of Object.values(m)) c[v] = (c[v] ?? 0) + 1;
    return c;
  };

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "curaduria" && (
        <Mesa>
          <div>
            <div className="ml-hd">
              <Eyebrow>Elige una pieza y colócala en su movimiento</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: curaduriaDone ? OK : T.text3 }}>
                {Object.keys(colF).length}/{FRAGMENTOS.length}
              </span>
            </div>
            {fragLibres.length === 0 ? (
              <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Exposición completa! Catalogaste las {FRAGMENTOS.length} piezas.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {fragLibres.map((f) => (
                  <PiezaCard key={f.id} f={f} abierta={selF === f.id} onElegir={() => elegirFrag(f.id)} />
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <LineaTiempo
              contados={contar(colF)}
              armado={!!fragSel}
              resaltado={resF ? { bin: resF.bin, ok: resF.ok } : null}
              onElegir={colocarFrag}
            />
            {resF && <Medidor res={resF} frag={fragSel} />}
          </div>
        </Mesa>
      )}

      {modo === "obras" && (
        <Mesa>
          <div>
            <div className="ml-hd">
              <Eyebrow>Selecciona una obra y toca su movimiento</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: obrasDone ? OK : T.text3 }}>
                {Object.keys(ubicObra).length}/{OBRAS.length}
              </span>
            </div>
            {obrasLibres.length === 0 ? (
              <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {OBRAS.length} obras!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {obrasLibres.map((o) => (
                  <button key={o.id} type="button" className="ml-chip" data-sel={selObra === o.id} onClick={() => { setResObra(null); setSelObra((s) => (s === o.id ? null : o.id)); }}>
                    {o.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <LineaTiempo contados={contar(ubicObra)} armado={!!selObra} resaltado={resObra ? { bin: resObra.bin, ok: resObra.ok } : null} onElegir={colocarObra} />
            {resObra && <Aviso res={resObra} />}
          </div>
        </Mesa>
      )}

      {modo === "rasgos" && (
        <Mesa>
          <div>
            <div className="ml-hd">
              <Eyebrow>Selecciona un rasgo y toca el movimiento que define</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: rasgosDone ? OK : T.text3 }}>
                {Object.keys(empRasgo).length}/{RASGOS.length}
              </span>
            </div>
            {rasgosLibres.length === 0 ? (
              <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {RASGOS.length} rasgos!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rasgosLibres.map((r) => (
                  <button key={r.id} type="button" className="ml-chip" data-sel={selRasgo === r.id} onClick={() => { setResRasgo(null); setSelRasgo((s) => (s === r.id ? null : r.id)); }}>
                    {r.rasgo}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <LineaTiempo contados={contar(empRasgo)} armado={!!selRasgo} resaltado={resRasgo ? { bin: resRasgo.bin, ok: resRasgo.ok } : null} onElegir={colocarRasgo} />
            {resRasgo && <Aviso res={resRasgo} />}
          </div>
        </Mesa>
      )}

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
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={MOVIMIENTOS_LITERARIOS_HUECOS}
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
    curaduria: "Lee la pieza y fíjate en sus tres rasgos. Algunas piezas mezclan rasgos de dos movimientos: gana el movimiento donde se enciendan más.",
    obras: "Cada autor y obra pertenece a un movimiento. Si dudas, compara con la descripción del movimiento que aparece al equivocarte.",
    rasgos: "Cada movimiento tiene un rasgo que lo distingue de los demás. Une el rasgo con el movimiento que define.",
    glosario: "Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="La exposición (simulación)" icono="fa-landmark">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  Eres curador de una sala con ocho piezas. Los autores y los fragmentos son inventados para este ejercicio; los periodos de la línea del tiempo son aproximados.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Piezas catalogadas" value={`${Object.keys(colF).length}/${FRAGMENTOS.length}`} col={curaduriaDone ? OK : undefined} />
                  <Dato label="Modos hechos" value={`${modosHechos}/5`} col={modosHechos === 5 ? OK : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Reconoces los movimientos literarios con claridad!" : "Termina todos los modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={MOVIMIENTOS_LITERARIOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los seis movimientos" icono="fa-timeline">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {MOVS.map((m) => (
                    <div key={m} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{MOVIMIENTO_INFO[m].titulo}.</strong> {MOVIMIENTO_INFO[m].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PARES.map((p) => (
                    <div key={p.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{p.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_MOVIMIENTOS}</div>
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
  .ml-hd { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
  .ml-chip { cursor:pointer; display:inline-flex; align-items:center; justify-content:flex-start; gap:8px; padding:11px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .ml-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .ml-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .ml-pieza { display:flex; flex-direction:column; text-align:left; border-radius:14px; overflow:hidden; padding:0; cursor:pointer; color:${T.text};
    border:1.5px solid ${T.line}; background:${T.glass}; transition:border-color .14s, background .14s, box-shadow .14s; min-width:0; }
  .ml-pieza:hover { border-color:${T.lineStrong}; }
  .ml-pieza[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .ml-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:30px;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.7); }
  .ml-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .ml-pieza-cuerpo { display:flex; flex-direction:column; gap:8px; padding:10px 12px 12px; font-size:14px; line-height:1.45; }
  .ml-rasgos { display:flex; flex-wrap:wrap; gap:6px; }
  .ml-rasgo { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:14px; font-weight:800;
    border:1px solid ${T.line}; background:rgba(255,255,255,0.06); color:${T.text2}; }
  .ml-rasgo[data-on="true"] { border-color:${OK}; background:${OK}22; color:#fff; }
  .ml-rasgo[data-mal="true"] { border-color:${NO}88; background:${NO}18; color:#fff; }
  .ml-linea { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:10px; display:grid; gap:8px; }
  .ml-linea svg { width:100%; max-width:460px; margin:0 auto; display:block; height:auto; }
  .ml-banda { cursor:pointer; outline:none; }
  .ml-banda rect.ml-fondo { transition:fill .15s, stroke .15s; }
  .ml-banda:hover rect.ml-fondo, .ml-banda:focus-visible rect.ml-fondo { stroke:#fff; }
  .ml-aviso { border-radius:14px; padding:12px 14px; display:grid; gap:8px; font-size:14px; line-height:1.45; }
  .ml-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .ml-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .ml-q:disabled{ cursor:default; }
  .ml-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .ml-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .ml-btn:disabled { opacity:.45; cursor:not-allowed; }

  /* Acentos del simulador (línea de tiempo y piezas) */
  .ml-linea { --tono:262; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.13) 0%, transparent 62%); }
  .ml-linea::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .ml-pieza[data-sel="true"] { background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono, 188) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .ml-chip, .ml-chip:hover, .ml-chip[data-sel="true"] { transform:none; transition:none; }
    .ml-banda rect.ml-fondo { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas del simulador
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave }: { clave: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <div className="ml-foto" aria-hidden>
      <i className="fa-solid fa-scroll" />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </div>
  );
}

function PiezaCard({ f, abierta, onElegir }: { f: Fragmento; abierta: boolean; onElegir: () => void }) {
  return (
    <button type="button" className="ml-pieza" data-sel={abierta} aria-pressed={abierta} onClick={onElegir}>
      <Foto clave={f.clave} />
      <span className="ml-pieza-cuerpo">
        <strong style={{ fontSize: 15 }}>{f.titulo}</strong>
        <span style={{ color: T.text3 }}>{f.autor} · simulación</span>
        <span style={{ fontStyle: "italic", color: T.text2 }}>«{f.texto}»</span>
        {abierta && (
          <span className="ml-rasgos" aria-label="Rasgos que muestra la pieza">
            {f.rasgos.map((r) => (
              <span key={r} className="ml-rasgo">
                <i className="fa-solid fa-magnifying-glass" aria-hidden />
                {rasgoPorId(r).texto}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

const Y0 = 28;
const ALTO = 470;
const yDe = (anio: number) => Y0 + ((anio - 1580) / 400) * ALTO;

function LineaTiempo({
  contados,
  armado,
  resaltado,
  onElegir,
}: {
  contados: Partial<Record<Movimiento, number>>;
  armado: boolean;
  resaltado: { bin: Movimiento; ok: boolean } | null;
  onElegir: (m: Movimiento) => void;
}) {
  const anios = [1600, 1700, 1800, 1900];
  return (
    <div className="ml-linea">
      <div style={{ fontSize: 14, color: T.text2, display: "flex", gap: 8, alignItems: "center" }}>
        <i className="fa-solid fa-timeline" aria-hidden style={{ color: "var(--lsa)" }} />
        {armado ? "Toca el movimiento donde va la selección." : "Línea del tiempo (periodos aproximados)."}
      </div>
      <svg viewBox="0 0 360 520" role="group" aria-label="Línea del tiempo de los movimientos literarios">
        <line x1="62" y1={Y0} x2="62" y2={Y0 + ALTO} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        {anios.map((a) => (
          <g key={a}>
            <line x1="56" y1={yDe(a)} x2="68" y2={yDe(a)} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <text x="50" y={yDe(a) + 5} textAnchor="end" fontSize="15" fill="rgba(255,255,255,0.7)">{a}</text>
          </g>
        ))}
        {MOVS.map((m) => {
          const b = BANDAS[m];
          const x = b.col === 0 ? 80 : 222;
          const w = 134;
          const y = yDe(b.desde);
          const h = Math.max(38, yDe(b.hasta) - y);
          const res = resaltado && resaltado.bin === m ? (resaltado.ok ? OK : NO) : null;
          const n = contados[m] ?? 0;
          return (
            <g
              key={m}
              className="ml-banda"
              role="button"
              tabIndex={0}
              aria-label={`${MOVIMIENTO_INFO[m].titulo}, ${b.periodo}. ${n} colocadas`}
              onClick={() => onElegir(m)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onElegir(m);
                }
              }}
            >
              <rect
                className="ml-fondo"
                x={x}
                y={y}
                width={w}
                height={h}
                rx="9"
                fill={res ? `${res}33` : armado ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}
                stroke={res ?? "rgba(255,255,255,0.35)"}
                strokeWidth={res ? 3 : 1.5}
                strokeDasharray={armado && !res ? "5 4" : undefined}
              />
              <text x={x + 8} y={y + 18} fontSize="15" fontWeight="800" fill="#fff">{MOVIMIENTO_INFO[m].titulo}</text>
              {h >= 56 && <text x={x + 8} y={y + 38} fontSize="14" fill="rgba(255,255,255,0.7)">{b.periodo}</text>}
              {n > 0 &&
                Array.from({ length: n }, (_, i) => (
                  <circle key={i} cx={x + w - 14 - i * 16} cy={y + h - 12} r="6" fill={OK} />
                ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Medidor de rasgos tras colocar una pieza de la curaduría. */
function Medidor({ res, frag }: { res: Resultado; frag: Fragmento | null }) {
  const rasgos = rasgosDe(res.bin);
  return (
    <div className="ml-aviso" role="status" style={{ border: `1px solid ${res.ok ? OK : NO}66`, background: `${res.ok ? OK : NO}12` }}>
      <strong style={{ color: res.ok ? OK : NO }}>
        <i className={`fa-solid ${res.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden /> Rasgos de {NOMBRES[res.bin]}: {res.encendidos.length} de 3
      </strong>
      <div className="ml-rasgos">
        {rasgos.map((r) => (
          <span key={r.id} className="ml-rasgo" data-on={res.encendidos.includes(r.id)}>
            <i className={`fa-solid ${res.encendidos.includes(r.id) ? "fa-lightbulb" : "fa-circle"}`} aria-hidden />
            {r.texto}
          </span>
        ))}
      </div>
      <span style={{ color: T.text2 }}>{res.mensaje}</span>
      {!res.ok && frag && <span style={{ color: T.text3 }}>Vuelve a leer la pieza y prueba en otro movimiento.</span>}
    </div>
  );
}

function Aviso({ res }: { res: Resultado }) {
  return (
    <div className="ml-aviso" role="status" style={{ border: `1px solid ${res.ok ? OK : NO}66`, background: `${res.ok ? OK : NO}12`, color: T.text2 }}>
      <strong style={{ color: res.ok ? OK : NO }}>
        <i className={`fa-solid ${res.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden /> {res.ok ? "Correcto" : "Todavía no"}
      </strong>
      <span>{res.mensaje}</span>
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
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
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
        Cinco preguntas sobre los rasgos definitorios de cada movimiento literario. Elige la opción correcta y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 9 }}>
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
                    <button key={oi} className="ml-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="ml-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ml-btn" onClick={reintentar}>
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
