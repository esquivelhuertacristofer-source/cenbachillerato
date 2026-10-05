"use client";

/**
 * Laboratorio — Subgéneros narrativos: del suspenso al Antropoceno
 * Práctica experimental para LC-III-P04-A1 (Lenguaje y Comunicación III).
 *
 * EXPERIMENTO CENTRAL: «Mesa del editor». Una editorial FICTICIA (simulación)
 * le pide al alumno convertir una misma semilla de cuento —escrita para este
 * laboratorio, sin citar a ningún autor— en el subgénero de un encargo. El
 * alumno elige una convención en cuatro ranuras (escenario, personaje,
 * conflicto, tono): la portada y el párrafo de apertura cambian a la vista y
 * un lector simulado dice qué subgénero reconocería, con avisos cuando una
 * convención contradice el encargo (ver `subgeneros-narrativos-sim.ts`).
 *
 * Cinco modos, montados en el esqueleto `LabShell`:
 *  1. «Mesa del editor» — el simulador.
 *  2. «¿A qué subgénero pertenece?» — clasifica doce obras y rasgos entre los
 *     seis subgéneros de la fuente (dentro de `Mesa`).
 *  3. «El rasgo de cada subgénero» — empareja subgénero y rasgo (A1, verbatim).
 *  4. «Escribe el término» — definición verbatim (A5) → escribe el término.
 *  5. «Completa el texto» — fill_blanks verbatim de la progresión.
 *  + Cuestionario de comprensión (V/F verbatim de A4) en la pestaña Reto.
 *
 * DOM puro (sin three.js). Contenido VERBATIM de LC-III·P04; la teoría vive en
 * la pestaña «Teoría». Las imágenes salen de /media/labs-sim/subgeneros-narrativos
 * y, si aún no existen, se ve el degradado con su ícono.
 */

