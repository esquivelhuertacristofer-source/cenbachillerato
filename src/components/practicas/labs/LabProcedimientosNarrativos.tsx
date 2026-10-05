"use client";

/**
 * Laboratorio — Procedimientos narrativos
 * Práctica experimental para LC-II-P07 (Lengua y Comunicación II).
 *
 * Aquí no se trabaja de qué trata un relato ni cómo se corrige: se trabaja LA
 * MAQUINARIA con la que está hecho. Seis modos:
 *
 *  1. «Historia y discurso» — el orden de los hechos frente al orden en que se
 *     cuentan. El alumno reconstruye la cronología de dos relatos de taller y
 *     después nombra qué hace cada párrafo con el tiempo: seguir la línea,
 *     retroceder (analepsis) o adelantarse (prolepsis).
 *  2. «Quién cuenta» — la MISMA escena en tres voces (primera persona, testigo
 *     y omnisciente) y siete datos que repartir: quién puede contarlos y quién
 *     se queda sin ellos.
 *  3. «El ritmo» — resumen, escena, elipsis y pausa descriptiva: ocho
 *     fragmentos que medir contra el reloj de la historia.
 *  4. «Directo o indirecto» — cuatro diálogos que convertir pieza por pieza:
 *     conector, deíctico, pronombre y verbo; el último pasa de indirecto a
 *     indirecto libre quitando el andamio.
 *  5. «Escribe el término» — el glosario, tecleado de memoria.
 *  6. «Completa el texto» — el fill_blanks verbatim de A6.
 *  + Reto evaluable con el quiz verbatim de A2 (la actividad ancla).
 *
 * DOM puro (sin three.js): en Lengua el 3D sería decoración; lo que hay que ver
 * aquí son dos líneas de tiempo cruzándose y un texto cambiando de forma.
 * Funciona con ratón, teclado y pantalla táctil (clic para seleccionar / clic
 * para colocar, además del arrastre nativo).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { PROCEDIMIENTOS_NARRATIVOS_FICHA } from "./procedimientos-narrativos-ficha";
import { PROCEDIMIENTOS_NARRATIVOS_HUECOS } from "./procedimientos-narrativos-huecos";
import {
  CUENTO,
  CUENTO_TITULO,
  NARRADORES,
  ORDEN_CRONOLOGICO,
  RUTA_FOTOS_NARRATIVA,
  evaluar,
  mover,
  narradorDe,
  puedeContar,
  reaccionLectora,
  type Resultado,
} from "./procedimientos-narrativos-sim";
import {
  RELATOS,
  MARCA_INFO,
  VOZ_INFO,
  ESCENA_VOCES,
  QUIEN_INFO,
  INFORMACIONES,
  RITMO_INFO,
  FRAGMENTOS_RITMO,
  ESTILO_INFO,
  CONVERSIONES,
  LECTURA_A1,
  DATO_DEM,
  HECHOS,
  PARES,
  QUIZ,
  NOTA_PIE,
  type Marca,
  type Voz,
  type Quien,
  type Ritmo,
  type RelatoDoble,
  type ParrafoDiscurso,
  type Conversion,
} from "./procedimientos-narrativos-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-procedimientos-narrativos-reto";

type Modo = "taller" | "orden" | "voz" | "ritmo" | "dialogo" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "Taller del relato", icono: "fa-clapperboard" },
  { id: "orden", label: "Historia y discurso", icono: "fa-timeline" },
  { id: "voz", label: "Quién cuenta", icono: "fa-masks-theater" },
  { id: "ritmo", label: "El ritmo del relato", icono: "fa-gauge-high" },
  { id: "dialogo", label: "Directo o indirecto", icono: "fa-comments" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const MARCAS: Marca[] = ["sigue", "analepsis", "prolepsis"];
const VOCES: Voz[] = ["primera", "testigo", "omnisciente"];
const QUIENES: Quien[] = ["irene", "chuy", "omni", "todas"];
const RITMOS: Ritmo[] = ["resumen", "escena", "elipsis", "pausa"];

interface Aviso {
  ok: boolean;
  texto: string;
}

export function LabProcedimientosNarrativos({ color }: PracticaLabProps) {
  const accent = color.hex;
  const [modo, setModo] = useState<Modo>("taller");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
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
  // Todos los aciertos y todos los fallos pasan por estos tres ayudantes, así
  // que la contabilidad de la partida se lleva aquí. `sfxOk` no cuenta: marca
  // el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ── MODO 0 — taller del relato (simulador) ─────────────────────────── */
  const [orden, setOrden] = useState<string[]>(ORDEN_CRONOLOGICO);
  const [narr, setNarr] = useState<Voz>("primera");
  const [narrProbados, setNarrProbados] = useState<Record<string, boolean>>({ primera: true });
  const [mejorSorpresa, setMejorSorpresa] = useState(0);
  const resTaller = evaluar(orden, narr);
  const tallerRegistra = (r: Resultado) => {
    if (r.sorpresa >= 7 && mejorSorpresa < 7) sfxPlace();
    else if (sonido) void audioRef.current?.blip();
    setMejorSorpresa((m) => Math.max(m, r.sorpresa));
  };
  const cambiarNarr = (v: Voz) => {
    setNarr(v);
    setNarrProbados((prev) => ({ ...prev, [v]: true }));
    tallerRegistra(evaluar(orden, v));
  };
  const moverEscena = (id: string, delta: -1 | 1) => {
    const nuevo = mover(orden, id, delta);
    if (nuevo === orden) return;
    setOrden(nuevo);
    tallerRegistra(evaluar(nuevo, narr));
  };
  const resetTaller = () => {
    setOrden(ORDEN_CRONOLOGICO);
    setNarr("primera");
  };

  /* ── MODO 1 — historia contra discurso ──────────────────────────────── */
  const [relatoIdx, setRelatoIdx] = useState(0);
  const relato: RelatoDoble = RELATOS[relatoIdx] ?? RELATOS[0]!;
  const [puestos, setPuestos] = useState<Record<string, (string | null)[]>>({});
  const [marcados, setMarcados] = useState<Record<string, Record<string, Marca>>>({});
  const [selParrafo, setSelParrafo] = useState<string | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const [shakeParrafo, setShakeParrafo] = useState<string | null>(null);
  const [avisoOrden, setAvisoOrden] = useState<Aviso | null>(null);

  const slotsDe = (r: RelatoDoble): (string | null)[] => puestos[r.id] ?? r.parrafos.map(() => null);
  const marcasDe = (r: RelatoDoble): Record<string, Marca> => marcados[r.id] ?? {};
  const ordenListo = (r: RelatoDoble) => slotsDe(r).every((s) => s !== null);
  const marcasListas = (r: RelatoDoble) => r.parrafos.every((p) => marcasDe(r)[p.id] === p.marca);
  const slots = slotsDe(relato);
  const marcasRelato = marcasDe(relato);
  const colocados = slots.filter((s) => s !== null).length;
  const fase: "orden" | "marcas" | "fin" = !ordenListo(relato) ? "orden" : !marcasListas(relato) ? "marcas" : "fin";

  const colocar = (parrafoId: string, slotIdx: number) => {
    const p = relato.parrafos.find((x) => x.id === parrafoId);
    if (!p) return;
    const actuales = slotsDe(relato);
    if (actuales[slotIdx] !== null || actuales.includes(parrafoId)) return;
    if (p.historia === slotIdx + 1) {
      const nuevo = [...actuales];
      nuevo[slotIdx] = parrafoId;
      setPuestos((v) => ({ ...v, [relato.id]: nuevo }));
      setSelParrafo(null);
      setAvisoOrden({ ok: true, texto: `Correcto. ${p.hecho}` });
      sfxPlace();
      if (nuevo.every((s) => s !== null)) sfxOk();
    } else {
      setShakeSlot(slotIdx);
      setAvisoOrden({
        ok: false,
        texto: "Ahí no: ese párrafo no es el hecho que ocupa ese lugar en la historia. Fíjate en las marcas de tiempo («tres años antes», «a las seis», «en marzo»).",
      });
      sfxNo();
      window.setTimeout(() => setShakeSlot(null), 420);
    }
  };

  const marcar = (parrafo: ParrafoDiscurso, marca: Marca) => {
    if (marcasDe(relato)[parrafo.id] === parrafo.marca) return;
    if (parrafo.marca === marca) {
      const nuevo = { ...marcasDe(relato), [parrafo.id]: marca };
      setMarcados((v) => ({ ...v, [relato.id]: nuevo }));
      setAvisoOrden({ ok: true, texto: parrafo.porque });
      sfxPlace();
      if (relato.parrafos.every((p) => nuevo[p.id] === p.marca)) sfxOk();
    } else {
      setShakeParrafo(parrafo.id);
      setAvisoOrden({ ok: false, texto: `Todavía no. ${MARCA_INFO[marca].pista}` });
      sfxNo();
      window.setTimeout(() => setShakeParrafo(null), 420);
    }
  };

  const resetOrden = () => {
    setPuestos((v) => ({ ...v, [relato.id]: relato.parrafos.map(() => null) }));
    setMarcados((v) => ({ ...v, [relato.id]: {} }));
    setSelParrafo(null);
    setAvisoOrden(null);
  };

  /* ── MODO 2 — quién cuenta ──────────────────────────────────────────── */
  const [vozSel, setVozSel] = useState<Voz>("primera");
  const [leidas, setLeidas] = useState<Record<string, boolean>>({ primera: true });
  const [respInfo, setRespInfo] = useState<Record<string, Quien>>({});
  const [shakeInfo, setShakeInfo] = useState<string | null>(null);
  const [avisoVoz, setAvisoVoz] = useState<Aviso | null>(null);
  const vocesLeidas = VOCES.filter((v) => leidas[v] === true).length;
  const infosResueltas = INFORMACIONES.filter((i) => respInfo[i.id] === i.quien).length;

  const elegirVoz = (v: Voz) => {
    setVozSel(v);
    setLeidas((prev) => ({ ...prev, [v]: true }));
  };

  const elegirQuien = (infoId: string, quien: Quien) => {
    const info = INFORMACIONES.find((i) => i.id === infoId);
    if (!info || respInfo[infoId] === info.quien) return;
    if (info.quien === quien) {
      const nuevo = { ...respInfo, [infoId]: quien };
      setRespInfo(nuevo);
      setAvisoVoz({ ok: true, texto: info.porque });
      sfxPlace();
      if (INFORMACIONES.every((i) => nuevo[i.id] === i.quien)) sfxOk();
    } else {
      setShakeInfo(infoId);
      setAvisoVoz({ ok: false, texto: "Todavía no. Vuelve a leer las tres versiones: fíjate en qué dice cada una y, sobre todo, en qué no puede decir." });
      sfxNo();
      window.setTimeout(() => setShakeInfo(null), 420);
    }
  };

  const resetVoz = () => {
    setRespInfo({});
    setAvisoVoz(null);
    setVozSel("primera");
    setLeidas({ primera: true });
  };

  /* ── MODO 3 — ritmo ─────────────────────────────────────────────────── */
  const [ubicRitmo, setUbicRitmo] = useState<Record<string, Ritmo>>({});
  const [selFragR, setSelFragR] = useState<string | null>(null);
  const [shakeRitmo, setShakeRitmo] = useState<Ritmo | null>(null);
  const [avisoRitmo, setAvisoRitmo] = useState<Aviso | null>(null);
  const ritmoDone = FRAGMENTOS_RITMO.every((f) => ubicRitmo[f.id] === f.ritmo);
  const fragsLibres = FRAGMENTOS_RITMO.filter((f) => !ubicRitmo[f.id]);

  const clasificarRitmo = (fragId: string, ritmo: Ritmo) => {
    const f = FRAGMENTOS_RITMO.find((x) => x.id === fragId);
    if (!f || ubicRitmo[fragId]) return;
    if (f.ritmo === ritmo) {
      const nuevo = { ...ubicRitmo, [fragId]: ritmo };
      setUbicRitmo(nuevo);
      setSelFragR(null);
      setAvisoRitmo({ ok: true, texto: f.porque });
      sfxPlace();
      if (FRAGMENTOS_RITMO.every((x) => nuevo[x.id] === x.ritmo)) sfxOk();
    } else {
      setShakeRitmo(ritmo);
      setAvisoRitmo({ ok: false, texto: `Ahí no. ${RITMO_INFO[ritmo].titulo}: ${RITMO_INFO[ritmo].formula}. Pregúntate cuánto tiempo de historia cabe en ese texto.` });
      sfxNo();
      window.setTimeout(() => setShakeRitmo(null), 420);
    }
  };

  const resetRitmo = () => {
    setUbicRitmo({});
    setSelFragR(null);
    setAvisoRitmo(null);
  };

  /* ── MODO 4 — diálogo y discurso ────────────────────────────────────── */
  const [convIdx, setConvIdx] = useState(0);
  const conv: Conversion = CONVERSIONES[convIdx] ?? CONVERSIONES[0]!;
  const [elegidos, setElegidos] = useState<Record<string, Record<string, number>>>({});
  const [shakeSlotDlg, setShakeSlotDlg] = useState<string | null>(null);
  const [avisoDlg, setAvisoDlg] = useState<Aviso | null>(null);
  const eleccionesDe = (c: Conversion): Record<string, number> => elegidos[c.id] ?? {};
  const convListo = (c: Conversion) => c.slots.every((s) => eleccionesDe(c)[s.id] !== undefined);
  const dialogoDone = CONVERSIONES.every((c) => convListo(c));
  const convsHechas = CONVERSIONES.filter((c) => convListo(c)).length;

  const elegirOpcion = (slotId: string, iOpcion: number) => {
    const slot = conv.slots.find((s) => s.id === slotId);
    const op = slot?.opciones[iOpcion];
    if (!slot || !op) return;
    if (eleccionesDe(conv)[slotId] !== undefined) return;
    if (op.ok) {
      const nuevo = { ...eleccionesDe(conv), [slotId]: iOpcion };
      setElegidos((v) => ({ ...v, [conv.id]: nuevo }));
      setAvisoDlg({ ok: true, texto: op.porque });
      sfxPlace();
      if (conv.slots.every((s) => nuevo[s.id] !== undefined)) sfxOk();
    } else {
      setShakeSlotDlg(slotId);
      setAvisoDlg({ ok: false, texto: op.porque });
      sfxNo();
      window.setTimeout(() => setShakeSlotDlg(null), 420);
    }
  };

  const resetDialogo = () => {
    setElegidos((v) => ({ ...v, [conv.id]: {} }));
    setAvisoDlg(null);
  };

  /* ── MODO 5 — glosario que se escribe ───────────────────────────────── */
  // El contador hace de `key`: subirlo remonta el componente y deja las
  // tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  /* ── MODO 6 — completa el texto ─────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  const resetActual =
    modo === "texto" ? resetTexto : modo === "taller" ? resetTaller : modo === "glosario" ? resetGlosario : modo === "orden" ? resetOrden : modo === "voz" ? resetVoz : modo === "ritmo" ? resetRitmo : resetDialogo;

  /* ── progreso ───────────────────────────────────────────────────────── */
  const r0 = RELATOS[0]!;
  const r1 = RELATOS[1]!;
  const objetivos = [
    { txt: `Cuenta «${CUENTO_TITULO}» con los tres narradores y compara qué escenas puede contar cada uno`, done: NARRADORES.every((n) => narrProbados[n.id] === true) },
    { txt: "Reordena las escenas hasta lograr una sorpresa de 7 o más en el giro", done: mejorSorpresa >= 7 },
    { txt: `Reconstruye el orden de los hechos de «${r0.titulo}»`, done: ordenListo(r0) },
    { txt: `Nombra el procedimiento de cada párrafo de «${r0.titulo}»`, done: marcasListas(r0) },
    { txt: `Reconstruye el orden de los hechos de «${r1.titulo}»`, done: ordenListo(r1) },
    { txt: `Nombra el procedimiento de cada párrafo de «${r1.titulo}»`, done: marcasListas(r1) },
    { txt: "Lee la escena del apagón en las tres voces", done: vocesLeidas >= 3 },
    { txt: `Reparte los ${INFORMACIONES.length} datos entre las voces que pueden darlos`, done: infosResueltas >= INFORMACIONES.length },
    { txt: `Clasifica los ${FRAGMENTOS_RITMO.length} fragmentos por su ritmo`, done: ritmoDone },
    { txt: `Resuelve las ${CONVERSIONES.length} conversiones de diálogo`, done: dialogoDone },
    { txt: `Escribe los ${PARES.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Aprueba el reto evaluable (${QUIZ.puntajeMinimo}%)`, done: quizAprobado },
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
    "data-zona": "true" as const,
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
  });

  const aviso = modo === "orden" ? avisoOrden : modo === "voz" ? avisoVoz : modo === "ritmo" ? avisoRitmo : modo === "dialogo" ? avisoDlg : null;

  const lecturas: Record<Modo, string> = {
    taller: `Sorpresa ${resTaller.sorpresa}/10 con ${narradorDe(narr).corto.toLowerCase()}.`,
    orden: "Historia es cuándo pasó; discurso, cuándo se cuenta.",
    voz: "Elegir narrador es elegir qué ignora el lector.",
    ritmo: "Compara el reloj de la historia con el del texto.",
    dialogo: "Cambia conector, deícticos, pronombres y tiempo verbal.",
    glosario: "Lee la definición y escribe el término.",
    texto: "Completa los huecos con la palabra que corresponde.",
  };

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
      lectura={lecturas[modo]}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <style>{`
        @keyframes prnShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes prnPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .prn-chip { cursor:grab; display:flex; align-items:flex-start; gap:10px; padding:12px 15px; border-radius:13px; text-align:left;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:600; transition:all .14s; user-select:none; width:100%; line-height:1.55; }
        .prn-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .prn-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .prn-chip:active { cursor:grabbing; }
        .prn-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 15px; transition:all .16s; display:flex; align-items:flex-start; gap:13px; }
        .prn-row[data-shake="true"] { animation:prnShake .4s; border-color:${NO}; }
        .prn-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .prn-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:12px 14px;
          display:flex; align-items:center; gap:10px; color:${T.text3}; font-size:14px; transition:all .16s; min-height:52px; text-align:left; width:100%; }
        .prn-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; cursor:pointer; }
        .prn-slot[data-shake="true"] { animation:prnShake .4s; border-color:${NO}; }
        .prn-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:190px; text-align:left; width:100%; }
        .prn-bin[data-shake="true"] { animation:prnShake .4s; border-color:${NO}; }
        .prn-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .prn-btn:hover { border-color:${T.lineStrong}; }
        .prn-btn:disabled { opacity:.45; cursor:default; }
        .prn-seg { cursor:pointer; flex:1; padding:11px 12px; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; text-align:center; min-width:130px; }
        .prn-seg:hover { border-color:${T.lineStrong}; color:#fff; }
        .prn-seg[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .prn-mini { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; border-radius:9px;
          padding:6px 12px; font-size:14px; font-weight:800; transition:all .14s; }
        .prn-mini[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
        .prn-mini:hover { border-color:${T.lineStrong}; color:#fff; }
        .prn-marca { cursor:pointer; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text2}; border-radius:10px;
          padding:6px 11px; font-size:14px; font-weight:800; transition:all .14s; white-space:nowrap; }
        .prn-marca:hover { border-color:${T.lineStrong}; color:#fff; }
        .prn-marca:disabled { cursor:default; }
        .prn-opt { cursor:pointer; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; border-radius:10px;
          padding:7px 12px; font-size:14px; font-weight:700; font-family:inherit; transition:all .14s; }
        .prn-opt:hover { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .prn-opt:disabled { cursor:default; opacity:.4; }
        .prn-hueco { display:inline-flex; align-items:center; gap:7px; border-radius:9px; padding:2px 10px; font-weight:800;
          border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:${T.text3}; }
        .prn-hueco[data-done="true"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .prn-hueco[data-shake="true"] { animation:prnShake .4s; border-color:${NO}; }
        .prn-divider { height:1px; background:${T.line}; margin:16px 0; }
        @media (max-width: 1100px){ .prn-banda { grid-template-columns:minmax(0,1fr) !important; } }
        @media (max-width: 980px){ .prn-grid { grid-template-columns:minmax(0,1fr) !important; } .prn-dos { grid-template-columns:minmax(0,1fr) !important; } }
        @media (prefers-reduced-motion: reduce){ .prn-row[data-shake="true"], .prn-bin[data-shake="true"], .prn-slot[data-shake="true"], .prn-hueco[data-shake="true"] { animation:none; } }

        /* Identidad del tablero */
        .prn-bin, .prn-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .prn-bin:nth-of-type(6n+1), .prn-row:nth-of-type(6n+1) { --tono:188; }
        .prn-bin:nth-of-type(6n+2), .prn-row:nth-of-type(6n+2) { --tono:262; }
        .prn-bin:nth-of-type(6n+3), .prn-row:nth-of-type(6n+3) { --tono:44; }
        .prn-bin:nth-of-type(6n+4), .prn-row:nth-of-type(6n+4) { --tono:152; }
        .prn-bin:nth-of-type(6n+5), .prn-row:nth-of-type(6n+5) { --tono:330; }
        .prn-bin:nth-of-type(6n+6), .prn-row:nth-of-type(6n+6) { --tono:18; }
        .prn-bin::before, .prn-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .prn-bin[data-done="true"], .prn-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .prn-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .prn-chip:hover { transform:translateY(-2px); }
        .prn-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .prn-chip, .prn-chip:hover, .prn-chip[data-sel="true"] { transform:none; transition:none; }
        }

        /* Taller del relato */
        .prn-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
        .prn-med { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
        .prn-med > span { font-size:14px; font-weight:800; color:${T.text2}; display:flex; justify-content:space-between; gap:8px; }
        .prn-med > span strong { color:#fff; font-variant-numeric:tabular-nums; }
        .prn-med-barra { height:9px; border-radius:6px; background:${T.inset}; overflow:hidden; }
        .prn-med-barra > div { height:100%; border-radius:6px; transition:width .35s ease; }
        .prn-curva { border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; padding:10px 12px 8px; }
        .prn-curva svg { display:block; width:100%; height:auto; }
        .prn-curva-eje { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:2px; text-align:center; font-size:14px; font-weight:800; color:${T.text2}; }
        .prn-reaccion { display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; font-size:15px; line-height:1.5; color:${T.text2}; }
        .prn-reaccion > i { font-size:30px; flex-shrink:0; }
        .prn-reaccion strong { display:block; color:#fff; font-size:16px; }
        .prn-guion { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:12px; }
        .prn-esc { display:flex; flex-direction:column; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; overflow:hidden; min-width:0; }
        .prn-esc[data-fuera="true"] { opacity:.72; border-style:dashed; }
        .prn-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:34px; color:rgba(255,255,255,0.55);
          background:linear-gradient(135deg, rgba(${color.rgba},0.35), rgba(8,19,31,0.95)); overflow:hidden; }
        .prn-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
        .prn-esc[data-fuera="true"] .prn-foto img { filter:grayscale(1) brightness(.5); }
        .prn-num { position:absolute; left:8px; top:8px; min-width:28px; height:28px; border-radius:14px; background:rgba(2,12,28,.85); color:#fff; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; padding:0 8px; z-index:1; }
        .prn-esc-cuerpo { padding:10px 12px; display:flex; flex-direction:column; gap:8px; flex:1; }
        .prn-esc-cuerpo h5 { margin:0; font-size:15px; color:#fff; font-weight:800; }
        .prn-esc-cuerpo p { margin:0; font-size:14px; line-height:1.5; color:${T.text2}; }
        .prn-marcaje { align-self:flex-start; display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:9px; font-size:14px; font-weight:800; }
        .prn-esc-mov { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; padding:0 12px 12px; }
        .prn-esc-mov button { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:40px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff; font-size:14px; font-weight:800; }
        .prn-esc-mov button:hover:not(:disabled) { border-color:${accent}; }
        .prn-esc-mov button:disabled { opacity:.35; cursor:default; }
        @media (prefers-reduced-motion: reduce){ .prn-med-barra > div { transition:none; } }
      `}</style>

          {/* MODO — taller del relato (simulador) */}
          {modo === "taller" && (
            <TallerRelato
              orden={orden}
              narrador={narr}
              resultado={resTaller}
              probados={narrProbados}
              onNarrador={cambiarNarr}
              onMover={moverEscena}
            />
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de A6) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={PROCEDIMIENTOS_NARRATIVOS_HUECOS}
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

          {/* MODO — glosario que se escribe */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y su ejemplo y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {/* MODO — historia contra discurso */}
          {modo === "orden" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  {RELATOS.map((r, i) => (
                    <button
                      key={r.id}
                      className="prn-mini"
                      data-on={relatoIdx === i}
                      onClick={() => {
                        setRelatoIdx(i);
                        setSelParrafo(null);
                        setAvisoOrden(null);
                      }}
                    >
                      <i className="fa-solid fa-book-bookmark" style={{ marginRight: 7 }} />
                      {r.titulo}
                      {ordenListo(r) && marcasListas(r) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: fase === "fin" ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                    {fase === "orden"
                      ? `${colocados}/${relato.parrafos.length} hechos colocados`
                      : `${relato.parrafos.filter((p) => marcasRelato[p.id] === p.marca).length}/${relato.parrafos.length} procedimientos nombrados`}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  {relato.ficha}
                </div>
              </div>

              <div className="prn-dos" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
                <ColumnaDiscurso
                  relato={relato}
                  slots={slots}
                  marcasRelato={marcasRelato}
                  fase={fase}
                  selParrafo={selParrafo}
                  shakeParrafo={shakeParrafo}
                  onSel={(id) => setSelParrafo((s) => (s === id ? null : id))}
                  onMarcar={marcar}
                  dragProps={dragProps}
                />
                <ColumnaHistoria
                  relato={relato}
                  slots={slots}
                  selParrafo={selParrafo}
                  shakeSlot={shakeSlot}
                  fase={fase}
                  onSlot={(i) => {
                    if (selParrafo) colocar(selParrafo, i);
                  }}
                  onDropSlot={(id, i) => colocar(id, i)}
                  dropProps={dropProps}
                />
              </div>
            </>
          )}

          {/* MODO — quién cuenta */}
          {modo === "voz" && (
            <PanelVoces
              vozSel={vozSel}
              leidas={leidas}
              respInfo={respInfo}
              shakeInfo={shakeInfo}
              accent={accent}
              rgba={color.rgba}
              onVoz={elegirVoz}
              onQuien={elegirQuien}
            />
          )}

          {/* MODO — ritmo */}
          {modo === "ritmo" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Lleva cada fragmento al ritmo que lo explica</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: ritmoDone ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
                    {FRAGMENTOS_RITMO.length - fragsLibres.length}/{FRAGMENTOS_RITMO.length}
                  </span>
                </div>
                {fragsLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Los {FRAGMENTOS_RITMO.length} fragmentos medidos! Ya distingues comprimir, omitir y detener.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {fragsLibres.map((f) => (
                      <button key={f.id} className="prn-chip" data-sel={selFragR === f.id} onClick={() => setSelFragR((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 14, color: T.text3, marginTop: 4 }} />
                        <span>{f.texto}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <MesaRitmo
                ubicRitmo={ubicRitmo}
                selFragR={selFragR}
                shakeRitmo={shakeRitmo}
                onBin={(r) => {
                  if (selFragR) clasificarRitmo(selFragR, r);
                }}
                onDropBin={(fragId, r) => clasificarRitmo(fragId, r)}
                dropProps={dropProps}
              />
            </>
          )}

          {/* MODO — diálogo y discurso */}
          {modo === "dialogo" && (
            <MesaConversion
              conv={conv}
              convIdx={convIdx}
              elecciones={eleccionesDe(conv)}
              convsHechas={convsHechas}
              shakeSlotDlg={shakeSlotDlg}
              accent={accent}
              rgba={color.rgba}
              onConv={(i) => {
                setConvIdx(i);
                setAvisoDlg(null);
              }}
              onOpcion={elegirOpcion}
              listo={(c) => convListo(c)}
            />
          )}

          {/* retroalimentación del modo (una sola caja para los cuatro) */}
          {aviso && (
            <div
              role="status"
              aria-live="polite"
              style={{
                borderRadius: 14,
                border: `1px solid ${aviso.ok ? OK : NO}55`,
                background: `${aviso.ok ? OK : NO}12`,
                padding: "13px 16px",
                fontSize: 14,
                color: T.text2,
                lineHeight: 1.6,
                display: "flex",
                gap: 11,
              }}
            >
              <i className={`fa-solid ${aviso.ok ? "fa-lightbulb" : "fa-circle-exclamation"}`} style={{ color: aviso.ok ? OK : NO, marginTop: 3 }} />
              <span>{aviso.texto}</span>
            </div>
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
              </Bloque>
              <Bloque titulo="Qué mirar en este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "taller" && (
                    <>
                      El <strong style={{ color: T.text }}>narrador</strong> decide qué escenas puede contar; el <strong style={{ color: T.text }}>orden</strong>{" "}
                      decide cuándo se revela el giro. Mueve las escenas con «Antes» y «Después» y observa la curva de suspenso: el giro rinde más cuando llega
                      con las pistas ya acumuladas, y la despedida de don Celso, contada antes, delata al panadero. Las cifras son una simulación.
                    </>
                  )}
              {modo === "orden" && (
                <>
                  Un relato tiene dos órdenes. La <strong style={{ color: T.text }}>historia</strong> es el orden en que pasaron los hechos; el{" "}
                  <strong style={{ color: T.text }}>discurso</strong>, el orden en que el texto los cuenta. Cuando el discurso retrocede hay{" "}
                  <strong style={{ color: T.text }}>analepsis</strong>; cuando se adelanta, <strong style={{ color: T.text }}>prolepsis</strong>.
                </>
              )}
              {modo === "voz" && (
                <>
                  Elegir narrador es elegir <strong style={{ color: T.text }}>qué va a ignorar el lector</strong>. Lee la escena en las tres voces y
                  después decide, dato por dato, quién puede contarlo. El testigo también dice «yo»: su interior sí lo cuenta, el de los demás no.
                </>
              )}
              {modo === "ritmo" && (
                <>
                  Compara dos relojes: el de la <strong style={{ color: T.text }}>historia</strong> y el del <strong style={{ color: T.text }}>texto</strong>.
                  Mucha historia en poco texto es <strong style={{ color: T.text }}>resumen</strong>; historia sin texto es{" "}
                  <strong style={{ color: T.text }}>elipsis</strong>; texto sin historia es <strong style={{ color: T.text }}>pausa</strong>; los dos a la
                  par, <strong style={{ color: T.text }}>escena</strong>.
                </>
              )}
              {modo === "dialogo" && (
                <>
                  Pasar de estilo directo a indirecto no es quitar la raya: hay que mover el <strong style={{ color: T.text }}>conector</strong>, los{" "}
                  <strong style={{ color: T.text }}>deícticos</strong> (mañana → al día siguiente, aquí → allí), los{" "}
                  <strong style={{ color: T.text }}>pronombres</strong> y el <strong style={{ color: T.text }}>tiempo verbal</strong>.
                </>
              )}
              {modo === "glosario" && <>Aquí no se arrastra: lee la definición y su ejemplo y escribe el término. La pista te da la inicial y las letras.</>}
              {modo === "texto" && <>El texto es el de la actividad de la progresión. Si te atoras, abre el banco de palabras o pide la pista del hueco.</>}
                </p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              mensajeAprobado="Reconoces los procedimientos con los que está hecho un relato."
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              playPick={sonido ? () => void audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PROCEDIMIENTOS_NARRATIVOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los textos de la progresión" icono="fa-book-open-reader">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* lectura verbatim A1 */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <Eyebrow>
            <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
            Lectura A1 · verbatim
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LECTURA_A1.map((p, i) => (
              <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.text2 }}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* hechos verbatim A4 */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <Eyebrow>
            <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
            Hechos A4 · verbatim
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {HECHOS.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    marginTop: 1,
                    borderRadius: 7,
                    padding: "2px 8px",
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.05em",
                    color: h.respuesta ? OK : NO,
                    background: `${h.respuesta ? OK : NO}1c`,
                    border: `1px solid ${h.respuesta ? OK : NO}55`,
                  }}
                >
                  {h.respuesta ? "V" : "F"}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: T.text2 }}>
                  {h.enunciado} <em style={{ color: T.text3 }}>{h.retroalimentacion}</em>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* dato verbatim del callout A1 */}
        <div
          style={{
            borderRadius: 18,
            padding: "16px 18px",
            border: `1px solid ${T.line}`,
            background: T.glass,
            fontSize: 14,
            color: T.text2,
            lineHeight: 1.55,
            display: "flex",
            gap: 12,
          }}
        >
          <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
          <span>
            <strong style={{ color: T.text }}>¿Sabías? </strong>
            {DATO_DEM}
          </span>
        </div>
                </div>
              </Bloque>
              <p style={{ margin: 0, color: T.text3, lineHeight: 1.6 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />
                {NOTA_PIE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — la columna del DISCURSO (el orden en que se cuenta)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DragFactory = (id: string) => { draggable: boolean; onDragStart: (e: React.DragEvent) => void };
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function ColumnaDiscurso({
  relato,
  slots,
  marcasRelato,
  fase,
  selParrafo,
  shakeParrafo,
  onSel,
  onMarcar,
  dragProps,
}: {
  relato: RelatoDoble;
  slots: (string | null)[];
  marcasRelato: Record<string, Marca>;
  fase: "orden" | "marcas" | "fin";
  selParrafo: string | null;
  shakeParrafo: string | null;
  onSel: (id: string) => void;
  onMarcar: (p: ParrafoDiscurso, m: Marca) => void;
  dragProps: DragFactory;
}) {
  return (
    <div style={{ ...card, padding: "18px 20px" }}>
      <Eyebrow>
        <i className="fa-solid fa-align-left" style={{ marginRight: 8 }} />
        El discurso · el orden en que se cuenta
      </Eyebrow>
      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 13 }}>
        {fase === "orden"
          ? "Este es el texto, en su orden. Toca un párrafo y llévalo al lugar que le toca en la historia."
          : "Ahora nombra qué hace cada párrafo con el tiempo de la historia."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {relato.parrafos.map((p, i) => {
          const colocado = slots.includes(p.id);
          const marcaOk = marcasRelato[p.id] === p.marca;
          const info = MARCA_INFO[p.marca];
          return (
            <div key={p.id} className="prn-row" data-done={fase === "orden" ? colocado : marcaOk} data-shake={shakeParrafo === p.id} style={{ flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#fff",
                    background: "rgba(255,255,255,0.09)",
                    border: `1px solid ${T.line}`,
                  }}
                  title={`Se cuenta en ${i + 1}.º lugar`}
                >
                  D{i + 1}
                </span>
                <button
                  type="button"
                  className="prn-chip"
                  data-sel={selParrafo === p.id}
                  disabled={fase !== "orden" || colocado}
                  onClick={() => onSel(p.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: fase === "orden" && !colocado ? "grab" : "default",
                    opacity: fase === "orden" && colocado ? 0.5 : 1,
                  }}
                  {...(fase === "orden" && !colocado ? dragProps(p.id) : {})}
                >
                  <span style={{ fontWeight: 500 }}>{p.texto}</span>
                </button>
              </div>

              {fase === "orden" && colocado && (
                <div style={{ fontSize: 14, color: OK, fontWeight: 700, paddingLeft: 46, animation: "prnPop .25s ease" }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                  Colocado: {p.hecho}
                </div>
              )}

              {fase !== "orden" && (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", paddingLeft: 46 }}>
                  {marcaOk ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        borderRadius: 10,
                        padding: "6px 11px",
                        fontSize: 14,
                        fontWeight: 900,
                        color: info.color,
                        background: `${info.color}1c`,
                        border: `1px solid ${info.color}66`,
                        animation: "prnPop .25s ease",
                      }}
                    >
                      <i className={`fa-solid ${info.icono}`} />
                      {info.titulo}
                    </span>
                  ) : (
                    MARCAS.map((m) => (
                      <button key={m} type="button" className="prn-marca" onClick={() => onMarcar(p, m)} title={MARCA_INFO[m].pista}>
                        <i className={`fa-solid ${MARCA_INFO[m].icono}`} style={{ marginRight: 6, color: MARCA_INFO[m].color }} />
                        {MARCA_INFO[m].corto}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — la columna de la HISTORIA (el orden en que pasaron los hechos)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ColumnaHistoria({
  relato,
  slots,
  selParrafo,
  shakeSlot,
  fase,
  onSlot,
  onDropSlot,
  dropProps,
}: {
  relato: RelatoDoble;
  slots: (string | null)[];
  selParrafo: string | null;
  shakeSlot: number | null;
  fase: "orden" | "marcas" | "fin";
  onSlot: (i: number) => void;
  onDropSlot: (id: string, i: number) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ ...card, padding: "18px 20px" }}>
      <Eyebrow>
        <i className="fa-solid fa-timeline" style={{ marginRight: 8 }} />
        La historia · el orden en que pasó
      </Eyebrow>
      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 13 }}>
        {fase === "orden" ? "Del hecho más antiguo al más reciente. Un párrafo por casilla." : "Esta es la cronología real. Compárala con el orden del texto: ahí están los saltos."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {slots.map((puestoId, i) => {
          const p = puestoId ? relato.parrafos.find((x) => x.id === puestoId) : undefined;
          if (!p) {
            const armado = selParrafo !== null;
            return (
              <button
                key={`slot-${i}`}
                type="button"
                className="prn-slot"
                data-armed={armado}
                data-shake={shakeSlot === i}
                onClick={() => onSlot(i)}
                {...dropProps((id) => onDropSlot(id, i))}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    color: T.text3,
                    background: "rgba(255,255,255,0.06)",
                  }}
                >
                  {i + 1}
                </span>
                <span>{armado ? "Suelta aquí si este es el hecho número " + (i + 1) : "Hecho " + (i + 1) + " de la historia"}</span>
              </button>
            );
          }
          const orden = relato.parrafos.findIndex((x) => x.id === p.id) + 1;
          const info = MARCA_INFO[p.marca];
          return (
            <div
              key={p.id}
              style={{
                borderRadius: 12,
                border: `1.5px solid ${OK}55`,
                background: `${OK}0f`,
                padding: "11px 13px",
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                animation: "prnPop .25s ease",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#04121f",
                  background: OK,
                }}
              >
                {i + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "#fff" }}>{p.hecho}</div>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 5, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span>
                    se cuenta en <strong style={{ color: T.text2 }}>D{orden}</strong>
                  </span>
                  {fase !== "orden" && p.marca !== "sigue" && (
                    <span style={{ color: info.color, fontWeight: 800 }}>
                      <i className={`fa-solid ${info.icono}`} style={{ marginRight: 5 }} />
                      {info.corto}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — la misma escena en tres voces
 * ═══════════════════════════════════════════════════════════════════════════ */
function PanelVoces({
  vozSel,
  leidas,
  respInfo,
  shakeInfo,
  accent,
  rgba,
  onVoz,
  onQuien,
}: {
  vozSel: Voz;
  leidas: Record<string, boolean>;
  respInfo: Record<string, Quien>;
  shakeInfo: string | null;
  accent: string;
  rgba: string;
  onVoz: (v: Voz) => void;
  onQuien: (infoId: string, q: Quien) => void;
}) {
  const info = VOZ_INFO[vozSel];
  const resueltas = INFORMACIONES.filter((i) => respInfo[i.id] === i.quien).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>La misma escena, tres narradores</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: VOCES.every((v) => leidas[v]) ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {VOCES.filter((v) => leidas[v] === true).length}/3 voces leídas
          </span>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {VOCES.map((v) => (
            <button key={v} className="prn-seg" data-on={vozSel === v} onClick={() => onVoz(v)}>
              <i className={`fa-solid ${VOZ_INFO[v].icono}`} style={{ marginRight: 7, color: VOZ_INFO[v].color }} />
              {VOZ_INFO[v].titulo}
              {leidas[v] === true && <i className="fa-solid fa-check" style={{ marginLeft: 7, fontSize: 14, color: OK }} />}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          borderRadius: 18,
          border: `1px solid rgba(${rgba},0.3)`,
          background: `radial-gradient(120% 120% at 0% 0%, rgba(${rgba},0.12) 0%, transparent 60%), ${T.glass}`,
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${info.color}2b`,
              color: info.color,
              fontSize: 14,
            }}
          >
            <i className={`fa-solid ${info.icono}`} />
          </span>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{info.titulo}</div>
            <div style={{ fontSize: 14, color: T.text3 }}>{info.subtitulo}</div>
          </div>
        </div>
        <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "#fff" }}>
          {ESCENA_VOCES[vozSel]}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
            <i className="fa-solid fa-circle-plus" style={{ color: OK, marginTop: 3 }} />
            <span>
              <strong style={{ color: T.text }}>Gana: </strong>
              {info.gana}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
            <i className="fa-solid fa-circle-minus" style={{ color: NO, marginTop: 3 }} />
            <span>
              <strong style={{ color: T.text }}>Pierde: </strong>
              {info.pierde}
            </span>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Eyebrow>
            <i className="fa-solid fa-scale-unbalanced" style={{ marginRight: 8, color: accent }} />
            ¿Quién puede contarlo?
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: resueltas >= INFORMACIONES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {resueltas}/{INFORMACIONES.length}
          </span>
        </div>
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>
          El omnisciente puede contarlo todo; la pregunta es a qué otra voz le alcanza. Lee las tres versiones antes de decidir.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INFORMACIONES.map((inf) => {
            const bien = respInfo[inf.id] === inf.quien;
            const qi = QUIEN_INFO[inf.quien];
            return (
              <div key={inf.id} className="prn-row" data-done={bien} data-shake={shakeInfo === inf.id} style={{ flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: "#fff", fontWeight: 600 }}>{inf.texto}</div>
                {bien ? (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: 14,
                      fontWeight: 900,
                      color: qi.color,
                      background: `${qi.color}1c`,
                      border: `1px solid ${qi.color}66`,
                      animation: "prnPop .25s ease",
                    }}
                  >
                    <i className={`fa-solid ${qi.icono}`} />
                    {qi.titulo}
                  </span>
                ) : (
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {QUIENES.map((q) => (
                      <button key={q} type="button" className="prn-marca" onClick={() => onQuien(inf.id, q)}>
                        <i className={`fa-solid ${QUIEN_INFO[q].icono}`} style={{ marginRight: 6, color: QUIEN_INFO[q].color }} />
                        {QUIEN_INFO[q].titulo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — la mesa del ritmo
 * ═══════════════════════════════════════════════════════════════════════════ */
function MesaRitmo({
  ubicRitmo,
  selFragR,
  shakeRitmo,
  onBin,
  onDropBin,
  dropProps,
}: {
  ubicRitmo: Record<string, Ritmo>;
  selFragR: string | null;
  shakeRitmo: Ritmo | null;
  onBin: (r: Ritmo) => void;
  onDropBin: (fragId: string, r: Ritmo) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 235px), 1fr))", gap: 12 }}>
      {RITMOS.map((r) => {
        const info = RITMO_INFO[r];
        const dentro = FRAGMENTOS_RITMO.filter((f) => ubicRitmo[f.id] === r);
        return (
          <div
            key={r}
            className="prn-bin"
            data-shake={shakeRitmo === r}
            data-done={dentro.length >= 2}
            role="button"
            tabIndex={0}
            onClick={() => onBin(r)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBin(r);
              }
            }}
            style={{ borderColor: `${info.color}55`, cursor: selFragR ? "pointer" : "default" }}
            {...dropProps((fragId) => onDropBin(fragId, r))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#fff",
                  background: `${info.color}33`,
                }}
              >
                <i className={`fa-solid ${info.icono}`} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: info.color, lineHeight: 1.45, marginBottom: 5, fontWeight: 800 }}>{info.formula}</div>
            <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45, marginBottom: 12 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <span style={{ fontSize: 14, color: T.text3, opacity: 0.6 }}>Arrastra aquí…</span>
              ) : (
                dentro.map((f) => (
                  <span
                    key={f.id}
                    style={{
                      animation: "prnPop .25s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      padding: "9px 11px",
                      borderRadius: 10,
                      background: `${info.color}1c`,
                      border: `1px solid ${info.color}55`,
                      fontSize: 14,
                      color: "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{f.texto}</span>
                    <span style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: 5, color: info.color }} />
                      historia: {f.tiempoHistoria} · texto: {f.tiempoRelato}
                    </span>
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
 * MODO 4 — la mesa de conversión de diálogo
 * ═══════════════════════════════════════════════════════════════════════════ */
function MesaConversion({
  conv,
  convIdx,
  elecciones,
  convsHechas,
  shakeSlotDlg,
  accent,
  rgba,
  onConv,
  onOpcion,
  listo,
}: {
  conv: Conversion;
  convIdx: number;
  elecciones: Record<string, number>;
  convsHechas: number;
  shakeSlotDlg: string | null;
  accent: string;
  rgba: string;
  onConv: (i: number) => void;
  onOpcion: (slotId: string, iOpcion: number) => void;
  listo: (c: Conversion) => boolean;
}) {
  const completa = conv.slots.every((s) => elecciones[s.id] !== undefined);
  const pendiente = conv.slots.find((s) => elecciones[s.id] === undefined) ?? null;
  const de = ESTILO_INFO[conv.de];
  const a = ESTILO_INFO[conv.a];

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {CONVERSIONES.map((c, i) => (
            <button key={c.id} className="prn-mini" data-on={convIdx === i} onClick={() => onConv(i)}>
              <i className="fa-solid fa-quote-right" style={{ marginRight: 7 }} />
              {c.titulo}
              {listo(c) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: convsHechas >= CONVERSIONES.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {convsHechas}/{CONVERSIONES.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 14, fontWeight: 800 }}>
          <span style={{ color: de.color }}>
            <i className={`fa-solid ${de.icono}`} style={{ marginRight: 6 }} />
            {de.titulo}
          </span>
          <i className="fa-solid fa-arrow-right-long" style={{ color: T.text3 }} />
          <span style={{ color: a.color }}>
            <i className={`fa-solid ${a.icono}`} style={{ marginRight: 6 }} />
            {a.titulo}
          </span>
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Lo que dice el texto de partida</Eyebrow>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: "#fff", fontStyle: "italic" }}>{conv.original}</p>
      </div>

      <div
        style={{
          borderRadius: 18,
          border: `1px solid rgba(${rgba},0.3)`,
          background: `radial-gradient(120% 120% at 0% 0%, rgba(${rgba},0.12) 0%, transparent 60%), ${T.glass}`,
          padding: "20px 24px",
        }}
      >
        <Eyebrow>
          <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
          Cómo queda en {a.titulo.toLowerCase()}
        </Eyebrow>
        <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 16, lineHeight: 2.3, color: "#fff" }}>
          {conv.partes.map((parte, i) => {
            const slot = conv.slots[i];
            if (!slot) return <span key={i}>{parte}</span>;
            const elegida = elecciones[slot.id];
            const op = elegida !== undefined ? slot.opciones[elegida] : undefined;
            const puesto = op ? (op.pega ?? op.texto) : null;
            return (
              <span key={i}>
                {parte}
                <span className="prn-hueco" data-done={op !== undefined} data-shake={shakeSlotDlg === slot.id} title={slot.etiqueta}>
                  {op ? (puesto === "" ? <em style={{ opacity: 0.75, fontWeight: 600 }}>(nada)</em> : puesto) : slot.etiqueta}
                </span>
              </span>
            );
          })}
        </p>
        {completa && (
          <div style={{ marginTop: 16, paddingTop: 13, borderTop: `1px solid ${T.line}`, fontSize: 14, color: T.text2, lineHeight: 1.6, display: "flex", gap: 10 }}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: accent, marginTop: 2 }} />
            <span>{conv.nota}</span>
          </div>
        )}
      </div>

      {pendiente ? (
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            Elige {pendiente.etiqueta.toLowerCase()} · hueco {conv.slots.indexOf(pendiente) + 1} de {conv.slots.length}
          </Eyebrow>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {pendiente.opciones.map((op, i) => (
              <button key={op.texto} type="button" className="prn-opt" onClick={() => onOpcion(pendiente.id, i)}>
                {op.texto}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: OK }}>
          <i className="fa-solid fa-circle-check" />
          Conversión terminada. Cambia de diálogo arriba para hacer el siguiente.
        </div>
      )}

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Los tres estilos, de un vistazo</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 12 }}>
          {(["directo", "indirecto", "libre"] as const).map((e) => {
            const est = ESTILO_INFO[e];
            return (
              <div key={e} style={{ borderRadius: 13, border: `1px solid ${est.color}44`, background: `${est.color}0d`, padding: "13px 15px" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: est.color, marginBottom: 6 }}>
                  <i className={`fa-solid ${est.icono}`} style={{ marginRight: 7 }} />
                  {est.titulo}
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, marginBottom: 7 }}>{est.marca}</div>
                <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, fontStyle: "italic" }}>{est.ejemplo}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 0 — el taller del relato (simulador)
 *
 * El alumno elige narrador y reordena las escenas de un cuento original.
 * Cambia la curva de suspenso, los medidores, las marcas de salto de tiempo y
 * la reacción de una lectora ficticia. Las cifras son una simulación.
 * ═══════════════════════════════════════════════════════════════════════════ */
function TallerRelato({
  orden,
  narrador,
  resultado,
  probados,
  onNarrador,
  onMover,
}: {
  orden: string[];
  narrador: Voz;
  resultado: Resultado;
  probados: Record<string, boolean>;
  onNarrador: (v: Voz) => void;
  onMover: (id: string, delta: -1 | 1) => void;
}) {
  const info = narradorDe(narrador);
  const reaccion = reaccionLectora(resultado);
  const escenas = orden.map((id) => CUENTO.find((e) => e.id === id)!);
  const n = escenas.length;
  const W = 700;
  const H = 170;
  const x = (i: number) => 30 + (i * (W - 60)) / Math.max(1, n - 1);
  const y = (v: number) => H - 14 - (v / 10) * (H - 34);
  const puntos = resultado.curva.map((c, i) => `${x(i)},${y(c.nivel)}`).join(" ");
  const saltoDe = (id: string) => resultado.saltos.find((s) => s.id === id)?.marca;
  const medidores: { label: string; valor: number; texto: string; color: string }[] = [
    { label: "Sorpresa en el giro", valor: resultado.sorpresa, texto: `${resultado.sorpresa}/10`, color: reaccion.color },
    { label: "Cercanía con Mara", valor: resultado.cercania, texto: `${resultado.cercania}/10`, color: info.color },
    { label: "Escenas que conoce el lector", valor: resultado.informacion / 10, texto: `${resultado.informacion} %`, color: "#5BC8FF" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {NARRADORES.map((nr) => (
          <button key={nr.id} className="prn-seg" data-on={narrador === nr.id} onClick={() => onNarrador(nr.id)}>
            <i className={`fa-solid ${nr.icono}`} style={{ marginRight: 7, color: nr.color }} />
            {nr.corto}
            {probados[nr.id] === true && <i className="fa-solid fa-check" style={{ marginLeft: 7, color: OK }} />}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text }}>«{CUENTO_TITULO}» · {info.titulo}:</strong> {info.quedaFuera}.
      </div>

      <div className="prn-medidores">
        {medidores.map((m) => (
          <div key={m.label} className="prn-med">
            <span>
              {m.label}
              <strong>{m.texto}</strong>
            </span>
            <div className="prn-med-barra">
              <div style={{ width: `${Math.min(100, m.valor * 10)}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="prn-curva" aria-label="Curva de suspenso">
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 4 }}>
          <i className="fa-solid fa-chart-line" style={{ marginRight: 8, color: info.color }} />
          Curva de suspenso (simulación)
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Nivel de suspenso después de cada escena">
          <line x1="20" y1={y(0)} x2={W - 20} y2={y(0)} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="20" y1={y(7)} x2={W - 20} y2={y(7)} stroke="rgba(52,211,153,0.35)" strokeWidth="2" strokeDasharray="8 8" />
          <polyline points={puntos} fill="none" stroke={info.color} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          {resultado.curva.map((c, i) => {
            const e = escenas[i]!;
            const giro = e.tipo === "giro";
            return <circle key={c.id} cx={x(i)} cy={y(c.nivel)} r={giro ? 11 : 7} fill={giro ? "#FFC75A" : c.contada ? info.color : "#2a3a4d"} stroke="#04121f" strokeWidth="3" />;
          })}
        </svg>
        <div className="prn-curva-eje">
          {escenas.map((e, i) => (
            <span key={e.id} style={{ color: e.tipo === "giro" ? "#FFC75A" : undefined }} title={e.titulo}>
              {i + 1}
              <i className={`fa-solid ${e.icono}`} style={{ marginLeft: 4, fontSize: 14 }} />
            </span>
          ))}
        </div>
      </div>

      <div className="prn-reaccion" role="status" aria-live="polite" style={{ borderColor: `${reaccion.color}66` }}>
        <i className={`fa-solid ${reaccion.icono}`} style={{ color: reaccion.color }} aria-hidden />
        <span>
          <strong>Ximena, lectora ficticia: {reaccion.frase}</strong>
          {reaccion.porque}
        </span>
      </div>

      <div className="prn-guion">
        {escenas.map((e, i) => {
          const fuera = !puedeContar(e, narrador);
          const marca = saltoDe(e.id);
          const mi = marca ? MARCA_INFO[marca] : null;
          return (
            <div key={e.id} className="prn-esc" data-fuera={fuera}>
              <div className="prn-foto">
                <i className={`fa-solid ${e.icono}`} aria-hidden />
                <img src={`${RUTA_FOTOS_NARRATIVA}/${e.foto}.webp`} alt="" loading="lazy" onError={(ev) => (ev.currentTarget.style.display = "none")} />
                <span className="prn-num">{i + 1}</span>
              </div>
              <div className="prn-esc-cuerpo">
                <h5>{e.titulo}</h5>
                {fuera ? (
                  <p>
                    <i className="fa-solid fa-eye-slash" style={{ marginRight: 7 }} />
                    {info.corto} no puede contar esta escena: el lector se queda sin ella.
                  </p>
                ) : (
                  <p>{e.texto}</p>
                )}
                {mi && marca !== "sigue" && (
                  <span className="prn-marcaje" style={{ color: mi.color, background: `${mi.color}1c`, border: `1px solid ${mi.color}66` }}>
                    <i className={`fa-solid ${mi.icono}`} aria-hidden />
                    {mi.titulo}
                  </span>
                )}
              </div>
              <div className="prn-esc-mov">
                <button type="button" disabled={i === 0} onClick={() => onMover(e.id, -1)} aria-label={`Contar «${e.titulo}» antes`}>
                  <i className="fa-solid fa-arrow-left" aria-hidden /> Antes
                </button>
                <button type="button" disabled={i === n - 1} onClick={() => onMover(e.id, 1)} aria-label={`Contar «${e.titulo}» después`}>
                  Después <i className="fa-solid fa-arrow-right" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
