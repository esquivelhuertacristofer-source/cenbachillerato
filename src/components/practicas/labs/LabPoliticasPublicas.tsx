"use client";

/**
 * Laboratorio — Políticas públicas: el ciclo de la política pública
 * Práctica experimental para CS-III-P02-A4 (Ciencias Sociales III).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «El ciclo de la política pública» — ORDENA las cinco etapas, del problema
 *     a la evaluación: identificación del problema → diseño de alternativas →
 *     adopción → implementación → evaluación (A1, verbatim).
 *  2. «Empareja concepto y definición» — arrastra cada concepto a la definición
 *     que le corresponde (glosario A5, verbatim).
 *  3. «Escribe el término» — lee la definición y escribe el término del
 *     glosario; las etiquetas verbatim de A5 siguen de pista.
 *  + Cuestionario de comprensión (V/F verbatim de A4 y A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CS-III·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { POLITICAS_PUBLICAS_HUECOS } from "./politicas-publicas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { POLITICAS_PUBLICAS_FICHA } from "./politicas-publicas-ficha";
import { CICLO, PARES, GLOSARIO, QUIZ, DATO_POLITICAS } from "./politicas-publicas-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-politicas-publicas-reto";

type Modo = "ciclo" | "conceptos" | "glosario" | "texto";

/**
 * El glosario de esta progresión no trae ejemplo sino `etiquetas` (A5), que es
 * lo que el modo anterior enseñaba como pista. Se conservan tal cual: son el
 * andamio que permite recordar el término sin verlo.
 */
