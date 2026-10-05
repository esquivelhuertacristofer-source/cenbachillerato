﻿"use client";

/**
 * Laboratorio — Detección de fake news y verificación de información
 * Práctica experimental para CD-II-P03-A2 (Cultura Digital II).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Alerta o verificación?» — clasifica nueve indicios entre señal de alerta
 *     de desinformación y práctica de verificación confiable.
 *  2. «Las técnicas de verificación» — empareja cada técnica (fact-checking,
 *     búsqueda inversa, fuente original, desconfiar de titulares) con lo que hace
 *     (descripción verbatim de la lectura A1).
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (V/F verbatim de A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-II·P03.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { DETECCION_FAKE_NEWS_HUECOS } from "./deteccion-fake-news-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { DETECCION_FAKE_NEWS_FICHA } from "./deteccion-fake-news-ficha";
import {
  SENALES,
  CATEGORIA_INFO,
  TECNICAS,
  PARES,
  QUIZ,
  DATO_FAKE,
  type Categoria,
} from "./fake-news-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-fake-news-reto";

type Modo = "senales" | "tecnicas" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "senales", label: "¿Alerta o verificación?", icono: "fa-flag" },
  { id: "tecnicas", label: "Las técnicas de verificación", icono: "fa-magnifying-glass-chart" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabFakeNews({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("senales");

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

  // ── modo señales (clasifica alerta / fiable) ───────────────────────────
  const [ubicSenal, setUbicSenal] = useState<Record<string, Categoria>>({});
  const [selSenal, setSelSenal] = useState<string | null>(null);
  const [shakeSenal, setShakeSenal] = useState<Categoria | null>(null);
  const senalesLibres = SENALES.filter((s) => !ubicSenal[s.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarSenal = (senalId: string, bin: Categoria) => {
    if (ubicSenal[senalId]) return;
    const s = SENALES.find((x) => x.id === senalId);
    if (s && s.categoria === bin) {
      setUbicSenal((e) => ({ ...e, [senalId]: bin }));
      setSelSenal(null);
      sfxPlace();
      if (Object.keys(ubicSenal).length + 1 >= SENALES.length) {
        sfxOk();
        persistMejor(true, tecnicasDone, glosarioDone);
      }
    } else {
      setShakeSenal(bin);
      sfxNo();
      window.setTimeout(() => setShakeSenal(null), 420);
    }
  };
  const resetSenales = () => {
    setUbicSenal({});
    setSelSenal(null);
  };

  // ── modo técnicas (empareja técnica → función) ─────────────────────────
  const [empTec, setEmpTec] = useState<Record<string, boolean>>({});
  const [selTec, setSelTec] = useState<string | null>(null);
  const [shakeTec, setShakeTec] = useState<string | null>(null);
  const tecLibres = TECNICAS.filter((t) => !empTec[t.id]).slice().sort((a, b) => a.tecnica.localeCompare(b.tecnica, "es"));

  const intentarTec = (chipId: string, rowId: string) => {
    if (empTec[rowId]) return;
    if (chipId === rowId) {
      setEmpTec((e) => ({ ...e, [rowId]: true }));
      setSelTec(null);
      sfxPlace();
      if (Object.keys(empTec).length + 1 >= TECNICAS.length) {
        sfxOk();
        persistMejor(senalesDone, true, glosarioDone);
      }
    } else {
      setShakeTec(rowId);
      sfxNo();
      window.setTimeout(() => setShakeTec(null), 420);
    }
  };
  const resetTecnicas = () => {
    setEmpTec({});
    setSelTec(null);
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
  const senalesDone = Object.keys(ubicSenal).length >= SENALES.length;
  const tecnicasDone = Object.keys(empTec).length >= TECNICAS.length;
  const modosHechos = (senalesDone ? 1 : 0) + (tecnicasDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica los 9 indicios (alerta / verificación)", done: senalesDone },
    { txt: "Empareja las 4 técnicas con su función", done: tecnicasDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "senales" ? resetSenales : modo === "tecnicas" ? resetTecnicas : resetGlosario;


  const hechos = Object.keys(ubicSenal).length;
  const lectura =
    modo === "senales" ? <>Indicios clasificados: {hechos}/{SENALES.length}</>
    : modo === "tecnicas" ? <>Técnicas emparejadas: {Object.keys(empTec).length}/{TECNICAS.length}</>
    : <>Modos completos: {modosHechos}/4</>;

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

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

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={DETECCION_FAKE_NEWS_HUECOS}
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

          {modo === "senales" && (
            <Mesa>
              <div>
              {instruccion("Arrastra cada indicio a su categoría", `${hechos}/${SENALES.length}`, senalesDone)}
              {senalesLibres.length === 0 ? (
                <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                  <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {SENALES.length} indicios!
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {senalesLibres.map((s) => (
                    <button key={s.id} className="fn-chip" data-sel={selSenal === s.id} onClick={() => setSelSenal((v) => (v === s.id ? null : s.id))} {...dragProps(s.id)}>
                      {s.texto}
                    </button>
                  ))}
                </div>
              )}
              </div>
              <BinsSenales selSenal={selSenal} shakeSenal={shakeSenal} ubicSenal={ubicSenal} onMatch={intentarSenal} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "tecnicas" && (
            <Mesa>
              <div>
              {instruccion("Arrastra cada técnica a lo que hace", `${Object.keys(empTec).length}/${TECNICAS.length}`, tecnicasDone)}
              {tecLibres.length === 0 ? (
                <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                  <i className="fa-solid fa-circle-check" /> ¡Emparejaste las 4 técnicas!
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {tecLibres.map((t) => (
                    <button key={t.id} className="fn-chip" data-sel={selTec === t.id} onClick={() => setSelTec((v) => (v === t.id ? null : t.id))} {...dragProps(t.id)}>
                      <i className="fa-solid fa-shield-halved" style={{ fontSize: 14, color: T.text3 }} />
                      {t.tecnica}
                    </button>
                  ))}
                </div>
              )}
              </div>
              <RowsTecnicas selTec={selTec} shakeTec={shakeTec} empTec={empTec} onMatch={intentarTec} dropProps={dropProps} />
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
                persistMejor(senalesDone, tecnicasDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}
        </div>
      }
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Verificas antes de compartir como un experto!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "senales" && (
                    <>Una <strong style={{ color: T.text }}>señal de alerta</strong> invita a desconfiar y verificar; una <strong style={{ color: T.text }}>práctica de verificación</strong> somete la información a comprobación antes de creerla o compartirla.</>
                  )}
                  {modo === "tecnicas" && (
                    <>Antes de compartir, pregúntate: ¿lo verificó un <strong style={{ color: T.text }}>fact-checker</strong>?, ¿la <strong style={{ color: T.text }}>imagen</strong> es real?, ¿hay una <strong style={{ color: T.text }}>fuente original</strong>?, ¿el <strong style={{ color: T.text }}>titular</strong> es sensacionalista?</>
                  )}
                  {modo === "glosario" && <>Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>}
                  {modo === "texto" && <>Escribe cada palabra que falta en el texto.</>}
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
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Las dos categorías" icono="fa-flag">
                {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ejemplos de cada técnica" icono="fa-magnifying-glass-chart">
                {TECNICAS.map((t) => (
                  <p key={t.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{t.tecnica}.</strong> {t.ejemplo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_FAKE}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={DETECCION_FAKE_NEWS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes fnShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes fnPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fn-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .fn-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .fn-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .fn-chip:active { cursor:grabbing; }
  .fn-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .fn-row[data-shake="true"] { animation:fnShake .4s; border-color:${NO}; }
  .fn-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .fn-slot { flex-shrink:0; min-width:200px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .fn-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .fn-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:220px; }
  .fn-bin[data-shake="true"] { animation:fnShake .4s; border-color:${NO}; }
  .fn-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fn-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fn-q:disabled{ cursor:default; }
  .fn-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .fn-btn:hover { border-color:${T.lineStrong}; }

  /* Identidad del tablero */
  .fn-bin, .fn-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .fn-bin:nth-of-type(6n+1), .fn-row:nth-of-type(6n+1) { --tono:188; }
  .fn-bin:nth-of-type(6n+2), .fn-row:nth-of-type(6n+2) { --tono:262; }
  .fn-bin:nth-of-type(6n+3), .fn-row:nth-of-type(6n+3) { --tono:44; }
  .fn-bin:nth-of-type(6n+4), .fn-row:nth-of-type(6n+4) { --tono:152; }
  .fn-bin:nth-of-type(6n+5), .fn-row:nth-of-type(6n+5) { --tono:330; }
  .fn-bin:nth-of-type(6n+6), .fn-row:nth-of-type(6n+6) { --tono:18; }
  .fn-bin::before, .fn-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .fn-bin[data-done="true"], .fn-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){ .fn-row[data-shake="true"], .fn-bin[data-shake="true"] { animation:none; } .fn-chip, .fn-chip:hover, .fn-chip[data-sel="true"] { transform:none; transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsSenales({
  selSenal,
  shakeSenal,
  ubicSenal,
  onMatch,
  dropProps,
}: {
  selSenal: string | null;
  shakeSenal: Categoria | null;
  ubicSenal: Record<string, Categoria>;
  onMatch: (senalId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["alerta", "fiable"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = SENALES.filter((s) => ubicSenal[s.id] === bin);
        const tint = bin === "alerta" ? NO : OK;
        return (
          <div
            key={bin}
            className="fn-bin"
            data-shake={shakeSenal === bin}
            onClick={() => selSenal && onMatch(selSenal, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={tint} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((s) => (
                  <span key={s.id} style={{ animation: "fnPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {s.texto}
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

function RowsTecnicas({
  selTec,
  shakeTec,
  empTec,
  onMatch,
  dropProps,
}: {
  selTec: string | null;
  shakeTec: string | null;
  empTec: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {TECNICAS.map((t) => {
        const done = empTec[t.id];
        return (
          <div
            key={t.id}
            className="fn-row"
            data-shake={shakeTec === t.id}
            data-done={done}
            onClick={() => !done && selTec && onMatch(selTec, t.id)}
            {...dropProps((id) => onMatch(id, t.id))}
          >
            <div className="fn-slot" data-armed={!done && !!selTec} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "fnPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-shield-halved" />
                  {t.tecnica}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> técnica
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{t.funcion}</div>
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
        Seis afirmaciones sobre las fake news y la verificación de información. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="fn-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fn-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fn-btn" onClick={reintentar}>
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
