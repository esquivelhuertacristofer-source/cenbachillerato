"use client";

/**
 * Laboratorio — El Estado mexicano: elementos, poderes y conceptos.
 * Práctica experimental para CS-I-P01-A4 (Ciencias Sociales I · el Estado).
 *
 * SIMULADOR. «El caso de Las Palmas»: una comunidad ficticia se queda sin agua y
 * el alumno lleva el trámite por el tablero del Estado (3 niveles de gobierno ×
 * 3 poderes). Elegir la institución equivocada ATORA el expediente: pasan los
 * días y el tinaco sigue vacío; la secuencia correcta lo llena. Cifras y hechos
 * del caso: simulación. Las instituciones se nombran como instituciones.
 *  1. «Caso Las Palmas» — el simulador.
 *  + los modos de siempre: «Arma el Estado», «División de poderes», «Conceptos
 *    clave» (arrastre) y «Completa el texto», verbatim de CS-I·P01.
 *
 * DOM + SVG (sin three.js).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { ESTADO_MEXICANO_HUECOS } from "./estado-mexicano-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { ESTADO_MEXICANO_FICHA } from "./estado-mexicano-ficha";
import {
  ELEMENTOS,
  ITEMS_PODER,
  PODER_INFO,
  CONCEPTOS,
  QUIZ,
  DATO_ESTADO,
  type Poder,
} from "./estado-mexicano-data";
import {
  CELDAS,
  DIAS_INICIO,
  DIAS_POR_ATORO,
  NIVELES,
  PASOS,
  PODERES_COL,
  celdaPorId,
  porQueNo,
  type Celda,
} from "./estado-mexicano-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const AGUA = "#4FB3FF";
const RETO_KEY = "cen-estado-mexicano-reto";
const RUTA_FOTOS = "/media/labs-sim/estado-mexicano";

type Modo = "caso" | "armar" | "poderes" | "conceptos" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "caso", label: "Caso Las Palmas", icono: "fa-faucet-drip" },
  { id: "armar", label: "Arma el Estado", icono: "fa-cubes-stacked" },
  { id: "poderes", label: "División de poderes", icono: "fa-scale-balanced" },
  { id: "conceptos", label: "Conceptos clave", icono: "fa-link" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

type DragF = (id: string) => React.ButtonHTMLAttributes<HTMLButtonElement>;
type DropF = (onDrop: (id: string) => void) => React.HTMLAttributes<HTMLDivElement>;

const porNombre = (a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, "es");
const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");
const porTermino = (a: { termino: string }, b: { termino: string }) => a.termino.localeCompare(b.termino, "es");

export function LabEstadoMexicano({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("caso");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
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
  // Único punto por el que pasan aciertos y fallos: la partida se lleva aquí.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── simulador: el caso de Las Palmas ──────────────────────────────────
  const [resueltas, setResueltas] = useState<string[]>([]);
  const [atoros, setAtoros] = useState(0);
  const [atoroCelda, setAtoroCelda] = useState<string | null>(null);
  const [atoroTexto, setAtoroTexto] = useState<string | null>(null);
  const paso = resueltas.length;
  const casoDone = paso >= PASOS.length;
  const dias = DIAS_INICIO + atoros * DIAS_POR_ATORO;

  const elegirCelda = (celdaId: string) => {
    if (casoDone || resueltas.includes(celdaId)) return;
    const p = PASOS[paso]!;
    if (celdaId === p.correcta) {
      setResueltas((r) => [...r, celdaId]);
      setAtoroCelda(null);
      setAtoroTexto(null);
      if (paso + 1 >= PASOS.length) sfxOk();
      else sfxPlace();
    } else {
      setAtoros((a) => a + 1);
      setAtoroCelda(celdaId);
      setAtoroTexto(porQueNo(p, celdaId));
      sfxNo();
    }
  };
  const resetCaso = () => {
    setResueltas([]);
    setAtoros(0);
    setAtoroCelda(null);
    setAtoroTexto(null);
  };

  // ── modo Armar (elementos constitutivos vs símbolos patrios) ──────────
  const NUM_CONSTITUTIVOS = ELEMENTOS.filter((e) => e.constitutivo).length;
  const [dentroEstado, setDentroEstado] = useState<string[]>([]);
  const [selEl, setSelEl] = useState<string | null>(null);
  const [shakeEstado, setShakeEstado] = useState(false);
  const [rechazo, setRechazo] = useState<string | null>(null);
  const elementosLibres = ELEMENTOS.filter((e) => !dentroEstado.includes(e.id)).slice().sort(porNombre);

  const intentarEl = (elId: string) => {
    const el = ELEMENTOS.find((x) => x.id === elId);
    if (!el || dentroEstado.includes(elId)) return;
    if (el.constitutivo) {
      const nuevo = [...dentroEstado, elId];
      setDentroEstado(nuevo);
      setSelEl(null);
      setRechazo(null);
      sfxPlace();
      if (nuevo.length >= NUM_CONSTITUTIVOS) sfxOk();
    } else {
      setShakeEstado(true);
      setRechazo(el.detalle);
      sfxNo();
      window.setTimeout(() => setShakeEstado(false), 420);
    }
  };
  const resetArmar = () => {
    setDentroEstado([]);
    setSelEl(null);
    setRechazo(null);
  };

  // ── modo Poderes (clasificar en 3 poderes) ────────────────────────────
  const [ubicPoder, setUbicPoder] = useState<Record<string, Poder>>({});
  const [selItem, setSelItem] = useState<string | null>(null);
  const [shakePoder, setShakePoder] = useState<Poder | null>(null);
  const itemsLibres = ITEMS_PODER.filter((i) => !ubicPoder[i.id]).slice().sort(porTexto);

  const intentarItem = (itemId: string, poder: Poder) => {
    const it = ITEMS_PODER.find((x) => x.id === itemId);
    if (!it || ubicPoder[itemId]) return;
    if (it.poder === poder) {
      setUbicPoder((u) => ({ ...u, [itemId]: poder }));
      setSelItem(null);
      sfxPlace();
      if (Object.keys(ubicPoder).length + 1 >= ITEMS_PODER.length) sfxOk();
    } else {
      setShakePoder(poder);
      sfxNo();
      window.setTimeout(() => setShakePoder(null), 420);
    }
  };
  const resetPoderes = () => {
    setUbicPoder({});
    setSelItem(null);
  };

  // ── modo Conceptos (emparejar concepto → definición) ──────────────────
  const [empConcepto, setEmpConcepto] = useState<Record<string, boolean>>({});
  const [selConcepto, setSelConcepto] = useState<string | null>(null);
  const [shakeConRow, setShakeConRow] = useState<string | null>(null);
  const conceptosLibres = CONCEPTOS.filter((c) => !empConcepto[c.id]).slice().sort(porTermino);

  const intentarConcepto = (conId: string, rowId: string) => {
    if (empConcepto[rowId]) return;
    if (conId === rowId) {
      setEmpConcepto((e) => ({ ...e, [rowId]: true }));
      setSelConcepto(null);
      sfxPlace();
      if (Object.keys(empConcepto).length + 1 >= CONCEPTOS.length) sfxOk();
    } else {
      setShakeConRow(rowId);
      sfxNo();
      window.setTimeout(() => setShakeConRow(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpConcepto({});
    setSelConcepto(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = dentroEstado.length >= NUM_CONSTITUTIVOS;
  const poderesDone = Object.keys(ubicPoder).length >= ITEMS_PODER.length;
  const conceptosDone = Object.keys(empConcepto).length >= CONCEPTOS.length;
  const modosHechos = (casoDone ? 1 : 0) + (armarDone ? 1 : 0) + (poderesDone ? 1 : 0) + (conceptosDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar todos los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Lleva el caso de Las Palmas por las instituciones correctas hasta resolverlo", done: casoDone },
    { txt: "Resuélvelo sin atorar el trámite ni una vez", done: casoDone && atoros === 0 },
    { txt: "Arma el Estado con sus 3 elementos constitutivos", done: armarDone },
    { txt: "Clasifica los cargos en los 3 poderes", done: poderesDone },
    { txt: "Empareja los 5 conceptos con su definición", done: conceptosDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
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
    modo === "texto" ? resetTexto : modo === "armar" ? resetArmar : modo === "poderes" ? resetPoderes : modo === "conceptos" ? resetConceptos : resetCaso;

  const lectura =
    modo === "caso"
      ? casoDone
        ? `Caso resuelto · ${atoros} atoros`
        : `Paso ${paso + 1} de ${PASOS.length} · ${dias} días sin agua`
      : `${modosHechos}/5 · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "caso" && (
        <SimCaso
          accent={accent}
          resueltas={resueltas}
          paso={paso}
          casoDone={casoDone}
          atoros={atoros}
          dias={dias}
          atoroCelda={atoroCelda}
          atoroTexto={atoroTexto}
          onElegir={elegirCelda}
        />
      )}

      {modo === "armar" && (
        <PanelArmar elementosLibres={elementosLibres} dentroEstado={dentroEstado} selEl={selEl} setSelEl={setSelEl} intentarEl={intentarEl} shakeEstado={shakeEstado} rechazo={rechazo} accent={accent} numConstitutivos={NUM_CONSTITUTIVOS} dragProps={dragProps} dropProps={dropProps} />
      )}

      {modo === "poderes" && (
        <PanelPoderes itemsLibres={itemsLibres} ubicPoder={ubicPoder} selItem={selItem} setSelItem={setSelItem} intentarItem={intentarItem} shakePoder={shakePoder} dragProps={dragProps} dropProps={dropProps} />
      )}

      {modo === "conceptos" && (
        <PanelConceptos conceptosLibres={conceptosLibres} empConcepto={empConcepto} selConcepto={selConcepto} setSelConcepto={setSelConcepto} intentarConcepto={intentarConcepto} shakeConRow={shakeConRow} dragProps={dragProps} dropProps={dropProps} />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={ESTADO_MEXICANO_HUECOS}
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
    caso: "Lee qué necesita cada paso: ¿hay que hacer una ley, aplicarla o juzgar? Y luego, ¿en qué nivel: municipio, estado o federación?",
    armar: "El Estado clásico tiene tres elementos: territorio, población y gobierno. Bandera, himno y escudo son símbolos patrios.",
    poderes: "El Ejecutivo aplica las leyes, el Legislativo las hace y el Judicial imparte justicia. Se controlan mutuamente.",
    conceptos: "Lee la definición y elige el concepto. Captura del Estado e impunidad describen fallas del Estado.",
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
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Entiendes cómo se organiza el Estado!" : "Termina todos los modos para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={ESTADO_MEXICANO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Elementos del Estado" icono="fa-cubes-stacked">
                {ELEMENTOS.map((e) => (
                  <div key={e.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{e.nombre}.</strong> {e.detalle}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Los tres poderes" icono="fa-scale-balanced">
                {PODERES_COL.map((p) => (
                  <div key={p} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{PODER_INFO[p].label}.</strong> {PODER_INFO[p].descripcion}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Conceptos clave" icono="fa-link">
                {CONCEPTOS.map((c) => (
                  <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{c.termino}.</strong> {c.definicion}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_ESTADO}</div>
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
  @keyframes estShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes estPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .est-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:12px; }
  .est-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .est-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; transition:all .14s; user-select:none; }
  .est-chip:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .est-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .est-pill { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:#fff; padding:7px 13px; border-radius:999px; border:1px solid ${T.line}; animation:estPop .25s ease; }
  .est-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:14px; min-height:150px; display:flex; flex-direction:column; gap:10px; transition:all .16s; min-width:0; }
  .est-zona { border-radius:18px; border:2.5px dashed ${T.lineStrong}; padding:18px; min-height:180px; display:flex; flex-direction:column; gap:14px; transition:all .16s; }
  .est-zona[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.07); }
  .est-bin[data-shake="true"], .est-zona[data-shake="true"], .est-row[data-shake="true"] { animation:estShake .4s; border-color:${NO}; }
  .est-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; transition:all .16s; }
  .est-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .est-drop { flex-shrink:0; min-width:140px; min-height:44px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; padding:4px 10px; text-align:center; }
  .est-drop[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .est-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .est-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .est-q:disabled{ cursor:default; }
  .est-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .est-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .est-btn:disabled { opacity:.45; cursor:not-allowed; }
  .est-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .est-foto { position:relative; aspect-ratio:16/9; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(79,179,255,0.25), rgba(52,211,153,0.2)); color:rgba(255,255,255,0.4); font-size:30px; }
  .est-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .est-tablero { position:relative; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:10px; }
  .est-tablero svg.est-ruta { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; }
  .est-cabeza { font-size:14px; font-weight:900; text-align:center; text-transform:uppercase; letter-spacing:.06em; padding:6px 4px; border-radius:10px; z-index:1; }
  .est-celda { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; text-align:center;
    padding:10px 6px; min-height:104px; border-radius:14px; border:2px solid ${T.line}; background:#0b1a2c; color:#fff; font-size:14px; font-weight:700;
    line-height:1.25; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; min-width:0; }
  .est-celda:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .est-celda small { font-size:14px; color:${T.text3}; font-weight:700; }
  .est-celda[data-ok="true"] { border-color:${OK}; background:#0c2a22; }
  .est-celda[data-mal="true"] { border-color:${NO}; background:#2a0f14; animation:estShake .4s; }
  .est-celda:disabled { cursor:default; }
  .est-num { position:absolute; top:-9px; left:-9px; width:26px; height:26px; border-radius:50%; background:${OK}; color:#04121f; font-size:14px; font-weight:900;
    display:flex; align-items:center; justify-content:center; }
  .est-aviso { border-radius:16px; padding:14px 16px; display:grid; gap:8px; border:1.5px solid; }
  @media (prefers-reduced-motion: reduce){
    .est-bin[data-shake="true"], .est-zona[data-shake="true"], .est-row[data-shake="true"], .est-celda[data-mal="true"], .est-pill { animation:none; }
    .est-chip, .est-chip:hover, .est-celda, .est-celda:hover:not(:disabled) { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas
 * ═══════════════════════════════════════════════════════════════════════════ */
