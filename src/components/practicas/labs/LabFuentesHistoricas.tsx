"use client";

/**
 * Laboratorio — Fuentes históricas: selección, evaluación y contraste
 * Práctica experimental para CH-III-P01-A4 (Conciencia Histórica III).
 *
 * El alumno es historiador en un ARCHIVO FICTICIO («La crecida de Villa
 * Alameda», simulación) y reconstruye qué pasó con ocho fuentes:
 *  · examina cada fuente con los CINCO CRITERIOS (autoría, fecha, intención,
 *    audiencia, contexto), que cuestan «horas de archivo» limitadas, y puede
 *    contrastarla con otra;
 *  · la clasifica (primaria, secundaria o terciaria) y juzga su fiabilidad;
 *  · cada juicio mueve el medidor de solidez y la línea de tiempo del caso:
 *    confiar en una fuente sesgada abre disputas, confiar en una copia no
 *    suma pruebas nuevas;
 *  · cierra el caso y compara su reconstrucción con lo ocurrido.
 *  + «Escribe el término» (glosario A5) y «Completa el texto» (A6).
 *  + Cuestionario de comprensión (V/F verbatim de A4), en la pestaña Reto.
 *
 * DOM puro (sin three.js). Teoría VERBATIM de CH-III·P01, en la pestaña Teoría.
 * Modelo en fuentes-historicas-sim.ts. Fuentes, medios y cifras: ficticios.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { FUENTES_HISTORICAS_HUECOS } from "./fuentes-historicas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { FUENTES_HISTORICAS_FICHA } from "./fuentes-historicas-ficha";
import {
  FUENTES,
  TIPO_FUENTE_INFO,
  CRITERIOS,
  PARES,
  QUIZ,
  DATO_FUENTES,
} from "./fuentes-historicas-data";
import {
  ARCHIVO,
  CRITERIOS_SIM,
  EVENTOS,
  ETIQUETA_JUICIO,
  HORAS,
  COSTO_PISTA,
  COSTO_CONTRASTE,
  MIN_PARA_CERRAR,
  textoContraste,
  claveContraste,
  horasGastadas,
  lineaDeTiempo,
  solidez,
  correctos,
  valorar,
  porId,
  type CriterioId,
  type FuenteSim,
  type Juicio,
  type TipoFuente,
  type LineaEvento,
} from "./fuentes-historicas-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-fuentes-historicas-reto";
const RUTA_SIM = "/media/labs-sim/fuentes-historicas";

type Modo = "caso" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "caso", label: "Archivo del caso", icono: "fa-box-archive" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

interface Aviso {
  tono: "ok" | "casi" | "mal" | "info";
  texto: string;
}

export function LabFuentesHistoricas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("caso");

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

  // ── estado del caso ───────────────────────────────────────────────────
  const [sel, setSel] = useState<string>(ARCHIVO[0]!.id);
  const [pistas, setPistas] = useState<string[]>([]); // `${fuente}:${criterio}`
  const [contrastes, setContrastes] = useState<string[]>([]); // claves de pareja
  const [contrastando, setContrastando] = useState(false);
  const [contrasteVer, setContrasteVer] = useState<string | null>(null);
  const [tipos, setTipos] = useState<Record<string, TipoFuente>>({});
  const [juicios, setJuicios] = useState<Record<string, Juicio | undefined>>({});
  const [cerrado, setCerrado] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoFuente | null>(null);

  const resetCaso = () => {
    setSel(ARCHIVO[0]!.id);
    setPistas([]);
    setContrastes([]);
    setContrastando(false);
    setContrasteVer(null);
    setTipos({});
    setJuicios({});
    setCerrado(false);
    setAviso(null);
    partida.reiniciar();
  };

  // El glosario se escribe: el contador hace de `key` y deja las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── derivados ─────────────────────────────────────────────────────────
  const horasUsadas = horasGastadas(pistas, contrastes);
  const horasQuedan = HORAS - horasUsadas;
  const linea = lineaDeTiempo(juicios);
  const solidezAhora = solidez(linea);
  const juzgadas = Object.values(juicios).filter(Boolean).length;
  const fuente = porId(sel);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const tiposDone = Object.keys(tipos).length >= ARCHIVO.length;
  const criteriosUsados = new Set(pistas.map((p) => p.split(":")[1]));
  const criteriosDone = CRITERIOS_SIM.every((c) => criteriosUsados.has(c.id));
  const modosHechos = (tiposDone ? 1 : 0) + (criteriosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Juzga la fiabilidad de 5 fuentes usando las pistas", done: juzgadas >= MIN_PARA_CERRAR },
    { txt: "Clasifica las 8 fuentes por su tipo", done: tiposDone },
    { txt: "Empareja los 5 criterios con su pregunta", done: criteriosDone },
    { txt: "Cierra el caso con la línea de tiempo bien reconstruida", done: cerrado && correctos(linea) === EVENTOS.length },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetActual = modo === "texto" ? resetTexto : modo === "glosario" ? resetGlosario : resetCaso;

  // ── acciones ──────────────────────────────────────────────────────────
  const usarPista = (c: CriterioId) => {
    const k = `${sel}:${c}`;
    if (pistas.includes(k) || cerrado) return;
    if (horasQuedan < COSTO_PISTA) {
      setAviso({ tono: "mal", texto: "Se acabaron las horas de archivo: decide con lo que ya sabes." });
      return;
    }
    sfxClick();
    const nuevas = [...pistas, k];
    setPistas(nuevas);
    setAviso(null);
    if (CRITERIOS_SIM.every((x) => nuevas.some((p) => p.endsWith(`:${x.id}`)))) {
      sfxOk();
      persistMejor(tiposDone, true, glosarioDone);
    }
  };
  const contrastarCon = (otraId: string) => {
    const k = claveContraste(sel, otraId);
    if (cerrado) return;
    if (!contrastes.includes(k)) {
      if (horasQuedan < COSTO_CONTRASTE) {
        setAviso({ tono: "mal", texto: "Contrastar cuesta 2 horas y ya no te alcanzan." });
        return;
      }
      setContrastes((c) => [...c, k]);
    }
    sfxClick();
    setContrasteVer(otraId);
    setAviso(null);
  };
  const clasificar = (t: TipoFuente) => {
    if (tipos[sel] || cerrado) return;
    if (fuente.tipo === t) {
      sfxPlace();
      setTipos((x) => ({ ...x, [sel]: t }));
      setAviso({ tono: "ok", texto: `Correcto: ${fuente.razonTipo}` });
      if (Object.keys(tipos).length + 1 >= ARCHIVO.length) {
        sfxOk();
        persistMejor(true, criteriosDone, glosarioDone);
      }
    } else {
      sfxNo();
      setShakeTipo(t);
      window.setTimeout(() => setShakeTipo(null), 420);
      setAviso({ tono: "mal", texto: `No es ${TIPO_FUENTE_INFO[t].titulo.toLowerCase()}. Pregúntate si se produjo EN la época de los hechos, la interpreta después o solo reúne obras.` });
    }
  };
  const juzgar = (j: Juicio) => {
    if (juicios[sel] || cerrado) return;
    const v = valorar(fuente, j);
    const ciego = !pistas.some((p) => p.startsWith(`${sel}:`));
    setJuicios((x) => ({ ...x, [sel]: j }));
    if (v === "exacto") {
      sfxPlace();
      setAviso({ tono: "ok", texto: `${ciego ? "Acertaste, aunque a ciegas. " : ""}${fuente.razonFiab}` });
    } else if (v === "casi") {
      sfxClick();
      setAviso({ tono: "casi", texto: `Casi: ${fuente.razonFiab}` });
    } else {
      sfxNo();
      setAviso({ tono: "mal", texto: `Cuidado: ${fuente.razonFiab} Mira cómo cambió la línea de tiempo.` });
    }
  };
  const cerrarCaso = () => {
    if (juzgadas < MIN_PARA_CERRAR || cerrado) return;
    sfxOk();
    setCerrado(true);
  };

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "caso" && (
        <>
          <Cabecera horasQuedan={horasQuedan} solidez={solidezAhora} juzgadas={juzgadas} accent={accent} />

          <div className="fh-fuentes">
            {ARCHIVO.map((f) => (
              <TarjetaFuente
                key={f.id}
                f={f}
                activa={sel === f.id}
                tipo={tipos[f.id]}
                juicio={juicios[f.id]}
                pistasN={pistas.filter((p) => p.startsWith(`${f.id}:`)).length}
                onClick={() => {
                  setSel(f.id);
                  setAviso(null);
                  setContrastando(false);
                  setContrasteVer(null);
                }}
              />
            ))}
          </div>

          <DetalleFuente
            f={fuente}
            pistas={pistas}
            contrastes={contrastes}
            contrastando={contrastando}
            contrasteVer={contrasteVer}
            tipo={tipos[sel]}
            juicio={juicios[sel]}
            aviso={aviso}
            shakeTipo={shakeTipo}
            horasQuedan={horasQuedan}
            cerrado={cerrado}
            onPista={usarPista}
            onToggleContraste={() => setContrastando((c) => !c)}
            onContrastar={contrastarCon}
            onClasificar={clasificar}
            onJuzgar={juzgar}
          />

          <LineaTiempo linea={linea} accent={accent} cerrado={cerrado} />

          {!cerrado ? (
            <div className="fh-panel" style={{ alignItems: "flex-start" }}>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                {juzgadas < MIN_PARA_CERRAR
                  ? `Juzga al menos ${MIN_PARA_CERRAR} fuentes para poder cerrar el caso (llevas ${juzgadas}).`
                  : "Cuando tu línea de tiempo te convenza, cierra el caso y compárala con lo que ocurrió."}
              </div>
              <button type="button" className="fh-btn fh-btn-main" disabled={juzgadas < MIN_PARA_CERRAR} onClick={cerrarCaso}>
                <i className="fa-solid fa-gavel" aria-hidden /> Cerrar el caso
              </button>
            </div>
          ) : (
            <Veredicto linea={linea} solidez={solidezAhora} onReiniciar={resetCaso} />
          )}
        </>
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
            persistMejor(tiposDone, criteriosDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={FUENTES_HISTORICAS_HUECOS}
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
    caso: "Una fuente sesgada no se descarta: se identifica su sesgo. Y dos fuentes que se copian no cuentan como dos pruebas. Gasta tus horas donde más dudas tengas.",
    glosario: "Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const lectura = modo === "caso" ? `${juzgadas}/${ARCHIVO.length} juzgadas · ${horasQuedan} h · solidez ${solidezAhora} %` : `${modosHechos}/4 · ${bestEstrellas}★`;

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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "caso" ? "Reiniciar el caso" : "Reiniciar este modo"} onClick={resetActual} />
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
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Evalúas fuentes como un historiador!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
              <Bloque titulo="Las 5 preguntas del historiador" icono="fa-magnifying-glass">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CRITERIOS_SIM.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: criteriosUsados.has(c.id) ? OK : T.text2, lineHeight: 1.45 }}>
                      <i className={`fa-solid ${criteriosUsados.has(c.id) ? "fa-circle-check" : c.icono}`} aria-hidden style={{ marginRight: 8 }} />
                      <strong style={{ color: criteriosUsados.has(c.id) ? OK : T.text }}>{c.etiqueta}.</strong> {c.pregunta}
                    </div>
                  ))}
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
                <FichaTeorica data={FUENTES_HISTORICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Primaria, secundaria o terciaria" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(Object.keys(TIPO_FUENTE_INFO) as TipoFuente[]).map((t) => (
                    <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{TIPO_FUENTE_INFO[t].titulo}.</strong> {TIPO_FUENTE_INFO[t].subtitulo}
                      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                        {FUENTES.filter((f) => f.tipo === t).map((f) => (
                          <li key={f.id}>{f.texto}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Los cinco criterios" icono="fa-magnifying-glass">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CRITERIOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.criterio}: {c.pregunta}</strong> {c.ejemplo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-link">
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_FUENTES}</div>
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
  @keyframes fhShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
  @keyframes fhPop { 0%{transform:scale(.8);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fh-fuentes { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .fh-card { position:relative; display:flex; flex-direction:column; gap:6px; text-align:left; padding:8px; border-radius:14px; min-width:0;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.35; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; }
  .fh-card:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .fh-card[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .fh-card strong { font-size:14px; font-weight:800; }
  .fh-foto { position:relative; overflow:hidden; border-radius:10px; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); display:flex; align-items:center; justify-content:center; }
  .fh-foto > i { font-size:26px; color:rgba(255,255,255,0.55); }
  .fh-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .fh-chip { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:2px 8px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .fh-chip[data-t="ok"] { border-color:${OK}66; color:${OK}; }
  .fh-chip[data-t="casi"] { border-color:${AMBAR}66; color:${AMBAR}; }
  .fh-chip[data-t="mal"] { border-color:${NO}66; color:${NO}; }
  .fh-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .fh-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; text-align:left; }
  .fh-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .fh-btn:disabled { opacity:.45; cursor:not-allowed; }
  .fh-btn[data-used="true"] { border-color:${OK}66; background:${OK}12; }
  .fh-btn[data-shake="true"] { animation:fhShake .4s; border-color:${NO}; }
  .fh-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .fh-herr { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:8px; }
  .fh-pista { font-size:14px; line-height:1.5; color:${T.text2}; padding:9px 12px; border-radius:10px; background:${T.inset}; border:1px solid ${T.line}; animation:fhPop .25s ease; }
  .fh-pista strong { color:${T.text}; }
  .fh-aviso { font-size:14px; line-height:1.5; padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; color:#fff; animation:fhPop .25s ease; }
  .fh-aviso[data-t="ok"] { border-color:${OK}77; background:${OK}14; }
  .fh-aviso[data-t="casi"] { border-color:${AMBAR}77; background:${AMBAR}14; }
  .fh-aviso[data-t="mal"] { border-color:${NO}77; background:${NO}12; }
  .fh-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .fh-barra > i { display:block; height:100%; border-radius:7px; transition:width .7s cubic-bezier(.2,.8,.2,1); }
  .fh-linea { position:relative; display:flex; flex-direction:column; gap:12px; padding-left:22px; }
  .fh-linea::before { content:""; position:absolute; left:7px; top:6px; bottom:6px; width:3px; border-radius:2px; background:${T.lineStrong}; }
  .fh-ev { position:relative; display:flex; flex-direction:column; gap:3px; }
  .fh-ev::before { content:""; position:absolute; left:-22px; top:3px; width:17px; height:17px; border-radius:50%; background:var(--pt, ${T.lineStrong}); border:3px solid #0b2233; transition:background .3s; }
  .fh-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fh-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fh-q:disabled{ cursor:default; }
  @media (prefers-reduced-motion: reduce){
    .fh-card, .fh-card:hover { transform:none; transition:none; }
    .fh-pista, .fh-aviso, .fh-btn[data-shake="true"] { animation:none; }
    .fh-barra > i { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales del caso
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen de una fuente: gradiente + ícono detrás; la foto se oculta si falta. */
function Foto({ clave, icono, alto }: { clave: string; icono: string; alto: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="fh-foto" style={{ height: alto }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

function Cabecera({ horasQuedan, solidez: s, juzgadas, accent }: { horasQuedan: number; solidez: number; juzgadas: number; accent: string }) {
  const col = s >= 70 ? OK : s >= 35 ? AMBAR : NO;
  return (
    <div className="fh-panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-box-archive" style={{ marginRight: 8, color: accent }} />
          Caso (simulación): la crecida de Villa Alameda
        </Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>{juzgadas}/{ARCHIVO.length} juzgadas</span>
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        Una noche de 1907 (simulación) el agua inundó el barrio bajo. ¿Qué pasó y de quién te puedes fiar? Examina las fuentes, juzga cada una y mira cómo se arma la línea de tiempo.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 5 }}>
            <i className="fa-solid fa-hourglass-half" aria-hidden style={{ marginRight: 7 }} />
            Horas de archivo: <strong style={{ color: "#fff" }}>{horasQuedan}</strong> de {HORAS}
          </div>
          <div className="fh-barra"><i style={{ width: `${(horasQuedan / HORAS) * 100}%`, background: accent }} /></div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 5 }}>
            <i className="fa-solid fa-scale-balanced" aria-hidden style={{ marginRight: 7 }} />
            Solidez del caso: <strong style={{ color: col }}>{s} %</strong>
          </div>
          <div className="fh-barra"><i style={{ width: `${s}%`, background: col }} /></div>
        </div>
      </div>
    </div>
  );
}

