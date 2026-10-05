"use client";

/**
 * Laboratorio — Figuras retóricas: analiza fragmentos de poesía
 * Práctica experimental para LC-III-P05-A1 (Lengua y Comunicación III).
 *
 * El alumno ya no solo empareja nombres: trabaja en un ESTUDIO DE CARTELES.
 * Recibe el eslogan sencillo de una campaña ficticia y lo reescribe eligiendo
 * una de cinco versiones (cada una usa una figura retórica distinta, sin
 * decir cuál). El cartel cambia al instante, un medidor de «impacto» dice
 * cuánto le llega al público al que va dirigido, y una perilla de intensidad
 * mueve emoción contra claridad. Para publicar tiene que NOMBRAR la figura que
 * usó; la retroalimentación explica qué efecto produce y cuál usó de verdad.
 *
 * Modos: Estudio de carteles (simulador) · tres modos de repaso de arrastre
 * (definición, verso, figura/forma; verbatim del glosario A5, la lectura A1 y
 * el quiz A2) · Completa el texto. El cuestionario V/F (A4) vive en «Reto» y la
 * teoría en «Teoría».
 *
 * Marcas, campañas y cifras de impacto son FICTICIAS («simulación»).
 * DOM puro (sin three.js), accesible con ratón, teclado y táctil.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { FIGURAS_RETORICAS_HUECOS } from "./figuras-retoricas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { FIGURAS_RETORICAS_FICHA } from "./figuras-retoricas-ficha";
import {
  PARES_DEF,
  PARES_VERSO,
  RECURSOS,
  TIPO_INFO,
  QUIZ,
  DATO_FIGURAS,
  type TipoRecurso,
} from "./figuras-retoricas-data";
import {
  CARTELES,
  FIGURAS_SIM,
  INTENSIDADES,
  ORDEN_FIGURAS,
  medir,
  puntuar,
  retroCartel,
  type Cartel,
  type FiguraId,
  type Medicion,
  type ResultadoCartel,
} from "./figuras-retoricas-sim";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-figuras-retoricas-reto";
const RUTA_FOTOS = "/media/labs-sim/figuras-retoricas";

type Modo = "estudio" | "definiciones" | "versos" | "tipos" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "estudio", label: "Estudio de carteles", icono: "fa-bullhorn" },
  { id: "definiciones", label: "Empareja figura y definición", icono: "fa-book-open" },
  { id: "versos", label: "Empareja figura y verso", icono: "fa-feather-pointed" },
  { id: "tipos", label: "¿Figura retórica o forma poética?", icono: "fa-layer-group" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const LETRAS = ["A", "B", "C", "D", "E"];

/** Orden en que se muestran las cinco versiones: cambia de un cartel a otro. */
const ordenVista = (idx: number): FiguraId[] => ORDEN_FIGURAS.map((_, i) => ORDEN_FIGURAS[(i * 2 + idx) % ORDEN_FIGURAS.length]!);

