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
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { KIT_HERRAMIENTAS_HUECOS } from "./kit-herramientas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
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
import {
  ETAPAS,
  EQUIPO,
  HORAS_INICIO,
  medidores,
  resultadoFinal,
  type Aplicada,
  type OpcionEtapa,
} from "./kit-herramientas-entrega";

const NO = "#FF5E5E";
const RETO_KEY = "cen-kit-herramientas-digitales-reto";
const RUTA_SIM = "/media/labs-sim/kit-herramientas-digitales";

type Modo = "entrega" | "encargo" | "duelo" | "escritorio" | "flujo" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "entrega", label: "La entrega del viernes", icono: "fa-flag-checkered" },
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

  // ── modo 0: la entrega del viernes (simulador) ────────────────────────
  const [aplicadas, setAplicadas] = useState<Aplicada[]>([]);
  const [prueba, setPrueba] = useState<Aplicada | null>(null);
  const [deshechas, setDeshechas] = useState(0);
  const etapaIdx = aplicadas.length;
  const etapa = ETAPAS[etapaIdx] ?? null;
  const entregaDone = aplicadas.length >= ETAPAS.length;
  const med = medidores(prueba ? [...aplicadas, prueba] : aplicadas);
  const fin = resultadoFinal(med);

  const elegirOpcion = (op: OpcionEtapa) => {
    if (!etapa || prueba) return;
    const ap = { etapa: etapa.id, opcion: op.id };
    if (op.mejor) {
      setAplicadas((a) => [...a, ap]);
      sfxPlace();
      if (aplicadas.length + 1 >= ETAPAS.length) sfxOk();
    } else {
      setPrueba(ap);
      sfxNo();
    }
  };
  const deshacerPrueba = () => {
    setPrueba(null);
    setDeshechas((n) => n + 1);
  };
  const resetEntrega = () => {
    setAplicadas([]);
    setPrueba(null);
    setDeshechas(0);
  };

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "Lleva el informe del equipo hasta la entrega", done: entregaDone },
    { txt: "Entrega sin deshacer ninguna elección", done: entregaDone && deshechas === 0 },
    { txt: "Resuelve los 8 encargos con la categoría correcta", done: encargosDone },
    { txt: "Lee por qué no servían las otras en los 8", done: descartesDone },
    { txt: "Gana las 7 rondas de «Elegir entre dos»", done: dueloDone },
    { txt: "Renombra los 6 archivos del escritorio", done: renombreDone },
    { txt: "Archiva los 6 en la carpeta de su materia", done: archivoDone },
    { txt: "Ordena los 8 pasos del trabajo", done: ordenDone },
    { txt: "Asigna la herramienta de cada paso", done: toolsDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone, modo: "glosario" },
    { txt: "Completa el texto de A6", done: textoDone, modo: "texto" },
    { txt: "Acierta los 4 hechos verdadero o falso", done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "entrega"
      ? resetEntrega
      : modo === "encargo"
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

  const lectura =
    modo === "entrega" ? (
      <>Horas: {med.horas} · Calidad: {med.calidad} % · Colaboración: {med.colab} %</>
    ) : modo === "encargo" ? (
      <>Encargos resueltos: {Object.keys(encargoOk).length}/{ENCARGOS.length}</>
    ) : modo === "duelo" ? (
      <>Rondas ganadas: {Object.keys(rondaOk).length}/{RONDAS.length}</>
    ) : modo === "escritorio" ? (
      <>Archivos renombrados: {Object.keys(renombrado).length}/{ARCHIVOS.length}</>
    ) : modo === "flujo" ? (
      <>Pasos ordenados: {flujoPos}/{PASOS.length}</>
    ) : (
      <>Repaso de los términos de las herramientas</>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{`
        @keyframes kitShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes kitPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .kit-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .kit-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .kit-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .kit-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .kit-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .kit-icobtn:hover { background:rgba(255,255,255,0.12); }

        .kit-cat { cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; gap:5px; text-align:left;
          padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
          font-size:14px; font-weight:700; transition:all .14s; line-height:1.4; width:100%; }
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
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700;
          transition:all .14s; user-select:none; text-align:left; line-height:1.45; width:100%; }
        .kit-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .kit-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.01); }
        .kit-chip:active { cursor:grabbing; }

        .kit-bin { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; min-height:150px; }
        .kit-bin[data-shake="true"] { animation:kitShake .4s; border-color:${NO}; }
        .kit-bin[data-done="true"] { border-color:${OK}55; }

        .kit-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; padding:10px 13px;
          line-height:1.45; transition:all .14s; font-family:inherit; }
        .kit-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-op:disabled { cursor:default; }
        .kit-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .kit-op[data-bad="true"] { border-color:${NO}; background:${NO}1c; color:#fff; }

        .kit-mini { cursor:pointer; padding:7px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .kit-mini:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-mini:disabled { opacity:.45; cursor:not-allowed; }
        .kit-mini[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .kit-mini[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .kit-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .kit-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .kit-vf:disabled { cursor:default; opacity:.85; }
        .kit-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .kit-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }

        .kit-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:46px; padding:9px 12px;
          display:flex; align-items:center; gap:10px; color:${T.text3}; font-size:14px; transition:all .16s; }
        .kit-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .kit-linea[data-shake="true"] { animation:kitShake .4s; }
        .kit-nombre { font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:14px; letter-spacing:-0.01em; }
        .kit-divider { height:1px; background:${T.line}; margin:16px 0; }

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
        .kit-foto { position:relative; width:100%; aspect-ratio:16/9; max-height:200px; border-radius:12px; overflow:hidden; margin-bottom:12px;
          background:linear-gradient(135deg, rgba(${color.rgba},0.28), rgba(255,255,255,0.04)); display:flex; align-items:center; justify-content:center; }
        .kit-foto > i { font-size:38px; color:rgba(255,255,255,0.35); }
        .kit-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .kit-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap:10px; padding:12px 14px; border-radius:16px;
          border:1.5px solid ${T.line}; background:${T.glass}; }
        .kit-medidor-cab { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; color:${T.text}; margin-bottom:6px; }
        .kit-medidor-barra { height:12px; border-radius:8px; background:${T.inset}; overflow:hidden; }
        .kit-medidor-barra > div { height:100%; border-radius:8px; transition:width .5s ease, background .3s; }
        .kit-etapas { display:flex; gap:8px; flex-wrap:wrap; }
        .kit-etapa { display:inline-flex; align-items:center; gap:7px; padding:7px 12px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glass};
          font-size:14px; font-weight:800; color:${T.text3}; }
        .kit-etapa[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.16); }
        .kit-etapa[data-done="true"] { border-color:${OK}66; color:${OK}; }
        .kit-bitacora { display:flex; flex-direction:column; gap:8px; }
        .kit-bit { display:flex; gap:10px; font-size:14px; line-height:1.5; color:${T.text2}; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; }
        .kit-eleccion { cursor:pointer; display:flex; gap:12px; align-items:flex-start; width:100%; text-align:left; padding:13px 15px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-family:inherit; transition:all .14s; }
        .kit-eleccion > i { font-size:18px; color:${accent}; margin-top:3px; width:22px; text-align:center; }
        .kit-eleccion strong { display:block; font-size:15px; margin-bottom:3px; }
        .kit-eleccion span > span { display:block; font-size:14px; line-height:1.45; color:${T.text2}; font-weight:500; }
        .kit-eleccion:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
        .kit-eleccion:disabled { cursor:default; opacity:.6; }
        .kit-eleccion[data-bad="true"] { border-color:${NO}; background:${NO}18; opacity:1; }
        .kit-consecuencia { margin-top:8px; padding:12px 14px; border-radius:12px; border:1px solid ${NO}55; background:${NO}10; display:flex; flex-direction:column;
          gap:8px; align-items:flex-start; font-size:14px; line-height:1.5; color:${T.text2}; }
        .kit-deltas { display:inline-flex; flex-wrap:wrap; gap:6px; margin-left:4px; }
        .kit-deltas em { font-style:normal; font-size:14px; font-weight:800; padding:2px 8px; border-radius:8px; background:${NO}1f; color:${NO}; }
        .kit-deltas em[data-bueno="true"] { background:${OK}1f; color:${OK}; }
        @media (prefers-reduced-motion: reduce){ .kit-medidor-barra > div { transition:none; } .kit-eleccion:hover { transform:none; } }
      `}</style>

          {modo === "entrega" && (
            <>
              <MedidoresEntrega med={med} />

              <div className="kit-etapas" role="list" aria-label="Etapas del trabajo">
                {ETAPAS.map((e, i) => (
                  <span key={e.id} role="listitem" className="kit-etapa" data-on={i === etapaIdx && !entregaDone} data-done={i < etapaIdx}>
                    <i className={`fa-solid ${i < etapaIdx ? "fa-check" : e.icono}`} />
                    <span>{i + 1}</span>
                  </span>
                ))}
              </div>

              {etapaIdx === 0 && !prueba && (
                <div className="kit-card" style={{ padding: "16px 18px" }}>
                  <div className="kit-foto">
                    <i className="fa-solid fa-people-group" aria-hidden />
                    <img
                      src={`${RUTA_SIM}/${EQUIPO.imagen}.webp`}
                      alt={EQUIPO.imagenAlt}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>{EQUIPO.titulo}</div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: T.text2 }}>{EQUIPO.intro}</p>
                </div>
              )}

              {aplicadas.length > 0 && (
                <div className="kit-bitacora">
                  {aplicadas.map((a) => {
                    const e = ETAPAS.find((x) => x.id === a.etapa)!;
                    const op = e.opciones.find((x) => x.id === a.opcion)!;
                    return (
                      <div key={a.etapa} className="kit-bit">
                        <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 3 }} />
                        <span>
                          <strong style={{ color: "#fff" }}>{e.titulo}: {op.titulo}.</strong> {op.pasa} <DeltasOpcion op={op} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {etapa && (
                <div className="kit-card" style={{ padding: "18px 20px" }}>
                  <Eyebrow>
                    <i className={`fa-solid ${etapa.icono}`} style={{ marginRight: 8, color: accent }} />
                    Etapa {etapaIdx + 1} de {ETAPAS.length} · {etapa.titulo}
                  </Eyebrow>
                  <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.55, color: "#fff", fontWeight: 600 }}>{etapa.situacion}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {etapa.opciones.map((op) => {
                      const elegida = prueba?.opcion === op.id;
                      return (
                        <div key={op.id}>
                          <button className="kit-eleccion" data-bad={elegida} disabled={!!prueba} onClick={() => elegirOpcion(op)}>
                            <i className={`fa-solid ${op.icono}`} />
                            <span>
                              <strong>{op.titulo}</strong>
                              <span>{op.hace}</span>
                            </span>
                          </button>
                          {elegida && (
                            <div className="kit-consecuencia" role="alert">
                              <span>{op.pasa}</span>
                              <DeltasOpcion op={op} />
                              <span>Mira cómo se movieron los medidores. Deshaz la elección y prueba otra.</span>
                              <button className="kit-mini" onClick={deshacerPrueba}>
                                <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
                                Deshacer y elegir otra
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {entregaDone && (
                <div className="kit-card" data-done="true" style={{ padding: "18px 20px" }}>
                  <Eyebrow>
                    <i className="fa-solid fa-flag-checkered" style={{ marginRight: 8, color: OK }} />
                    Entrega: calificación simulada {fin.nota.toFixed(1)}
                  </Eyebrow>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: T.text2 }}>
                    {fin.aTiempo ? `Entregan a tiempo y sobran ${med.horas} horas.` : "Entregan tarde: se acabaron las horas."} Calidad {med.calidad} %, colaboración{" "}
                    {med.colab} %. Cada herramienta se eligió por lo que tenía que hacer en esa etapa, no por su nombre.
                    {deshechas > 0 ? ` Deshiciste ${deshechas} ${deshechas === 1 ? "elección" : "elecciones"} en el camino.` : " Sin deshacer ninguna elección."}
                  </p>
                </div>
              )}
            </>
          )}

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
              fontSize: 14,
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Horas libres" value={`${med.horas} h`} />
                  <Dato label="Errores" value={String(partida.errores)} />
                </div>
              </Bloque>
              <Bloque titulo="Cómo elegir" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "entrega" && (
                <>
                  Elige por <strong style={{ color: T.text }}>lo que la herramienta tiene que hacer</strong> en esa etapa. Si algo sale mal, mira qué medidor
                  se movió y por qué.
                </>
              )}
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
            <>
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
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="La tarea que viene · A3" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2 }}>{CONSIGNA_A3.prompt}</p>
                {CONSIGNA_A3.pistas.map((pista, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} />
                    {pista}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Lectura A1 · para pensar" icono="fa-book-open-reader">
                {COMPRENSION_A1.map((c, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{c.pregunta}</strong> {c.guia}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="¿Sabías?" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_SABIAS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={KIT_HERRAMIENTAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Sobre el contenido" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text2 }}>
                  Verbatim de CD-I-P08: la lectura A1 con su «¿Sabías?» y sus preguntas, el reto evaluable (A2), la consigna y las pistas (A3), los cuatro
                  enunciados verdadero/falso (A4), el glosario y su actividad final —«{CONSIGNA_A5}»— (A5) y el texto con huecos (A6). Escrito para este
                  laboratorio (ilustrativo): la entrega del viernes, los ocho encargos, las parejas de herramientas, los seis archivos y los ocho pasos. Las
                  personas, los salones y las fechas son ficticios y las cifras son simulación. Aquí no se afirma ningún precio ni función de ninguna marca: lo
                  evaluable es la categoría y el criterio.
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «La entrega del viernes»: medidores y consecuencias
 * ═══════════════════════════════════════════════════════════════════════════ */
function MedidoresEntrega({ med }: { med: { horas: number; calidad: number; colab: number } }) {
  const filas = [
    { id: "horas", label: "Horas libres", icono: "fa-hourglass-half", valor: med.horas, max: HORAS_INICIO, txt: `${med.horas} h`, col: med.horas <= 2 ? "#FF8A5E" : "#5BC8FF" },
    { id: "calidad", label: "Calidad", icono: "fa-medal", valor: med.calidad, max: 100, txt: `${med.calidad} %`, col: med.calidad >= 70 ? OK : med.calidad >= 40 ? "#FFC75A" : "#FF8A5E" },
    { id: "colab", label: "Colaboración", icono: "fa-people-group", valor: med.colab, max: 100, txt: `${med.colab} %`, col: med.colab >= 70 ? OK : med.colab >= 40 ? "#FFC75A" : "#FF8A5E" },
  ];
  return (
    <div className="kit-medidores" aria-live="polite">
      {filas.map((f) => (
        <div key={f.id} className="kit-medidor">
          <div className="kit-medidor-cab">
            <span>
              <i className={`fa-solid ${f.icono}`} style={{ color: f.col, marginRight: 7 }} />
              {f.label}
            </span>
            <strong style={{ color: f.col }}>{f.txt}</strong>
          </div>
          <div className="kit-medidor-barra">
            <div style={{ width: `${(f.valor / f.max) * 100}%`, background: f.col }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Cuánto movió una elección cada medidor (para que el cambio se lea con número). */
function DeltasOpcion({ op }: { op: OpcionEtapa }) {
  const items: { txt: string; bueno: boolean }[] = [
    { txt: op.horas === 0 ? "0 h" : `-${op.horas} h`, bueno: op.horas <= 1 },
    { txt: `${op.calidad > 0 ? "+" : ""}${op.calidad} calidad`, bueno: op.calidad >= 0 },
    { txt: `${op.colab > 0 ? "+" : ""}${op.colab} colaboración`, bueno: op.colab >= 0 },
  ];
  return (
    <span className="kit-deltas">
      {items.map((d) => (
        <em key={d.txt} data-bueno={d.bueno}>
          {d.txt}
        </em>
      ))}
    </span>
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
          <span style={{ fontSize: 14, fontWeight: 800, color: hechos >= ENCARGOS.length ? OK : T.text3, ...NUM }}>
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
                fontSize: 14,
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
                      fontSize: 14,
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
          <p style={{ margin: 0, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 255px), 1fr))", gap: 10, marginTop: 12 }}>
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 800 }}>
                  <i className={`fa-solid ${info.icono}`} style={{ color: esCorrecta ? OK : accent, fontSize: 14 }} />
                  {info.titulo}
                </span>
                <span style={{ fontWeight: 500, color: T.text3, fontSize: 14, lineHeight: 1.45 }}>{info.subtitulo}</span>
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
          <span style={{ fontSize: 14, fontWeight: 800, color: hechas >= RONDAS.length ? OK : T.text3, ...NUM }}>
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
              fontSize: 14,
              fontWeight: 800,
              color: accent,
              marginBottom: 12,
            }}
          >
            <i className="fa-solid fa-rotate" />
            Misma pareja, otra necesidad
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.text3, marginBottom: 6 }}>
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
              fontSize: 14,
              lineHeight: 1.55,
              color: T.text2,
            }}
          >
            <span style={{ fontWeight: 800, color: OK, marginRight: 7 }}>Gana {ronda.gana === "a" ? pareja.a.nombre : pareja.b.nombre}.</span>
            {ronda.porque} <span style={{ color: T.text3 }}>La otra no, porque {ronda.porqueNo.charAt(0).toLowerCase()}{ronda.porqueNo.slice(1)}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
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
                  <span key={x} style={{ display: "flex", gap: 9, fontSize: 14, lineHeight: 1.45, color: T.text2 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 14, marginTop: 3 }} />
                    {x}
                  </span>
                ))}
                {h.enContra.map((x) => (
                  <span key={x} style={{ display: "flex", gap: 9, fontSize: 14, lineHeight: 1.45, color: T.text3 }}>
                    <i className="fa-solid fa-circle-minus" style={{ color: NO, fontSize: 14, marginTop: 3 }} />
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
          <span style={{ fontSize: 14, fontWeight: 800, color: nRenombrados >= ARCHIVOS.length ? OK : T.text3, ...NUM }}>
            {nRenombrados}/{ARCHIVOS.length} con nombre · {nArchivados}/{ARCHIVOS.length} archivados
          </span>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: T.text3, lineHeight: 1.55 }}>
          Primero ponle a cada uno un nombre que sirva; después arrástralo a la carpeta de su materia. La consigna es de A5:
          «{CONSIGNA_A5}»
        </p>
      </div>

      <Mesa>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {enEscritorio.length === 0 ? (
          <div
            style={{
              ...card,
              padding: "20px 22px",
              fontSize: 14,
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
                  <div style={{ flex: 1, minWidth: "min(100%, 210px)" }}>
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
                    <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>{a.contexto}</div>
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
                        <i className="fa-solid fa-hand-pointer" style={{ fontSize: 14, marginTop: 2 }} />
                        Archivar
                      </button>
                    )}
                  </div>
                </div>

                {!listo && abiertoAqui && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 13 }}>
                    <span style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>¿Con cuál de estos tres lo vas a encontrar?</span>
                    {a.opciones.map((op, i) => (
                      <button key={op} className="kit-op" onClick={() => onElegirNombre(a.id, i)}>
                        <i className="fa-regular fa-file" style={{ color: accent, marginTop: 2, fontSize: 14 }} />
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 12 }}>
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
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
                <span style={{ marginLeft: "auto", fontSize: 14, color: T.text3, ...NUM }}>
                  {dentro.length}/{esperados}
                </span>
              </div>
              <div style={{ fontSize: 14, color: T.text3, marginBottom: 11, lineHeight: 1.4 }}>
                Una carpeta por materia del semestre.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.length === 0 ? (
                  <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "6px 0" }}>Arrastra aquí…</div>
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
                      <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                      {a.opciones[a.correcta] ?? a.nombreMalo}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      </Mesa>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-ruler" style={{ marginRight: 8, color: accent }} />
          La convención, en cinco reglas
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))", gap: 11, marginTop: 12 }}>
          {REGLAS_NOMBRE.map((r) => (
            <div key={r.regla} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <i className={`fa-solid ${r.icono}`} style={{ color: accent, fontSize: 14, marginTop: 3 }} />
              <span style={{ fontSize: 14, lineHeight: 1.5, color: T.text2 }}>
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
      <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <Eyebrow>Pasos sueltos · colócalos en el orden en que ocurren</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: completo ? OK : T.text3, ...NUM }}>
            {flujoPos}/{PASOS.length}
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Trabajo de demostración: <strong style={{ color: T.text2 }}>«El agua que se pierde en la colonia»</strong>, en equipo de
          tres, con encuesta y exposición.
        </p>
        {completo ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" />
            Los ocho pasos en orden. Ahora asigna la herramienta de cada uno ({conHerramienta}/{PASOS.length}).
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 235px), 1fr))", gap: 10 }}>
            {sueltos.map((p) => (
              <button key={p.id} className="kit-chip" data-sel={selPaso === p.id} onClick={() => onSelPaso(p.id)} {...dragProps(p.id)}>
                <i className="fa-solid fa-grip-vertical" style={{ color: T.text3, marginTop: 3, fontSize: 14 }} />
                <span>
                  <span style={{ display: "block", fontWeight: 800 }}>{p.titulo}</span>
                  <span style={{ display: "block", fontWeight: 500, color: T.text2, fontSize: 14, marginTop: 3 }}>{p.detalle}</span>
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
                    fontSize: 14,
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
                    fontSize: 14,
                    fontWeight: 900,
                    ...NUM,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>{colocado.titulo}</div>
                  <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45, marginTop: 3 }}>{colocado.detalle}</div>

                  {resuelto ? (
                    <div style={{ marginTop: 10, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9 }}>
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
      </Mesa>
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
        <span style={{ fontSize: 14, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, ...NUM }}>
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
              <div style={{ flex: 1, minWidth: "min(100%, 240px)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{h.enunciado}</div>
                {r !== null && (
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 7 }}>
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