function Etiqueta({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3 }}>{children}</div>;
}

function Listo({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
      <i className="fa-solid fa-circle-check" aria-hidden /> {children}
    </div>
  );
}

/** Foto con respaldo: si el archivo aún no existe, queda el degradado y el ícono. */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <div className="est-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </div>
  );
}

/** Tinaco de Las Palmas: se llena con cada paso resuelto. */
function Tinaco({ nivel, dias }: { nivel: number; dias: number }) {
  const alto = 110 * nivel;
  return (
    <svg viewBox="0 0 140 170" role="img" aria-label={`Tinaco al ${Math.round(nivel * 100)} por ciento, ${dias} días sin agua`} style={{ width: "100%", maxWidth: 150, height: "auto" }}>
      <rect x="25" y="30" width="90" height="110" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
      <clipPath id="estTinacoClip">
        <rect x="28" y="33" width="84" height="104" rx="11" />
      </clipPath>
      <g clipPath="url(#estTinacoClip)">
        <rect x="25" y={140 - alto} width="90" height={alto} fill={AGUA} style={{ transition: "all .8s cubic-bezier(.2,.8,.2,1)" }} opacity="0.85" />
      </g>
      <rect x="55" y="18" width="30" height="14" rx="5" fill="rgba(255,255,255,0.35)" />
      <path d="M70 140 L70 160" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
      {nivel === 0 && (
        <text x="70" y="92" textAnchor="middle" fontSize="16" fontWeight="900" fill={NO}>
          SIN AGUA
        </text>
      )}
      {nivel >= 1 && (
        <text x="70" y="92" textAnchor="middle" fontSize="18" fontWeight="900" fill="#04121f">
          ¡LLENO!
        </text>
      )}
    </svg>
  );
}

