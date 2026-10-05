"use client";

/**
 * Laboratorio — Creatividad y ética en la producción digital
 * Práctica experimental para CD-II-P05 (Ciudadanía Digital II).
 *
 * EXPERIMENTO CENTRAL: «Estudio Lumbre». El alumno produce un video para una
 * campaña escolar ficticia y en seis pasos (música, imágenes, personas, IA,
 * datos y patrocinio, tono) elige entre un atajo y un camino responsable. La
 * vista previa de la publicación y tres indicadores (vistas, confianza, riesgo;
 * cifras de simulación) se mueven con cada decisión. Al publicar se cobran los
 * incidentes (baja por derechos de autor, queja de privacidad, etiqueta de
 * información falsa…) y se ve que el atajo daba más alcance al principio pero
 * conserva menos al final. Modelo puro en etica-produccion-digital-sim.ts.
 *
 * Modos extra (se conservan): clasificar prácticas, concepto y definición,
 * «Escribe el término» (glosario A5) y «Completa el texto».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de CD-II·P05 en la pestaña Teoría.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { ETICA_PRODUCCION_DIGITAL_HUECOS } from "./etica-produccion-digital-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { ETICA_PRODUCCION_DIGITAL_FICHA } from "./etica-produccion-digital-ficha";
import {
  PRACTICAS,
  JUICIO_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_EPD,
  type Juicio,
} from "./etica-produccion-digital-data";
import {
  PASOS,
  VISTAS_MAX,
  opcionDe,
  simular,
  publicar,
  metaLograda,
  buenasDe,
  type Elecciones,
  type Paso,
  type PasoId,
  type Resultado,
} from "./etica-produccion-digital-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-etica-produccion-digital-reto";
const RUTA_FOTOS = "/media/labs-sim/etica-produccion-digital";

type Modo = "estudio" | "juicio" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "estudio", label: "Estudio Lumbre", icono: "fa-clapperboard" },
  { id: "juicio", label: "¿Ética o falta de ética?", icono: "fa-scale-balanced" },
  { id: "conceptos", label: "Concepto y definición", icono: "fa-lightbulb" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabEticaProduccionDigital({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("estudio");

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
  // y todos los fallos de los modos de refuerzo, así que la partida se lleva aquí.
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
  // El simulador explora: sus decisiones suenan pero no gastan errores de la partida.
  const sfxSuave = (bien: boolean) => (sonido ? (bien ? audioRef.current?.blip() : audioRef.current?.incorrecto()) : undefined);

  // ── simulador «Estudio Lumbre» ─────────────────────────────────────────
  const [elec, setElec] = useState<Elecciones>({});
  const [publicado, setPublicado] = useState(false);
  const [publicoAlguna, setPublicoAlguna] = useState(false);
  const [metaAlguna, setMetaAlguna] = useState(false);
  const [anterior, setAnterior] = useState<Resultado | null>(null);
  const vivo = simular(elec);
  const final = publicar(elec);

  const elegir = (paso: PasoId, opcion: string) => {
    if (publicado) return;
    setElec((e) => ({ ...e, [paso]: opcion }));
    sfxSuave(!!opcionDe(paso, opcion)?.buena);
  };
  const publicarVideo = () => {
    if (publicado || vivo.hechos < PASOS.length) return;
    setPublicado(true);
    setPublicoAlguna(true);
    if (metaLograda(final)) {
      setMetaAlguna(true);
      sfxOk();
    } else {
      sfxSuave(false);
    }
  };
  const otraVersion = () => {
    setAnterior(final);
    setElec({});
    setPublicado(false);
  };
  const resetSim = () => {
    setElec({});
    setPublicado(false);
    setPublicoAlguna(false);
    setMetaAlguna(false);
    setAnterior(null);
  };

  // ── modo juicio (clasifica prácticas éticas / no éticas) ───────────────
  const [ubicJuicio, setUbicJuicio] = useState<Record<string, Juicio>>({});
  const [selJuicio, setSelJuicio] = useState<string | null>(null);
  const [shakeJuicio, setShakeJuicio] = useState<Juicio | null>(null);
  const juicioLibres = PRACTICAS.filter((p) => !ubicJuicio[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarJuicio = (practicaId: string, bin: Juicio) => {
    if (ubicJuicio[practicaId]) return;
    const p = PRACTICAS.find((x) => x.id === practicaId);
    if (p && p.juicio === bin) {
      setUbicJuicio((e) => ({ ...e, [practicaId]: bin }));
      setSelJuicio(null);
      sfxPlace();
      if (Object.keys(ubicJuicio).length + 1 >= PRACTICAS.length) {
        sfxOk();
        persistMejor(true, conceptosDone, glosarioDone);
      }
    } else {
      setShakeJuicio(bin);
      sfxNo();
      window.setTimeout(() => setShakeJuicio(null), 420);
    }
  };
  const resetJuicio = () => {
    setUbicJuicio({});
    setSelJuicio(null);
  };

  // ── modo conceptos (empareja concepto → definición) ────────────────────
  const [empConc, setEmpConc] = useState<Record<string, boolean>>({});
  const [selConc, setSelConc] = useState<string | null>(null);
  const [shakeConc, setShakeConc] = useState<string | null>(null);
  const concLibres = CONCEPTOS.filter((c) => !empConc[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarConc = (chipId: string, rowId: string) => {
    if (empConc[rowId]) return;
    if (chipId === rowId) {
      setEmpConc((e) => ({ ...e, [rowId]: true }));
      setSelConc(null);
      sfxPlace();
      if (Object.keys(empConc).length + 1 >= CONCEPTOS.length) {
        sfxOk();
        persistMejor(juicioDone, true, glosarioDone);
      }
    } else {
      setShakeConc(rowId);
      sfxNo();
      window.setTimeout(() => setShakeConc(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpConc({});
    setSelConc(null);
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
  const juicioDone = Object.keys(ubicJuicio).length >= PRACTICAS.length;
  const conceptosDone = Object.keys(empConc).length >= CONCEPTOS.length;
  const modosHechos = (juicioDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Produce el video de Lumbre: decide los 6 pasos y publícalo", done: publicoAlguna },
    { txt: "Publica una campaña responsable, sin incidentes", done: metaAlguna },
    { txt: "Clasifica las 10 prácticas como éticas o no", done: juicioDone },
    { txt: "Empareja los 6 conceptos con su definición", done: conceptosDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "juicio" ? resetJuicio : modo === "conceptos" ? resetConceptos : modo === "glosario" ? resetGlosario : resetSim;

  const lectura =
    modo === "estudio"
      ? publicado
        ? `Publicado: ${final.vistasFinal} vistas (simulación), confianza ${final.confianzaFinal}`
        : `${vivo.hechos}/${PASOS.length} decisiones · riesgo ${vivo.riesgo}`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "estudio" && (
        <Estudio
          accent={accent}
          rgba={color.rgba}
          elec={elec}
          vivo={vivo}
          final={final}
          publicado={publicado}
          anterior={anterior}
          onElegir={elegir}
          onPublicar={publicarVideo}
          onOtra={otraVersion}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={ETICA_PRODUCCION_DIGITAL_HUECOS}
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

      {modo === "juicio" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada práctica a su columna</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: juicioDone ? OK : T.text3 }}>
                {Object.keys(ubicJuicio).length}/{PRACTICAS.length}
              </span>
            </div>
            {juicioLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PRACTICAS.length} prácticas!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {juicioLibres.map((p) => (
                  <button key={p.id} className="epd-chip" data-sel={selJuicio === p.id} onClick={() => setSelJuicio((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <BinsJuicio selJuicio={selJuicio} shakeJuicio={shakeJuicio} ubicJuicio={ubicJuicio} onMatch={intentarJuicio} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "conceptos" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empConc).length}/{CONCEPTOS.length}
              </span>
            </div>
            {concLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los 6 conceptos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {concLibres.map((c) => (
                  <button key={c.id} className="epd-chip" data-sel={selConc === c.id} onClick={() => setSelConc((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                    <i className="fa-solid fa-lightbulb" style={{ fontSize: 14, color: T.text3 }} />
                    {c.concepto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <RowsConceptos selConc={selConc} shakeConc={shakeConc} empConc={empConc} onMatch={intentarConc} dropProps={dropProps} />
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
            persistMejor(juicioDone, conceptosDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    estudio: "El atajo da más vistas al subir, pero mira qué pasa DESPUÉS de publicar. Prueba una versión con atajos y otra responsable, y compara.",
    juicio: "Pregúntate antes de publicar: ¿es verdadero? ¿respeta la privacidad? ¿reconozco la autoría?",
    conceptos: "Los cuatro principios (veracidad, privacidad, no discriminación y transparencia) guían toda producción digital responsable.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "estudio" ? "Reiniciar el estudio" : "Reiniciar este modo"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Cuaderno",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Indicadores del video (simulación)" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <Dato label="Vistas" value={String(publicado ? final.vistasFinal : vivo.vistas)} col={accent} />
                  <Dato label="Confianza" value={String(publicado ? final.confianzaFinal : vivo.confianza)} col={OK} />
                  <Dato label="Riesgo" value={String(vivo.riesgo)} col={vivo.riesgo > 25 ? NO : vivo.riesgo > 8 ? AMBAR : OK} />
                  <Dato label="Decisiones responsables" value={`${buenasDe(elec)}/${PASOS.length}`} />
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "¡Produces contenido digital con ética!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={ETICA_PRODUCCION_DIGITAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Conceptos de la ética de la creación" icono="fa-lightbulb">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CONCEPTOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.concepto}.</strong> {c.definicion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_EPD}</div>
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
  @keyframes epdShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes epdPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .epd-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
  .epd-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .epd-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .epd-chip:active { cursor:grabbing; }
  .epd-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .epd-row[data-shake="true"] { animation:epdShake .4s; border-color:${NO}; }
  .epd-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .epd-slot { flex-shrink:0; min-width:150px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .epd-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .epd-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
  .epd-bin[data-shake="true"] { animation:epdShake .4s; border-color:${NO}; }
  .epd-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .epd-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .epd-q:disabled{ cursor:default; }
  .epd-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .epd-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .epd-btn:disabled { opacity:.45; cursor:not-allowed; }
  .epd-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .epd-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .epd-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:11px; }
  .epd-opc { position:relative; display:flex; flex-direction:column; gap:7px; text-align:left; padding:13px 14px; border-radius:14px; min-width:0;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.45; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; }
  .epd-opc:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .epd-opc[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .epd-opc[data-ok="true"] { border-color:${OK}88; background:${OK}14; }
  .epd-opc[data-mal="true"] { border-color:${NO}88; background:${NO}12; }
  .epd-opc:disabled { cursor:default; }
  .epd-paso { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 12px; border-radius:10px; font-size:14px; font-weight:800;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; }
  .epd-paso[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${rgba},0.16); }
  .epd-paso[data-hecho="true"] i.epd-ck { color:${OK}; }
  .epd-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .epd-barra > i { display:block; height:100%; border-radius:7px; transition:width .8s cubic-bezier(.2,.8,.2,1); }
  .epd-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  @media (prefers-reduced-motion: reduce){
    .epd-row[data-shake="true"], .epd-bin[data-shake="true"] { animation:none; }
    .epd-opc, .epd-opc:hover:not(:disabled) { transform:none; transition:none; }
    .epd-barra > i { transition:none; }
  }

  /* Identidad del tablero */
  .epd-bin, .epd-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .epd-bin:nth-of-type(6n+1), .epd-row:nth-of-type(6n+1) { --tono:188; }
  .epd-bin:nth-of-type(6n+2), .epd-row:nth-of-type(6n+2) { --tono:262; }
  .epd-bin:nth-of-type(6n+3), .epd-row:nth-of-type(6n+3) { --tono:44; }
  .epd-bin:nth-of-type(6n+4), .epd-row:nth-of-type(6n+4) { --tono:152; }
  .epd-bin:nth-of-type(6n+5), .epd-row:nth-of-type(6n+5) { --tono:330; }
  .epd-bin:nth-of-type(6n+6), .epd-row:nth-of-type(6n+6) { --tono:18; }
  .epd-bin::before, .epd-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .epd-bin[data-done="true"], .epd-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .epd-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .epd-chip:hover { transform:translateY(-2px); }
  .epd-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .epd-chip, .epd-chip:hover, .epd-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «Estudio Lumbre»
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto con respaldo: si el archivo aún no existe, queda el degradado y el ícono. */
function Foto({ clave, icono, rgba, alto = 120 }: { clave: string; icono: string; rgba: string; alto?: number }) {
  const [falla, setFalla] = useState(false);
  return (
    <span
      aria-hidden
      style={{ position: "relative", display: "block", height: alto, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg, rgba(${rgba},0.38), rgba(8,19,31,0.92))` }}
    >
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: "rgba(255,255,255,0.35)" }}>
        <i className={`fa-solid ${icono}`} />
      </span>
      {!falla && (
        <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </span>
  );
}

function Barra({ etiqueta, icono, valor, texto, max, col }: { etiqueta: string; icono: string; valor: number; texto: string; max: number; col: string }) {
  const frac = Math.max(0, Math.min(1, valor / max));
  return (
    <div style={{ display: "grid", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, fontWeight: 800, color: T.text }}>
        <span>
          <i className={`fa-solid ${icono}`} aria-hidden style={{ color: col, marginRight: 7 }} />
          {etiqueta}
        </span>
        <span style={{ color: col, fontVariantNumeric: "tabular-nums" }}>{texto}</span>
      </div>
      <div className="epd-barra" role="img" aria-label={`${etiqueta}: ${texto}`}>
        <i style={{ width: `${frac * 100}%`, background: col }} />
      </div>
    </div>
  );
}

function Estudio({
  accent,
  rgba,
  elec,
  vivo,
  final,
  publicado,
  anterior,
  onElegir,
  onPublicar,
  onOtra,
}: {
  accent: string;
  rgba: string;
  elec: Elecciones;
  vivo: Resultado;
  final: Resultado;
  publicado: boolean;
  anterior: Resultado | null;
  onElegir: (paso: PasoId, opcion: string) => void;
  onPublicar: () => void;
  onOtra: () => void;
}) {
  const primeraSinElegir = PASOS.findIndex((p) => !elec[p.id]);
  const [sel, setSel] = useState(0);
  const idx = Math.min(sel, PASOS.length - 1);
  const paso: Paso = PASOS[idx]!;
  const elegida = opcionDe(paso.id, elec[paso.id]);
  const todos = primeraSinElegir === -1;
  const r = publicado ? final : vivo;
  const colRiesgo = vivo.riesgo > 25 ? NO : vivo.riesgo > 8 ? AMBAR : OK;

  const elegirYAvanzar = (opcion: string) => {
    onElegir(paso.id, opcion);
    // La retroalimentación se lee en la misma pantalla; el avance es manual.
  };

  return (
    <>
      {/* ── La vista previa de la publicación ─────────────────────────── */}
      <div className="epd-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Colectivo Lumbre · campaña «Cuidemos el agua»</Eyebrow>
          <span className="epd-tag">
            <i className="fa-solid fa-flask" aria-hidden /> Simulación: cifras ficticias
          </span>
        </div>
        <div className="epd-grid" style={{ alignItems: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Foto clave="estudio-grabacion" icono="fa-clapperboard" rgba={rgba} alto={150} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PASOS.map((p) => {
                const o = opcionDe(p.id, elec[p.id]);
                return (
                  <span
                    key={p.id}
                    className="epd-tag"
                    style={publicado && o ? { borderColor: o.buena ? `${OK}88` : `${NO}88`, color: "#fff" } : undefined}
                  >
                    <i className={`fa-solid ${o ? o.icono : p.icono}`} aria-hidden style={{ opacity: o ? 1 : 0.4 }} />
                    {o ? o.vista : `${p.titulo}: por decidir`}
                  </span>
                );
              })}
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <Barra etiqueta={publicado ? "Vistas tras publicar" : "Vistas"} icono="fa-eye" valor={r.vistasFinal} max={VISTAS_MAX} texto={String(r.vistasFinal)} col={accent} />
            <Barra etiqueta="Confianza" icono="fa-handshake" valor={r.confianzaFinal} max={100} texto={String(r.confianzaFinal)} col={OK} />
            <Barra etiqueta="Riesgo legal y ético" icono="fa-triangle-exclamation" valor={vivo.riesgo} max={100} texto={String(vivo.riesgo)} col={colRiesgo} />
          </div>
        </div>
      </div>

      {/* ── Resultado tras publicar ───────────────────────────────────── */}
      {publicado ? (
        <div className="epd-panel" data-done="true">
          <Eyebrow>Después de publicar</Eyebrow>
          {final.incidentes.length === 0 ? (
            <div style={{ fontSize: 15, color: OK, fontWeight: 800, display: "flex", gap: 10, alignItems: "center" }}>
              <i className="fa-solid fa-circle-check" aria-hidden /> Sin quejas ni bajas. El video se mantiene y la gente lo comparte con confianza.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 9 }}>
              {final.incidentes.map((i) => (
                <div key={i.id} style={{ display: "flex", gap: 11, padding: "11px 13px", borderRadius: 12, border: `1px solid ${NO}66`, background: `${NO}12`, fontSize: 14, lineHeight: 1.45 }}>
                  <i className={`fa-solid ${i.icono}`} aria-hidden style={{ color: NO, marginTop: 3 }} />
                  <span>
                    <strong style={{ color: "#fff" }}>{i.titulo}.</strong> <span style={{ color: T.text3 }}>{i.quien}.</span> {i.texto}{" "}
                    <strong style={{ color: NO }}>
                      −{Math.round(i.perdida * 100)} % de las vistas, confianza {i.confianza}.
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Antes de los incidentes sumaba <strong style={{ color: "#fff" }}>{final.vistas}</strong> vistas; se quedó en <strong style={{ color: "#fff" }}>{final.vistasFinal}</strong>.
            {anterior && (
              <>
                {" "}
                Tu versión anterior terminó con <strong style={{ color: "#fff" }}>{anterior.vistasFinal}</strong> vistas y confianza <strong style={{ color: "#fff" }}>{anterior.confianzaFinal}</strong>.
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="epd-btn epd-btn-main" onClick={onOtra}>
              <i className="fa-solid fa-clapperboard" aria-hidden /> Producir otra versión
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Pasos ─────────────────────────────────────────────────── */}
          <div className="epd-panel">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="tablist" aria-label="Pasos de la producción">
              {PASOS.map((p, i) => (
                <button key={p.id} type="button" role="tab" aria-selected={i === idx} className="epd-paso" data-on={i === idx} data-hecho={!!elec[p.id]} onClick={() => setSel(i)}>
                  <i className={`fa-solid ${elec[p.id] ? "fa-circle-check" : p.icono} epd-ck`} aria-hidden />
                  {p.titulo}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <Foto clave={paso.foto} icono={paso.icono} rgba={rgba} alto={110} />
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>
                {idx + 1}. {paso.pregunta}
              </div>
            </div>
            <div className="epd-grid">
              {paso.opciones.map((o) => (
                <button key={o.id} type="button" className="epd-opc" data-sel={elegida?.id === o.id} onClick={() => elegirYAvanzar(o.id)}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                    <i className={`fa-solid ${o.icono}`} aria-hidden style={{ color: accent }} />
                    {o.titulo}
                  </span>
                  <span style={{ color: T.text2 }}>{o.detalle}</span>
                </button>
              ))}
            </div>
            {elegida && (
              <div
                role="status"
                style={{ display: "flex", gap: 11, padding: "11px 13px", borderRadius: 12, fontSize: 14, lineHeight: 1.5, border: `1px solid ${elegida.buena ? OK : AMBAR}66`, background: `${elegida.buena ? OK : AMBAR}12` }}
              >
                <i className={`fa-solid ${elegida.buena ? "fa-circle-check" : "fa-circle-exclamation"}`} aria-hidden style={{ color: elegida.buena ? OK : AMBAR, marginTop: 3 }} />
                <span>
                  <strong style={{ color: "#fff" }}>
                    {elegida.vistas >= 0 ? "+" : ""}
                    {elegida.vistas} vistas · confianza {elegida.confianza >= 0 ? "+" : ""}
                    {elegida.confianza} · riesgo +{elegida.riesgo}.
                  </strong>{" "}
                  {elegida.porque}
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {idx < PASOS.length - 1 && (
                <button type="button" className="epd-btn" onClick={() => setSel(idx + 1)}>
                  Siguiente paso <i className="fa-solid fa-arrow-right" aria-hidden />
                </button>
              )}
              <button type="button" className="epd-btn epd-btn-main" disabled={!todos} onClick={onPublicar}>
                <i className="fa-solid fa-paper-plane" aria-hidden /> Publicar el video
              </button>
              {!todos && <span style={{ fontSize: 14, color: T.text3 }}>Decide los {PASOS.length} pasos para publicar.</span>}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsJuicio({
  selJuicio,
  shakeJuicio,
  ubicJuicio,
  onMatch,
  dropProps,
}: {
  selJuicio: string | null;
  shakeJuicio: Juicio | null;
  ubicJuicio: Record<string, Juicio>;
  onMatch: (practicaId: string, bin: Juicio) => void;
  dropProps: DropFactory;
}) {
  const bins: Juicio[] = ["etica", "noetica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = JUICIO_INFO[bin];
        const dentro = PRACTICAS.filter((p) => ubicJuicio[p.id] === bin);
        return (
          <div
            key={bin}
            className="epd-bin"
            data-shake={shakeJuicio === bin}
            onClick={() => selJuicio && onMatch(selJuicio, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={bin === "etica" ? OK : NO} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí&hellip;</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "epdPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                    {p.texto}
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

function RowsConceptos({
  selConc,
  shakeConc,
  empConc,
  onMatch,
  dropProps,
}: {
  selConc: string | null;
  shakeConc: string | null;
  empConc: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CONCEPTOS.map((c) => {
        const done = empConc[c.id];
        return (
          <div
            key={c.id}
            className="epd-row"
            data-shake={shakeConc === c.id}
            data-done={done}
            onClick={() => !done && selConc && onMatch(selConc, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="epd-slot" data-armed={!done && !!selConc} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "epdPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-lightbulb" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
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
        Cinco afirmaciones sobre la creatividad y la &eacute;tica en la producci&oacute;n digital. Decide si son verdaderas o falsas y pulsa &laquo;Comprobar&raquo;.
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="epd-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="epd-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="epd-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>&middot; revisa las marcadas e int&eacute;ntalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