const PARES_GLOSARIO = GLOSARIO.map((g) => ({ ...g, ejemplo: g.etiquetas.join(" · ") }));

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ciclo", label: "Ciclo", icono: "fa-arrows-spin" },
  { id: "conceptos", label: "Conceptos", icono: "fa-link" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabPoliticasPublicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ciclo");

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

  // ── modo ciclo (ordena secuencialmente) ────────────────────────────────
  const [cicloPos, setCicloPos] = useState(0);
  const [selCic, setSelCic] = useState<string | null>(null);
  const [shakeCic, setShakeCic] = useState(false);
  const cicloLibres = CICLO.filter((c) => c.orden >= cicloPos).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarCiclo = (pasoId: string) => {
    if (cicloPos >= CICLO.length) return;
    const esperado = CICLO[cicloPos]!;
    if (pasoId === esperado.id) {
      setCicloPos((p) => p + 1);
      setSelCic(null);
      sfxPlace();
      if (cicloPos + 1 >= CICLO.length) {
        sfxOk();
        persistMejor(true, conceptosDone, glosarioDone);
      }
    } else {
      setShakeCic(true);
      sfxNo();
      window.setTimeout(() => setShakeCic(false), 420);
    }
  };
  const resetCiclo = () => {
    setCicloPos(0);
    setSelCic(null);
  };

  // ── modo conceptos (empareja concepto → definición) ─────────────────────
  const [empCon, setEmpCon] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeCon, setShakeCon] = useState<string | null>(null);
  const conLibres = PARES.filter((p) => !empCon[p.id]).slice().sort((a, b) => a.termino.localeCompare(b.termino, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (empCon[rowId]) return;
    if (chipId === rowId) {
      setEmpCon((e) => ({ ...e, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(empCon).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(cicloDone, true, glosarioDone);
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
  const cicloDone = cicloPos >= CICLO.length;
  const conceptosDone = Object.keys(empCon).length >= PARES.length;
  const modosHechos = (cicloDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Ordena las 5 etapas del ciclo de la política", done: cicloDone },
    { txt: "Empareja los 6 conceptos con su definición", done: conceptosDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "ciclo" ? resetCiclo : modo === "conceptos" ? resetConceptos : resetGlosario;

  const lectura = `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{`
        @keyframes ppShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes ppPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .pp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; user-select:none; max-width:min(100%,360px); text-align:left; line-height:1.4;
          transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .pp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .pp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
        .pp-chip:active { cursor:grabbing; }
        .pp-row { --tono:188; position:relative; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .pp-row[data-shake="true"] { animation:ppShake .4s; border-color:${NO}; }
        .pp-row[data-done="true"] { border-color:${OK}66; background-color:${OK}0f;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .pp-row:nth-of-type(6n+1) { --tono:188; }
        .pp-row:nth-of-type(6n+2) { --tono:262; }
        .pp-row:nth-of-type(6n+3) { --tono:44; }
        .pp-row:nth-of-type(6n+4) { --tono:152; }
        .pp-row:nth-of-type(6n+5) { --tono:330; }
        .pp-row:nth-of-type(6n+6) { --tono:18; }
        .pp-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .pp-slot { flex-shrink:0; min-width:min(100%,200px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .pp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; }
        .pp-slotline { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px 16px; transition:all .16s;
          display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:14px; cursor:pointer; }
        .pp-slotline[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; }
        .pp-slotline[data-shake="true"] { animation:ppShake .4s; border-color:${NO}; }
        .pp-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:center; gap:12px; animation:ppPop .25s ease; }
        .pp-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.45; }
        .pp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .pp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .pp-q:disabled{ cursor:default; }
        .pp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .pp-btn:hover { border-color:${T.lineStrong}; }
        @media (prefers-reduced-motion: reduce){
          .pp-row[data-shake="true"], .pp-slotline[data-shake="true"] { animation:none; }
          .pp-chip, .pp-chip:hover, .pp-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={POLITICAS_PUBLICAS_HUECOS}
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

      {/* MODO 1 — ciclo */}
      {modo === "ciclo" && (
        <Mesa>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra la siguiente etapa al hueco activo</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: cicloDone ? OK : T.text3 }}>
                {cicloPos}/{CICLO.length}
              </span>
            </div>
            {cicloLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Reconstruiste el ciclo de la política pública!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {cicloLibres.map((c) => (
                  <button key={c.id} className="pp-chip" data-sel={selCic === c.id} onClick={() => setSelCic((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                    {c.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <CicloOrden selCic={selCic} shakeCic={shakeCic} cicloPos={cicloPos} onMatch={intentarCiclo} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 2 — conceptos */}
      {modo === "conceptos" && (
        <Mesa>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada concepto a su definición</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                {Object.keys(empCon).length}/{PARES.length}
              </span>
            </div>
            {conLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los 6 conceptos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {conLibres.map((p) => (
                  <button key={p.id} className="pp-chip" data-sel={selCon === p.id} onClick={() => setSelCon((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    <i className="fa-solid fa-link" style={{ fontSize: 14, color: T.text3 }} />
                    {p.termino}
                  </button>
                ))}
              </div>
            )}
          </div>

          <RowsConceptos selCon={selCon} shakeCon={shakeCon} empCon={empCon} onMatch={intentarCon} dropProps={dropProps} />
        </Mesa>
      )}

      {/* MODO 3 — glosario */}
      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES_GLOSARIO}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y escribe el término."
          onCompletado={() => {
            setGlosarioDone(true);
            sfxOk();
            persistMejor(cicloDone, conceptosDone, true);
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
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Dominas el ciclo de las políticas públicas!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {modo === "ciclo" && (
                    <>Un problema solo entra al ciclo cuando llega a la <strong style={{ color: T.text }}>agenda gubernamental</strong>; la <strong style={{ color: T.text }}>implementación</strong> es donde más fallan las políticas en México.</>
                  )}
                  {modo === "conceptos" && (
                    <>Lee primero la definición y su ejemplo; luego suelta el <strong style={{ color: T.text }}>concepto</strong> que le corresponde.</>
                  )}
                  {modo === "glosario" && <>Lee la definición y sus etiquetas y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>}
                  {modo === "texto" && <>Escribe la palabra que falta en cada hueco del texto.</>}
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
                <FichaTeorica data={POLITICAS_PUBLICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_POLITICAS}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
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

function CicloOrden({
  selCic,
  shakeCic,
  cicloPos,
  onMatch,
  dropProps,
}: {
  selCic: string | null;
  shakeCic: boolean;
  cicloPos: number;
  onMatch: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {CICLO.map((c, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < cicloPos) {
          // ya colocado
          return (
            <div key={c.id} className="pp-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: OK, color: "#04121f" }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>{c.texto}</div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.detalle}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                {c.etapa}
              </span>
            </div>
          );
        }
        if (i === cicloPos) {
          // hueco activo
          return (
            <div
              key={c.id}
              className="pp-slotline"
              data-armed={!!selCic}
              data-shake={shakeCic}
              onClick={() => selCic && onMatch(selCic)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí la siguiente etapa</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={c.id} className="pp-locked">
            {num}
            <span style={{ fontSize: 14, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 14 }} />
              Etapa {i + 1}
            </span>
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
      {PARES.map((p) => {
        const done = empCon[p.id];
        return (
          <div
            key={p.id}
            className="pp-row"
            data-shake={shakeCon === p.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="pp-slot" data-armed={!done && !!selCon} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "ppPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-link" />
                  {p.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{p.definicion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{p.ejemplo}</div>
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
        Seis afirmaciones sobre el diseño, la implementación y la evaluación de las políticas públicas, y el papel de la ciudadanía. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="pp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="pp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pp-btn" onClick={reintentar}>
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
