"use client";

/**
 * Laboratorio — Relaciones de poder e interseccionalidad: clase, género, etnia
 * y edad como categorías de análisis
 * Práctica experimental para CS-II-P04-A4 (Ciencias Sociales II).
 *
 * SIMULADOR de poder. El alumno no clasifica frases: LEE un conflicto. «Valle
 * Sereno» es un municipio FICTICIO (simulación; nada de lo que aparece existe)
 * donde el ayuntamiento quiere entregar el agua a una empresa. Seis modos:
 *  1. «Diagnostica el poder» — sobre el mapa de 7 actores, descubre la fuente
 *     principal de cada uno (autoridad, dinero, redes, saber o relato). Las
 *     fuentes salen de las definiciones del propio lab (Weber, Bourdieu,
 *     hegemonía, clase).
 *  2. «Actúa en el conflicto» — con 6 fichas arma una coalición: cada acción
 *     mueve nodos, aristas y el «balance de poder», y el cabildo resuelve.
 *  3. «¿Clase, género, etnia o edad?» — clasifica los 7 ejemplos (verbatim).
 *  4. «Empareja concepto y definición» — verbatim A1/A2.
 *  5. «Escribe el término» — glosario verbatim (A5).
 *  6. «Completa el texto» — verbatim de la progresión.
 *  + Cuestionario de comprensión (V/F verbatim de A4) en la pestaña Reto.
 *
 * Las consecuencias salen del modelo determinista y comentado de
 * `relaciones-poder-sim.ts`. DOM + SVG/CSS (sin three.js). Contenido curricular
 * VERBATIM de CS-II·P04 en la pestaña Teoría.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { RELACIONES_PODER_HUECOS } from "./relaciones-poder-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RELACIONES_PODER_FICHA } from "./relaciones-poder-ficha";
import {
  EJEMPLOS,
  CATEGORIA_INFO,
  CONCEPTOS,
  PARES,
  QUIZ,
  DATO_PODER,
  type Categoria,
} from "./relaciones-poder-data";
import {
  ACCIONES,
  ACTOR,
  ACTORES,
  ALIANZAS,
  FICHAS,
  FUENTES,
  evaluar,
  gastoDe,
  lecturaDe,
  poderDe,
  resolver,
  type Actor,
  type Estado,
  type Fuente,
} from "./relaciones-poder-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-relaciones-poder-reto";
const RUTA_SIM = "/media/labs-sim/relaciones-poder";

type Modo = "diag" | "sim" | "clasificar" | "conceptos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "diag", label: "1 Diagnostica el poder", icono: "fa-magnifying-glass-chart" },
  { id: "sim", label: "2 Actúa en el conflicto", icono: "fa-scale-balanced" },
  { id: "clasificar", label: "¿Clase, género, etnia o edad?", icono: "fa-layer-group" },
  { id: "conceptos", label: "Empareja concepto y definición", icono: "fa-diagram-project" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PISTA: Record<Modo, string> = {
  diag: "Lee el papel de cada actor y pregunta: ¿de qué depende que consiga lo que quiere? No siempre es de quien «manda» ni de quien tiene más dinero.",
  sim: "Cada ficha tiene un costo y una consecuencia. Mira cómo cambian los nodos, las líneas y el balance antes de ir al cabildo. Lo gratuito también se paga.",
  clasificar: "La interseccionalidad muestra que la posición social no la determina una sola característica, sino la combinación de clase, género, etnia y edad.",
  conceptos: "El poder es imponer la propia voluntad aun contra la resistencia de otros; el capital cultural y el capital social se heredan y reproducen la desigualdad.",
  glosario: "Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
  texto: "Escribe la palabra que falta en cada hueco del texto.",
};

export function LabRelacionesPoder({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("diag");

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

  // ── modo diagnóstico (fuente principal de poder de cada actor) ─────────
  const [diagRes, setDiagRes] = useState<Record<string, Fuente>>({});
  const [diagFallo, setDiagFallo] = useState<Record<string, Fuente | null>>({});
  const [selActor, setSelActor] = useState<string | null>(null);
  const diagDone = Object.keys(diagRes).length >= ACTORES.length;
  const elegirFuente = (actorId: string, f: Fuente) => {
    if (diagRes[actorId]) return;
    if (ACTOR(actorId).dominante === f) {
      setDiagRes((p) => ({ ...p, [actorId]: f }));
      setDiagFallo((p) => ({ ...p, [actorId]: null }));
      sfxPlace();
      if (Object.keys(diagRes).length + 1 >= ACTORES.length) sfxOk();
    } else {
      setDiagFallo((p) => ({ ...p, [actorId]: f }));
      sfxNo();
    }
  };
  const resetDiag = () => {
    setDiagRes({});
    setDiagFallo({});
    setSelActor(null);
  };

  // ── modo simulador (coalición, balance y cabildo) ──────────────────────
  const [accSel, setAccSel] = useState<string[]>([]);
  const [resuelto, setResuelto] = useState(false);
  const est = evaluar(accSel);
  const res = resuelto ? resolver(est) : null;
  const simGana = resuelto && est.balance >= 55;
  const toggleAccion = (id: string) => {
    if (resuelto) return;
    sfxClick();
    setAccSel((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      const a = ACCIONES.find((x) => x.id === id);
      if (!a || gastoDe(s) + a.costo > FICHAS) return s;
      return [...s, id];
    });
  };
  const alCabildo = () => {
    if (resuelto) return;
    const r = resolver(est);
    if (r.tono === "bien") {
      sfxPlace();
      sfxOk();
    } else if (r.tono === "mal") sfxNo();
    else sfxPlace();
    setResuelto(true);
  };
  const resetSim = () => {
    setAccSel([]);
    setResuelto(false);
    setSelActor(null);
  };

  // ── modo clasificar (por categoría de análisis) ────────────────────────
  const [ubicEj, setUbicEj] = useState<Record<string, Categoria>>({});
  const [selEj, setSelEj] = useState<string | null>(null);
  const [shakeEj, setShakeEj] = useState<Categoria | null>(null);
  const ejLibres = EJEMPLOS.filter((e) => !ubicEj[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEj = (ejId: string, bin: Categoria) => {
    if (ubicEj[ejId]) return;
    const e = EJEMPLOS.find((x) => x.id === ejId);
    if (e && e.categoria === bin) {
      setUbicEj((prev) => ({ ...prev, [ejId]: bin }));
      setSelEj(null);
      sfxPlace();
      if (Object.keys(ubicEj).length + 1 >= EJEMPLOS.length) {
        sfxOk();
        persistMejor(true, conceptosDone, glosarioDone);
      }
    } else {
      setShakeEj(bin);
      sfxNo();
      window.setTimeout(() => setShakeEj(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicEj({});
    setSelEj(null);
  };

  // ── modo conceptos (empareja concepto → definición) ────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = CONCEPTOS.filter((c) => !empCon[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((prev) => ({ ...prev, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= CONCEPTOS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeCon(rowId);
      sfxNo();
      window.setTimeout(() => setShakeCon(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpCon({});
    setSelCon(null);
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
  const clasificarDone = Object.keys(ubicEj).length >= EJEMPLOS.length;
  const conceptosDone = Object.keys(empCon).length >= CONCEPTOS.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Descubre la fuente principal de poder de los 7 actores del mapa", done: diagDone },
    { txt: "Reúne una coalición con más del 55 % de balance y llévala al cabildo", done: simGana },
    { txt: "Clasifica los 7 ejemplos por categoría de análisis", done: clasificarDone },
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
  const resetActual =
    modo === "texto" ? resetTexto
    : modo === "clasificar" ? resetClasificar
    : modo === "conceptos" ? resetConceptos
    : modo === "glosario" ? resetGlosario
    : modo === "diag" ? resetDiag
    : resetSim;

  const lectura =
    modo === "sim" ? lecturaDe(est, accSel)
    : modo === "diag" ? `${Object.keys(diagRes).length}/${ACTORES.length} actores analizados`
    : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "diag" && (
        <ModoDiagnostico
          accent={accent}
          sel={selActor}
          onSel={(id) => setSelActor(id)}
          diagRes={diagRes}
          diagFallo={diagFallo}
          onElegir={elegirFuente}
          done={diagDone}
        />
      )}

      {modo === "sim" && (
        <ModoSimulador
          accent={accent}
          est={est}
          sel={selActor}
          onSel={(id) => setSelActor(id)}
          accSel={accSel}
          onToggle={toggleAccion}
          resuelto={resuelto}
          resolucion={res}
          onCabildo={alCabildo}
          onReiniciar={resetSim}
        />
      )}

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={RELACIONES_PODER_HUECOS}
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

      {modo === "clasificar" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada ejemplo a su categoría de análisis</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                {Object.keys(ubicEj).length}/{EJEMPLOS.length}
              </span>
            </div>
            {ejLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {EJEMPLOS.length} ejemplos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {ejLibres.map((e) => (
                  <button key={e.id} className="rp-chip" data-sel={selEj === e.id} onClick={() => setSelEj((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                    {e.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <BinsCategorias selEj={selEj} shakeEj={shakeEj} ubicEj={ubicEj} onMatch={intentarEj} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "conceptos" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{CONCEPTOS.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {conLibres.map((c) => (
                  <button key={c.id} className="rp-chip" data-sel={selCon === c.id} onClick={() => setSelCon((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                    <i className="fa-solid fa-diagram-project" style={{ fontSize: 14, color: T.text3 }} />
                    {c.concepto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <RowsConceptos selCon={selCon} shakeCon={shakeCon} empCon={empCon} onMatch={intentarCon} dropProps={dropProps} />
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
            persistMejor(clasificarDone, conceptosDone, true);
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
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{PISTA[modo]}</div>
              </Bloque>
              <Bloque titulo="Las 5 fuentes de poder" icono="fa-scale-balanced">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FUENTES.map((f) => (
                    <div key={f.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>
                        <i className={`fa-solid ${f.icono}`} style={{ color: accent, marginRight: 7 }} aria-hidden />
                        {f.nombre}.
                      </strong>{" "}
                      {f.def}
                    </div>
                  ))}
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
                  {bestEstrellas >= 3 ? "¡Analizas el poder y la desigualdad como un científico social!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={RELACIONES_PODER_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Categorías de análisis" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[k].titulo}.</strong> {CATEGORIA_INFO[k].subtitulo}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-diagram-project">
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
              <Bloque titulo="Ejemplos de desigualdad" icono="fa-list">
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {EJEMPLOS.map((e) => (
                    <li key={e.id}>{e.texto}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_PODER}</div>
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
  @keyframes rpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes rpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .rp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
  .rp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .rp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .rp-chip:active { cursor:grabbing; }
  .rp-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .rp-row[data-shake="true"] { animation:rpShake .4s; border-color:${NO}; }
  .rp-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .rp-slot { flex-shrink:0; min-width:min(100%, 200px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .rp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .rp-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
  .rp-bin[data-shake="true"] { animation:rpShake .4s; border-color:${NO}; }
  .rp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .rp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .rp-q:disabled{ cursor:default; }
  .rp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .rp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .rp-btn:disabled { opacity:.45; cursor:not-allowed; }
  .rp-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .rp-qgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:9px; }
  .rp-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:11px; }
  .rp-grid-s { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:9px; }
  .rp-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .rp-pop { animation:rpPop .28s ease; }

  /* Mapa de actores */
  .rp-mapa { position:relative; width:100%; min-height:340px; aspect-ratio:4/3; border-radius:16px; overflow:hidden;
    border:1px solid ${T.line}; background:radial-gradient(90% 70% at 30% 20%, rgba(${rgba},0.14) 0%, transparent 60%), rgba(2,12,28,0.6); }
  .rp-mapa svg { position:absolute; inset:0; width:100%; height:100%; }
  .rp-nodo { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:3px;
    background:none; border:none; padding:0; cursor:pointer; color:#fff; font-size:14px; font-weight:800; text-shadow:0 1px 6px rgba(0,0,0,0.9); }
  .rp-nodo-c { display:flex; align-items:center; justify-content:center; border-radius:50%; border:3px solid ${T.lineStrong};
    background:rgba(8,20,36,0.92); transition:width .5s cubic-bezier(.2,.8,.2,1), height .5s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s; }
  .rp-nodo[data-bando="coal"] .rp-nodo-c { border-color:${OK}; box-shadow:0 0 18px -4px ${OK}; }
  .rp-nodo[data-bando="contra"] .rp-nodo-c { border-color:${NO}; box-shadow:0 0 18px -6px ${NO}; }
  .rp-nodo[data-sel="true"] .rp-nodo-c { outline:3px solid ${accent}; outline-offset:3px; }
  .rp-nodo[data-hecho="true"] .rp-nodo-c { border-color:${OK}; }
  .rp-linea { transition:stroke .3s, stroke-width .3s; }
  .rp-foto { position:relative; width:100%; overflow:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,20,36,0.9)); color:rgba(255,255,255,0.55); font-size:30px; }
  .rp-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .rp-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .rp-barra > i { display:block; height:100%; border-radius:7px; transition:width .6s cubic-bezier(.2,.8,.2,1); }
  .rp-accion { position:relative; display:flex; flex-direction:column; gap:7px; text-align:left; padding:13px 14px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.4; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; min-width:0; }
  .rp-accion:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .rp-accion[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .rp-accion:disabled { cursor:not-allowed; opacity:.5; }
  .rp-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }

  /* Identidad del tablero */
  .rp-bin, .rp-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .rp-bin:nth-of-type(6n+1), .rp-row:nth-of-type(6n+1) { --tono:188; }
  .rp-bin:nth-of-type(6n+2), .rp-row:nth-of-type(6n+2) { --tono:262; }
  .rp-bin:nth-of-type(6n+3), .rp-row:nth-of-type(6n+3) { --tono:44; }
  .rp-bin:nth-of-type(6n+4), .rp-row:nth-of-type(6n+4) { --tono:152; }
  .rp-bin:nth-of-type(6n+5), .rp-row:nth-of-type(6n+5) { --tono:330; }
  .rp-bin:nth-of-type(6n+6), .rp-row:nth-of-type(6n+6) { --tono:18; }
  .rp-bin::before, .rp-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .rp-bin[data-done="true"], .rp-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .rp-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .rp-chip:hover { transform:translateY(-2px); }
  .rp-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .rp-chip, .rp-chip:hover, .rp-chip[data-sel="true"] { transform:none; transition:none; }
    .rp-row[data-shake="true"], .rp-bin[data-shake="true"], .rp-pop { animation:none; }
    .rp-nodo-c, .rp-barra > i, .rp-accion, .rp-accion:hover:not(:disabled) { transition:none; transform:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales del simulador
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto de escena con degradado e ícono detrás: se ve bien aunque aún no exista. */
function Foto({ clave, icono, alto = 120 }: { clave: string; icono: string; alto?: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="rp-foto" style={{ height: alto } as CSSProperties}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

/** Mapa SVG de la red de actores. Nodos HTML (legibles) sobre líneas SVG. */
function Mapa({ est, sel, onSel, tamano, estado }: {
  est: Estado;
  sel: string | null;
  onSel: (id: string) => void;
  /** Diámetro del nodo: depende del modo (en el diagnóstico es parejo hasta saber). */
  tamano: (a: Actor) => number;
  estado: (a: Actor) => { bando: string; hecho: boolean };
}) {
  return (
    <div className="rp-mapa" role="group" aria-label="Mapa de actores del conflicto del agua en Valle Sereno (simulación)">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {ALIANZAS.map((al) => {
          const a = ACTOR(al.a);
          const b = ACTOR(al.b);
          const bando = est.activas[`${al.a}|${al.b}`];
          const col = bando === "coal" ? OK : bando === "contra" ? NO : "rgba(255,255,255,0.16)";
          return (
            <line key={`${al.a}|${al.b}`} className="rp-linea" x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={bando ? 4 : 2} strokeDasharray={bando ? undefined : "4 5"} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          );
        })}
      </svg>
      {ACTORES.map((a) => {
        const d = tamano(a);
        const st = estado(a);
        return (
          <button key={a.id} type="button" className="rp-nodo" data-bando={st.bando} data-hecho={st.hecho} data-sel={sel === a.id} style={{ left: `${a.x}%`, top: `${a.y}%` }} onClick={() => onSel(a.id)} aria-label={a.nombre}>
            <span className="rp-nodo-c" style={{ width: d, height: d, fontSize: Math.max(18, d * 0.4) }}>
              <i className={`fa-solid ${a.icono}`} aria-hidden />
            </span>
            {a.corto}
          </button>
        );
      })}
    </div>
  );
}

/** Las 5 barras de recursos de un actor. */
function Barras({ actor, resaltar }: { actor: Actor; resaltar?: Fuente }) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {FUENTES.map((f) => (
        <div key={f.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,110px) minmax(0,1fr) 36px", gap: 9, alignItems: "center", fontSize: 14, color: resaltar === f.id ? "#fff" : T.text2, fontWeight: resaltar === f.id ? 800 : 600 }}>
          <span><i className={`fa-solid ${f.icono}`} style={{ marginRight: 6, color: resaltar === f.id ? AMBAR : T.text3 }} aria-hidden />{f.nombre}</span>
          <div className="rp-barra"><i style={{ width: `${(actor.recursos[f.id] / 5) * 100}%`, background: resaltar === f.id ? AMBAR : "rgba(255,255,255,0.45)" }} /></div>
          <span style={{ textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{actor.recursos[f.id]}/5</span>
        </div>
      ))}
    </div>
  );
}

function ModoDiagnostico({ accent, sel, onSel, diagRes, diagFallo, onElegir, done }: {
  accent: string;
  sel: string | null;
  onSel: (id: string) => void;
  diagRes: Record<string, Fuente>;
  diagFallo: Record<string, Fuente | null>;
  onElegir: (actorId: string, f: Fuente) => void;
  done: boolean;
}) {
  const base = evaluar([]);
  const actor = sel ? ACTOR(sel) : null;
  const acierto = actor ? diagRes[actor.id] : undefined;
  const fallo = actor ? diagFallo[actor.id] : null;
  return (
    <>
      <div style={{ ...card, padding: "14px 16px", fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <Eyebrow>Valle Sereno · conflicto por el agua (simulación)</Eyebrow>
        El ayuntamiento quiere entregar el servicio de agua a una empresa. Antes de actuar, toca cada actor y descubre <strong style={{ color: T.text }}>de dónde sale su poder</strong>. Los círculos crecen cuando lo aciertas.
      </div>
      <Mapa
        est={base}
        sel={sel}
        onSel={onSel}
        tamano={(a) => (diagRes[a.id] ? 40 + poderDe(a) * 1.8 : 50)}
        estado={(a) => ({ bando: "", hecho: !!diagRes[a.id] })}
      />
      {done && (
        <div className="rp-panel rp-pop" style={{ borderColor: `${OK}66` }}>
          <strong style={{ color: OK, fontSize: 15 }}><i className="fa-solid fa-circle-check" /> ¡Mapa completo!</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>Quien manda no siempre es quien más dinero tiene: cada actor pesa por una mezcla distinta de fuentes. Ahora pasa al modo 2 y decide cómo usarlas.</span>
        </div>
      )}
      <div className="rp-panel">
        {!actor ? (
          <span style={{ fontSize: 14, color: T.text2 }}><i className="fa-solid fa-hand-pointer" style={{ color: accent, marginRight: 8 }} />Toca un actor del mapa para analizarlo.</span>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ width: "min(100%, 170px)" }}>
                <Foto clave={actor.foto} icono={actor.icono} alto={110} />
              </div>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{actor.nombre}</div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 4 }}>{actor.rol}</div>
              </div>
            </div>
            {acierto ? (
              <>
                <Barras actor={actor} resaltar={actor.dominante} />
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: OK }}>Fuente principal: {FUENTES.find((f) => f.id === actor.dominante)!.nombre}.</strong> {actor.porque}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>¿Cuál es su fuente principal de poder?</div>
                <div className="rp-grid-s">
                  {FUENTES.map((f) => (
                    <button key={f.id} type="button" className="rp-accion" onClick={() => onElegir(actor.id, f.id)} data-sel={fallo === f.id}>
                      <span style={{ fontWeight: 800 }}><i className={`fa-solid ${f.icono}`} style={{ color: accent, marginRight: 7 }} aria-hidden />{f.nombre}</span>
                    </button>
                  ))}
                </div>
                {fallo && (
                  <div style={{ fontSize: 14, color: NO, lineHeight: 1.5 }}>
                    <i className="fa-solid fa-circle-xmark" /> Aquí {FUENTES.find((f) => f.id === fallo)!.nombre.toLowerCase()} pesa {actor.recursos[fallo]} de 5. Busca la fuente de la que más depende para conseguir lo que quiere.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <details className="rp-panel" style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800, color: "#fff" }}>¿Qué significa cada fuente?</summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {FUENTES.map((f) => (
            <div key={f.id}><strong style={{ color: "#fff" }}>{f.nombre}.</strong> {f.def}</div>
          ))}
        </div>
      </details>
    </>
  );
}

function ModoSimulador({ accent, est, sel, onSel, accSel, onToggle, resuelto, resolucion, onCabildo, onReiniciar }: {
  accent: string;
  est: Estado;
  sel: string | null;
  onSel: (id: string) => void;
  accSel: string[];
  onToggle: (id: string) => void;
  resuelto: boolean;
  resolucion: ReturnType<typeof resolver> | null;
  onCabildo: () => void;
  onReiniciar: () => void;
}) {
  const actor = sel ? ACTOR(sel) : null;
  const libres = FICHAS - est.fichasUsadas;
  const col = est.balance >= 55 ? OK : est.balance >= 45 ? AMBAR : NO;
  return (
    <>
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <Foto clave="asamblea" icono="fa-people-group" alto={96} />
        <div style={{ padding: "12px 16px", fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>Tú acompañas al Comité de Los Pinos.</strong> La contraparte (ayuntamiento, empresa y Radio Valle) tiene mucho más poder. Con {FICHAS} fichas, arma una coalición y mira cómo se mueve el mapa. Las cifras son de simulación.
        </div>
      </div>

      <Mapa
        est={est}
        sel={sel}
        onSel={onSel}
        tamano={(a) => 40 + (est.poderActor[a.id] ?? 0) * 1.8}
        estado={(a) => ({ bando: est.bandos[a.id] ?? "neutral", hecho: false })}
      />

      <div className="rp-panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 14, fontWeight: 800, color: "#fff" }}>
          <span style={{ color: OK }}>Coalición {Math.round(est.coal)}</span>
          <span>Balance de poder: <span style={{ color: col }}>{est.balance} %</span> (simulación)</span>
          <span style={{ color: NO }}>Contraparte {Math.round(est.contra)}</span>
        </div>
        <div className="rp-barra" style={{ height: 16, position: "relative" }} role="img" aria-label={`Balance de poder ${est.balance} por ciento`}>
          <i style={{ width: `${est.balance}%`, background: col }} />
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Es la «probabilidad de imponer la propia voluntad» (Weber). Para ganar necesitas más del 55 %.
          {est.hegemonia === "coal" && <> <strong style={{ color: OK }}>Hegemonía:</strong> tu relato va ganando consenso (+10 %).</>}
          {est.hegemonia === "contra" && <> <strong style={{ color: NO }}>Hegemonía:</strong> el «sentido común» favorece a la contraparte (+10 %).</>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Voces en la mesa:</span>
          {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((k) => {
            const on = est.voces.includes(k);
            return (
              <span key={k} className="rp-tag" style={{ borderColor: on ? `${OK}88` : undefined, color: on ? "#fff" : T.text3, opacity: on ? 1 : 0.7 }}>
                <i className={`fa-solid ${CATEGORIA_INFO[k].icono}`} aria-hidden /> {CATEGORIA_INFO[k].titulo}
              </span>
            );
          })}
        </div>
      </div>

      {actor && (
        <div className="rp-panel">
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{actor.nombre}</div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{actor.rol}</div>
          <Barras actor={actor} resaltar={actor.dominante} />
        </div>
      )}

      <div className="rp-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: "#fff", fontSize: 15 }}>Acciones</strong>
          <span style={{ fontSize: 14, fontWeight: 800, color: libres === 0 ? AMBAR : T.text2 }} aria-label={`${libres} fichas libres de ${FICHAS}`}>
            {Array.from({ length: FICHAS }, (_, i) => (i < libres ? "●" : "○")).join(" ")} {libres} fichas
          </span>
        </div>
        <div className="rp-grid">
          {ACCIONES.map((a) => {
            const on = accSel.includes(a.id);
            const sinFichas = !on && a.costo > libres;
            return (
              <button key={a.id} type="button" className="rp-accion" data-sel={on} disabled={resuelto || sinFichas} onClick={() => onToggle(a.id)} aria-pressed={on}>
                <span style={{ fontWeight: 800, fontSize: 15 }}><i className={`fa-solid ${a.icono}`} style={{ color: accent, marginRight: 8 }} aria-hidden />{a.titulo}</span>
                <span style={{ color: T.text2 }}>{a.efecto}</span>
                <span className="rp-tag" style={{ alignSelf: "flex-start" }}>{a.costo === 0 ? "Gratis" : `${a.costo} ${a.costo === 1 ? "ficha" : "fichas"}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {accSel.length > 0 && (
        <div className="rp-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}>Reacciones</strong>
          {ACCIONES.filter((a) => accSel.includes(a.id)).map((a) => {
            const fallida = est.fallidas.includes(a.id);
            return (
              <div key={a.id} className="rp-pop" style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                <i className={`fa-solid ${fallida ? "fa-circle-xmark" : "fa-circle-check"}`} style={{ color: fallida ? NO : OK, marginRight: 8 }} aria-hidden />
                {fallida ? a.sinRequisito : a.reaccion}
                <div style={{ color: T.text3, marginTop: 2 }}>Por qué: {a.porque}</div>
              </div>
            );
          })}
        </div>
      )}

      {!resuelto ? (
        <button type="button" className="rp-btn rp-btn-main" onClick={onCabildo}>
          <i className="fa-solid fa-landmark" /> Llevar el caso al cabildo
        </button>
      ) : (
        resolucion && (
          <div className="rp-panel rp-pop" style={{ borderColor: `${resolucion.tono === "bien" ? OK : resolucion.tono === "mal" ? NO : AMBAR}88` }}>
            <strong style={{ fontSize: 16, color: resolucion.tono === "bien" ? OK : resolucion.tono === "mal" ? NO : AMBAR }}>{resolucion.titulo}</strong>
            <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{resolucion.texto}</span>
            <button type="button" className="rp-btn" onClick={onReiniciar}>
              <i className="fa-solid fa-rotate-left" /> Probar otra coalición
            </button>
          </div>
        )
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

function BinsCategorias({
  selEj,
  shakeEj,
  ubicEj,
  onMatch,
  dropProps,
}: {
  selEj: string | null;
  shakeEj: Categoria | null;
  ubicEj: Record<string, Categoria>;
  onMatch: (ejId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["clase", "genero", "etnia", "edad"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = EJEMPLOS.filter((e) => ubicEj[e.id] === bin);
        return (
          <div
            key={bin}
            className="rp-bin"
            data-shake={shakeEj === bin}
            onClick={() => selEj && onMatch(selEj, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "rpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                    {e.texto}
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
  selCon,
  shakeCon,
  empCon,
  onMatch,
  dropProps,
}: {
  selCon: string | null;
  shakeCon: string | null;
  empCon: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CONCEPTOS.map((c) => {
        const done = empCon[c.id];
        return (
          <div
            key={c.id}
            className="rp-row"
            data-shake={shakeCon === c.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="rp-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "rpPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-diagram-project" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{c.ejemplo}</div>
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
        Cuatro afirmaciones sobre las relaciones de poder, la interseccionalidad y la relación sociedad-naturaleza. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div className="rp-qgrid">
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
                    <button key={oi} className="rp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="rp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="rp-btn" onClick={reintentar}>
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