import React, { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { SUBGENEROS_NARRATIVOS_HUECOS } from "./subgeneros-narrativos-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { SUBGENEROS_NARRATIVOS_FICHA } from "./subgeneros-narrativos-ficha";
import {
  OBRAS,
  SUBGENERO_INFO,
  RASGOS,
  PARES,
  QUIZ,
  DATO_SUBGENEROS,
  type Subgenero,
} from "./subgeneros-narrativos-data";
import {
  RANURAS,
  SUBGENEROS,
  TONO_PORTADA,
  opcionesDe,
  leerCuento,
  parrafoApertura,
  evaluarEncargo,
  type Eleccion,
  type Ranura,
} from "./subgeneros-narrativos-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-subgeneros-narrativos-reto";
const RUTA_FOTOS = "/media/labs-sim/subgeneros-narrativos";

type Modo = "taller" | "obras" | "rasgos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "Mesa del editor", icono: "fa-book-bookmark" },
  { id: "obras", label: "¿A qué subgénero pertenece?", icono: "fa-book-open-reader" },
  { id: "rasgos", label: "El rasgo de cada subgénero", icono: "fa-list-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Nombre corto de cada subgénero para los medidores. */
const NOMBRE: Record<Subgenero, string> = {
  suspenso: "Suspenso",
  terror: "Terror",
  cienciaficcion: "Ciencia ficción",
  autoficcion: "Autoficción",
  neorrealismo: "Neorrealismo urbano",
  antropoceno: "Antropoceno",
};

/** Imagen del escenario de cada opción (id de `OPCIONES`). Solo la ranura «escenario» lleva foto. */
const FOTO_ESCENARIO: Record<string, string> = {
  "esc-su": "anden-noche",
  "esc-te": "casa-pasillos",
  "esc-cf": "ciudad-flotante",
  "esc-au": "escritorio-cuarto",
  "esc-ne": "vecindad-periferia",
  "esc-an": "pueblo-costero",
};

/** Imagen con reserva: degradado + ícono detrás; si el webp no existe, se oculta. */
function Foto({ clave, icono, className }: { clave: string; icono: string; className?: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span className={`sn-foto ${className ?? ""}`}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </span>
  );
}

export function LabSubgenerosNarrativos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("taller");

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

  // ── modo obras (clasifica por subgénero) ───────────────────────────────
  const [ubicObra, setUbicObra] = useState<Record<string, Subgenero>>({});
  const [selObra, setSelObra] = useState<string | null>(null);
  const [shakeObra, setShakeObra] = useState<Subgenero | null>(null);
  const obrasLibres = OBRAS.filter((o) => !ubicObra[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarObra = (obraId: string, bin: Subgenero) => {
    if (ubicObra[obraId]) return;
    const o = OBRAS.find((x) => x.id === obraId);
    if (o && o.subgenero === bin) {
      setUbicObra((e) => ({ ...e, [obraId]: bin }));
      setSelObra(null);
      sfxPlace();
      if (Object.keys(ubicObra).length + 1 >= OBRAS.length) {
        sfxOk();
        persistMejor(true, rasgosDone, glosarioDone);
      }
    } else {
      setShakeObra(bin);
      sfxNo();
      window.setTimeout(() => setShakeObra(null), 420);
    }
  };
  const resetObras = () => {
    setUbicObra({});
    setSelObra(null);
  };

  // ── modo rasgos (empareja subgénero → rasgo) ───────────────────────────
  const [empRasgo, setEmpRasgo] = useState<Record<string, boolean>>({});
  const [selRasgo, setSelRasgo] = useState<string | null>(null);
  const [shakeRasgo, setShakeRasgo] = useState<string | null>(null);
  const rasgosLibres = RASGOS.filter((r) => !empRasgo[r.id]).slice().sort((a, b) => a.subgenero.localeCompare(b.subgenero, "es"));

  const intentarRasgo = (chipId: string, rowId: string) => {
    if (empRasgo[rowId]) return;
    if (chipId === rowId) {
      setEmpRasgo((e) => ({ ...e, [rowId]: true }));
      setSelRasgo(null);
      sfxPlace();
      if (Object.keys(empRasgo).length + 1 >= RASGOS.length) {
        sfxOk();
        persistMejor(obrasDone, true, glosarioDone);
      }
    } else {
      setShakeRasgo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRasgo(null), 420);
    }
  };
  const resetRasgos = () => {
    setEmpRasgo({});
    setSelRasgo(null);
  };


  // ── modo taller (simulador: la mesa del editor) ────────────────────────
  const [objetivo, setObjetivo] = useState<Subgenero>("suspenso");
  const [eleccion, setEleccion] = useState<Eleccion>({});
  const [ranuraActiva, setRanuraActiva] = useState<Ranura>("escenario");
  const [cumplidos, setCumplidos] = useState<Partial<Record<Subgenero, boolean>>>({});
  const nCumplidos = Object.keys(cumplidos).length;
  const tallerDone = nCumplidos >= 3;
  const lector = leerCuento(eleccion);
  const apertura = parrafoApertura(eleccion);
  const veredicto = evaluarEncargo(objetivo, eleccion, NOMBRE);

  const elegirOpcion = (ranura: Ranura, opId: string) => {
    const nueva: Eleccion = { ...eleccion, [ranura]: eleccion[ranura] === opId ? undefined : opId };
    setEleccion(nueva);
    const v = evaluarEncargo(objetivo, nueva, NOMBRE);
    if (v.cumplido && !cumplidos[objetivo]) {
      setCumplidos((c) => ({ ...c, [objetivo]: true }));
      sfxPlace();
      sfxOk();
    } else {
      sfxClick();
    }
  };
  const cambiarObjetivo = (s: Subgenero) => {
    sfxClick();
    setObjetivo(s);
    // El cuento vuelve a empezar: el mismo cuento no sirve para dos encargos.
    setEleccion({});
    setRanuraActiva("escenario");
  };
  const resetTaller = () => {
    setEleccion({});
    setRanuraActiva("escenario");
    setObjetivo("suspenso");
    setCumplidos({});
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
  const obrasDone = Object.keys(ubicObra).length >= OBRAS.length;
  const rasgosDone = Object.keys(empRasgo).length >= RASGOS.length;
  const modosHechos = (tallerDone ? 1 : 0) + (obrasDone ? 1 : 0) + (rasgosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Convierte el cuento en el subgénero que pide el editor", done: nCumplidos >= 1 },
    { txt: "Cumple 3 encargos distintos sin contradicciones", done: tallerDone },
    { txt: `Clasifica las ${OBRAS.length} obras y rasgos por subgénero`, done: obrasDone },
    { txt: `Empareja los ${RASGOS.length} subgéneros con su rasgo`, done: rasgosDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
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
  const resetActual =
    modo === "texto" ? resetTexto : modo === "taller" ? resetTaller : modo === "obras" ? resetObras : modo === "rasgos" ? resetRasgos : resetGlosario;

  const pistaDe: Record<Modo, string> = {
    taller: "Cada convención empuja el cuento hacia un subgénero. Prueba una por ranura y mira cómo cambian la portada, el párrafo y las barras del lector. Si dos convenciones tiran para lados distintos, el lector se confunde.",
    obras: "El suspenso tensa; el terror asusta; la ciencia ficción imagina futuros; la autoficción mezcla vida e invención; el neorrealismo urbano retrata la ciudad; el Antropoceno narra la crisis ecológica.",
    rasgos: "Pregúntate qué hace cada subgénero: ¿tensa, asusta, especula, se confiesa, retrata la urbe o narra el colapso?",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const lectura =
    modo === "taller"
      ? lector.lider
        ? `El lector simulado reconoce: ${NOMBRE[lector.lider]} (${lector.porcentajes[lector.lider]} %)`
        : "Elige una convención para ver qué lee el lector"
      : modo === "obras"
        ? `${Object.keys(ubicObra).length}/${OBRAS.length} obras clasificadas`
        : modo === "rasgos"
          ? `${Object.keys(empRasgo).length}/${RASGOS.length} subgéneros emparejados`
          : `${modosHechos}/5 modos · ${bestEstrellas}★`;

  const hue = lector.lider ? TONO_PORTADA[lector.lider] : 215;
  const opcionesActivas = opcionesDe(ranuraActiva);

  const escena = (
    <div className="sn-escena">
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "taller" && (
        <div className="sn-taller">
          <div className="sn-encargo">
            <div className="sn-cabecera">
              <Foto clave="mesa-editor" icono="fa-book-bookmark" className="sn-hero" />
              <div className="sn-cabecera-txt">
                <strong>Editorial «Tinta del Sur»</strong>
                <span>Editorial ficticia · simulación</span>
              </div>
            </div>
            <div className="sn-titulo">
              <span>Encargo del editor: convierte el cuento en…</span>
              <strong data-ok={tallerDone}>{nCumplidos}/3 logrados</strong>
            </div>
            <div className="sn-objetivos" role="group" aria-label="Subgénero del encargo">
              {SUBGENEROS.map((s) => (
                <button key={s} type="button" className="sn-obj" data-on={objetivo === s} data-hecho={!!cumplidos[s]} onClick={() => cambiarObjetivo(s)}>
                  <i className={`fa-solid ${cumplidos[s] ? "fa-circle-check" : SUBGENERO_INFO[s].icono}`} aria-hidden />
                  {NOMBRE[s]}
                </button>
              ))}
            </div>
            <div className="sn-def">{SUBGENERO_INFO[objetivo].subtitulo}</div>
          </div>

          <div className="sn-cols">
            {/* Convenciones */}
            <div className="sn-conv">
              <div className="sn-ranuras" role="tablist" aria-label="Ranuras del cuento">
                {RANURAS.map((r) => (
                  <button key={r.id} type="button" role="tab" aria-selected={ranuraActiva === r.id} className="sn-ranura" data-on={ranuraActiva === r.id} onClick={() => setRanuraActiva(r.id)}>
                    <i className={`fa-solid ${eleccion[r.id] ? "fa-circle-check" : r.icono}`} aria-hidden />
                    {r.etiqueta}
                  </button>
                ))}
              </div>
              <div className="sn-opciones">
                {opcionesActivas.map((o) => (
                  <button key={o.id} type="button" className="sn-opcion" data-sel={eleccion[ranuraActiva] === o.id} onClick={() => elegirOpcion(ranuraActiva, o.id)}>
                    {FOTO_ESCENARIO[o.id] ? (
                      <Foto clave={FOTO_ESCENARIO[o.id]!} icono={o.icono} />
                    ) : (
                      <span className="sn-ico">
                        <i className={`fa-solid ${o.icono}`} aria-hidden />
                      </span>
                    )}
                    <span>{o.texto}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado: portada, apertura y lector */}
            <div className="sn-result">
              <div className="sn-portada" style={{ ["--h" as string]: hue }} data-vacia={!lector.lider}>
                <Foto clave="sobre-llave" icono="fa-envelope" className="sn-portada-foto" />
                <div className="sn-portada-cuerpo">
                  <i className={`fa-solid ${lector.lider ? SUBGENERO_INFO[lector.lider].icono : "fa-book"}`} aria-hidden />
                  <strong>La llave sin remitente</strong>
                  <span className="sn-cinta">
                    {lector.lider ? NOMBRE[lector.lider] : "Sin género"}
                    {lector.mezclaCon ? ` + ${NOMBRE[lector.mezclaCon]}` : ""}
                  </span>
                </div>
              </div>
              <p className="sn-parrafo">
                {apertura.fragmentos.map((f) => (
                  <span key={f.ranura} className="sn-frag" data-semilla={f.ranura === "semilla"}>
                    {f.texto}{" "}
                  </span>
                ))}
                {!apertura.completo && <span className="sn-hueco">… (faltan convenciones)</span>}
              </p>
            </div>
          </div>

          <div className="sn-lector">
            <div className="sn-titulo">
              <span>Lector simulado: qué subgénero reconocería</span>
              <strong>{lector.lider ? NOMBRE[lector.lider] : "—"}</strong>
            </div>
            {SUBGENEROS.map((s) => (
              <div key={s} className="sn-barra" data-obj={s === objetivo} data-lider={s === lector.lider}>
                <span className="sn-barra-nombre">{NOMBRE[s]}</span>
                <span className="sn-pista" role="meter" aria-label={NOMBRE[s]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={lector.porcentajes[s]}>
                  <span className="sn-relleno" style={{ width: `${lector.porcentajes[s]}%`, background: `hsl(${TONO_PORTADA[s]} 70% 58%)` }} />
                </span>
                <span className="sn-barra-pct">{lector.porcentajes[s]} %</span>
              </div>
            ))}
            <div className="sn-retro" data-ok={veredicto.cumplido ? "true" : veredicto.contradicciones.length > 0 ? "false" : undefined} role="status">
              <i className={`fa-solid ${veredicto.cumplido ? "fa-circle-check" : veredicto.contradicciones.length > 0 ? "fa-triangle-exclamation" : "fa-lightbulb"}`} aria-hidden />
              <span>{veredicto.cumplido ? `¡Encargo cumplido! ${veredicto.mensaje}` : veredicto.mensaje}</span>
            </div>
          </div>
        </div>
      )}

      {modo === "obras" && (
        <Mesa>
          <div className="sn-banco">
            <div className="sn-titulo">
              <span>Arrastra cada obra o rasgo a su subgénero</span>
              <strong data-ok={obrasDone}>{Object.keys(ubicObra).length}/{OBRAS.length}</strong>
            </div>
            {obrasLibres.length === 0 ? (
              <div className="sn-listo">
                <i className="fa-solid fa-circle-check" aria-hidden /> ¡Clasificaste las {OBRAS.length} obras y rasgos!
              </div>
            ) : (
              obrasLibres.map((o) => (
                <button key={o.id} type="button" className="sn-chip" data-sel={selObra === o.id} onClick={() => setSelObra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                  {o.texto}
                </button>
              ))
            )}
          </div>
          <BinsObras selObra={selObra} shakeObra={shakeObra} ubicObra={ubicObra} onMatch={intentarObra} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "rasgos" && (
        <Mesa>
          <div className="sn-banco">
            <div className="sn-titulo">
              <span>Arrastra cada subgénero a su rasgo definitorio</span>
              <strong data-ok={rasgosDone}>{Object.keys(empRasgo).length}/{RASGOS.length}</strong>
            </div>
            {rasgosLibres.length === 0 ? (
              <div className="sn-listo">
                <i className="fa-solid fa-circle-check" aria-hidden /> ¡Emparejaste los {RASGOS.length} subgéneros!
              </div>
            ) : (
              rasgosLibres.map((r) => (
                <button key={r.id} type="button" className="sn-chip" data-sel={selRasgo === r.id} onClick={() => setSelRasgo((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                  <i className="fa-solid fa-feather" style={{ fontSize: 14, color: T.text3 }} aria-hidden />
                  {r.subgenero}
                </button>
              ))
            )}
          </div>
          <RowsRasgos selRasgo={selRasgo} shakeRasgo={shakeRasgo} empRasgo={empRasgo} onMatch={intentarRasgo} dropProps={dropProps} />
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
            persistMejor(obrasDone, rasgosDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={SUBGENEROS_NARRATIVOS_HUECOS}
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
              {modo === "taller" && (
                <Bloque titulo="Tu mesa" icono="fa-gauge-high">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                    <Dato label="Encargos logrados" value={`${nCumplidos}/3`} col={tallerDone ? OK : undefined} />
                    <Dato label="Convenciones" value={`${lector.elegidas}/4`} col={accent} />
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
                  {bestEstrellas >= 3 ? "¡Distingues los subgéneros narrativos como un crítico!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={SUBGENEROS_NARRATIVOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los seis subgéneros" icono="fa-book-open-reader">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SUBGENEROS.map((s) => (
                    <div key={s} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{SUBGENERO_INFO[s].titulo}.</strong> {SUBGENERO_INFO[s].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="El rasgo de cada subgénero" icono="fa-list-check">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RASGOS.map((r) => (
                    <div key={r.id} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{r.subgenero}.</strong> {r.rasgo}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{r.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Obras y rasgos de referencia" icono="fa-book">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {OBRAS.map((o) => (
                    <div key={o.id} style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{SUBGENERO_INFO[o.subgenero].titulo}:</strong> {o.texto}
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
                <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.55 }}>{DATO_SUBGENEROS}</div>
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
  @keyframes snShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes snPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .sn-escena { display:grid; gap:14px; min-width:0; }
  .sn-taller, .sn-conv, .sn-result, .sn-lector, .sn-encargo { display:flex; flex-direction:column; gap:10px; min-width:0; }
  .sn-taller { gap:16px; }
  .sn-banco { display:flex; flex-direction:column; gap:10px; min-width:0; }
  .sn-cols { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:16px; align-items:start; }
  .sn-titulo { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:14px; font-weight:800; color:${T.text2}; line-height:1.35; }
  .sn-titulo strong { color:#fff; }
  .sn-titulo strong[data-ok="true"] { color:${OK}; }
  .sn-listo { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:700; color:${OK}; }
  .sn-def { font-size:14px; line-height:1.45; color:${T.text2}; padding:10px 12px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
  .sn-foto { position:relative; display:grid; place-items:center; aspect-ratio:16/10; width:100%; border-radius:10px; overflow:hidden;
    background:linear-gradient(135deg, rgba(${rgba},0.38), rgba(10,28,48,0.9)); color:rgba(255,255,255,0.75); font-size:26px; }
  .sn-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .sn-hero { aspect-ratio:auto; height:84px; border-radius:14px; }
  .sn-cabecera { position:relative; }
  .sn-cabecera-txt { position:absolute; left:0; right:0; bottom:0; padding:22px 14px 10px; display:grid; gap:2px;
    background:linear-gradient(0deg, rgba(3,8,18,0.85), transparent); border-radius:0 0 14px 14px; }
  .sn-cabecera-txt strong { font-size:16px; font-weight:900; color:#fff; }
  .sn-cabecera-txt span { font-size:14px; color:${T.text2}; }
  .sn-objetivos { display:flex; flex-wrap:wrap; gap:8px; }
  .sn-obj { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 13px; border-radius:11px; border:1.5px solid ${T.line};
    background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .sn-obj:hover { border-color:${T.lineStrong}; color:#fff; }
  .sn-obj[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; }
  .sn-obj[data-hecho="true"] i { color:${OK}; }
  .sn-ranuras { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:6px; }
  .sn-ranura { cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; padding:9px 8px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .sn-ranura[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; }
  .sn-ranura i { color:${accent}; }
  .sn-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:9px; }
  .sn-opcion { cursor:pointer; display:flex; flex-direction:column; gap:8px; padding:8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; line-height:1.3; text-align:left; transition:all .14s; min-width:0; }
  .sn-opcion:hover { border-color:${T.lineStrong}; }
  .sn-opcion[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 16px -5px ${accent}; }
  .sn-ico { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; background:rgba(${rgba},0.2); color:${accent}; font-size:17px; }
  .sn-portada { position:relative; overflow:hidden; border-radius:16px; min-height:190px; display:grid; align-items:end;
    background:linear-gradient(160deg, hsl(var(--h) 60% 34%), hsl(var(--h) 55% 12%)); border:1.5px solid hsl(var(--h) 70% 58% / 0.6);
    transition:background .5s ease, border-color .5s ease; }
  .sn-portada[data-vacia="true"] { background:linear-gradient(160deg, #26364a, #0d1824); border-color:${T.line}; }
  .sn-portada-foto { position:absolute; inset:0; aspect-ratio:auto; border-radius:0; opacity:.35; font-size:0; }
  .sn-portada-cuerpo { position:relative; display:grid; gap:8px; justify-items:center; text-align:center; padding:22px 14px 16px; }
  .sn-portada-cuerpo > i { font-size:42px; color:hsl(var(--h) 85% 78%); animation:snPop .35s ease; }
  .sn-portada-cuerpo strong { font-size:19px; font-weight:900; color:#fff; line-height:1.2; }
  .sn-cinta { padding:5px 12px; border-radius:99px; background:hsl(var(--h) 70% 58%); color:#04121f; font-size:14px; font-weight:900; }
  .sn-parrafo { margin:0; padding:12px 14px; border-radius:14px; background:${T.inset}; border:1px solid ${T.line}; font-size:15px; line-height:1.6; color:#fff; font-family:Georgia, serif; }
  .sn-frag[data-semilla="true"] { color:${T.text2}; font-style:italic; }
  .sn-hueco { color:${T.text3}; font-style:italic; }
  .sn-barra { display:grid; grid-template-columns:minmax(0, 9.5em) minmax(0, 1fr) 3.4em; align-items:center; gap:10px; font-size:14px; color:${T.text2}; }
  .sn-barra[data-obj="true"] .sn-barra-nombre { color:${accent}; font-weight:900; }
  .sn-barra[data-lider="true"] .sn-barra-pct { color:#fff; }
  .sn-barra-pct { text-align:right; font-variant-numeric:tabular-nums; font-weight:800; }
  .sn-pista { display:block; height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
  .sn-relleno { display:block; height:100%; border-radius:99px; transition:width .5s ease; }
  .sn-retro { display:flex; gap:10px; align-items:flex-start; padding:11px 13px; border-radius:13px; border:1px solid ${T.line};
    background:${T.inset}; font-size:14px; line-height:1.45; color:${T.text2}; }
  .sn-retro i { margin-top:3px; color:${accent}; }
  .sn-retro[data-ok="true"] { border-color:${OK}66; background:${OK}12; color:#fff; }
  .sn-retro[data-ok="true"] i { color:${OK}; }
  .sn-retro[data-ok="false"] { border-color:${AMBAR}77; background:${AMBAR}12; color:#fff; }
  .sn-retro[data-ok="false"] i { color:${AMBAR}; }
  .sn-chip { cursor:grab; display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:14px; width:100%;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; text-align:left; line-height:1.4; }
  .sn-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .sn-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .sn-chip[data-arrastrando="true"] { opacity:.45; }
  .sn-chip:active { cursor:grabbing; }
  .sn-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; transition:all .16s; }
  .sn-row[data-shake="true"] { animation:snShake .4s; border-color:${NO}; }
  .sn-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .sn-slot { flex:1 1 150px; min-width:0; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .sn-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .sn-bin { position:relative; border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px; transition:all .16s; min-height:150px; }
  .sn-bin[data-sobre="true"], .sn-row[data-sobre="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .sn-bin[data-shake="true"] { animation:snShake .4s; border-color:${NO}; }
  .sn-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .sn-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .sn-q:disabled{ cursor:default; }
  .sn-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .sn-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){
    .sn-row[data-shake="true"], .sn-bin[data-shake="true"], .sn-portada-cuerpo > i { animation:none; }
    .sn-relleno, .sn-portada { transition:none; }
  }
`;

/** Rótulo pequeño de las tarjetas (14 px, no 11). */
const Ceja = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, margin: "0 0 12px" }}>{children}</p>
);

/* ═══ Paneles de cada modo ═══ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsObras({
  selObra,
  shakeObra,
  ubicObra,
  onMatch,
  dropProps,
}: {
  selObra: string | null;
  shakeObra: Subgenero | null;
  ubicObra: Record<string, Subgenero>;
  onMatch: (obraId: string, bin: Subgenero) => void;
  dropProps: DropFactory;
}) {
  const bins: Subgenero[] = ["suspenso", "terror", "cienciaficcion", "autoficcion", "neorrealismo", "antropoceno"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = SUBGENERO_INFO[bin];
        const dentro = OBRAS.filter((o) => ubicObra[o.id] === bin);
        return (
          <div
            key={bin}
            className="sn-bin"
            data-shake={shakeObra === bin}
            onClick={() => selObra && onMatch(selObra, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "snPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {o.texto}
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

function RowsRasgos({
  selRasgo,
  shakeRasgo,
  empRasgo,
  onMatch,
  dropProps,
}: {
  selRasgo: string | null;
  shakeRasgo: string | null;
  empRasgo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {RASGOS.map((r) => {
        const done = empRasgo[r.id];
        return (
          <div
            key={r.id}
            className="sn-row"
            data-shake={shakeRasgo === r.id}
            data-done={done}
            onClick={() => !done && selRasgo && onMatch(selRasgo, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div className="sn-slot" data-armed={!done && !!selRasgo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "snPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather" />
                  {r.subgenero}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> subgénero
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{r.rasgo}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{r.ejemplo}</div>
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
        Cinco afirmaciones sobre los subgéneros narrativos y sus elementos discursivos. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="sn-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="sn-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="sn-btn" onClick={reintentar}>
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
