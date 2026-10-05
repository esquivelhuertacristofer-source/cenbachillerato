"use client";

/**
 * Laboratorio — Estrategias para buscar información confiable en internet
 * Práctica experimental para CD-II-P01 (Cultura Digital II).
 *
 * BUSCADOR SIMULADO (sitios y cifras inventados): el alumno arma una consulta con
 * palabras y operadores, la página de resultados cambia, revisa cada fuente con
 * los cinco criterios (cuesta tiempo) y su tarea recibe nota según la calidad.
 * Después, los modos de refuerzo. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Estrategia o señal de alerta?» — clasifica nueve indicios entre
 *     estrategia de búsqueda confiable y señal de alerta de desinformación.
 *  2. «Las cinco estrategias» — empareja cada estrategia (verificar dominio y
 *     autoría, revisar la fecha, buscar citas, lateral reading, evaluar el tono)
 *     con la pregunta clave que responde (verbatim de A1).
 *  3. «Escribe el término» — lee la definición verbatim (A1/A2) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (opción múltiple verbatim de A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-II·P01.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { BUSQUEDA_CONFIABLE_HUECOS } from "./busqueda-confiable-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { BUSQUEDA_CONFIABLE_FICHA } from "./busqueda-confiable-ficha";
import {
  SENALES,
  CATEGORIA_INFO,
  CRITERIOS,
  PARES,
  QUIZ,
  DATO_BUSQUEDA,
  type Categoria,
} from "./busqueda-confiable-data";
import {
  CRITERIOS_REVISION,
  FUENTES,
  MIN_FUENTES,
  NOTA_META,
  PALABRAS,
  TIEMPO_TOTAL,
  UMBRAL_CONFIABLE,
  buscar,
  consultaTexto,
  CONSULTA_VACIA,
  datoCriterio,
  evaluarTarea,
  operadoresActivos,
  retroVeredicto,
  veredictoCorrecto,
  type Consulta,
  type Criterio,
  type Fuente,
  type Veredicto,
} from "./busqueda-confiable-sim";

const NO = "#FF5E5E";
const FUENTES_POR_ID = (id: string): Fuente | undefined => FUENTES.find((f) => f.id === id);
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-busqueda-confiable-reto";

type Modo = "buscador" | "senales" | "estrategias" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "buscador", label: "Buscador", icono: "fa-magnifying-glass-chart" },
  { id: "senales", label: "¿Estrategia o señal de alerta?", icono: "fa-flag" },
  { id: "estrategias", label: "Las cinco estrategias", icono: "fa-magnifying-glass" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabBusquedaConfiable({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("buscador");

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

  // ── modo buscador (simulador) ──────────────────────────────────────────
  // El estado vive aquí, no en el modo: al cambiar de pestaña no se pierde ni
  // se des-cumple ninguna misión.
  const [consulta, setConsulta] = useState<Consulta>(CONSULTA_VACIA);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [revisados, setRevisados] = useState<Record<string, Criterio[]>>({});
  const [veredictos, setVeredictos] = useState<Record<string, Veredicto>>({});
  const [usoOperador, setUsoOperador] = useState(false);
  const [lograNota, setLograNota] = useState(false);
  const tiempoUsado = Object.values(revisados)
    .flat()
    .reduce((s, c) => s + (CRITERIOS_REVISION.find((x) => x.id === c)?.costo ?? 0), 0);
  const tarea = evaluarTarea(Object.keys(veredictos).filter((id) => veredictos[id] === "usar"));

  const actualizarConsulta = (c: Consulta) => {
    setConsulta(c);
    if (operadoresActivos(c) > 0) setUsoOperador(true);
    if (audioRef.current && sonido) audioRef.current.blip();
  };
  const revisar = (fid: string, c: Criterio) => {
    const costo = CRITERIOS_REVISION.find((x) => x.id === c)?.costo ?? 0;
    const ya = revisados[fid] ?? [];
    if (ya.includes(c) || tiempoUsado + costo > TIEMPO_TOTAL) return;
    setRevisados({ ...revisados, [fid]: [...ya, c] });
    if (audioRef.current && sonido) audioRef.current.blip();
  };
  const decidir = (fid: string, v: Veredicto) => {
    if (veredictos[fid]) return;
    const f = FUENTES_POR_ID(fid);
    if (!f) return;
    if (veredictoCorrecto(f, v)) sfxPlace();
    else sfxNo();
    const sig = { ...veredictos, [fid]: v };
    setVeredictos(sig);
    const t = evaluarTarea(Object.keys(sig).filter((id) => sig[id] === "usar"));
    if (t.usadas.length >= MIN_FUENTES && t.nota >= NOTA_META) setLograNota(true);
  };
  const resetBuscador = () => {
    setConsulta(CONSULTA_VACIA);
    setAbierto(null);
    setRevisados({});
    setVeredictos({});
    setUsoOperador(false);
    setLograNota(false);
  };

  // ── modo señales (clasifica estrategia / alerta) ───────────────────────
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
        persistMejor(true, estrategiasDone, glosarioDone);
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

  // ── modo estrategias (empareja estrategia → pregunta) ──────────────────
  const [empEstr, setEmpEstr] = useState<Record<string, boolean>>({});
  const [selEstr, setSelEstr] = useState<string | null>(null);
  const [shakeEstr, setShakeEstr] = useState<string | null>(null);
  const estrLibres = CRITERIOS.filter((c) => !empEstr[c.id]).slice().sort((a, b) => a.criterio.localeCompare(b.criterio, "es"));

  const intentarEstr = (chipId: string, rowId: string) => {
    if (empEstr[rowId]) return;
    if (chipId === rowId) {
      setEmpEstr((e) => ({ ...e, [rowId]: true }));
      setSelEstr(null);
      sfxPlace();
      if (Object.keys(empEstr).length + 1 >= CRITERIOS.length) {
        sfxOk();
        persistMejor(senalesDone, true, glosarioDone);
      }
    } else {
      setShakeEstr(rowId);
      sfxNo();
      window.setTimeout(() => setShakeEstr(null), 420);
    }
  };
  const resetEstrategias = () => {
    setEmpEstr({});
    setSelEstr(null);
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
  const estrategiasDone = Object.keys(empEstr).length >= CRITERIOS.length;
  const modosHechos = (senalesDone ? 1 : 0) + (estrategiasDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Busca con al menos un operador (comillas, site:, − o after:)", done: usoOperador },
    { txt: "Elige 3 fuentes confiables y saca 8 o más en tu tarea", done: lograNota },
    { txt: "Clasifica los 9 indicios (estrategia / alerta)", done: senalesDone },
    { txt: "Empareja las 5 estrategias con su pregunta", done: estrategiasDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone, modo: "glosario" },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "buscador" ? resetBuscador : modo === "senales" ? resetSenales : modo === "estrategias" ? resetEstrategias : resetGlosario;

  const pistaDe: Record<Modo, string> = {
    buscador: "Las comillas piden TODAS las palabras; site: limita el dominio; el signo menos quita lo que no quieres. Revisar cuesta minutos: decide qué revisar primero.",
    senales: "Una estrategia confiable ayuda a evaluar la fuente antes de creerla; una señal de alerta (lenguaje alarmista, titular sensacionalista) invita a desconfiar y verificar.",
    estrategias: "Para evaluar una fuente pregúntate quién la publicó, cuándo, si cita sus fuentes, qué dicen otros sitios sobre ella y si su tono es alarmista.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Completa los huecos del texto con las palabras de la lectura.",
  };

  const lectura =
    modo === "buscador" ? (
      tarea.usadas.length === 0 ? (
        <>Busca, revisa y elige al menos {MIN_FUENTES} fuentes para tu tarea.</>
      ) : (
        <>
          Nota de tu tarea: <strong>{tarea.nota.toFixed(1)}</strong> · calidad {tarea.calidad}/100
        </>
      )
    ) : modo === "senales" ? (
      <>
        {Object.keys(ubicSenal).length} de {SENALES.length} indicios clasificados
      </>
    ) : modo === "estrategias" ? (
      <>
        {Object.keys(empEstr).length} de {CRITERIOS.length} estrategias emparejadas
      </>
    ) : undefined;

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={
        <div>
          <style>{`
        @keyframes bcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes bcPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .bc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .bc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .bc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .bc-chip:active { cursor:grabbing; }
        .bc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .bc-row[data-shake="true"] { animation:bcShake .4s; border-color:${NO}; }
        .bc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .bc-slot { flex-shrink:0; min-width:210px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .bc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .bc-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:260px; }
        .bc-bin[data-shake="true"] { animation:bcShake .4s; border-color:${NO}; }
        .bc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .bc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .bc-q:disabled{ cursor:default; }
        .bc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .bc-btn:hover { border-color:${T.lineStrong}; }
        .bc-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .bc-row[data-shake="true"], .bc-bin[data-shake="true"] { animation:none; } }
        /* Buscador simulado */
        .bs-barra { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:14px; background:#f4f7fb; color:#14233a;
          font-size:15px; font-weight:700; min-height:48px; word-break:break-word; }
        .bs-barra i { color:#5b6b85; }
        .bs-vacia { color:#6b7a92; font-weight:500; }
        .bs-op { cursor:pointer; padding:9px 12px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2};
          font-size:14px; font-weight:800; transition:all .14s; }
        .bs-op:hover { border-color:${T.lineStrong}; color:#fff; }
        .bs-op[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.22); color:#fff; }
        .bs-res { border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; overflow:hidden; transition:border-color .16s; }
        .bs-res[data-open="true"] { border-color:${accent}; }
        .bs-res[data-v="usar"] { border-color:${OK}88; }
        .bs-res[data-v="descartar"] { opacity:.7; }
        .bs-cab { cursor:pointer; display:grid; grid-template-columns:76px minmax(0,1fr); gap:12px; width:100%; padding:12px; text-align:left;
          background:transparent; border:none; color:${T.text}; }
        .bs-mini { position:relative; width:76px; height:76px; border-radius:11px; overflow:hidden; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, rgba(${color.rgba},0.35), rgba(8,19,31,0.9)); color:rgba(255,255,255,0.85); font-size:24px; }
        .bs-mini img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .bs-url { font-size:14px; color:#7fd6a8; font-weight:700; word-break:break-all; }
        .bs-tit { font-size:16px; font-weight:800; color:#9cc4ff; line-height:1.3; margin:2px 0; }
        .bs-frag { font-size:14px; color:${T.text2}; line-height:1.45; }
        .bs-det { padding:4px 14px 14px; display:grid; gap:10px; border-top:1px solid ${T.line}; }
        .bs-crit { display:flex; flex-wrap:wrap; gap:8px; }
        .bs-dato { display:flex; gap:9px; align-items:flex-start; font-size:14px; line-height:1.45; padding:9px 11px; border-radius:10px; background:${T.inset}; border:1px solid ${T.line}; }
        .bs-medidor { height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
        .bs-medidor > span { display:block; height:100%; border-radius:99px; transition:width .5s ease, background .3s; }
        @media (prefers-reduced-motion: reduce){ .bs-medidor > span { transition:none; } }
        /* Identidad del tablero */
        .bc-bin, .bc-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .bc-bin:nth-of-type(6n+1), .bc-row:nth-of-type(6n+1) { --tono:188; }
        .bc-bin:nth-of-type(6n+2), .bc-row:nth-of-type(6n+2) { --tono:262; }
        .bc-bin:nth-of-type(6n+3), .bc-row:nth-of-type(6n+3) { --tono:44; }
        .bc-bin:nth-of-type(6n+4), .bc-row:nth-of-type(6n+4) { --tono:152; }
        .bc-bin:nth-of-type(6n+5), .bc-row:nth-of-type(6n+5) { --tono:330; }
        .bc-bin:nth-of-type(6n+6), .bc-row:nth-of-type(6n+6) { --tono:18; }
        .bc-bin::before, .bc-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .bc-bin[data-done="true"], .bc-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .bc-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .bc-chip:hover { transform:translateY(-2px); }
        .bc-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .bc-chip, .bc-chip:hover, .bc-chip[data-sel="true"] { transform:none; transition:none; }
        }

          `}</style>

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={BUSQUEDA_CONFIABLE_HUECOS}
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
                persistMejor(senalesDone, estrategiasDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "buscador" && (
            <BuscadorSim
              accent={accent}
              consulta={consulta}
              onConsulta={actualizarConsulta}
              abierto={abierto}
              onAbrir={(id) => setAbierto((a) => (a === id ? null : id))}
              revisados={revisados}
              onRevisar={revisar}
              veredictos={veredictos}
              onDecidir={decidir}
              tiempoUsado={tiempoUsado}
            />
          )}

          {modo === "senales" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada indicio a su categoría</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: senalesDone ? OK : T.text3 }}>
                    {Object.keys(ubicSenal).length}/{SENALES.length}
                  </span>
                </div>
                {senalesLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {SENALES.length} indicios!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {senalesLibres.map((s) => (
                      <button key={s.id} className="bc-chip" data-sel={selSenal === s.id} onClick={() => setSelSenal((v) => (v === s.id ? null : s.id))} {...dragProps(s.id)}>
                        {s.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsSenales selSenal={selSenal} shakeSenal={shakeSenal} ubicSenal={ubicSenal} onMatch={intentarSenal} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "estrategias" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada estrategia a la pregunta que responde</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: estrategiasDone ? OK : T.text3 }}>
                    {Object.keys(empEstr).length}/{CRITERIOS.length}
                  </span>
                </div>
                {estrLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {CRITERIOS.length} estrategias!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {estrLibres.map((c) => (
                      <button key={c.id} className="bc-chip" data-sel={selEstr === c.id} onClick={() => setSelEstr((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14, color: T.text3 }} />
                        {c.criterio}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsEstrategias selEstr={selEstr} shakeEstr={shakeEstr} empEstr={empEstr} onMatch={intentarEstr} dropProps={dropProps} />
            </Mesa>
          )}
        </div>
      }
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
          icono: "fa-clipboard-list",
          contenido: (
            <>
              <Bloque titulo="Tu tarea" icono="fa-file-pen">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <Dato label="Calidad de mis fuentes" value={tarea.usadas.length ? `${tarea.calidad}/100` : "—"} col={tarea.usadas.length ? colorCalidad(tarea.calidad) : undefined} />
                  <Dato label="Nota de la tarea" value={tarea.usadas.length ? tarea.nota.toFixed(1) : "—"} col={tarea.usadas.length ? colorCalidad(tarea.nota * 10) : undefined} />
                  <Dato label="Tiempo usado" value={`${tiempoUsado}/${TIEMPO_TOTAL} min`} col={tiempoUsado >= TIEMPO_TOTAL ? NO : undefined} />
                  <Dato label="Fuentes elegidas" value={`${tarea.usadas.length}/${MIN_FUENTES}+`} />
                </div>
                <div className="bs-medidor" role="img" aria-label={`Calidad de mis fuentes: ${tarea.calidad} de 100`}>
                  <span style={{ width: `${tarea.calidad}%`, background: colorCalidad(tarea.calidad) }} />
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{tarea.comentario}</div>
                {tarea.usadas.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    {tarea.usadas.map((f) => (
                      <li key={f.id}>
                        {f.sitio} <span style={{ color: T.text3 }}>(simulación)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Evalúas fuentes en internet con criterio!" : "Termina los modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={BUSQUEDA_CONFIABLE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Las cinco estrategias" icono="fa-magnifying-glass">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CRITERIOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{c.criterio}.</strong> {c.pregunta}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{c.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_BUSQUEDA}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

function colorCalidad(c: number): string {
  return c >= UMBRAL_CONFIABLE ? OK : c >= 45 ? "#FFC75A" : NO;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR DEL BUSCADOR (modo «Buscador»). Todo es simulación: sitios,
 * autores y cifras son inventados. La lógica vive en busqueda-confiable-sim.ts.
 * ═══════════════════════════════════════════════════════════════════════════ */
const RUTA_FOTOS = "/media/labs-sim/busqueda-confiable";

function BuscadorSim({
  accent,
  consulta,
  onConsulta,
  abierto,
  onAbrir,
  revisados,
  onRevisar,
  veredictos,
  onDecidir,
  tiempoUsado,
}: {
  accent: string;
  consulta: Consulta;
  onConsulta: (c: Consulta) => void;
  abierto: string | null;
  onAbrir: (id: string) => void;
  revisados: Record<string, Criterio[]>;
  onRevisar: (fid: string, c: Criterio) => void;
  veredictos: Record<string, Veredicto>;
  onDecidir: (fid: string, v: Veredicto) => void;
  tiempoUsado: number;
}) {
  const resultados = buscar(consulta);
  const texto = consultaTexto(consulta);
  const quedan = TIEMPO_TOTAL - tiempoUsado;
  const quitar = (id: string) => consulta.palabras.filter((p) => p !== id);
  const togglePalabra = (id: string) => {
    if (consulta.palabras.includes(id)) onConsulta({ ...consulta, palabras: quitar(id) });
    else if (consulta.palabras.length < 4) onConsulta({ ...consulta, palabras: [...consulta.palabras, id] });
  };

  return (
    <Mesa>
      <div style={{ ...card, padding: "16px 18px", display: "grid", gap: 12 }}>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Tu tarea (simulación):</strong> «¿Cuántas horas debe dormir un adolescente y cómo afecta su rendimiento escolar?» Elige 3 fuentes confiables.
        </div>
        <div className="bs-barra" role="status">
          <i className="fa-solid fa-magnifying-glass" aria-hidden />
          {texto ? <span>{texto}</span> : <span className="bs-vacia">Escribe tu consulta con las palabras de abajo…</span>}
        </div>
        <div>
          <Eyebrow>Palabras clave (máx. 4)</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {PALABRAS.map((p) => (
              <button key={p.id} type="button" className="bs-op" data-on={consulta.palabras.includes(p.id)} onClick={() => togglePalabra(p.id)}>
                {p.txt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Operadores</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <button type="button" className="bs-op" data-on={consulta.comillas} onClick={() => onConsulta({ ...consulta, comillas: !consulta.comillas })} title="Pide que aparezcan TODAS las palabras">
              “ ” comillas
            </button>
            {(["edu", "gob", "org"] as const).map((d) => (
              <button key={d} type="button" className="bs-op" data-on={consulta.dominio === d} onClick={() => onConsulta({ ...consulta, dominio: consulta.dominio === d ? "" : d })}>
                site:.{d}
              </button>
            ))}
            <button type="button" className="bs-op" data-on={consulta.excluirMilagro} onClick={() => onConsulta({ ...consulta, excluirMilagro: !consulta.excluirMilagro })} title="Quita los resultados que prometen un «milagro»">
              −milagro
            </button>
            <button type="button" className="bs-op" data-on={consulta.reciente} onClick={() => onConsulta({ ...consulta, reciente: !consulta.reciente })} title="Solo resultados de 2022 en adelante">
              after:2022
            </button>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: quedan <= 3 ? NO : T.text2, marginBottom: 6 }}>
            <span>
              <i className="fa-solid fa-hourglass-half" aria-hidden /> Tiempo para revisar
            </span>
            <span>{quedan} min</span>
          </div>
          <div className="bs-medidor">
            <span style={{ width: `${(quedan / TIEMPO_TOTAL) * 100}%`, background: quedan <= 3 ? NO : accent }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>
          {consulta.palabras.length === 0
            ? "Elige palabras clave para ver resultados."
            : `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} (buscador de simulación)`}
        </div>
        {consulta.palabras.length > 0 && resultados.length === 0 && (
          <div style={{ ...card, padding: "16px 18px", fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Tu consulta es demasiado estricta: ningún resultado cumple todo a la vez. Quita un operador o una palabra.
          </div>
        )}
        {resultados.map((f) => (
          <ResultadoCard
            key={f.id}
            accent={accent}
            f={f}
            abierto={abierto === f.id}
            onAbrir={() => onAbrir(f.id)}
            hechos={revisados[f.id] ?? []}
            onRevisar={(c) => onRevisar(f.id, c)}
            veredicto={veredictos[f.id]}
            onDecidir={(v) => onDecidir(f.id, v)}
            quedan={quedan}
          />
        ))}
      </div>
    </Mesa>
  );
}

function ResultadoCard({
  accent,
  f,
  abierto,
  onAbrir,
  hechos,
  onRevisar,
  veredicto,
  onDecidir,
  quedan,
}: {
  accent: string;
  f: Fuente;
  abierto: boolean;
  onAbrir: () => void;
  hechos: Criterio[];
  onRevisar: (c: Criterio) => void;
  veredicto: Veredicto | undefined;
  onDecidir: (v: Veredicto) => void;
  quedan: number;
}) {
  return (
    <div className="bs-res" data-open={abierto} data-v={veredicto}>
      <button type="button" className="bs-cab" onClick={onAbrir} aria-expanded={abierto}>
        <span className="bs-mini">
          <i className={`fa-solid ${f.icono}`} aria-hidden />
          <img src={`${RUTA_FOTOS}/${f.imagen}.webp`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="bs-url" style={{ display: "block" }}>{f.sitio}</span>
          <span className="bs-tit" style={{ display: "block" }}>{f.titulo}</span>
          <span className="bs-frag" style={{ display: "block" }}>{f.fragmento}</span>
          {veredicto && (
            <span style={{ display: "inline-block", marginTop: 6, fontSize: 14, fontWeight: 800, color: veredicto === "usar" ? OK : T.text3 }}>
              <i className={`fa-solid ${veredicto === "usar" ? "fa-bookmark" : "fa-ban"}`} aria-hidden /> {veredicto === "usar" ? "Usada en tu tarea" : "Descartada"}
            </span>
          )}
        </span>
      </button>
      {abierto && (
        <div className="bs-det">
          <div style={{ fontSize: 14, color: T.text3 }}>
            {f.tipoSitio} · Revisar cuesta tiempo ({quedan} min disponibles).
          </div>
          <div className="bs-crit">
            {CRITERIOS_REVISION.map((c) => {
              const hecho = hechos.includes(c.id);
              return (
                <button key={c.id} type="button" className="bs-op" data-on={hecho} disabled={hecho || c.costo > quedan} onClick={() => onRevisar(c.id)}>
                  <i className={`fa-solid ${c.icono}`} aria-hidden /> {c.txt} · {c.costo} min
                </button>
              );
            })}
          </div>
          {hechos.map((c) => {
            const d = datoCriterio(f, c);
            return (
              <div key={c} className="bs-dato" style={{ borderColor: d.bueno ? `${OK}66` : `${NO}66` }}>
                <i className={`fa-solid ${d.bueno ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ color: d.bueno ? OK : NO, marginTop: 3 }} aria-hidden />
                <span>
                  <strong>{d.etiqueta}:</strong> {d.texto}
                </span>
              </div>
            );
          })}
          {!veredicto ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className="bc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={() => onDecidir("usar")}>
                <i className="fa-solid fa-bookmark" aria-hidden /> Usar en mi tarea
              </button>
              <button type="button" className="bc-btn" onClick={() => onDecidir("descartar")}>
                <i className="fa-solid fa-ban" aria-hidden /> Descartar
              </button>
            </div>
          ) : (
            <div className="bs-dato" style={{ borderColor: veredictoCorrecto(f, veredicto) ? `${OK}66` : `${NO}66` }} role="status">
              <i className={`fa-solid ${veredictoCorrecto(f, veredicto) ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: veredictoCorrecto(f, veredicto) ? OK : NO, marginTop: 3 }} aria-hidden />
              <span>{retroVeredicto(f, veredicto, hechos)}</span>
            </div>
          )}
        </div>
      )}
    </div>
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
  const bins: Categoria[] = ["confiable", "alerta"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = SENALES.filter((s) => ubicSenal[s.id] === bin);
        const tint = bin === "alerta" ? NO : OK;
        return (
          <div
            key={bin}
            className="bc-bin"
            data-shake={shakeSenal === bin}
            onClick={() => selSenal && onMatch(selSenal, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={tint} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((s) => (
                  <span key={s.id} style={{ animation: "bcPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
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

function RowsEstrategias({
  selEstr,
  shakeEstr,
  empEstr,
  onMatch,
  dropProps,
}: {
  selEstr: string | null;
  shakeEstr: string | null;
  empEstr: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CRITERIOS.map((c) => {
        const done = empEstr[c.id];
        return (
          <div
            key={c.id}
            className="bc-row"
            data-shake={shakeEstr === c.id}
            data-done={done}
            onClick={() => !done && selEstr && onMatch(selEstr, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="bc-slot" data-armed={!done && !!selEstr} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "bcPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-magnifying-glass" />
                  {c.criterio}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> estrategia
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.pregunta}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (opción múltiple verbatim de A2)
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
        Cinco preguntas sobre cómo buscar y evaluar información confiable en internet. Elige la opción correcta de cada una y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
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
                    <button key={oi} className="bc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="bc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="bc-btn" onClick={reintentar}>
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
