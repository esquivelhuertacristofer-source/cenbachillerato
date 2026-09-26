"use client";

/**
 * Laboratorio — Kit de herramientas digitales para estudiar.
 * Práctica interactiva para CD-I-P08 (Cultura Digital I, 1.er semestre):
 * «Herramientas digitales para estudiar».
 *
 * Por qué NO es un laboratorio 3D: aquí no hay ningún fenómeno físico que
 * mirar. Lo que hay que aprender es una DECISIÓN —qué herramienta sirve para
 * esta tarea y por qué no las otras— y esa decisión se toma sobre encargos,
 * archivos y pasos, que son objetos de pantalla. Una escena tridimensional
 * sería decoración. DOM puro: ligero y accesible con ratón, teclado y pantalla
 * táctil.
 *
 * Y por qué no es un catálogo de marcas: el catálogo envejece. La app que hoy
 * se llama de una forma mañana se llama de otra o deja de existir, y saberse
 * la lista no enseña a elegir. Aquí lo evaluable es la categoría y el criterio.
 *
 * Seis modos:
 *  1. «El encargo del día» — llega una tarea escolar concreta y hay que elegir
 *     la categoría de herramienta; al resolverla, se lee por qué las dos que
 *     más tentaban no servían AQUÍ.
 *  2. «Elegir entre dos» — dos herramientas de la misma categoría descritas
 *     por lo que hacen, y una necesidad declarada que hace ganar a una. Tres
 *     rondas repiten pareja con otra necesidad: la respuesta se voltea.
 *  3. «Arregla el escritorio» — seis archivos con nombres imposibles: primero
 *     se renombran con una convención, después se archivan por materia. Nace
 *     de la consigna verbatim de A5.
 *  4. «El trabajo completo» — ordena los ocho pasos de un trabajo real y
 *     asigna la herramienta de cada paso.
 *  5. «Escribe el término» — el glosario A5 (más dos términos que A1 define),
 *     escrito de memoria.
 *  6. «Completa el texto» — los huecos verbatim de A6.
 *  + Hechos verdadero/falso (A4), la lectura A1 con sus preguntas, la consigna
 *    de A3 y el reto evaluable (A2).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { KIT_HERRAMIENTAS_HUECOS } from "./kit-herramientas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { KIT_HERRAMIENTAS_FICHA } from "./kit-herramientas-ficha";
import {
  CATEGORIA_INFO,
  CATEGORIAS_ORDEN,
  ENCARGOS,
  PAREJAS,
  RONDAS,
  MATERIA_INFO,
  REGLAS_NOMBRE,
  ARCHIVOS,
  PASOS,
  GLOSARIO,
  HECHOS,
  COMPRENSION_A1,
  DATO_SABIAS,
  CONSIGNA_A3,
  CONSIGNA_A5,
  RETO_QUIZ,
  type Categoria,
  type MateriaId,
  type ArchivoDesordenado,
  type PasoTrabajo,
  type Ronda,
  type Pareja,
} from "./kit-herramientas-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-kit-herramientas-digitales-reto";

type Modo = "encargo" | "duelo" | "escritorio" | "flujo" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "encargo", label: "El encargo del día", icono: "fa-clipboard-list" },
  { id: "duelo", label: "Elegir entre dos", icono: "fa-scale-balanced" },
  { id: "escritorio", label: "Arregla el escritorio", icono: "fa-folder-tree" },
  { id: "flujo", label: "El trabajo completo", icono: "fa-diagram-project" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const MATERIAS_ORDEN: MateriaId[] = ["quimica", "matematicas", "historia", "cultura"];

export function LabKitHerramientas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("encargo");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
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

  /** El pie del laboratorio: la última explicación, siempre a la vista. */
  const [pie, setPie] = useState<{ ok: boolean; txt: string } | null>(null);

  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = (txt?: string) => {
    partida.error();
    if (txt) setPie({ ok: false, txt });
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = (txt?: string) => {
    partida.acierto();
    if (txt) setPie({ ok: true, txt });
    return sonido && audioRef.current?.blip();
  };

  // ── modo 1: el encargo del día ────────────────────────────────────────
  const [encargoIdx, setEncargoIdx] = useState(0);
  const [encargoOk, setEncargoOk] = useState<Record<string, boolean>>({});
  const [descartesVistos, setDescartesVistos] = useState<Record<string, boolean>>({});
  const [shakeCat, setShakeCat] = useState<Categoria | null>(null);

  const encargo = ENCARGOS[encargoIdx] ?? ENCARGOS[0]!;
  const encargosDone = Object.keys(encargoOk).length >= ENCARGOS.length;
  const descartesDone = Object.keys(descartesVistos).length >= ENCARGOS.length;

  const elegirCategoria = (cat: Categoria) => {
    if (encargoOk[encargo.id]) return;
    if (cat === encargo.correcta) {
      setEncargoOk((prev) => ({ ...prev, [encargo.id]: true }));
      sfxPlace(`${CATEGORIA_INFO[cat].titulo}. ${encargo.porque}`);
      if (Object.keys(encargoOk).length + 1 >= ENCARGOS.length) sfxOk();
    } else {
      const declarado = encargo.descartes.find((d) => d.cat === cat);
      setShakeCat(cat);
      sfxNo(
        declarado
          ? `${CATEGORIA_INFO[cat].titulo}: ${declarado.porque}`
          : `${CATEGORIA_INFO[cat].titulo} sirve para otra cosa: ${CATEGORIA_INFO[cat].subtitulo} Nada de eso es lo que pide este encargo.`
      );
      window.setTimeout(() => setShakeCat(null), 420);
    }
  };

  const verDescartes = () => {
    if (descartesVistos[encargo.id]) return;
    setDescartesVistos((prev) => ({ ...prev, [encargo.id]: true }));
    setPie({
      ok: true,
      txt: `Saber por qué NO sirve la otra es la mitad de la decisión: sin eso, acertar fue suerte.`,
    });
    if (Object.keys(descartesVistos).length + 1 >= ENCARGOS.length) sfxOk();
  };

  const irEncargo = (i: number) => {
    const n = ENCARGOS.length;
    setEncargoIdx(((i % n) + n) % n);
  };

  const resetEncargo = () => {
    setEncargoIdx(0);
    setEncargoOk({});
    setDescartesVistos({});
    setPie(null);
  };

  // ── modo 2: elegir entre dos ──────────────────────────────────────────
  const [rondaIdx, setRondaIdx] = useState(0);
  const [rondaOk, setRondaOk] = useState<Record<string, boolean>>({});
  const [shakeLado, setShakeLado] = useState<"a" | "b" | null>(null);

  const ronda = RONDAS[rondaIdx] ?? RONDAS[0]!;
  const pareja = PAREJAS.find((p) => p.id === ronda.parejaId) ?? PAREJAS[0]!;
  const dueloDone = Object.keys(rondaOk).length >= RONDAS.length;

  const elegirLado = (lado: "a" | "b") => {
    if (rondaOk[ronda.id]) return;
    if (lado === ronda.gana) {
      setRondaOk((prev) => ({ ...prev, [ronda.id]: true }));
      sfxPlace(`${ronda.porque} En cambio: ${ronda.porqueNo}`);
      if (Object.keys(rondaOk).length + 1 >= RONDAS.length) sfxOk();
    } else {
      setShakeLado(lado);
      sfxNo(ronda.porqueNo);
      window.setTimeout(() => setShakeLado(null), 420);
    }
  };

  const irRonda = (i: number) => {
    const n = RONDAS.length;
    setRondaIdx(((i % n) + n) % n);
  };

  const resetDuelo = () => {
    setRondaIdx(0);
    setRondaOk({});
    setPie(null);
  };

  // ── modo 3: arregla el escritorio ─────────────────────────────────────
  const [abierto, setAbierto] = useState<string | null>(null);
  const [renombrado, setRenombrado] = useState<Record<string, boolean>>({});
  const [archivado, setArchivado] = useState<Record<string, MateriaId>>({});
  const [selArchivo, setSelArchivo] = useState<string | null>(null);
  const [shakeCarpeta, setShakeCarpeta] = useState<MateriaId | null>(null);

  const renombreDone = Object.keys(renombrado).length >= ARCHIVOS.length;
  const archivoDone = Object.keys(archivado).length >= ARCHIVOS.length;

  const elegirNombre = (archivoId: string, i: number) => {
    const ar = ARCHIVOS.find((x) => x.id === archivoId);
    if (!ar || renombrado[archivoId]) return;
    if (i === ar.correcta) {
      setRenombrado((prev) => ({ ...prev, [archivoId]: true }));
      setAbierto(null);
      sfxPlace(`${ar.opciones[ar.correcta] ?? ""} — ${ar.porque}`);
      if (Object.keys(renombrado).length + 1 >= ARCHIVOS.length) {
        sfxOk();
        setPie({
          ok: true,
          txt: "Los seis ya tienen nombre. Ahora arrástralos a la carpeta de su materia: esa es la estructura que pide A5.",
        });
      }
    } else {
      sfxNo(ar.porqueNo[i] ?? "Ese nombre no cumple la convención.");
    }
  };

  const archivar = (archivoId: string, carpeta: MateriaId) => {
    const ar = ARCHIVOS.find((x) => x.id === archivoId);
    if (!ar || archivado[archivoId] || !renombrado[archivoId]) return;
    if (ar.materia === carpeta) {
      setArchivado((prev) => ({ ...prev, [archivoId]: carpeta }));
      setSelArchivo(null);
      sfxPlace(`${ar.opciones[ar.correcta] ?? ""} queda en ${MATERIA_INFO[carpeta].titulo}. El nombre empieza por la materia, así que dentro de la carpeta también se ordena solo.`);
      if (Object.keys(archivado).length + 1 >= ARCHIVOS.length) sfxOk();
    } else {
      setShakeCarpeta(carpeta);
      sfxNo(
        `Ese archivo no es de ${MATERIA_INFO[carpeta].titulo}: ${ar.contexto} El propio nombre que le pusiste lo dice.`
      );
      window.setTimeout(() => setShakeCarpeta(null), 420);
    }
  };

  const resetEscritorio = () => {
    setAbierto(null);
    setRenombrado({});
    setArchivado({});
    setSelArchivo(null);
    setPie(null);
  };

  // ── modo 4: el trabajo completo ───────────────────────────────────────
  const [flujoPos, setFlujoPos] = useState(0);
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakeLinea, setShakeLinea] = useState(false);
  const [pasoTool, setPasoTool] = useState<Record<string, boolean>>({});

  const ordenDone = flujoPos >= PASOS.length;
  const toolsDone = Object.keys(pasoTool).length >= PASOS.length;

  const colocarPaso = (id: string) => {
    if (flujoPos >= PASOS.length) return;
    const esperado = PASOS[flujoPos]!;
    if (id === esperado.id) {
      setFlujoPos((p) => p + 1);
      setSelPaso(null);
      sfxPlace(`Paso ${flujoPos + 1}: ${esperado.titulo}. ${esperado.porqueAhi}`);
      if (flujoPos + 1 >= PASOS.length) {
        sfxOk();
        setPie({
          ok: true,
          txt: "Los ocho pasos en orden. Ahora dile a cada uno con qué herramienta se hace: esa es la otra mitad del trabajo.",
        });
      }
    } else {
      setShakeLinea(true);
      sfxNo(`Todavía no. Antes de eso toca «${esperado.titulo}»: ${esperado.porqueAhi}`);
      window.setTimeout(() => setShakeLinea(false), 420);
    }
  };

  const asignarTool = (pasoId: string, cat: Categoria) => {
    const p = PASOS.find((x) => x.id === pasoId);
    if (!p || pasoTool[pasoId]) return;
    if (cat === p.correcta) {
      setPasoTool((prev) => ({ ...prev, [pasoId]: true }));
      sfxPlace(`${CATEGORIA_INFO[cat].titulo}. ${p.porque}`);
      if (Object.keys(pasoTool).length + 1 >= PASOS.length) sfxOk();
    } else {
      sfxNo(
        `${CATEGORIA_INFO[cat].titulo} no resuelve ese paso: ${CATEGORIA_INFO[cat].subtitulo} Lo que el paso pide es otra cosa.`
      );
    }
  };

  const resetFlujo = () => {
    setFlujoPos(0);
    setSelPaso(null);
    setPasoTool({});
    setPie(null);
  };

  // ── modo 5: escribe el término ────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
    setPie(null);
  };

  // ── modo 6: completa el texto ─────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
    setPie(null);
  };

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosDone = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "Resuelve los 8 encargos con la categoría correcta", done: encargosDone },
    { txt: "Lee por qué no servían las otras en los 8", done: descartesDone },
    { txt: "Gana las 7 rondas de «Elegir entre dos»", done: dueloDone },
    { txt: "Renombra los 6 archivos del escritorio", done: renombreDone },
    { txt: "Archiva los 6 en la carpeta de su materia", done: archivoDone },
    { txt: "Ordena los 8 pasos del trabajo", done: ordenDone },
    { txt: "Asigna la herramienta de cada paso", done: toolsDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone },
    { txt: "Completa el texto de A6", done: textoDone },
    { txt: "Acierta los 4 hechos verdadero o falso", done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "encargo"
      ? resetEncargo
      : modo === "duelo"
        ? resetDuelo
        : modo === "escritorio"
          ? resetEscritorio
          : modo === "flujo"
            ? resetFlujo
            : modo === "glosario"
              ? resetGlosario
              : resetTexto;

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes kitShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes kitPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .kit-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .kit-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .kit-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .kit-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .kit-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .kit-icobtn:hover { background:rgba(255,255,255,0.12); }

        .kit-cat { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; gap:5px; text-align:left;
          padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
          font-size:13px; font-weight:700; transition:all .14s; line-height:1.4; width:100%; }
        .kit-cat:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .kit-cat:disabled { cursor:default; opacity:.55; }
        .kit-cat[data-shake="true"] { animation:kitShake .4s; border-color:${NO}; }
        .kit-cat[data-ok="true"] { border-color:${OK}; background:${OK}18; opacity:1; }

        .kit-card { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px 18px; transition:all .16s; }
        .kit-card[data-shake="true"] { animation:kitShake .4s; border-color:${NO}; }
        .kit-card[data-done="true"] { border-color:${OK}66; }
        .kit-card[data-sel="true"] { border-color:${accent}; box-shadow:0 0 18px -7px ${accent}; }

        .kit-tool { cursor:pointer; text-align:left; width:100%; border-radius:16px; border:1.5px solid ${T.line};
          background:${T.glass}; padding:16px 18px; color:${T.text2}; transition:all .15s; }
        .kit-tool:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; transform:translateY(-2px); }
        .kit-tool:disabled { cursor:default; }
        .kit-tool[data-shake="true"] { animation:kitShake .4s; border-color:${NO}; }
        .kit-tool[data-win="true"] { border-color:${OK}; background:${OK}14; color:#fff; }

        .kit-chip { cursor:grab; display:flex; align-items:flex-start; gap:10px; padding:11px 14px; border-radius:13px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:700;
          transition:all .14s; user-select:none; text-align:left; line-height:1.45; width:100%; }
        .kit-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .kit-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.01); }
        .kit-chip:active { cursor:grabbing; }

        .kit-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; min-height:150px; }
        .kit-bin[data-shake="true"] { animation:kitShake .4s; border-color:${NO}; }
        .kit-bin[data-done="true"] { border-color:${OK}55; }

        .kit-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:600; padding:10px 13px;
          line-height:1.45; transition:all .14s; font-family:inherit; }
        .kit-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-op:disabled { cursor:default; }
        .kit-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .kit-op[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }

        .kit-mini { cursor:pointer; padding:7px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; font-family:inherit; }
        .kit-mini:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-mini:disabled { opacity:.45; cursor:not-allowed; }
        .kit-mini[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .kit-mini[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .kit-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; font-family:inherit; }
        .kit-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-vf:disabled { cursor:default; opacity:.85; }
        .kit-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .kit-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }

        .kit-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:46px; padding:9px 12px;
          display:flex; align-items:center; gap:10px; color:${T.text3}; font-size:12.5px; transition:all .16s; }
        .kit-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .kit-linea[data-shake="true"] { animation:kitShake .4s; }
        .kit-nombre { font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12.5px; letter-spacing:-0.01em; }
        .kit-divider { height:1px; background:${T.line}; margin:16px 0; }
        /* La columna de objetivos acompaña al alumno en los modos largos
           (el escritorio y el trabajo completo miden el doble que la ventana). */
        .kit-side { position:sticky; top:10px; }
        .kit-apoyo { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));
          gap:16px; align-items:start; margin-top:18px; }
        @media (max-width: 900px){
          .kit-grid { grid-template-columns:minmax(0,1fr) !important; }
          .kit-side { position:static; }
          .kit-tab { padding:9px 12px; font-size:12.5px; gap:7px; }
        }

        /* Cajón de teoría */
        .kit-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .kit-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .kit-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .kit-drawer[data-open="true"] { transform:translateX(0); }
        .kit-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .kit-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .kit-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .kit-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .kit-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .kit-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .kit-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .kit-bin, .kit-card { --tono:196; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.10) 0%, transparent 62%); }
        .kit-bin:nth-of-type(6n+1), .kit-card:nth-of-type(6n+1) { --tono:196; }
        .kit-bin:nth-of-type(6n+2), .kit-card:nth-of-type(6n+2) { --tono:268; }
        .kit-bin:nth-of-type(6n+3), .kit-card:nth-of-type(6n+3) { --tono:42; }
        .kit-bin:nth-of-type(6n+4), .kit-card:nth-of-type(6n+4) { --tono:150; }
        .kit-bin:nth-of-type(6n+5), .kit-card:nth-of-type(6n+5) { --tono:328; }
        .kit-bin:nth-of-type(6n+6), .kit-card:nth-of-type(6n+6) { --tono:16; }
        .kit-bin::before, .kit-card::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .kit-bin[data-done="true"], .kit-card[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.19) 0%, transparent 68%); }
        @media (prefers-reduced-motion: reduce){
          .kit-bin[data-shake="true"], .kit-card[data-shake="true"], .kit-tool[data-shake="true"], .kit-cat[data-shake="true"] { animation:none; }
          .kit-chip, .kit-chip:hover, .kit-chip[data-sel="true"], .kit-cat:hover, .kit-tool:hover { transform:none; transition:none; }
        }
      `}</style>

      {/* ── Barra de modos y herramientas ─────────────────────────────────
          Dos filas a propósito: son seis modos, y el marcador crece cuando
          aparece la precisión. En una sola fila, la barra se partía sola en
          cuanto el alumno respondía lo primero. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="kit-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="kit-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="kit-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="kit-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ─────────────────────────────────────────────── */}
      <button className="kit-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="kit-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="kit-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="kit-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="kit-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="kit-drawer-body">
          <FichaTeorica data={KIT_HERRAMIENTAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div
        className="kit-grid"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}
      >
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "encargo" && (
            <EncargoPanel
              accent={accent}
              indice={encargoIdx}
              resueltos={encargoOk}
              descartes={descartesVistos}
              shakeCat={shakeCat}
              onElegir={elegirCategoria}
              onVerDescartes={verDescartes}
              onIr={irEncargo}
            />
          )}

          {modo === "duelo" && (
            <DueloPanel
              accent={accent}
              ronda={ronda}
              pareja={pareja}
              indice={rondaIdx}
              resueltas={rondaOk}
              shakeLado={shakeLado}
              onElegir={elegirLado}
              onIr={irRonda}
            />
          )}

          {modo === "escritorio" && (
            <EscritorioPanel
              accent={accent}
              abierto={abierto}
              renombrado={renombrado}
              archivado={archivado}
              selArchivo={selArchivo}
              shakeCarpeta={shakeCarpeta}
              onAbrir={(id) => setAbierto((v) => (v === id ? null : id))}
              onElegirNombre={elegirNombre}
              onSelArchivo={(id) => setSelArchivo((v) => (v === id ? null : id))}
              onArchivar={archivar}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "flujo" && (
            <FlujoPanel
              accent={accent}
              flujoPos={flujoPos}
              selPaso={selPaso}
              shakeLinea={shakeLinea}
              pasoTool={pasoTool}
              onSelPaso={(id) => setSelPaso((v) => (v === id ? null : id))}
              onColocar={colocarPaso}
              onAsignar={asignarTool}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · CD-I-P08-A5
              </Eyebrow>
              <EscribeTermino
                key={glosarioIntento}
                pares={GLOSARIO}
                accent={accent}
                rgba={color.rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición y su ejemplo, y escribe el término que le corresponde. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  setPie({
                    ok: true,
                    txt: "Los seis términos, escritos de memoria. Cuatro son los programas del glosario A5; los otros dos —plagio y buscador académico— los define la lectura A1 y los vuelve a preguntar el reto evaluable.",
                  });
                  sfxOk();
                }}
                onAcierto={() => sfxPlace()}
                onError={() => sfxNo()}
              />
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={KIT_HERRAMIENTAS_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. Fíjate en que el párrafo va por función, no por marca: escribir, calcular, exponer, guardar. Eso es lo que no cambia aunque cambien los programas.",
                });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {/* Pie: la última explicación, siempre a la vista */}
          <div
            role="status"
            aria-live="polite"
            style={{
              borderRadius: 14,
              border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
              background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
              padding: "13px 16px",
              fontSize: 13,
              lineHeight: 1.55,
              color: T.text2,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              transition: "all .2s",
            }}
          >
            <i
              className={`fa-solid ${pie ? (pie.ok ? "fa-circle-check" : "fa-circle-exclamation") : "fa-comment-dots"}`}
              style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 15, marginTop: 2 }}
            />
            <span>
              {pie
                ? pie.txt
                : "Aquí aparece la explicación de cada decisión: por qué esa herramienta resuelve el encargo, por qué la otra no servía en ese caso y qué se rompe cuando el nombre del archivo no dice nada."}
            </span>
          </div>
        </div>

        {/* ── Columna lateral ─────────────────────────────────────────────
            Solo lo que acompaña al modo en curso: los objetivos y qué se
            practica aquí. El material de consulta (A3, A1, el «¿Sabías?»)
            bajó a una banda a todo lo ancho: en el lateral hacía la columna
            derecha el doble de alta que modos cortos como «Completa el texto»
            y dejaba media pantalla de vacío a la izquierda. */}
        <div className="kit-side" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* Qué se practica en el modo actual */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid rgba(${color.rgba},0.3)`,
              background: `rgba(${color.rgba},0.08)`,
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "encargo" && (
                <>
                  No preguntes «¿qué app uso?», pregunta{" "}
                  <strong style={{ color: T.text }}>«¿qué tiene que hacer la herramienta?»</strong>. Calcular sobre muchos datos,
                  avisarte en una fecha, dejar que tres personas escriban lo mismo: cada verbo apunta a una categoría.
                </>
              )}
              {modo === "duelo" && (
                <>
                  Ninguna de las dos es mejor: gana la que cubre la{" "}
                  <strong style={{ color: T.text }}>necesidad declarada</strong>. Cambia la necesidad y la respuesta se voltea —
                  por eso hay rondas que repiten la misma pareja.
                </>
              )}
              {modo === "escritorio" && (
                <>
                  Un nombre sirve si <strong style={{ color: T.text }}>tu yo de dentro de tres semanas</strong> encuentra el
                  archivo sin abrirlo. Materia, tema, fecha AAAA-MM-DD y versión con número; nunca «final definitiva real».
                </>
              )}
              {modo === "flujo" && (
                <>
                  El orden no es un capricho: <strong style={{ color: T.text }}>registrar la fuente después de escribir</strong>{" "}
                  es como se llega, sin querer, a una bibliografía inventada. Coloca los pasos y después dile a cada uno con qué
                  herramienta se hace.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Recordar el término es más difícil —y enseña más— que reconocerlo entre opciones. Si te atoras, usa la pista o
                  abre el <strong style={{ color: T.text }}>banco de términos</strong>.
                </>
              )}
              {modo === "texto" && (
                <>
                  Lee el párrafo completo antes de escribir: el contexto decide la palabra. Pulsa{" "}
                  <strong style={{ color: T.text }}>Enter</strong> para comprobar cada hueco.
                </>
              )}
            </span>
          </div>

        </div>
      </div>

      {/* ── Banda de consulta, a todo lo ancho ────────────────────────────
          Material verbatim de la progresión que no depende del modo. */}
      <div className="kit-apoyo">
          {/* Consigna verbatim de A3 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
              La tarea que viene · A3
            </Eyebrow>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: T.text2, lineHeight: 1.6 }}>{CONSIGNA_A3.prompt}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {CONSIGNA_A3.pistas.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, color: T.text3, lineHeight: 1.45 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginTop: 3, fontSize: 10 }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de comprensión de la lectura A1 (verbatim) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · para pensar
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COMPRENSION_A1.map((c, i) => (
                <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                  <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>
                    {c.pregunta}
                  </summary>
                  <p style={{ margin: "9px 0 0", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{c.guia}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Dato verbatim del callout de A1 */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid ${T.line}`,
              background: T.glass,
              fontSize: 12.5,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              <strong style={{ color: T.text }}>¿Sabías?</strong> {DATO_SABIAS}
            </span>
          </div>
      </div>

      <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Eliges la herramienta por lo que tiene que hacer, no por su marca."
      />

      {/* Nota al pie: qué es verbatim y qué es de este laboratorio */}
      <p style={{ margin: "20px 2px 0", fontSize: 11.5, lineHeight: 1.6, color: T.text3 }}>
        <i className="fa-solid fa-quote-right" style={{ marginRight: 7, opacity: 0.7 }} />
        <strong style={{ color: T.text2 }}>Verbatim de la progresión CD-I-P08:</strong> la lectura A1 con su callout «¿Sabías?»
        y sus preguntas de comprensión, el reto evaluable (A2), la consigna y las pistas del kit (A3), los cuatro enunciados
        verdadero/falso (A4), el glosario y su actividad final —«{CONSIGNA_A5}»— (A5) y el texto con huecos (A6). Los productos
        que la progresión nombra se conservan tal cual aparecen ahí.{" "}
        <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> los ocho encargos, las tres
        parejas de herramientas con sus siete necesidades, los seis archivos del escritorio y los ocho pasos del trabajo. Las
        personas, los salones y las fechas son ficticios. Las herramientas de «Elegir entre dos» se describen por lo que hacen y
        no corresponden a ningún producto concreto: aquí no se afirma ningún precio, límite de almacenamiento ni función de
        ninguna marca. Lo evaluable es la categoría y el criterio, porque son lo que sigue siendo cierto cuando las marcas
        cambian.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Tipos de los ayudantes de arrastre (los paneles los reciben como props)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DragFactory = (id: string) => {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
};
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  role: "button";
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — El encargo del día
 * ═══════════════════════════════════════════════════════════════════════════ */
function EncargoPanel({
  accent,
  indice,
  resueltos,
  descartes,
  shakeCat,
  onElegir,
  onVerDescartes,
  onIr,
}: {
  accent: string;
  indice: number;
  resueltos: Record<string, boolean>;
  descartes: Record<string, boolean>;
  shakeCat: Categoria | null;
  onElegir: (cat: Categoria) => void;
  onVerDescartes: () => void;
  onIr: (i: number) => void;
}) {
  const encargo = ENCARGOS[indice] ?? ENCARGOS[0]!;
  const resuelto = resueltos[encargo.id] === true;
  const visto = descartes[encargo.id] === true;
  const hechos = Object.keys(resueltos).length;

  return (
    <>
      <div className="kit-card" data-done={resuelto} style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Eyebrow>Encargo {indice + 1} de {ENCARGOS.length} · {encargo.materia}</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechos >= ENCARGOS.length ? OK : T.text3, ...NUM }}>
            {hechos}/{ENCARGOS.length} resueltos
          </span>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.6, color: "#fff", fontWeight: 600 }}>{encargo.texto}</p>

        {resuelto ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                borderRadius: 13,
                border: `1px solid ${OK}55`,
                background: `${OK}12`,
                padding: "12px 15px",
                fontSize: 13,
                lineHeight: 1.55,
                color: T.text2,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, color: OK, marginRight: 8 }}>
                <i className={`fa-solid ${CATEGORIA_INFO[encargo.correcta].icono}`} />
                {CATEGORIA_INFO[encargo.correcta].titulo}
              </span>
              {encargo.porque}
            </div>

            {visto ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {encargo.descartes.map((d) => (
                  <div
                    key={d.cat}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${T.line}`,
                      background: T.inset,
                      padding: "11px 14px",
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: T.text2,
                      display: "flex",
                      gap: 11,
                      alignItems: "flex-start",
                    }}
                  >
                    <i className={`fa-solid ${CATEGORIA_INFO[d.cat].icono}`} style={{ color: T.text3, marginTop: 2 }} />
                    <span>
                      <strong style={{ color: T.text }}>{CATEGORIA_INFO[d.cat].titulo} no, porque </strong>
                      {d.porque}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <button className="kit-mini" onClick={onVerDescartes} style={{ alignSelf: "flex-start" }}>
                <i className="fa-solid fa-circle-question" style={{ marginRight: 8 }} />
                ¿Por qué no las otras dos?
              </button>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>
            Elige abajo la categoría de herramienta que resuelve este encargo. Si te equivocas, el laboratorio te dice para qué
            sirve en realidad la que elegiste.
          </p>
        )}

        <div className="kit-divider" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="kit-mini" onClick={() => onIr(indice - 1)} title="Encargo anterior">
            <i className="fa-solid fa-angle-left" style={{ marginRight: 7 }} />
            Anterior
          </button>
          {ENCARGOS.map((e, i) => (
            <button
              key={e.id}
              className="kit-mini"
              data-on={i === indice}
              data-done={resueltos[e.id] === true}
              onClick={() => onIr(i)}
              title={e.materia}
              style={{ minWidth: 38 }}
            >
              {resueltos[e.id] ? <i className="fa-solid fa-check" /> : i + 1}
            </button>
          ))}
          <button className="kit-mini" onClick={() => onIr(indice + 1)} title="Siguiente encargo">
            Siguiente
            <i className="fa-solid fa-angle-right" style={{ marginLeft: 7 }} />
          </button>
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Las ocho categorías · elige una</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))", gap: 10, marginTop: 12 }}>
          {CATEGORIAS_ORDEN.map((cat) => {
            const info = CATEGORIA_INFO[cat];
            const esCorrecta = resuelto && cat === encargo.correcta;
            return (
              <button
                key={cat}
                className="kit-cat"
                data-shake={shakeCat === cat}
                data-ok={esCorrecta}
                disabled={resuelto}
                onClick={() => onElegir(cat)}
                title={info.subtitulo}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 800 }}>
                  <i className={`fa-solid ${info.icono}`} style={{ color: esCorrecta ? OK : accent, fontSize: 13 }} />
                  {info.titulo}
                </span>
                <span style={{ fontWeight: 500, color: T.text3, fontSize: 11.5, lineHeight: 1.45 }}>{info.subtitulo}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — Elegir entre dos
 * ═══════════════════════════════════════════════════════════════════════════ */
function DueloPanel({
  accent,
  ronda,
  pareja,
  indice,
  resueltas,
  shakeLado,
  onElegir,
  onIr,
}: {
  accent: string;
  ronda: Ronda;
  pareja: Pareja;
  indice: number;
  resueltas: Record<string, boolean>;
  shakeLado: "a" | "b" | null;
  onElegir: (lado: "a" | "b") => void;
  onIr: (i: number) => void;
}) {
  const resuelta = resueltas[ronda.id] === true;
  const hechas = Object.keys(resueltas).length;
  const lados: ("a" | "b")[] = ["a", "b"];

  return (
    <>
      <div className="kit-card" data-done={resuelta} style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Eyebrow>
            Ronda {indice + 1} de {RONDAS.length} · {pareja.categoria}
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: hechas >= RONDAS.length ? OK : T.text3, ...NUM }}>
            {hechas}/{RONDAS.length}
          </span>
        </div>

        {ronda.giro && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              borderRadius: 999,
              border: `1px solid rgba(255,255,255,0.14)`,
              padding: "5px 13px",
              fontSize: 11.5,
              fontWeight: 800,
              color: accent,
              marginBottom: 12,
            }}
          >
            <i className="fa-solid fa-rotate" />
            Misma pareja, otra necesidad
          </div>
        )}

        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 6 }}>
          Necesidad declarada
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.6, color: "#fff", fontWeight: 600 }}>{ronda.necesidad}</p>

        {resuelta && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 13,
              border: `1px solid ${OK}55`,
              background: `${OK}12`,
              padding: "12px 15px",
              fontSize: 13,
              lineHeight: 1.55,
              color: T.text2,
            }}
          >
            <span style={{ fontWeight: 800, color: OK, marginRight: 7 }}>Gana {ronda.gana === "a" ? pareja.a.nombre : pareja.b.nombre}.</span>
            {ronda.porque} <span style={{ color: T.text3 }}>La otra no, porque {ronda.porqueNo.charAt(0).toLowerCase()}{ronda.porqueNo.slice(1)}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {lados.map((lado) => {
          const h = lado === "a" ? pareja.a : pareja.b;
          const gana = resuelta && lado === ronda.gana;
          return (
            <button
              key={lado}
              className="kit-tool"
              data-shake={shakeLado === lado}
              data-win={gana}
              disabled={resuelta}
              onClick={() => onElegir(lado)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: gana ? `${OK}22` : "rgba(255,255,255,0.06)",
                    color: gana ? OK : accent,
                    fontSize: 16,
                  }}
                >
                  <i className={`fa-solid ${h.icono}`} />
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{h.nombre}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {h.aFavor.map((x) => (
                  <span key={x} style={{ display: "flex", gap: 9, fontSize: 12.5, lineHeight: 1.45, color: T.text2 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 11, marginTop: 3 }} />
                    {x}
                  </span>
                ))}
                {h.enContra.map((x) => (
                  <span key={x} style={{ display: "flex", gap: 9, fontSize: 12.5, lineHeight: 1.45, color: T.text3 }}>
                    <i className="fa-solid fa-circle-minus" style={{ color: NO, fontSize: 11, marginTop: 3 }} />
                    {x}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="kit-mini" onClick={() => onIr(indice - 1)}>
          <i className="fa-solid fa-angle-left" style={{ marginRight: 7 }} />
          Anterior
        </button>
        {RONDAS.map((r, i) => (
          <button
            key={r.id}
            className="kit-mini"
            data-on={i === indice}
            data-done={resueltas[r.id] === true}
            onClick={() => onIr(i)}
            style={{ minWidth: 38 }}
            title={r.necesidad}
          >
            {resueltas[r.id] ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
        <button className="kit-mini" onClick={() => onIr(indice + 1)}>
          Siguiente
          <i className="fa-solid fa-angle-right" style={{ marginLeft: 7 }} />
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — Arregla el escritorio
 * ═══════════════════════════════════════════════════════════════════════════ */
function EscritorioPanel({
  accent,
  abierto,
  renombrado,
  archivado,
  selArchivo,
  shakeCarpeta,
  onAbrir,
  onElegirNombre,
  onSelArchivo,
  onArchivar,
  dragProps,
  dropProps,
}: {
  accent: string;
  abierto: string | null;
  renombrado: Record<string, boolean>;
  archivado: Record<string, MateriaId>;
  selArchivo: string | null;
  shakeCarpeta: MateriaId | null;
  onAbrir: (id: string) => void;
  onElegirNombre: (id: string, i: number) => void;
  onSelArchivo: (id: string) => void;
  onArchivar: (id: string, carpeta: MateriaId) => void;
  dragProps: DragFactory;
  dropProps: DropFactory;
}) {
  const enEscritorio = ARCHIVOS.filter((a) => !archivado[a.id]);
  const nRenombrados = Object.keys(renombrado).length;
  const nArchivados = Object.keys(archivado).length;

  const nombreDe = (a: ArchivoDesordenado) => (renombrado[a.id] ? a.opciones[a.correcta] ?? a.nombreMalo : a.nombreMalo);

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>Escritorio · seis archivos que no vas a encontrar en tres semanas</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: nRenombrados >= ARCHIVOS.length ? OK : T.text3, ...NUM }}>
            {nRenombrados}/{ARCHIVOS.length} con nombre · {nArchivados}/{ARCHIVOS.length} archivados
          </span>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
          Primero ponle a cada uno un nombre que sirva; después arrástralo a la carpeta de su materia. La consigna es de A5:
          «{CONSIGNA_A5}»
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {enEscritorio.length === 0 ? (
          <div
            style={{
              ...card,
              padding: "20px 22px",
              fontSize: 13.5,
              fontWeight: 700,
              color: OK,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className="fa-solid fa-circle-check" />
            Escritorio limpio: los seis archivos tienen nombre y están en la carpeta de su materia.
          </div>
        ) : (
          enEscritorio.map((a) => {
            const listo = renombrado[a.id] === true;
            const abiertoAqui = abierto === a.id;
            return (
              <div key={a.id} className="kit-card" data-done={listo} data-sel={selArchivo === a.id} style={{ padding: "14px 17px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 13, flexWrap: "wrap" }}>
                  <i className={`fa-solid ${a.icono}`} style={{ color: listo ? OK : T.text3, fontSize: 21, marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 210 }}>
                    <div
                      className="kit-nombre"
                      style={{
                        color: listo ? OK : "#fff",
                        fontWeight: 700,
                        wordBreak: "break-word",
                        textDecoration: listo ? "none" : "none",
                      }}
                    >
                      {nombreDe(a)}
                    </div>
                    {listo && (
                      <div className="kit-nombre" style={{ color: T.text3, marginTop: 4, textDecoration: "line-through" }}>
                        {a.nombreMalo}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>{a.contexto}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch" }}>
                    {!listo ? (
                      <button className="kit-mini" data-on={abiertoAqui} onClick={() => onAbrir(a.id)}>
                        <i className="fa-solid fa-i-cursor" style={{ marginRight: 8 }} />
                        {abiertoAqui ? "Cerrar" : "Renombrar"}
                      </button>
                    ) : (
                      <button
                        className="kit-chip"
                        data-sel={selArchivo === a.id}
                        style={{ padding: "8px 13px", width: "auto", justifyContent: "center" }}
                        onClick={() => onSelArchivo(a.id)}
                        title="Selecciónalo y toca su carpeta, o arrástralo"
                        {...dragProps(a.id)}
                      >
                        <i className="fa-solid fa-hand-pointer" style={{ fontSize: 11, marginTop: 2 }} />
                        Archivar
                      </button>
                    )}
                  </div>
                </div>

                {!listo && abiertoAqui && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 13 }}>
                    <span style={{ fontSize: 12, color: T.text3, fontWeight: 700 }}>¿Con cuál de estos tres lo vas a encontrar?</span>
                    {a.opciones.map((op, i) => (
                      <button key={op} className="kit-op" onClick={() => onElegirNombre(a.id, i)}>
                        <i className="fa-regular fa-file" style={{ color: accent, marginTop: 2, fontSize: 12 }} />
                        <span className="kit-nombre" style={{ flex: 1, wordBreak: "break-word" }}>
                          {op}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        {MATERIAS_ORDEN.map((m) => {
          const info = MATERIA_INFO[m];
          const dentro = ARCHIVOS.filter((a) => archivado[a.id] === m);
          const esperados = ARCHIVOS.filter((a) => a.materia === m).length;
          return (
            <div
              key={m}
              className="kit-bin"
              data-shake={shakeCarpeta === m}
              data-done={dentro.length >= esperados}
              onClick={() => selArchivo && onArchivar(selArchivo, m)}
              {...dropProps((id) => onArchivar(id, m))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <i className={`fa-solid ${info.icono}`} style={{ color: dentro.length >= esperados ? OK : accent }} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
                <span style={{ marginLeft: "auto", fontSize: 11.5, color: T.text3, ...NUM }}>
                  {dentro.length}/{esperados}
                </span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 11, lineHeight: 1.4 }}>
                Una carpeta por materia del semestre.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.length === 0 ? (
                  <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "6px 0" }}>Arrastra aquí…</div>
                ) : (
                  dentro.map((a) => (
                    <span
                      key={a.id}
                      className="kit-nombre"
                      style={{
                        animation: "kitPop .25s ease",
                        display: "inline-flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "8px 11px",
                        borderRadius: 10,
                        background: `${OK}1a`,
                        border: `1px solid ${OK}55`,
                        color: "#fff",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}
                    >
                      <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                      {a.opciones[a.correcta] ?? a.nombreMalo}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-ruler" style={{ marginRight: 8, color: accent }} />
          La convención, en cinco reglas
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 11, marginTop: 12 }}>
          {REGLAS_NOMBRE.map((r) => (
            <div key={r.regla} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <i className={`fa-solid ${r.icono}`} style={{ color: accent, fontSize: 13, marginTop: 3 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.5, color: T.text2 }}>
                <strong style={{ color: T.text }}>{r.regla}. </strong>
                {r.porque}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — El trabajo completo
 * ═══════════════════════════════════════════════════════════════════════════ */
function FlujoPanel({
  accent,
  flujoPos,
  selPaso,
  shakeLinea,
  pasoTool,
  onSelPaso,
  onColocar,
  onAsignar,
  dragProps,
  dropProps,
}: {
  accent: string;
  flujoPos: number;
  selPaso: string | null;
  shakeLinea: boolean;
  pasoTool: Record<string, boolean>;
  onSelPaso: (id: string) => void;
  onColocar: (id: string) => void;
  onAsignar: (pasoId: string, cat: Categoria) => void;
  dragProps: DragFactory;
  dropProps: DropFactory;
}) {
  const completo = flujoPos >= PASOS.length;
  const sueltos = PASOS.filter((p) => p.orden >= flujoPos)
    .slice()
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
  const colocados: PasoTrabajo[] = PASOS.filter((p) => p.orden < flujoPos);
  const conHerramienta = Object.keys(pasoTool).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Eyebrow>Pasos sueltos · colócalos en el orden en que ocurren</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: completo ? OK : T.text3, ...NUM }}>
            {flujoPos}/{PASOS.length}
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>
          Trabajo de demostración: <strong style={{ color: T.text2 }}>«El agua que se pierde en la colonia»</strong>, en equipo de
          tres, con encuesta y exposición.
        </p>
        {completo ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" />
            Los ocho pasos en orden. Ahora asigna la herramienta de cada uno ({conHerramienta}/{PASOS.length}).
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(235px, 1fr))", gap: 10 }}>
            {sueltos.map((p) => (
              <button key={p.id} className="kit-chip" data-sel={selPaso === p.id} onClick={() => onSelPaso(p.id)} {...dragProps(p.id)}>
                <i className="fa-solid fa-grip-vertical" style={{ color: T.text3, marginTop: 3, fontSize: 11 }} />
                <span>
                  <span style={{ display: "block", fontWeight: 800 }}>{p.titulo}</span>
                  <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 12, marginTop: 3 }}>{p.detalle}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="kit-linea" data-shake={shakeLinea} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PASOS.map((p, i) => {
          const puesto = i < flujoPos;
          const esSiguiente = i === flujoPos;
          const resuelto = pasoTool[p.id] === true;
          if (!puesto) {
            return (
              <div
                key={p.id}
                className="kit-slot"
                data-armed={esSiguiente && !!selPaso}
                onClick={() => esSiguiente && selPaso && onColocar(selPaso)}
                {...dropProps((id) => onColocar(id))}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${T.line}`,
                    fontSize: 12,
                    fontWeight: 900,
                    color: T.text3,
                    ...NUM,
                  }}
                >
                  {i + 1}
                </span>
                {esSiguiente ? "Aquí va el siguiente paso del trabajo" : "Paso pendiente"}
              </div>
            );
          }
          const colocado = colocados.find((c) => c.id === p.id) ?? p;
          return (
            <div key={p.id} className="kit-card" data-done={resuelto} style={{ padding: "13px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: resuelto ? `${OK}26` : "rgba(255,255,255,0.07)",
                    color: resuelto ? OK : accent,
                    fontSize: 12,
                    fontWeight: 900,
                    ...NUM,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>{colocado.titulo}</div>
                  <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.45, marginTop: 3 }}>{colocado.detalle}</div>

                  {resuelto ? (
                    <div style={{ marginTop: 10, fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9 }}>
                      <i className={`fa-solid ${CATEGORIA_INFO[colocado.correcta].icono}`} style={{ color: OK, marginTop: 2 }} />
                      <span>
                        <strong style={{ color: OK }}>{CATEGORIA_INFO[colocado.correcta].titulo}. </strong>
                        {colocado.porque}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {colocado.opciones.map((cat) => (
                        <button key={cat} className="kit-mini" onClick={() => onAsignar(colocado.id, cat)}>
                          <i className={`fa-solid ${CATEGORIA_INFO[cat].icono}`} style={{ marginRight: 7, color: accent }} />
                          {CATEGORIA_INFO[cat].corto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero / falso (A4, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */
function HechosCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (boolean | null)[];
  onResponder: (i: number, valor: boolean) => void;
}) {
  const aciertos = respuestas.filter((r, i) => r !== null && r === HECHOS[i]!.respuesta).length;

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-unbalanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (A4, verbatim)
        </Eyebrow>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i];
          const resuelto = r !== null && r === h.respuesta;
          const fallado = r !== null && r !== h.respuesta;
          return (
            <div
              key={i}
              style={{
                borderRadius: 13,
                border: `1px solid ${resuelto ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                background: resuelto ? `${OK}0f` : T.glass,
                padding: "13px 16px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{h.enunciado}</div>
                {r !== null && (
                  <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginTop: 7 }}>
                    <i
                      className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-exclamation"}`}
                      style={{ color: resuelto ? OK : NO, marginRight: 8 }}
                    />
                    {h.retro}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="kit-vf"
                  data-on={resuelto && h.respuesta === true}
                  data-bad={fallado && r === true}
                  disabled={resuelto}
                  onClick={() => onResponder(i, true)}
                >
                  Verdadero
                </button>
                <button
                  className="kit-vf"
                  data-on={resuelto && h.respuesta === false}
                  data-bad={fallado && r === false}
                  disabled={resuelto}
                  onClick={() => onResponder(i, false)}
                >
                  Falso
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