function SimCaso({
  accent,
  resueltas,
  paso,
  casoDone,
  atoros,
  dias,
  atoroCelda,
  atoroTexto,
  onElegir,
}: {
  accent: string;
  resueltas: string[];
  paso: number;
  casoDone: boolean;
  atoros: number;
  dias: number;
  atoroCelda: string | null;
  atoroTexto: string | null;
  onElegir: (id: string) => void;
}) {
  const actual = casoDone ? null : PASOS[paso]!;
  const centro = (c: Celda) => {
    const col = PODERES_COL.indexOf(c.poder);
    const fila = NIVELES.findIndex((n) => n.id === c.nivel);
    return { x: ((col + 0.5) / 3) * 300, y: ((fila + 0.5) / 3) * 300 };
  };
  const puntos = resueltas
    .map((id) => celdaPorId(id))
    .filter((c): c is Celda => !!c)
    .map((c) => {
      const p = centro(c);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  return (
    <>
      <div className="est-panel">
        <Foto clave="las-palmas" icono="fa-faucet-drip" />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 240px", minWidth: 0, display: "grid", gap: 8 }}>
            <Etiqueta>
              {casoDone ? "Caso cerrado" : `Paso ${paso + 1} de ${PASOS.length}`}
            </Etiqueta>
            <div style={{ fontSize: 15, color: T.text, lineHeight: 1.5, fontWeight: 700 }}>
              {actual ? actual.situacion : "El agua volvió a Las Palmas. Recorriste los tres poderes y los tres niveles de gobierno en el orden que pedía el problema."}
            </div>
            {paso > 0 && (
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-circle-check" aria-hidden style={{ color: OK, marginRight: 8 }} />
                {PASOS[paso - 1]!.resuelto}
              </div>
            )}
          </div>
          <div style={{ flex: "0 1 150px", display: "grid", justifyItems: "center", gap: 4 }}>
            <Tinaco nivel={resueltas.length / PASOS.length} dias={dias} />
            <div style={{ fontSize: 14, fontWeight: 800, color: casoDone ? OK : atoros > 0 ? NO : T.text2, textAlign: "center" }}>
              {casoDone ? "Agua restablecida" : `${dias} días sin agua`}
            </div>
            <div style={{ fontSize: 14, color: T.text3 }}>simulación</div>
          </div>
        </div>
      </div>

      <div className="est-panel">
        <Etiqueta>
          <i className="fa-solid fa-map" aria-hidden style={{ color: accent, marginRight: 8 }} />
          {casoDone ? "El camino del expediente" : "Toca la institución que debe actuar"}
        </Etiqueta>
        <div className="est-tablero">
          {PODERES_COL.map((p) => (
            <div key={p} className="est-cabeza" style={{ background: `${PODER_INFO[p].color}22`, color: PODER_INFO[p].color }}>
              {PODER_INFO[p].label.replace("Poder ", "")}
            </div>
          ))}
        </div>
        <div className="est-tablero" style={{ gridAutoRows: "minmax(104px, auto)" }}>
          <svg className="est-ruta" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden>
            {resueltas.length > 1 && <polyline points={puntos} fill="none" stroke={OK} strokeWidth="4" strokeDasharray="8 6" vectorEffect="non-scaling-stroke" />}
          </svg>
          {NIVELES.flatMap((n) =>
            PODERES_COL.map((p) => {
              const c = CELDAS.find((x) => x.nivel === n.id && x.poder === p)!;
              const idx = resueltas.indexOf(c.id);
              return (
                <button
                  key={c.id}
                  className="est-celda"
                  data-ok={idx >= 0}
                  data-mal={atoroCelda === c.id}
                  disabled={casoDone || idx >= 0}
                  onClick={() => onElegir(c.id)}
                  aria-label={`${c.nombre}, nivel ${n.label}`}
                >
                  {idx >= 0 && <span className="est-num">{idx + 1}</span>}
                  <i className={`fa-solid ${c.icono}`} aria-hidden style={{ fontSize: 20, color: PODER_INFO[p].color }} />
                  <span>{c.nombre}</span>
                  <small>{n.label}</small>
                </button>
              );
            })
          )}
        </div>
      </div>

      {atoroTexto && !casoDone && (
        <div className="est-aviso" role="alert" style={{ borderColor: NO, background: `${NO}14` }}>
          <strong style={{ color: NO, fontSize: 15 }}>
            <i className="fa-solid fa-hourglass-half" aria-hidden style={{ marginRight: 8 }} />
            Expediente atorado: +{DIAS_POR_ATORO} días sin agua (simulación)
          </strong>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{atoroTexto}</div>
        </div>
      )}
      {casoDone && (
        <div className="est-aviso" role="status" style={{ borderColor: OK, background: `${OK}12` }}>
          <strong style={{ color: OK, fontSize: 15 }}>
            <i className="fa-solid fa-circle-check" aria-hidden style={{ marginRight: 8 }} />
            {PASOS[PASOS.length - 1]!.resuelto}
          </strong>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            {atoros === 0
              ? "Sin un solo atoro: cada paso llegó a la institución que le tocaba. Esa es la división de poderes funcionando."
              : `Se atoró ${atoros} ${atoros === 1 ? "vez" : "veces"} (+${atoros * DIAS_POR_ATORO} días). Reinicia y busca el camino sin atorarlo.`}
          </div>
        </div>
      )}
    </>
  );
}

function PanelArmar({
  elementosLibres,
  dentroEstado,
  selEl,
  setSelEl,
  intentarEl,
  shakeEstado,
  rechazo,
  accent,
  numConstitutivos,
  dragProps,
  dropProps,
}: {
  elementosLibres: typeof ELEMENTOS;
  dentroEstado: string[];
  selEl: string | null;
  setSelEl: (f: (s: string | null) => string | null) => void;
  intentarEl: (id: string) => void;
  shakeEstado: boolean;
  rechazo: string | null;
  accent: string;
  numConstitutivos: number;
  dragProps: DragF;
  dropProps: DropF;
}) {
  return (
    <Mesa>
      <div className="est-panel">
        <Etiqueta>Candidatos · {dentroEstado.length}/{numConstitutivos}</Etiqueta>
        <div style={{ fontSize: 14, color: T.text2 }}>Cuidado: hay distractores que parecen parte del Estado.</div>
        {elementosLibres.length === 0 ? (
          <Listo>¡Solo quedaron los elementos correctos!</Listo>
        ) : (
          elementosLibres.map((e) => (
            <button key={e.id} className="est-chip" data-sel={selEl === e.id} onClick={() => setSelEl((s) => (s === e.id ? null : e.id))} {...dragProps(e.id)}>
              <i className={`fa-solid ${e.icono}`} aria-hidden />
              {e.nombre}
            </button>
          ))
        )}
      </div>
      <div
        className="est-zona"
        data-shake={shakeEstado}
        data-armed={!!selEl}
        onClick={() => selEl && intentarEl(selEl)}
        {...dropProps((id) => intentarEl(id))}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <i className="fa-solid fa-building-columns" aria-hidden style={{ color: accent, fontSize: 22 }} />
          <div>
            <strong style={{ fontSize: 17 }}>El Estado</strong>
            <div style={{ fontSize: 14, color: T.text3 }}>Suelta aquí sus elementos constitutivos</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {ELEMENTOS.filter((e) => dentroEstado.includes(e.id)).map((d) => (
            <span key={d.id} className="est-pill" style={{ background: `${OK}26`, borderColor: `${OK}66` }}>
              <i className={`fa-solid ${d.icono}`} aria-hidden /> {d.nombre}
            </span>
          ))}
          {dentroEstado.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Aún no has colocado ningún elemento…</span>}
        </div>
        {rechazo && (
          <div style={{ fontSize: 14, lineHeight: 1.45, display: "flex", gap: 9, padding: "10px 13px", borderRadius: 10, background: `${NO}1c`, border: `1px solid ${NO}55` }}>
            <i className="fa-solid fa-triangle-exclamation" aria-hidden style={{ color: NO, marginTop: 3 }} />
            <span>{rechazo}</span>
          </div>
        )}
      </div>
    </Mesa>
  
  );
}

function PanelPoderes({
  itemsLibres,
  ubicPoder,
  selItem,
  setSelItem,
  intentarItem,
  shakePoder,
  dragProps,
  dropProps,
}: {
  itemsLibres: typeof ITEMS_PODER;
  ubicPoder: Record<string, Poder>;
  selItem: string | null;
  setSelItem: (f: (s: string | null) => string | null) => void;
  intentarItem: (id: string, p: Poder) => void;
  shakePoder: Poder | null;
  dragProps: DragF;
  dropProps: DropF;
}) {
  return (
    <Mesa>
      <div className="est-panel">
        <Etiqueta>Cargos y funciones · {Object.keys(ubicPoder).length}/{ITEMS_PODER.length}</Etiqueta>
        {itemsLibres.length === 0 ? (
          <Listo>¡Clasificaste los {ITEMS_PODER.length} elementos!</Listo>
        ) : (
          itemsLibres.map((it) => (
            <button key={it.id} className="est-chip" data-sel={selItem === it.id} onClick={() => setSelItem((s) => (s === it.id ? null : it.id))} {...dragProps(it.id)}>
              <i className={`fa-solid ${it.esFuncion ? "fa-gears" : "fa-user"}`} aria-hidden />
              {it.texto}
            </button>
          ))
        )}
      </div>
      <div className="est-grid">
        {PODERES_COL.map((poder) => {
          const info = PODER_INFO[poder];
          const dentro = ITEMS_PODER.filter((i) => ubicPoder[i.id] === poder);
          return (
            <div
              key={poder}
              className="est-bin"
              data-shake={shakePoder === poder}
              onClick={() => selItem && intentarItem(selItem, poder)}
              {...dropProps((id) => intentarItem(id, poder))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <i className={`fa-solid ${info.icono}`} aria-hidden style={{ color: info.color, fontSize: 18 }} />
                <strong style={{ fontSize: 15 }}>{info.label}</strong>
              </div>
              <div style={{ fontSize: 14, color: T.text2 }}>{info.descripcion}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((d) => (
                  <span key={d.id} className="est-pill" style={{ background: `${info.color}26`, borderColor: `${info.color}55` }}>
                    {d.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Suelta aquí…</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Mesa>
  
  );
}

function PanelConceptos({
  conceptosLibres,
  empConcepto,
  selConcepto,
  setSelConcepto,
  intentarConcepto,
  shakeConRow,
  dragProps,
  dropProps,
}: {
  conceptosLibres: typeof CONCEPTOS;
  empConcepto: Record<string, boolean>;
  selConcepto: string | null;
  setSelConcepto: (f: (s: string | null) => string | null) => void;
  intentarConcepto: (a: string, b: string) => void;
  shakeConRow: string | null;
  dragProps: DragF;
  dropProps: DropF;
}) {
  return (
    <Mesa>
      <div className="est-panel">
        <Etiqueta>Conceptos · {Object.keys(empConcepto).length}/{CONCEPTOS.length}</Etiqueta>
        {conceptosLibres.length === 0 ? (
          <Listo>¡Emparejaste los {CONCEPTOS.length} conceptos!</Listo>
        ) : (
          conceptosLibres.map((c) => (
            <button key={c.id} className="est-chip" data-sel={selConcepto === c.id} onClick={() => setSelConcepto((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
              <i className="fa-solid fa-tag" aria-hidden />
              {c.termino}
            </button>
          ))
        )}
      </div>
      <div style={{ display: "grid", gap: 11 }}>
        {CONCEPTOS.map((c) => {
          const done = empConcepto[c.id];
          return (
            <div
              key={c.id}
              className="est-row"
              data-shake={shakeConRow === c.id}
              data-done={done}
              onClick={() => !done && selConcepto && intentarConcepto(selConcepto, c.id)}
              {...dropProps((id) => intentarConcepto(id, c.id))}
            >
              <div className="est-drop" data-armed={!done && !!selConcepto}>
                {done ? <strong>{c.termino}</strong> : <span>concepto</span>}
              </div>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.definicion}</div>
            </div>
          );
        })}
      </div>
    </Mesa>
  
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (pestaña Reto)
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
    <div style={{ display: "grid", gap: 16 }}>
      <style>{ESTILOS(accent, rgba)}</style>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        Cinco preguntas sobre el Estado, los poderes y la ciudadanía.
        {aprobado && <strong style={{ color: OK }}> Aprobado.</strong>}
      </div>
      {QUIZ.map((q, qi) => {
        const elegida = resp[qi];
        return (
          <div key={qi}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 10 }}>
              <span style={{ color: accent }}>{qi + 1}.</span> {q.pregunta}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
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
                  <button key={oi} className="est-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                    <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: "1.5px solid currentColor" }}>
                      {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                  </button>
                );
              })}
            </div>
            {comprobado && (
              <div style={{ marginTop: 8, fontSize: 14, color: T.text2, lineHeight: 1.5, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                {q.retro}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="est-btn est-btn-main" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" /> Comprobar
          </button>
        ) : (
          <button className="est-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" /> Reintentar
          </button>
        )}
        {comprobado && (
          <strong style={{ fontSize: 14, color: aprobadoAhora ? OK : NO }}>
            {aciertos} / {total} correctas{!aprobadoAhora && " · revisa las marcadas"}
          </strong>
        )}
      </div>
    </div>
  );
}