function TarjetaFuente({ f, activa, tipo, juicio, pistasN, onClick }: { f: FuenteSim; activa: boolean; tipo?: TipoFuente; juicio?: Juicio; pistasN: number; onClick: () => void }) {
  return (
    <button type="button" className="fh-card" data-on={activa} onClick={onClick}>
      <Foto clave={f.clave} icono={f.icono} alto={72} />
      <strong>{f.medio}</strong>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {pistasN > 0 && <span className="fh-chip"><i className="fa-solid fa-magnifying-glass" aria-hidden />{pistasN}/5</span>}
        {tipo && <span className="fh-chip" data-t="ok">{tipo}</span>}
        {juicio && <span className="fh-chip">{ETIQUETA_JUICIO[juicio]}</span>}
      </span>
    </button>
  );
}

function DetalleFuente({
  f, pistas, contrastes, contrastando, contrasteVer, tipo, juicio, aviso, shakeTipo, horasQuedan, cerrado,
  onPista, onToggleContraste, onContrastar, onClasificar, onJuzgar,
}: {
  f: FuenteSim; pistas: string[]; contrastes: string[]; contrastando: boolean; contrasteVer: string | null;
  tipo?: TipoFuente; juicio?: Juicio; aviso: Aviso | null; shakeTipo: TipoFuente | null; horasQuedan: number; cerrado: boolean;
  onPista: (c: CriterioId) => void; onToggleContraste: () => void; onContrastar: (id: string) => void;
  onClasificar: (t: TipoFuente) => void; onJuzgar: (j: Juicio) => void;
}) {
  const tiposBtn: TipoFuente[] = ["primaria", "secundaria", "terciaria"];
  const juiciosBtn: Juicio[] = ["confiable", "reservas", "poco"];
  return (
    <div className="fh-panel" key={f.id}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14, alignItems: "start" }}>
        <Foto clave={f.clave} icono={f.icono} alto={150} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span className="fh-chip" style={{ alignSelf: "flex-start" }}><i className={`fa-solid ${f.icono}`} aria-hidden />{f.medio}</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{f.titulo}</div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{f.resumen}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, marginBottom: 7 }}>
          1 · Examínala (cada pista cuesta {COSTO_PISTA} h)
        </div>
        <div className="fh-herr">
          {CRITERIOS_SIM.map((c) => {
            const usada = pistas.includes(`${f.id}:${c.id}`);
            return (
              <button key={c.id} type="button" className="fh-btn" data-used={usada} disabled={cerrado || (!usada && horasQuedan < COSTO_PISTA)} onClick={() => onPista(c.id)}>
                <i className={`fa-solid ${usada ? "fa-circle-check" : c.icono}`} aria-hidden />
                <span><strong>{c.etiqueta}</strong> · {c.pregunta}</span>
              </button>
            );
          })}
          <button type="button" className="fh-btn" data-used={contrastando} disabled={cerrado} onClick={onToggleContraste}>
            <i className="fa-solid fa-code-compare" aria-hidden />
            <span><strong>Contrastar</strong> con otra fuente ({COSTO_CONTRASTE} h)</span>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 9 }}>
          {CRITERIOS_SIM.filter((c) => pistas.includes(`${f.id}:${c.id}`)).map((c) => (
            <div key={c.id} className="fh-pista"><strong>{c.etiqueta}:</strong> {f.pistas[c.id]}</div>
          ))}
        </div>
        {contrastando && (
          <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 14, color: T.text2 }}>¿Con cuál la contrastas?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ARCHIVO.filter((o) => o.id !== f.id).map((o) => (
                <button key={o.id} type="button" className="fh-btn" data-used={contrasteVer === o.id} onClick={() => onContrastar(o.id)} style={{ padding: "8px 12px" }}>
                  {o.medio}{contrastes.includes(claveContraste(f.id, o.id)) ? " ✓" : ""}
                </button>
              ))}
            </div>
            {contrasteVer && <div className="fh-pista"><strong>{f.medio} frente a {porId(contrasteVer).medio.toLowerCase()}:</strong> {textoContraste(f.id, contrasteVer)}</div>}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, marginBottom: 7 }}>2 · ¿Qué tipo de fuente es?</div>
        <div className="fh-herr">
          {tiposBtn.map((t) => (
            <button key={t} type="button" className="fh-btn" data-used={tipo === t} data-shake={shakeTipo === t} disabled={!!tipo || cerrado} onClick={() => onClasificar(t)}>
              <i className={`fa-solid ${TIPO_FUENTE_INFO[t].icono}`} aria-hidden />
              {TIPO_FUENTE_INFO[t].titulo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, marginBottom: 7 }}>3 · ¿Qué tanto te fías de ella? (pesa en la línea de tiempo)</div>
        <div className="fh-herr">
          {juiciosBtn.map((j) => (
            <button key={j} type="button" className="fh-btn" data-used={juicio === j} disabled={!!juicio || cerrado} onClick={() => onJuzgar(j)}>
              <i className={`fa-solid ${j === "confiable" ? "fa-shield-halved" : j === "reservas" ? "fa-scale-unbalanced" : "fa-triangle-exclamation"}`} aria-hidden />
              {ETIQUETA_JUICIO[j]}
            </button>
          ))}
        </div>
      </div>

      {aviso && <div className="fh-aviso" data-t={aviso.tono} role="status">{aviso.texto}</div>}
    </div>
  );
}