export function LabFigurasRetoricas({ color }: PracticaLabProps) {
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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── simulador: estudio de carteles ─────────────────────────────────────
  const [cartelId, setCartelId] = useState(CARTELES[0]!.id);
  const [elegida, setElegida] = useState<Record<string, FiguraId | undefined>>({});
  const [intensidad, setIntensidad] = useState<Record<string, number>>({});
  const [nombrada, setNombrada] = useState<Record<string, FiguraId | undefined>>({});
  const [probadas, setProbadas] = useState<Record<string, boolean>>({});
  const [publicados, setPublicados] = useState<Record<string, ResultadoCartel | undefined>>({});
  // Logro que no se pierde aunque republiques con otra versión.
  const [logroImpacto, setLogroImpacto] = useState(false);

  const cartelIdx = Math.max(0, CARTELES.findIndex((c) => c.id === cartelId));
  const cartel: Cartel = CARTELES[cartelIdx]!;
  const figActual = elegida[cartel.id];
  const inten = intensidad[cartel.id] ?? 2;
  const medicion: Medicion | null = figActual ? medir(cartel, figActual, inten) : null;
  const resCartel = publicados[cartel.id];
  const nombreElegido = nombrada[cartel.id];
  const vista = ordenVista(cartelIdx);

  const elegirVersion = (f: FiguraId) => {
    setElegida((e) => ({ ...e, [cartel.id]: f }));
    setProbadas((p) => ({ ...p, [`${cartel.id}:${f}`]: true }));
    sfxBlip();
  };

  const publicar = () => {
    if (!figActual || !nombreElegido) return;
    const m = medir(cartel, figActual, inten);
    const nombreOk = nombreElegido === figActual;
    const impactoOk = m.impacto >= cartel.meta;
    const r: ResultadoCartel = { fig: figActual, nombrada: nombreElegido, intensidad: inten, nombreOk, impacto: m.impacto, impactoOk, puntos: puntuar(nombreOk, impactoOk) };
    setPublicados((p) => ({ ...p, [cartel.id]: r }));
    if (impactoOk) setLogroImpacto(true);
    if (nombreOk) sfxPlace();
    else sfxNo();
    if (nombreOk && impactoOk) sfxOk();
  };

  const resetEstudio = () => {
    setElegida({});
    setIntensidad({});
    setNombrada({});
    setProbadas({});
    setPublicados({});
    setLogroImpacto(false);
    setCartelId(CARTELES[0]!.id);
    partida.reiniciar();
  };

  const probadasN = Object.keys(probadas).length;
  const publicadosN = Object.values(publicados).filter(Boolean).length;
  const mejorImpacto = Object.values(publicados).reduce((n, r) => Math.max(n, r?.impacto ?? 0), 0);
  const nombresOk = Object.values(publicados).filter((r) => r?.nombreOk).length;

  // ── modo definiciones (empareja figura → definición) ───────────────────
  const [empDef, setEmpDef] = useState<Record<string, boolean>>({});
  const [selDef, setSelDef] = useState<string | null>(null);
  const [shakeDef, setShakeDef] = useState<string | null>(null);
  const defLibres = PARES_DEF.filter((p) => !empDef[p.id]).slice().sort((a, b) => a.figura.localeCompare(b.figura, "es"));

  const intentarDef = (chipId: string, rowId: string) => {
    if (empDef[rowId]) return;
    if (chipId === rowId) {
      setEmpDef((e) => ({ ...e, [rowId]: true }));
      setSelDef(null);
      sfxPlace();
      if (Object.keys(empDef).length + 1 >= PARES_DEF.length) {
        sfxOk();
        persistMejor(true, versosDone, tiposDone);
      }
    } else {
      setShakeDef(rowId);
      sfxNo();
      window.setTimeout(() => setShakeDef(null), 420);
    }
  };
  const resetDefiniciones = () => {
    setEmpDef({});
    setSelDef(null);
  };

  // ── modo versos (empareja figura → ejemplo en verso) ───────────────────
  const [empVerso, setEmpVerso] = useState<Record<string, boolean>>({});
  const [selVerso, setSelVerso] = useState<string | null>(null);
  const [shakeVerso, setShakeVerso] = useState<string | null>(null);
  const versoLibres = PARES_VERSO.filter((p) => !empVerso[p.id]).slice().sort((a, b) => a.figura.localeCompare(b.figura, "es"));

  const intentarVerso = (chipId: string, rowId: string) => {
    if (empVerso[rowId]) return;
    if (chipId === rowId) {
      setEmpVerso((e) => ({ ...e, [rowId]: true }));
      setSelVerso(null);
      sfxPlace();
      if (Object.keys(empVerso).length + 1 >= PARES_VERSO.length) {
        sfxOk();
        persistMejor(definicionesDone, true, tiposDone);
      }
    } else {
      setShakeVerso(rowId);
      sfxNo();
      window.setTimeout(() => setShakeVerso(null), 420);
    }
  };
  const resetVersos = () => {
    setEmpVerso({});
    setSelVerso(null);
  };

  // ── modo tipos (clasifica figura / forma) ──────────────────────────────
  const [ubicTipo, setUbicTipo] = useState<Record<string, TipoRecurso>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoRecurso | null>(null);
  const tipoLibres = RECURSOS.filter((r) => !ubicTipo[r.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTipo = (recursoId: string, bin: TipoRecurso) => {
    if (ubicTipo[recursoId]) return;
    const r = RECURSOS.find((x) => x.id === recursoId);
    if (r && r.tipo === bin) {
      setUbicTipo((e) => ({ ...e, [recursoId]: bin }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(ubicTipo).length + 1 >= RECURSOS.length) {
        sfxOk();
        persistMejor(definicionesDone, versosDone, true);
      }
    } else {
      setShakeTipo(bin);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetTipos = () => {
    setUbicTipo({});
    setSelTipo(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const definicionesDone = Object.keys(empDef).length >= PARES_DEF.length;
  const versosDone = Object.keys(empVerso).length >= PARES_VERSO.length;
  const tiposDone = Object.keys(ubicTipo).length >= RECURSOS.length;
  const modosHechos = (definicionesDone ? 1 : 0) + (versosDone ? 1 : 0) + (tiposDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Prueba 3 versiones distintas de un eslogan en el estudio", done: probadasN >= 3 },
    { txt: "Publica un cartel cuyo impacto llegue a su público", done: logroImpacto },
    { txt: "Empareja las 6 figuras con su definición", done: definicionesDone },
    { txt: "Empareja las 6 figuras con su verso", done: versosDone },
    { txt: "Clasifica los 6 recursos por su tipo", done: tiposDone },
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
    modo === "estudio" ? resetEstudio : modo === "texto" ? resetTexto : modo === "definiciones" ? resetDefiniciones : modo === "versos" ? resetVersos : resetTipos;

  const lectura =
    modo === "estudio" ? (
      medicion ? (
        <>Impacto {medicion.impacto} de {cartel.meta} · {cartel.audiencia}</>
      ) : (
        <>Elige una versión del eslogan y mira cómo cambia el cartel</>
      )
    ) : modo === "definiciones" ? (
      <>Figuras emparejadas: {Object.keys(empDef).length}/{PARES_DEF.length}</>
    ) : modo === "versos" ? (
      <>Versos emparejados: {Object.keys(empVerso).length}/{PARES_VERSO.length}</>
    ) : modo === "tipos" ? (
      <>Recursos clasificados: {Object.keys(ubicTipo).length}/{RECURSOS.length}</>
    ) : (
      <>Repaso de las figuras en un párrafo</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

  const retro = resCartel && figActual ? retroCartel(cartel, resCartel, medir(cartel, resCartel.fig, resCartel.intensidad)) : null;
  // La retro describe lo publicado; si luego cambias la versión, ya no es lo que ves.
  const retroVigente = !!resCartel && resCartel.fig === figActual && resCartel.nombrada === nombreElegido && resCartel.intensidad === inten;

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

          {/* ── MODO — estudio de carteles (simulador) ─────────────────── */}
          {modo === "estudio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <div className="fr-campanas" role="tablist" aria-label="Campañas">
                {CARTELES.map((c) => {
                  const r = publicados[c.id];
                  return (
                    <button key={c.id} type="button" role="tab" aria-selected={c.id === cartel.id} className="fr-camp" data-sel={c.id === cartel.id} onClick={() => setCartelId(c.id)}>
                      <i className={`fa-solid ${c.icono}`} aria-hidden />
                      <span>{c.marca.split(" (")[0]}</span>
                      {r && <i className={`fa-solid ${r.impactoOk ? "fa-circle-check" : "fa-circle-half-stroke"}`} style={{ color: r.impactoOk ? OK : AVISO }} aria-hidden />}
                    </button>
                  );
                })}
              </div>

              <div className="fr-brief">
                <span><i className="fa-solid fa-users" aria-hidden /> Público: <strong>{cartel.audiencia}</strong></span>
                <span><i className="fa-solid fa-bullseye" aria-hidden /> Meta: <strong>{cartel.objetivo}</strong></span>
              </div>

              <Cartelera cartel={cartel} texto={figActual ? cartel.versiones[figActual] : cartel.base} intensidad={inten} activo={!!figActual} />

              <div className="fr-medidores">
                <Medidor etiqueta="Impacto en el público (simulación)" valor={medicion?.impacto ?? 0} col={medicion ? (medicion.impacto >= cartel.meta ? OK : AVISO) : T.text3} meta={cartel.meta} grande />
                <Medidor etiqueta="Emoción" valor={medicion?.emocion ?? 0} col="#FF7AA8" />
                <Medidor etiqueta="Claridad" valor={medicion?.claridad ?? 0} col="#5BC8FF" />
                <Medidor etiqueta="Recuerdo" valor={medicion?.recuerdo ?? 0} col="#B79CFF" />
              </div>

              <div>
                {instruccion("Reescribe el eslogan: elige una versión", `${probadasN} probadas`)}
                <div className="fr-versiones">
                  {vista.map((f, i) => (
                    <button key={f} type="button" className="fr-version" data-sel={figActual === f} onClick={() => elegirVersion(f)}>
                      <b>{LETRAS[i]}</b>
                      <span>{cartel.versiones[f]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Deslizador
                label="Intensidad de la figura"
                icon="fa-sliders"
                colr={accent}
                valor={INTENSIDADES[inten - 1]!}
                min={1}
                max={3}
                step={1}
                value={inten}
                onChange={(v) => setIntensidad((s) => ({ ...s, [cartel.id]: v }))}
                hintL="Sutil: más claro"
                hintR="Fuerte: más emoción"
              />

              <div>
                {instruccion("¿Qué figura retórica usaste?", nombreElegido ? "elegida" : undefined, !!nombreElegido)}
                <div className="fr-nombres">
                  {ORDEN_FIGURAS.map((f) => (
                    <button key={f} type="button" className="fr-nombre" data-sel={nombreElegido === f} onClick={() => setNombrada((n) => ({ ...n, [cartel.id]: f }))}>
                      <i className={`fa-solid ${FIGURAS_SIM[f].icono}`} aria-hidden /> {FIGURAS_SIM[f].nombre}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="fr-btn"
                  style={{ background: accent, color: "#04121f", border: "none", marginTop: 12, opacity: figActual && nombreElegido ? 1 : 0.5 }}
                  disabled={!figActual || !nombreElegido}
                  onClick={publicar}
                >
                  <i className="fa-solid fa-bullhorn" aria-hidden /> {resCartel ? "Publicar de nuevo" : "Publicar cartel"}
                </button>
                {!figActual && <div className="fr-nota">Primero elige una versión del eslogan.</div>}
              </div>

              {resCartel && retro && retroVigente && (
                <div className="fr-retro" data-ok={resCartel.nombreOk && resCartel.impactoOk}>
                  <strong>
                    <i className={`fa-solid ${resCartel.nombreOk && resCartel.impactoOk ? "fa-circle-check" : "fa-circle-half-stroke"}`} aria-hidden />{" "}
                    {resCartel.puntos}/2 puntos · {FIGURAS_SIM[resCartel.fig].nombre}
                  </strong>
                  {retro.map((l, i) => (
                    <span key={i}>{l}</span>
                  ))}
                  {publicadosN < CARTELES.length && (
                    <button
                      type="button"
                      className="fr-btn"
                      onClick={() => {
                        const sig = CARTELES.find((c) => !publicados[c.id]);
                        if (sig) setCartelId(sig.id);
                      }}
                    >
                      <i className="fa-solid fa-arrow-right" aria-hidden /> Siguiente campaña
                    </button>
                  )}
                </div>
              )}
              {resCartel && !retroVigente && (
                <div className="fr-nota">Cambiaste la versión: vuelve a publicar para ver qué efecto tuvo.</div>
              )}
            </div>
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={FIGURAS_RETORICAS_HUECOS}
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

          {/* MODO — definiciones */}
          {modo === "definiciones" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada figura a su definición", `${Object.keys(empDef).length}/${PARES_DEF.length}`, definicionesDone)}
                {defLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_DEF.length} figuras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {defLibres.map((p) => (
                      <button key={p.id} className="fr-chip" data-sel={selDef === p.id} onClick={() => setSelDef((v) => (v === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 14, color: T.text3 }} />
                        {p.figura}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsDefiniciones selDef={selDef} shakeDef={shakeDef} empDef={empDef} onMatch={intentarDef} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — versos */}
          {modo === "versos" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada figura al verso que la ilustra", `${Object.keys(empVerso).length}/${PARES_VERSO.length}`, versosDone)}
                {versoLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_VERSO.length} figuras con su verso!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {versoLibres.map((p) => (
                      <button key={p.id} className="fr-chip" data-sel={selVerso === p.id} onClick={() => setSelVerso((v) => (v === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-feather-pointed" style={{ fontSize: 14, color: T.text3 }} />
                        {p.figura}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsVersos selVerso={selVerso} shakeVerso={shakeVerso} empVerso={empVerso} onMatch={intentarVerso} dropProps={dropProps} />
            </Mesa>
          )}

          {/* MODO — tipos */}
          {modo === "tipos" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada recurso a su tipo", `${Object.keys(ubicTipo).length}/${RECURSOS.length}`, tiposDone)}
                {tipoLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {RECURSOS.length} recursos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tipoLibres.map((r) => (
                      <button key={r.id} className="fr-chip" data-sel={selTipo === r.id} onClick={() => setSelTipo((v) => (v === r.id ? null : r.id))} {...dragProps(r.id)}>
                        {r.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsTipos selTipo={selTipo} shakeTipo={shakeTipo} ubicTipo={ubicTipo} onMatch={intentarTipo} dropProps={dropProps} />
            </Mesa>
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
                  <Dato label="Versiones probadas" value={`${probadasN}`} />
                  <Dato label="Carteles publicados" value={`${publicadosN}/${CARTELES.length}`} col={publicadosN >= CARTELES.length ? OK : undefined} />
                  <Dato label="Figuras bien nombradas" value={`${nombresOk}/${CARTELES.length}`} />
                  <Dato label="Mejor impacto (simulación)" value={`${mejorImpacto}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Lees poesía como un crítico literario!" : "Termina los tres modos de repaso para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Qué hace cada figura en un cartel" icono="fa-lightbulb">
                {ORDEN_FIGURAS.map((f) => (
                  <p key={f} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{FIGURAS_SIM[f].nombre}.</strong> {FIGURAS_SIM[f].efecto.charAt(0).toUpperCase() + FIGURAS_SIM[f].efecto.slice(1)}.
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Pista del modo" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "estudio" && <>Fíjate en lo que pesa más para cada público: a las familias les importa la <strong style={{ color: T.text }}>claridad</strong>; a los jóvenes, la <strong style={{ color: T.text }}>emoción</strong> y que se <strong style={{ color: T.text }}>recuerde</strong>.</>}
                  {modo === "definiciones" && <>La <strong style={{ color: T.text }}>metáfora</strong> identifica sin «como»; la <strong style={{ color: T.text }}>prosopopeya</strong> humaniza; la <strong style={{ color: T.text }}>hipérbole</strong> exagera.</>}
                  {modo === "versos" && <>Lee el verso en voz alta: el sonido y la imagen revelan la figura. Pregúntate qué transforma cada verso del significado ordinario.</>}
                  {modo === "tipos" && <>Las <strong style={{ color: T.text }}>figuras retóricas</strong> transforman el significado de las palabras; la <strong style={{ color: T.text }}>forma poética</strong> (rima y métrica) organiza el sonido y la medida del verso.</>}
                  {modo === "texto" && <>Completa cada hueco con la figura que corresponde a la situación que describe el párrafo.</>}
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
              <Bloque titulo="Qué es una figura retórica" icono="fa-wand-magic-sparkles">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_FIGURAS}</p>
              </Bloque>
              <Bloque titulo="Los dos tipos de recurso" icono="fa-layer-group">
                {(Object.keys(TIPO_INFO) as TipoRecurso[]).map((t) => (
                  <p key={t} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{TIPO_INFO[t].titulo}.</strong> {TIPO_INFO[t].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Definiciones" icono="fa-book-open">
                {PARES_DEF.map((p) => (
                  <p key={p.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.figura}.</strong> {p.definicion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ejemplos en verso" icono="fa-feather-pointed">
                {PARES_VERSO.map((p) => (
                  <p key={p.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.figura}.</strong> <em>{p.verso}</em> {p.nota}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FIGURAS_RETORICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas del estudio de carteles
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Cartel de la campaña: fondo de color + ilustración (si ya existe) + eslogan. */
function Cartelera({ cartel, texto, intensidad, activo }: { cartel: Cartel; texto: string; intensidad: number; activo: boolean }) {
  const [conFoto, setConFoto] = useState(true);
  const tam = 18 + intensidad * 4;
  return (
    <div className="fr-cartel" style={{ background: `linear-gradient(135deg, ${cartel.colores[0]}, ${cartel.colores[1]})` }}>
      <i className={`fa-solid ${cartel.icono} fr-cartel-ico`} aria-hidden />
      {conFoto && (
        <img className="fr-cartel-foto" src={`${RUTA_FOTOS}/${cartel.foto}.webp`} alt="" loading="lazy" onError={() => setConFoto(false)} />
      )}
      <div className="fr-cartel-vela" />
      <div className="fr-cartel-cuerpo">
        <span className="fr-cartel-marca">{cartel.marca}</span>
        <p className="fr-cartel-texto" data-activo={activo} style={{ fontSize: tam, textShadow: `0 2px ${4 + intensidad * 6}px rgba(0,0,0,${0.35 + intensidad * 0.15})` }}>
          {texto}
        </p>
        {activo && <span className="fr-cartel-antes">Antes: «{cartel.base}»</span>}
      </div>
    </div>
  );
}

/** Barra de medición con marca de meta opcional. */
function Medidor({ etiqueta, valor, col, meta, grande }: { etiqueta: string; valor: number; col: string; meta?: number; grande?: boolean }) {
  return (
    <div className="fr-med" data-grande={!!grande}>
      <span className="fr-med-top">
        <span>{etiqueta}</span>
        <strong style={{ color: col }}>{valor}</strong>
      </span>
      <div className="fr-med-barra" role="meter" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor}>
        <div style={{ width: `${valor}%`, background: col }} />
        {meta !== undefined && <i style={{ left: `${meta}%` }} title={`Meta: ${meta}`} />}
      </div>
      {meta !== undefined && <span className="fr-med-meta">Meta: {meta}</span>}
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes frShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes frPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fr-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .fr-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .fr-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .fr-chip:active { cursor:grabbing; }
  .fr-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .fr-row[data-shake="true"] { animation:frShake .4s; border-color:${NO}; }
  .fr-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .fr-slot { flex-shrink:0; min-width:150px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .fr-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .fr-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:220px; }
  .fr-bin[data-shake="true"] { animation:frShake .4s; border-color:${NO}; }
  .fr-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fr-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fr-q:disabled{ cursor:default; }
  .fr-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .fr-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .fr-btn:disabled { cursor:default; }

  /* Estudio de carteles */
  .fr-campanas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:8px; }
  .fr-camp { cursor:pointer; display:flex; align-items:center; gap:9px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:${T.text2}; font-size:14px; font-weight:800; text-align:left; line-height:1.25; transition:all .14s; }
  .fr-camp span { flex:1; min-width:0; }
  .fr-camp[data-sel="true"] { border-color:${accent}; color:#fff; background:rgba(${rgba},0.18); box-shadow:0 0 14px -6px ${accent}; }
  .fr-brief { display:grid; gap:6px; font-size:14.5px; color:${T.text2}; line-height:1.45; }
  .fr-brief strong { color:#fff; }
  .fr-brief i { color:${accent}; margin-right:6px; }
  .fr-cartel { position:relative; border-radius:18px; overflow:hidden; min-height:190px; display:flex; align-items:flex-end; border:1.5px solid ${T.lineStrong}; }
  .fr-cartel-ico { position:absolute; right:16px; top:14px; font-size:44px; color:rgba(255,255,255,0.35); }
  .fr-cartel-foto { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .fr-cartel-vela { position:absolute; inset:0; background:linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%); }
  .fr-cartel-cuerpo { position:relative; display:flex; flex-direction:column; gap:8px; padding:16px; width:100%; }
  .fr-cartel-marca { font-size:14px; font-weight:800; color:rgba(255,255,255,0.85); letter-spacing:.02em; }
  .fr-cartel-texto { margin:0; color:#fff; font-weight:900; line-height:1.25; overflow-wrap:anywhere; transition:font-size .25s; }
  .fr-cartel-texto[data-activo="false"] { font-weight:600; opacity:.9; }
  .fr-cartel-antes { font-size:14px; color:rgba(255,255,255,0.78); font-style:italic; overflow-wrap:anywhere; }
  .fr-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .fr-med { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:rgba(2,12,28,0.5); min-width:0; }
  .fr-med[data-grande="true"] { grid-column:1 / -1; }
  .fr-med-top { display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:14px; color:${T.text2}; font-weight:700; }
  .fr-med-top strong { font-size:19px; font-weight:900; font-variant-numeric:tabular-nums; font-family:ui-monospace, monospace; }
  .fr-med-barra { position:relative; height:10px; border-radius:6px; background:rgba(255,255,255,0.12); overflow:visible; }
  .fr-med-barra > div { height:100%; border-radius:6px; transition:width .35s, background .35s; }
  .fr-med-barra > i { position:absolute; top:-4px; width:3px; height:18px; border-radius:2px; background:#fff; }
  .fr-med-meta { font-size:14px; color:${T.text3}; }
  .fr-versiones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:10px; margin-top:10px; }
  .fr-version { cursor:pointer; display:flex; gap:10px; align-items:flex-start; padding:12px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:14.5px; font-weight:600; text-align:left; line-height:1.4; transition:all .14s; }
  .fr-version b { flex-shrink:0; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${T.inset}; border:1.5px solid ${T.lineStrong}; font-size:14px; }
  .fr-version span { min-width:0; overflow-wrap:anywhere; }
  .fr-version:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .fr-version[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -6px ${accent}; }
  .fr-nombres { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; margin-top:10px; }
  .fr-nombre { cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; min-height:48px; padding:8px 10px; border-radius:12px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:800; transition:all .14s; }
  .fr-nombre i { color:${accent}; }
  .fr-nombre[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); }
  .fr-nota { margin-top:8px; font-size:14px; color:${T.text3}; line-height:1.45; }
  .fr-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${AVISO}66; background:${AVISO}10; }
  .fr-retro[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
  .fr-retro strong { color:#fff; font-size:15px; }
  .fr-camp:focus-visible, .fr-version:focus-visible, .fr-nombre:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }

  /* Identidad del tablero */
  .fr-bin, .fr-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .fr-bin:nth-of-type(6n+1), .fr-row:nth-of-type(6n+1) { --tono:188; }
  .fr-bin:nth-of-type(6n+2), .fr-row:nth-of-type(6n+2) { --tono:262; }
  .fr-bin:nth-of-type(6n+3), .fr-row:nth-of-type(6n+3) { --tono:44; }
  .fr-bin:nth-of-type(6n+4), .fr-row:nth-of-type(6n+4) { --tono:152; }
  .fr-bin:nth-of-type(6n+5), .fr-row:nth-of-type(6n+5) { --tono:330; }
  .fr-bin:nth-of-type(6n+6), .fr-row:nth-of-type(6n+6) { --tono:18; }
  .fr-bin::before, .fr-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .fr-bin[data-done="true"], .fr-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){
    .fr-row[data-shake="true"], .fr-bin[data-shake="true"] { animation:none; }
    .fr-chip, .fr-chip:hover, .fr-chip[data-sel="true"], .fr-version:hover { transform:none; transition:none; }
    .fr-med-barra > div, .fr-cartel-texto { transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function RowsDefiniciones({
  selDef,
  shakeDef,
  empDef,
  onMatch,
  dropProps,
}: {
  selDef: string | null;
  shakeDef: string | null;
  empDef: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_DEF.map((p) => {
        const done = empDef[p.id];
        return (
          <div
            key={p.id}
            className="fr-row"
            data-shake={shakeDef === p.id}
            data-done={done}
            onClick={() => !done && selDef && onMatch(selDef, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="fr-slot" data-armed={!done && !!selDef} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "frPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  {p.figura}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> figura
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{p.definicion}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsVersos({
  selVerso,
  shakeVerso,
  empVerso,
  onMatch,
  dropProps,
}: {
  selVerso: string | null;
  shakeVerso: string | null;
  empVerso: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_VERSO.map((p) => {
        const done = empVerso[p.id];
        return (
          <div
            key={p.id}
            className="fr-row"
            data-shake={shakeVerso === p.id}
            data-done={done}
            onClick={() => !done && selVerso && onMatch(selVerso, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="fr-slot" data-armed={!done && !!selVerso} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "frPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather-pointed" />
                  {p.figura}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> figura
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontStyle: "italic", color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{p.verso}</div>
              {done && (
                <div style={{ animation: "frPop .25s ease", fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>{p.nota}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsTipos({
  selTipo,
  shakeTipo,
  ubicTipo,
  onMatch,
  dropProps,
}: {
  selTipo: string | null;
  shakeTipo: TipoRecurso | null;
  ubicTipo: Record<string, TipoRecurso>;
  onMatch: (recursoId: string, bin: TipoRecurso) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoRecurso[] = ["figura", "forma"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_INFO[bin];
        const dentro = RECURSOS.filter((r) => ubicTipo[r.id] === bin);
        return (
          <div
            key={bin}
            className="fr-bin"
            data-shake={shakeTipo === bin}
            onClick={() => selTipo && onMatch(selTipo, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((r) => (
                  <span key={r.id} style={{ animation: "frPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {r.texto}
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
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 15, color: T.text }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </strong>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco afirmaciones sobre las figuras retóricas, la rima y la métrica del género lírico. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="fr-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fr-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fr-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
