"use client";

/**
 * Laboratorio — Causas y actores de las crisis sociales en México
 * Práctica experimental para CS-III-P01-A4 (Ciencias Sociales III).
 *
 * SIMULADOR de crisis. El alumno no clasifica frases: VIVE cuatro meses de una
 * crisis en «Cañada Verde», un municipio FICTICIO (simulación; nada de lo que
 * aparece existe, y todas las cifras son valores de juego). Cinco modos:
 *  1. «Línea de tiempo de la crisis» — mes 1: elige 3 señales tempranas entre
 *     tarjetas con imagen (hay ruido y detonantes); luego las 2 causas de fondo;
 *     y en los meses 2, 3 y 4 decide la respuesta. Empleo, confianza y
 *     conflictividad se mueven, la curva de casos se traza contra «sin
 *     respuesta» y cada decisión explica por qué.
 *  2. «¿Causa, actor o consecuencia?» — clasifica los 9 elementos de la crisis
 *     de la pandemia de A1 (verbatim).
 *  3. «Empareja actor y su papel» — verbatim A1.
 *  4. «Escribe el término» — glosario verbatim (A5).
 *  5. «Completa el texto» — verbatim de la progresión.
 *  + Cuestionario de comprensión (V/F verbatim de A4) en la pestaña Reto.
 *
 * Las consecuencias salen del modelo determinista y comentado de
 * `crisis-sociales-sim.ts`. DOM + SVG/CSS (sin three.js). Contenido curricular
 * VERBATIM de CS-III·P01 en la pestaña Teoría.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CRISIS_SOCIALES_HUECOS } from "./crisis-sociales-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CRISIS_SOCIALES_FICHA } from "./crisis-sociales-ficha";
import {
  ELEMENTOS,
  CATEGORIA_INFO,
  ACTORES,
  PARES,
  QUIZ,
  DATO_CRISIS,
  type Categoria,
} from "./crisis-sociales-data";
import {
  CASOS_BASE,
  CAUSAS,
  EVENTOS,
  IND_INFO,
  INICIO,
  SENALES,
  VISITAS,
  alertaDe,
  desenlace,
  enfoqueOk,
  simular,
  type Evento,
  type Serie,
} from "./crisis-sociales-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-crisis-sociales-reto";
const RUTA_SIM = "/media/labs-sim/crisis-sociales";

type Modo = "crisis" | "clasificar" | "actores" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "crisis", label: "Línea de tiempo de la crisis", icono: "fa-timeline" },
  { id: "clasificar", label: "¿Causa, actor o consecuencia?", icono: "fa-layer-group" },
  { id: "actores", label: "Empareja actor y su papel", icono: "fa-users" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const PISTA: Record<Modo, string> = {
  crisis: "Una crisis no es solo el detonante: pregunta qué estructuras la vuelven peor para unos que para otros. Las decisiones que atacan la causa de fondo rinden más si la identificaste.",
  clasificar: "Las crisis nunca son solo naturales o accidentales: se cruzan causas estructurales, actores sociales con intereses distintos y consecuencias diferenciadas.",
  actores: "Cada actor cumple un papel distinto: el Estado diseña medidas, la sociedad civil llena vacíos, el sector empresarial negocia la reapertura y los organismos orientan.",
  glosario: "Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
  texto: "Escribe la palabra que falta en cada hueco del texto.",
};

export function LabCrisisSociales({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("crisis");

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

  // ── modo línea de tiempo (señales → causas → 3 decisiones) ──────────────
  const [senSel, setSenSel] = useState<string[]>([]);
  const [senOk, setSenOk] = useState(false);
  const [caSel, setCaSel] = useState<string[]>([]);
  const [caOk, setCaOk] = useState(false);
  const [decs, setDecs] = useState<Record<string, string>>({});
  const alerta = senOk ? alertaDe(senSel) : 0;
  const enfoque = caOk && enfoqueOk(caSel);
  const serie = simular(decs, alerta, enfoque);
  const decididas = serie.meses;
  const paso = !senOk ? 0 : !caOk ? 1 : 2 + decididas;
  const finDone = decididas >= EVENTOS.length;
  const fin = finDone ? desenlace(serie) : null;
  const analisisOk = senOk && caOk && enfoque;

  const toggleSenal = (id: string) => {
    if (senOk) return;
    sfxClick();
    setSenSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= VISITAS ? s : [...s, id]));
  };
  const confirmarSenales = () => {
    if (senOk || senSel.length !== VISITAS) return;
    let todas = true;
    for (const id of senSel) {
      if (SENALES.find((s) => s.id === id)?.tipo === "relevante") partida.acierto();
      else {
        sfxNo();
        todas = false;
      }
    }
    if (todas) sfxOk();
    setSenOk(true);
  };
  const toggleCausa = (id: string) => {
    if (caOk) return;
    sfxClick();
    setCaSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? s : [...s, id]));
  };
  const confirmarCausas = () => {
    if (caOk || caSel.length !== 2) return;
    let todas = true;
    for (const id of caSel) {
      if (CAUSAS.find((c) => c.id === id)?.estructural) partida.acierto();
      else {
        sfxNo();
        todas = false;
      }
    }
    if (todas) sfxOk();
    setCaOk(true);
  };
  const decidir = (ev: Evento, opId: string) => {
    if (decs[ev.id]) return;
    const op = ev.opciones.find((o) => o.id === opId);
    if (!op) return;
    if ((op.efecto.confianza ?? 0) < 0) sfxNo();
    else sfxPlace();
    setDecs((d) => ({ ...d, [ev.id]: opId }));
  };
  const resetCrisis = () => {
    setSenSel([]);
    setSenOk(false);
    setCaSel([]);
    setCaOk(false);
    setDecs({});
  };

  // ── modo clasificar (causa / actor / consecuencia) ─────────────────────
  const [ubicEl, setUbicEl] = useState<Record<string, Categoria>>({});
  const [selEl, setSelEl] = useState<string | null>(null);
  const [shakeEl, setShakeEl] = useState<Categoria | null>(null);
  const elLibres = ELEMENTOS.filter((e) => !ubicEl[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEl = (elId: string, bin: Categoria) => {
    if (ubicEl[elId]) return;
    const e = ELEMENTOS.find((x) => x.id === elId);
    if (e && e.categoria === bin) {
      setUbicEl((prev) => ({ ...prev, [elId]: bin }));
      setSelEl(null);
      sfxPlace();
      if (Object.keys(ubicEl).length + 1 >= ELEMENTOS.length) {
        sfxOk();
        persistMejor(true, actoresDone, glosarioDone);
      }
    } else {
      setShakeEl(bin);
      sfxNo();
      window.setTimeout(() => setShakeEl(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicEl({});
    setSelEl(null);
  };

  // ── modo actores (empareja actor → papel) ──────────────────────────────
  const [empAct, setEmpAct] = useState<Record<string, boolean>>({});
  const [selAct, setSelAct] = useState<string | null>(null);
  const [shakeAct, setShakeAct] = useState<string | null>(null);
  const actLibres = ACTORES.filter((c) => !empAct[c.id]).slice().sort((a, b) => a.actor.localeCompare(b.actor, "es"));

  const intentarAct = (chipId: string, rowId: string) => {
    if (empAct[rowId]) return;
    if (chipId === rowId) {
      setEmpAct((prev) => ({ ...prev, [rowId]: true }));
      setSelAct(null);
      sfxPlace();
      if (Object.keys(empAct).length + 1 >= ACTORES.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeAct(rowId);
      sfxNo();
      window.setTimeout(() => setShakeAct(null), 420);
    }
  };
  const resetActores = () => {
    setEmpAct({});
    setSelAct(null);
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
  const clasificarDone = Object.keys(ubicEl).length >= ELEMENTOS.length;
  const actoresDone = Object.keys(empAct).length >= ACTORES.length;
  const modosHechos = (clasificarDone ? 1 : 0) + (actoresDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Detecta señales tempranas y las 2 causas de fondo de la crisis", done: analisisOk },
    { txt: "Cierra la crisis con confianza de 70 o más y conflictividad de 25 o menos", done: fin?.id === "contenida" },
    { txt: "Clasifica los 9 elementos de la crisis", done: clasificarDone },
    { txt: "Empareja los 4 actores con su papel", done: actoresDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone, modo: "glosario" },
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
    : modo === "actores" ? resetActores
    : modo === "glosario" ? resetGlosario
    : resetCrisis;

  const lectura =
    modo === "crisis"
      ? finDone ? `${fin!.titulo}: confianza ${Math.round(serie.ind.confianza)}`
        : paso === 0 ? "Mes 1: elige 3 señales"
        : paso === 1 ? "Elige las 2 causas de fondo"
        : `Mes ${paso}: ${EVENTOS[decididas]!.titulo}`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "crisis" && (
        <ModoCrisis
          accent={accent}
          paso={paso}
          serie={serie}
          senSel={senSel}
          senOk={senOk}
          onSenal={toggleSenal}
          onConfirmarSenales={confirmarSenales}
          caSel={caSel}
          caOk={caOk}
          onCausa={toggleCausa}
          onConfirmarCausas={confirmarCausas}
          decs={decs}
          onDecidir={decidir}
          alerta={alerta}
          enfoque={enfoque}
          desenlaceFin={fin}
          onReiniciar={resetCrisis}
        />
      )}

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={CRISIS_SOCIALES_HUECOS}
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
              <Eyebrow>Arrastra cada elemento a su categoría</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                {Object.keys(ubicEl).length}/{ELEMENTOS.length}
              </span>
            </div>
            {elLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ELEMENTOS.length} elementos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {elLibres.map((e) => (
                  <button key={e.id} className="cri-chip" data-sel={selEl === e.id} onClick={() => setSelEl((v) => (v === e.id ? null : e.id))} {...dragProps(e.id)}>
                    {e.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <BinsCategorias selEl={selEl} shakeEl={shakeEl} ubicEl={ubicEl} onMatch={intentarEl} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "actores" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada actor al papel que cumplió</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: actoresDone ? OK : T.text3 }}>
                {Object.keys(empAct).length}/{ACTORES.length}
              </span>
            </div>
            {actLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {ACTORES.length} actores!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {actLibres.map((c) => (
                  <button key={c.id} className="cri-chip" data-sel={selAct === c.id} onClick={() => setSelAct((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                    <i className="fa-solid fa-users" style={{ fontSize: 14, color: T.text3 }} />
                    {c.actor}
                  </button>
                ))}
              </div>
            )}
          </div>

          <RowsActores selAct={selAct} shakeAct={shakeAct} empAct={empAct} onMatch={intentarAct} dropProps={dropProps} />
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
            persistMejor(clasificarDone, actoresDone, true);
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
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Analizas las crisis sociales como un científico social!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={CRISIS_SOCIALES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Causa, actor o consecuencia" icono="fa-layer-group">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[k].titulo}.</strong> {CATEGORIA_INFO[k].subtitulo}
                      <ul style={{ margin: "4px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                        {ELEMENTOS.filter((e) => e.categoria === k).map((e) => (
                          <li key={e.id}>{e.texto}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Actores y su papel" icono="fa-users">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ACTORES.map((a) => (
                    <div key={a.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{a.actor}.</strong> {a.rol}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{a.ejemplo}</div>
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_CRISIS}</div>
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
  @keyframes criShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes criPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .cri-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
  .cri-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .cri-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .cri-chip:active { cursor:grabbing; }
  .cri-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .cri-row[data-shake="true"] { animation:criShake .4s; border-color:${NO}; }
  .cri-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .cri-slot { flex-shrink:0; min-width:min(100%, 210px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .cri-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .cri-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
  .cri-bin[data-shake="true"] { animation:criShake .4s; border-color:${NO}; }
  .cri-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .cri-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .cri-q:disabled{ cursor:default; }
  .cri-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .cri-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .cri-btn:disabled { opacity:.45; cursor:not-allowed; }
  .cri-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .cri-qgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:9px; }
  .cri-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:11px; }
  .cri-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .cri-pop { animation:criPop .28s ease; }
  .cri-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .cri-foto { position:relative; width:100%; overflow:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(${rgba},0.28), rgba(8,20,36,0.9)); color:rgba(255,255,255,0.55); font-size:30px; }
  .cri-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cri-barra { height:12px; border-radius:7px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .cri-barra > i { display:block; height:100%; border-radius:7px; transition:width .7s cubic-bezier(.2,.8,.2,1), background .7s; }
  .cri-carta { position:relative; display:flex; flex-direction:column; gap:8px; text-align:left; padding:10px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.4; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; min-width:0; }
  .cri-carta:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .cri-carta[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .cri-carta[data-ok="true"] { border-color:${OK}88; background:${OK}14; }
  .cri-carta[data-mal="true"] { border-color:${NO}88; background:${NO}12; }
  .cri-carta:disabled { cursor:default; }
  .cri-grafica { width:100%; aspect-ratio:2/1; border-radius:14px; border:1px solid ${T.line}; background:${T.inset}; }
  .cri-tiempo { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; font-size:14px; color:${T.text2}; text-align:center; }

  /* Identidad del tablero */
  .cri-bin, .cri-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .cri-bin:nth-of-type(6n+1), .cri-row:nth-of-type(6n+1) { --tono:188; }
  .cri-bin:nth-of-type(6n+2), .cri-row:nth-of-type(6n+2) { --tono:262; }
  .cri-bin:nth-of-type(6n+3), .cri-row:nth-of-type(6n+3) { --tono:44; }
  .cri-bin:nth-of-type(6n+4), .cri-row:nth-of-type(6n+4) { --tono:152; }
  .cri-bin:nth-of-type(6n+5), .cri-row:nth-of-type(6n+5) { --tono:330; }
  .cri-bin:nth-of-type(6n+6), .cri-row:nth-of-type(6n+6) { --tono:18; }
  .cri-bin::before, .cri-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .cri-bin[data-done="true"], .cri-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .cri-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .cri-chip:hover { transform:translateY(-2px); }
  .cri-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .cri-chip, .cri-chip:hover, .cri-chip[data-sel="true"] { transform:none; transition:none; }
    .cri-row[data-shake="true"], .cri-bin[data-shake="true"], .cri-pop { animation:none; }
    .cri-barra > i, .cri-carta, .cri-carta:hover:not(:disabled) { transition:none; transform:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales del simulador
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto de escena con degradado e ícono detrás: se ve bien aunque aún no exista. */
function Foto({ clave, icono, alto = 110 }: { clave: string; icono: string; alto?: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="cri-foto" style={{ height: alto }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {clave && !fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

/** Curva de casos (simulación): la tuya contra «sin respuesta». */
function Cronologia({ serie, accent }: { serie: Serie; accent: string }) {
  const X = [12, 37, 62, 87];
  const y = (c: number) => 46 - (Math.min(c, 120) / 120) * 40;
  const base = CASOS_BASE.map((c, i) => `${X[i]},${y(c)}`).join(" ");
  const tuya = serie.casos.map((c, i) => `${X[i]},${y(c)}`).join(" ");
  return (
    <div className="cri-panel">
      <strong style={{ color: "#fff", fontSize: 15 }}>Casos por cada 10 000 personas (simulación)</strong>
      <svg className="cri-grafica" viewBox="0 0 100 50" role="img" aria-label="Curva de casos por mes: tu respuesta contra sin respuesta">
        <polyline points={base} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
        {CASOS_BASE.map((c, i) => <circle key={i} cx={X[i]} cy={y(c)} r="1.3" fill="rgba(255,255,255,0.45)" />)}
        {serie.casos.length > 1 && <polyline points={tuya} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {serie.casos.map((c, i) => <circle key={i} cx={X[i]} cy={y(c)} r="2" fill={accent} />)}
      </svg>
      <div className="cri-tiempo">
        {CASOS_BASE.map((c, i) => (
          <div key={i}>
            <strong style={{ color: "#fff" }}>Mes {i + 1}</strong>
            <div style={{ color: T.text3 }}>sin respuesta {c}</div>
            <div style={{ color: serie.casos[i] !== undefined ? accent : T.text3, fontWeight: 800 }}>{serie.casos[i] !== undefined ? `tú ${serie.casos[i]}` : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Indicadores({ serie }: { serie: Serie }) {
  return (
    <div className="cri-panel">
      <strong style={{ color: "#fff", fontSize: 15 }}>Indicadores del municipio (simulación)</strong>
      {IND_INFO.map((i) => {
        const v = Math.round(serie.ind[i.id]);
        const ini = INICIO[i.id];
        const bueno = i.buenoAlto ? v : 100 - v;
        const col = bueno >= 60 ? OK : bueno >= 40 ? AMBAR : NO;
        const dif = v - ini;
        return (
          <div key={i.id} style={{ display: "grid", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 800, color: "#fff", flexWrap: "wrap" }}>
              <span><i className={`fa-solid ${i.icono}`} style={{ marginRight: 7, color: col }} aria-hidden />{i.nombre}</span>
              <span style={{ color: col, fontFamily: "ui-monospace, monospace" }}>
                {v} <span style={{ color: T.text3, fontWeight: 600 }}>(inicio {ini}, {dif >= 0 ? "+" : ""}{dif})</span>
              </span>
            </div>
            <div className="cri-barra" role="img" aria-label={`${i.nombre}: ${v} de 100`}><i style={{ width: `${v}%`, background: col }} /></div>
          </div>
        );
      })}
    </div>
  );
}

const sig = (n: number) => (n > 0 ? `+${Math.round(n * 10) / 10}` : `${Math.round(n * 10) / 10}`);

function ModoCrisis(p: {
  accent: string;
  paso: number;
  serie: Serie;
  senSel: string[];
  senOk: boolean;
  onSenal: (id: string) => void;
  onConfirmarSenales: () => void;
  caSel: string[];
  caOk: boolean;
  onCausa: (id: string) => void;
  onConfirmarCausas: () => void;
  decs: Record<string, string>;
  onDecidir: (ev: Evento, opId: string) => void;
  alerta: number;
  enfoque: boolean;
  desenlaceFin: ReturnType<typeof desenlace> | null;
  onReiniciar: () => void;
}) {
  const { accent, paso, serie } = p;
  const evActual = paso >= 2 && paso < 2 + EVENTOS.length ? EVENTOS[paso - 2]! : null;
  return (
    <>
      <div className="cri-panel">
        <Eyebrow>Cañada Verde · crisis de salud y empleo (simulación)</Eyebrow>
        <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Un brote de dengue llega al mismo tiempo que la fábrica deja de operar. Tú coordinas la respuesta durante cuatro meses. Todos los municipios, lugares y cifras son inventados para practicar.
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Señales", "Causas", "Mes 2", "Mes 3", "Mes 4"].map((e, i) => (
            <span key={e} className="cri-tag" style={{ borderColor: i < paso ? `${OK}88` : i === paso ? accent : undefined, color: i < paso ? "#fff" : i === paso ? "#fff" : T.text3 }}>
              <i className={`fa-solid ${i < paso ? "fa-circle-check" : "fa-circle"}`} style={{ color: i < paso ? OK : T.text3 }} aria-hidden /> {e}
            </span>
          ))}
        </div>
      </div>

      <Cronologia serie={serie} accent={accent} />
      <Indicadores serie={serie} />

      {/* Bitácora: lo ya decidido, con su porqué */}
      {p.senOk && (
        <div className="cri-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}>Mes 1 · Lo que viste a tiempo</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Alerta temprana: {Math.round(p.alerta * 100)} % → los casos crecen {Math.round(p.alerta * 25)} % más despacio.
          </span>
          {SENALES.filter((s) => p.senSel.includes(s.id)).map((s) => (
            <div key={s.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <i className={`fa-solid ${s.tipo === "relevante" ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: s.tipo === "relevante" ? OK : NO, marginRight: 8 }} aria-hidden />
              <strong style={{ color: "#fff" }}>{s.tipo === "relevante" ? "Señal útil." : s.tipo === "opinion" ? "Solo opinión." : "Detonante, no causa."}</strong> {s.porque}
            </div>
          ))}
        </div>
      )}
      {p.caOk && (
        <div className="cri-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}>Causas que elegiste</strong>
          <span style={{ fontSize: 14, color: p.enfoque ? OK : AMBAR, lineHeight: 1.5, fontWeight: 700 }}>
            {p.enfoque ? "Enfoque estructural: las respuestas que atacan causas de fondo rinden 1.5 veces más." : "Enfoque parcial: sin las dos causas de fondo, tus respuestas rinden lo normal."}
          </span>
          {CAUSAS.filter((c) => p.caSel.includes(c.id)).map((c) => (
            <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <i className={`fa-solid ${c.estructural ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: c.estructural ? OK : NO, marginRight: 8 }} aria-hidden />
              <strong style={{ color: "#fff" }}>{c.texto}.</strong> {c.porque}
            </div>
          ))}
        </div>
      )}
      {EVENTOS.filter((ev) => p.decs[ev.id]).map((ev) => {
        const op = ev.opciones.find((o) => o.id === p.decs[ev.id])!;
        const d = serie.deltas.find((x) => x.eventoId === ev.id)!;
        return (
          <div key={ev.id} className="cri-panel cri-pop">
            <strong style={{ color: "#fff", fontSize: 15 }}>Mes {ev.mes} · {ev.titulo}</strong>
            <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <i className={`fa-solid ${op.icono}`} style={{ color: accent, marginRight: 8 }} aria-hidden />
              <strong style={{ color: "#fff" }}>{op.texto}</strong> ({op.actor}, escala {op.escala.toLowerCase()})
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="cri-tag">Casos {sig(d.d.casos)} %</span>
              <span className="cri-tag">Empleo {sig(d.d.empleo ?? 0)}</span>
              <span className="cri-tag">Confianza {sig(d.d.confianza ?? 0)}</span>
              <span className="cri-tag">Conflicto {sig(d.d.conflictividad ?? 0)}</span>
              {d.bonus && <span className="cri-tag" style={{ borderColor: `${OK}88`, color: "#fff" }}>Bonus de enfoque ×1.5</span>}
            </div>
            <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>Por qué: {op.porque}</span>
          </div>
        );
      })}

      {/* Paso actual */}
      {paso === 0 && (
        <div className="cri-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}>Mes 1 · Señales tempranas</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            El equipo de epidemiología solo puede hacer {VISITAS} visitas. Elige las {VISITAS} señales que vale la pena investigar: ({p.senSel.length}/{VISITAS}). Hay opiniones y detonantes que parecen señales.
          </span>
          <div className="cri-grid">
            {SENALES.map((s) => {
              const on = p.senSel.includes(s.id);
              return (
                <button key={s.id} type="button" className="cri-carta" data-sel={on} aria-pressed={on} onClick={() => p.onSenal(s.id)}>
                  <Foto clave={s.foto} icono={s.icono} alto={96} />
                  <span>{s.texto}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="cri-btn cri-btn-main" disabled={p.senSel.length !== VISITAS} onClick={p.onConfirmarSenales}>
            <i className="fa-solid fa-magnifying-glass" /> Investigar estas señales
          </button>
        </div>
      )}

      {paso === 1 && (
        <div className="cri-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}>Causas: ¿por qué pega tan fuerte en Cañada Verde?</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Elige las 2 causas de fondo: ({p.caSel.length}/2). Una causa estructural es profunda y duradera, más allá de los detonantes inmediatos.
          </span>
          <div className="cri-grid">
            {CAUSAS.map((c) => {
              const on = p.caSel.includes(c.id);
              return (
                <button key={c.id} type="button" className="cri-carta" data-sel={on} aria-pressed={on} onClick={() => p.onCausa(c.id)}>
                  <span style={{ fontWeight: 700 }}>{c.texto}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="cri-btn cri-btn-main" disabled={p.caSel.length !== 2} onClick={p.onConfirmarCausas}>
            <i className="fa-solid fa-check" /> Confirmar causas
          </button>
        </div>
      )}

      {evActual && (
        <div className="cri-panel">
          <strong style={{ color: "#fff", fontSize: 15 }}><i className={`fa-solid ${evActual.icono}`} style={{ color: accent, marginRight: 8 }} aria-hidden />Mes {evActual.mes} · {evActual.titulo}</strong>
          {evActual.foto !== "" && <Foto clave={evActual.foto} icono={evActual.icono} alto={110} />}
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{evActual.texto}</span>
          <div className="cri-grid">
            {evActual.opciones.map((o) => (
              <button key={o.id} type="button" className="cri-carta" onClick={() => p.onDecidir(evActual, o.id)}>
                <span style={{ fontWeight: 800 }}><i className={`fa-solid ${o.icono}`} style={{ color: accent, marginRight: 8 }} aria-hidden />{o.texto}</span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="cri-tag">{o.actor}</span>
                  <span className="cri-tag">Escala {o.escala.toLowerCase()}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {p.desenlaceFin && (
        <div className="cri-panel cri-pop" style={{ borderColor: `${p.desenlaceFin.tono === "bien" ? OK : p.desenlaceFin.tono === "mal" ? NO : AMBAR}88` }}>
          <strong style={{ fontSize: 16, color: p.desenlaceFin.tono === "bien" ? OK : p.desenlaceFin.tono === "mal" ? NO : AMBAR }}>{p.desenlaceFin.titulo}</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{p.desenlaceFin.texto}</span>
          <button type="button" className="cri-btn" onClick={p.onReiniciar}>
            <i className="fa-solid fa-rotate-left" /> Vivir la crisis otra vez
          </button>
        </div>
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
  selEl,
  shakeEl,
  ubicEl,
  onMatch,
  dropProps,
}: {
  selEl: string | null;
  shakeEl: Categoria | null;
  ubicEl: Record<string, Categoria>;
  onMatch: (elId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["causa", "actor", "consecuencia"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = ELEMENTOS.filter((e) => ubicEl[e.id] === bin);
        return (
          <div
            key={bin}
            className="cri-bin"
            data-shake={shakeEl === bin}
            onClick={() => selEl && onMatch(selEl, bin)}
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
                  <span key={e.id} style={{ animation: "criPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
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

function RowsActores({
  selAct,
  shakeAct,
  empAct,
  onMatch,
  dropProps,
}: {
  selAct: string | null;
  shakeAct: string | null;
  empAct: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {ACTORES.map((c) => {
        const done = empAct[c.id];
        return (
          <div
            key={c.id}
            className="cri-row"
            data-shake={shakeAct === c.id}
            data-done={done}
            onClick={() => !done && selAct && onMatch(selAct, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="cri-slot" data-armed={!done && !!selAct} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "criPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-users" />
                  {c.actor}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> actor
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.rol}</div>
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
        Cinco afirmaciones sobre las causas estructurales y los actores de las crisis sociales —económica, ambiental, sanitaria y de violencia—. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div className="cri-qgrid">
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
                    <button key={oi} className="cri-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cri-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cri-btn" onClick={reintentar}>
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