function LineaTiempo({ linea, accent, cerrado }: { linea: LineaEvento[]; accent: string; cerrado: boolean }) {
  const colorDe = (l: LineaEvento) => (l.estado === "corroborada" ? OK : l.estado === "una" ? accent : l.estado === "disputa" ? AMBAR : "rgba(255,255,255,0.25)");
  const etiqueta = (l: LineaEvento) => (l.estado === "corroborada" ? `corroborada por ${l.apoyos} fuentes` : l.estado === "una" ? "apoyada por una sola fuente" : l.estado === "disputa" ? "en disputa" : "sin evidencia todavía");
  return (
    <div className="fh-panel">
      <Eyebrow>
        <i className="fa-solid fa-timeline" style={{ marginRight: 8, color: accent }} />
        Línea de tiempo según tus juicios
      </Eyebrow>
      <div className="fh-linea">
        {linea.map((l) => (
          <div key={l.ev.id} className="fh-ev" style={{ ["--pt" as string]: colorDe(l) }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{l.ev.titulo}</div>
            <div style={{ fontSize: 14, color: l.version ? T.text : T.text3, lineHeight: 1.45 }}>
              {l.version === "a" ? l.ev.a : l.version === "b" ? (l.ev.b ?? l.ev.a) : "Aún no hay fuentes que lo respalden."}
            </div>
            <div style={{ fontSize: 14, color: colorDe(l), fontWeight: 700 }}>
              {etiqueta(l)}
              {cerrado && (l.correcto ? " · coincide con lo ocurrido" : " · no coincide con lo ocurrido")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Veredicto({ linea, solidez: s, onReiniciar }: { linea: LineaEvento[]; solidez: number; onReiniciar: () => void }) {
  const n = correctos(linea);
  const todas = n === linea.length;
  return (
    <div className="fh-panel" style={{ borderColor: `${todas ? OK : AMBAR}66` }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: todas ? OK : AMBAR }}>
        <i className={`fa-solid ${todas ? "fa-trophy" : "fa-circle-half-stroke"}`} aria-hidden style={{ marginRight: 9 }} />
        {n} de {linea.length} hechos reconstruidos · solidez {s} %
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {linea.map((l) => (
          <div key={l.ev.id} style={{ fontSize: 14, lineHeight: 1.5, color: T.text2 }}>
            <i className={`fa-solid ${l.correcto ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden style={{ marginRight: 8, color: l.correcto ? OK : NO }} />
            <strong style={{ color: T.text }}>{l.ev.titulo}.</strong> {l.ev.porque}
          </div>
        ))}
      </div>
      <button type="button" className="fh-btn" onClick={onReiniciar}>
        <i className="fa-solid fa-rotate-left" aria-hidden /> Abrir el caso de nuevo
      </button>
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
        Cinco afirmaciones sobre la selección, evaluación y contraste de fuentes históricas. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
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
                    <button key={oi} className="fh-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="fh-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fh-btn" onClick={reintentar}>
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
