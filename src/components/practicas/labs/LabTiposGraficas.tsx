"use client";

/**
 * Laboratorio — Tipos de gráficas y cuándo usarlas
 * Práctica experimental para CD-II-P04 (Cultura Digital II).
 *
 * MESA DE REDACCIÓN (simulador, datos inventados): el alumno elige el tipo de
 * gráfica para seis casos, la gráfica SVG se dibuja al instante y una lectora de
 * prueba reacciona (entendió / se confundió); el eje recortado exagera la
 * diferencia y se mide. Después, los modos de refuerzo:
 *  1. «Tipo de gráfica y su propósito» — empareja cada tipo de gráfica con el
 *     propósito de datos para el que sirve (comparar, tendencia, proporción,
 *     correlación, volumen acumulado).
 *  2. «¿Qué gráfica usarías?» — clasifica escenarios de datos reales (INEGI,
 *     PIB, redes sociales, escolaridad) por la gráfica apropiada.
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Cada tipo de gráfica lleva un
 * pequeño glifo SVG dibujado a mano. Contenido VERBATIM de CD-II·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { TIPOS_GRAFICAS_HUECOS } from "./tipos-graficas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { TIPOS_GRAFICAS_FICHA } from "./tipos-graficas-ficha";
import {
  GRAFICAS,
  ESCENARIOS,
  TRAMPAS,
  PARES,
  QUIZ,
  DATO_GRAFICAS,
  type Glyph,
} from "./tipos-graficas-data";
import {
  CASOS,
  TIPOS,
  baseEje,
  ejeAplica,
  evaluar,
  histograma,
  maximoBonito,
  rebanadas,
  rotuloNivel,
  tipoIdeal,
  type Caso,
  type Evaluacion,
  type Nivel,
  type Tipo,
} from "./tipos-graficas-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-tipos-graficas-reto";

type Modo = "mesa" | "tipos" | "escenarios" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "mesa", label: "Mesa de redacción", icono: "fa-newspaper" },
  { id: "tipos", label: "Tipo de gráfica y su propósito", icono: "fa-chart-pie" },
  { id: "escenarios", label: "¿Qué gráfica usarías?", icono: "fa-table-list" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const GLYPH_INFO: Record<Glyph, { titulo: string; icono: string }> = {
  barras: { titulo: "Barras", icono: "fa-chart-column" },
  linea: { titulo: "Línea", icono: "fa-chart-line" },
  circular: { titulo: "Circular (pastel)", icono: "fa-chart-pie" },
  dispersion: { titulo: "Dispersión", icono: "fa-braille" },
  area: { titulo: "Área", icono: "fa-chart-area" },
};

/* ── Glifo SVG dibujado a mano para cada tipo de gráfica (sin dependencias) ── */
function ChartGlyph({ glyph, color, size = 46 }: { glyph: Glyph; color: string; size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line x1="8" y1="40" x2="42" y2="40" stroke={T.text3} strokeWidth="1.5" />
      <line x1="8" y1="40" x2="8" y2="8" stroke={T.text3} strokeWidth="1.5" />
      {glyph === "barras" && (
        <>
          <rect x="12" y="26" width="6" height="14" fill={color} rx="1" />
          <rect x="21" y="18" width="6" height="22" fill={color} rx="1" opacity="0.8" />
          <rect x="30" y="30" width="6" height="10" fill={color} rx="1" opacity="0.6" />
        </>
      )}
      {glyph === "linea" && (
        <polyline points="10,34 18,22 26,28 34,14 42,18" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {glyph === "circular" && (
        <>
          <circle cx="26" cy="24" r="13" fill={color} opacity="0.35" />
          <path d="M26 24 L26 11 A13 13 0 0 1 38 28 Z" fill={color} />
          <path d="M26 24 L38 28 A13 13 0 0 1 18 35 Z" fill={color} opacity="0.65" />
        </>
      )}
      {glyph === "dispersion" && (
        <>
          {[
            [13, 33], [18, 26], [22, 30], [27, 20], [31, 24], [36, 14], [16, 31], [29, 27],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.1" fill={color} opacity={0.55 + (i % 3) * 0.15} />
          ))}
        </>
      )}
      {glyph === "area" && (
        <>
          <polygon points="10,34 18,22 26,28 34,14 42,18 42,40 10,40" fill={color} opacity="0.35" />
          <polyline points="10,34 18,22 26,28 34,14 42,18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function LabTiposGraficas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("mesa");

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

  // ── modo mesa de redacción (simulador) ─────────────────────────────────
  // El estado vive aquí, no en el modo: al cambiar de pestaña no se pierde ni
  // se des-cumple ninguna misión.
  const [casoId, setCasoId] = useState(CASOS[0]!.id);
  const [tipoSel, setTipoSel] = useState<Tipo | null>(null);
  const [recortado, setRecortado] = useState(false);
  const [probados, setProbados] = useState<Record<string, Tipo[]>>({});
  const [publicadas, setPublicadas] = useState<Record<string, Nivel>>({});
  const [mensajePub, setMensajePub] = useState<{ nivel: Nivel; texto: string } | null>(null);
  const casoActual: Caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const claras = Object.values(publicadas).filter((n) => n === "claro").length;
  const mesaProbada = Object.values(probados).some((t) => t.length >= TIPOS.length);

  const cambiarCaso = (id: string) => {
    setCasoId(id);
    setTipoSel(null);
    setRecortado(false);
    setMensajePub(null);
  };
  const elegirTipo = (t: Tipo) => {
    setTipoSel(t);
    setMensajePub(null);
    setProbados((p) => {
      const ya = p[casoId] ?? [];
      return ya.includes(t) ? p : { ...p, [casoId]: [...ya, t] };
    });
    if (audioRef.current && sonido) audioRef.current.blip();
  };
  const publicar = () => {
    if (!tipoSel) return;
    const ev = evaluar(casoActual, tipoSel, recortado);
    setPublicadas((p) => {
      const previo = p[casoId];
      return previo && ORDEN_NIVEL[previo] >= ORDEN_NIVEL[ev.nivel] ? p : { ...p, [casoId]: ev.nivel };
    });
    const ideal = TIPOS.find((t) => t.id === tipoIdeal(casoActual))?.nombre ?? "";
    if (ev.nivel === "claro") {
      setMensajePub({ nivel: "claro", texto: "¡A portada! La lectora entendió el mensaje sin ayuda." });
      sfxPlace();
    } else {
      setMensajePub({
        nivel: ev.nivel,
        texto: ev.engano
          ? "La editora la regresa: el eje recortado exagera la diferencia. Vuelve al eje desde cero."
          : `La editora la regresa: ${ev.nivel === "regular" ? "se entiende a medias" : "confunde a la lectora"}. Para este caso funciona mejor: ${ideal}.`,
      });
      sfxNo();
    }
  };
  const resetMesa = () => {
    setCasoId(CASOS[0]!.id);
    setTipoSel(null);
    setRecortado(false);
    setProbados({});
    setPublicadas({});
    setMensajePub(null);
  };

  // ── modo tipos (empareja tipo de gráfica → propósito) ──────────────────
  const [empTipo, setEmpTipo] = useState<Record<string, boolean>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<string | null>(null);
  const tiposLibres = GRAFICAS.filter((g) => !empTipo[g.id]).slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const intentarTipo = (chipId: string, rowId: string) => {
    if (empTipo[rowId]) return;
    if (chipId === rowId) {
      setEmpTipo((e) => ({ ...e, [rowId]: true }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(empTipo).length + 1 >= GRAFICAS.length) {
        sfxOk();
        persistMejor(true, escenariosDone, glosarioDone);
      }
    } else {
      setShakeTipo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetTipos = () => {
    setEmpTipo({});
    setSelTipo(null);
  };

  // ── modo escenarios (clasifica escenario → gráfica apropiada) ──────────
  const [ubicEsc, setUbicEsc] = useState<Record<string, Glyph>>({});
  const [selEsc, setSelEsc] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<Glyph | null>(null);
  const escLibres = ESCENARIOS.filter((e) => !ubicEsc[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEsc = (escId: string, bin: Glyph) => {
    if (ubicEsc[escId]) return;
    const e = ESCENARIOS.find((x) => x.id === escId);
    if (e && e.tipo === bin) {
      setUbicEsc((m) => ({ ...m, [escId]: bin }));
      setSelEsc(null);
      sfxPlace();
      if (Object.keys(ubicEsc).length + 1 >= ESCENARIOS.length) {
        sfxOk();
        persistMejor(tiposDone, true, glosarioDone);
      }
    } else {
      setShakeEsc(bin);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetEscenarios = () => {
    setUbicEsc({});
    setSelEsc(null);
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
  const tiposDone = Object.keys(empTipo).length >= GRAFICAS.length;
  const escenariosDone = Object.keys(ubicEsc).length >= ESCENARIOS.length;
  const modosHechos = (tiposDone ? 1 : 0) + (escenariosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Prueba los 6 tipos de gráfica con un mismo caso", done: mesaProbada },
    { txt: "Publica una gráfica clara en 4 de los 6 casos", done: claras >= 4 },
    { txt: "Empareja los 5 tipos de gráfica con su propósito", done: tiposDone },
    { txt: "Clasifica los 7 escenarios por su gráfica", done: escenariosDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "mesa" ? resetMesa : modo === "tipos" ? resetTipos : modo === "escenarios" ? resetEscenarios : resetGlosario;

  const evalActual = tipoSel ? evaluar(casoActual, tipoSel, recortado) : null;
  const probadosCaso = probados[casoActual.id] ?? [];

  const pistaDe: Record<Modo, string> = {
    mesa: "Pregúntate qué quieres mostrar: comparar categorías, una tendencia, partes de un todo, una relación entre dos variables o cómo se agrupan los datos. Prueba los seis tipos con el mismo caso y mira cómo reacciona la lectora.",
    tipos: "Las barras comparan categorías; la línea muestra tendencias en el tiempo; la circular reparte un todo; la dispersión relaciona dos variables.",
    escenarios: "Pregúntate qué quieres comunicar: ¿comparar, ver una tendencia, mostrar proporciones o una relación entre variables?",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Completa los huecos del texto con las palabras de la lectura.",
  };

  const lectura =
    modo === "mesa" ? (
      evalActual ? (
        <>
          Lectora de prueba: <strong>{rotuloNivel(evalActual.nivel)}</strong>
        </>
      ) : (
        <>Elige un tipo de gráfica para dibujar los datos.</>
      )
    ) : modo === "tipos" ? (
      <>
        {Object.keys(empTipo).length} de {GRAFICAS.length} tipos emparejados
      </>
    ) : modo === "escenarios" ? (
      <>
        {Object.keys(ubicEsc).length} de {ESCENARIOS.length} escenarios clasificados
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
        @keyframes tgShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tgPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tg-chip { cursor:grab; display:inline-flex; align-items:center; gap:10px; padding:10px 14px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .tg-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .tg-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .tg-chip:active { cursor:grabbing; }
        .tg-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .tg-row[data-shake="true"] { animation:tgShake .4s; border-color:${NO}; }
        .tg-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .tg-slot { flex-shrink:0; min-width:190px; min-height:54px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .tg-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .tg-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:210px; }
        .tg-bin[data-shake="true"] { animation:tgShake .4s; border-color:${NO}; }
        .tg-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .tg-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .tg-q:disabled{ cursor:default; }
        .tg-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .tg-btn:hover { border-color:${T.lineStrong}; }
        .tg-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .tg-row[data-shake="true"], .tg-bin[data-shake="true"] { animation:none; } }
        /* Mesa de redacción */
        .tg-op { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:9px 12px; border-radius:10px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .tg-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .tg-op[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.22); color:#fff; }
        .tg-op:disabled { cursor:default; opacity:.45; }
        .tg-marco { border-radius:14px; border:1.5px solid ${T.line}; background:#0a1626; padding:10px; }
        .tg-foto { position:relative; height:112px; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, rgba(${color.rgba},0.35), rgba(8,19,31,0.92)); color:rgba(255,255,255,0.85); font-size:34px; }
        .tg-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .tg-lectora { display:flex; gap:12px; align-items:flex-start; padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; font-size:14px; line-height:1.5; }
        .tg-lectora i.tg-cara { font-size:30px; flex-shrink:0; }
        .tg-medidor { height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
        .tg-medidor > span { display:block; height:100%; border-radius:99px; transition:width .5s ease, background .3s; }
        @media (prefers-reduced-motion: reduce){ .tg-medidor > span { transition:none; } }
        /* Identidad del tablero */
        .tg-bin, .tg-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .tg-bin:nth-of-type(6n+1), .tg-row:nth-of-type(6n+1) { --tono:188; }
        .tg-bin:nth-of-type(6n+2), .tg-row:nth-of-type(6n+2) { --tono:262; }
        .tg-bin:nth-of-type(6n+3), .tg-row:nth-of-type(6n+3) { --tono:44; }
        .tg-bin:nth-of-type(6n+4), .tg-row:nth-of-type(6n+4) { --tono:152; }
        .tg-bin:nth-of-type(6n+5), .tg-row:nth-of-type(6n+5) { --tono:330; }
        .tg-bin:nth-of-type(6n+6), .tg-row:nth-of-type(6n+6) { --tono:18; }
        .tg-bin::before, .tg-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .tg-bin[data-done="true"], .tg-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .tg-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .tg-chip:hover { transform:translateY(-2px); }
        .tg-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .tg-chip, .tg-chip:hover, .tg-chip[data-sel="true"] { transform:none; transition:none; }
        }

          `}</style>

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIPOS_GRAFICAS_HUECOS}
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
                persistMejor(tiposDone, escenariosDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "mesa" && (
            <MesaRedaccion
              accent={accent}
              caso={casoActual}
              onCaso={cambiarCaso}
              tipo={tipoSel}
              onTipo={elegirTipo}
              recortado={recortado}
              onRecorte={() => setRecortado((r) => !r)}
              probados={probados}
              publicadas={publicadas}
              onPublicar={publicar}
              mensaje={mensajePub}
              evaluacion={evalActual}
            />
          )}

          {modo === "tipos" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada gráfica al propósito que cumple</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: tiposDone ? OK : T.text3 }}>
                    {Object.keys(empTipo).length}/{GRAFICAS.length}
                  </span>
                </div>
                {tiposLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {GRAFICAS.length} tipos de gráfica!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tiposLibres.map((g) => (
                      <button key={g.id} className="tg-chip" data-sel={selTipo === g.id} onClick={() => setSelTipo((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <ChartGlyph glyph={g.glyph} color={accent} size={34} />
                        {g.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsTipos accent={accent} selTipo={selTipo} shakeTipo={shakeTipo} empTipo={empTipo} onMatch={intentarTipo} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "escenarios" && (
            <Mesa>
              <div style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada escenario a la gráfica apropiada</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: escenariosDone ? OK : T.text3 }}>
                    {Object.keys(ubicEsc).length}/{ESCENARIOS.length}
                  </span>
                </div>
                {escLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ESCENARIOS.length} escenarios!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {escLibres.map((e) => (
                      <button key={e.id} className="tg-chip" data-sel={selEsc === e.id} onClick={() => setSelEsc((s) => (s === e.id ? null : e.id))} {...dragProps(e.id)}>
                        <i className="fa-solid fa-database" style={{ fontSize: 14, color: T.text3 }} />
                        {e.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsEscenarios accent={accent} rgba={color.rgba} selEsc={selEsc} shakeEsc={shakeEsc} ubicEsc={ubicEsc} onMatch={intentarEsc} dropProps={dropProps} />
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
              <Bloque titulo="Mesa de redacción" icono="fa-newspaper">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <Dato label="Claridad ahora" value={evalActual ? `${evalActual.claridad} %` : "—"} col={evalActual ? colorNivel(evalActual.nivel) : undefined} />
                  <Dato label="Publicadas claras" value={`${claras}/${CASOS.length}`} col={claras >= 4 ? OK : undefined} />
                  <Dato label="Tipos probados" value={`${probadosCaso.length}/${TIPOS.length}`} />
                  <Dato label="Caso" value={`${CASOS.indexOf(casoActual) + 1}/${CASOS.length}`} />
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  Todos los datos son inventados (simulación). Publica una gráfica clara en al menos 4 de los 6 casos.
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Eliges la gráfica correcta como un estadístico!" : "Termina los modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={TIPOS_GRAFICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Tipos de gráfica y su propósito" icono="fa-chart-pie">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {GRAFICAS.map((g) => (
                    <div key={g.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{g.nombre}.</strong> {g.proposito}.
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{g.detalle}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Trampas visuales" icono="fa-triangle-exclamation">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TRAMPAS.map((t) => (
                    <div key={t.id} style={{ display: "flex", gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <i className={`fa-solid ${t.icono}`} style={{ color: NO, fontSize: 14, marginTop: 3, flexShrink: 0 }} />
                      <span>
                        <strong style={{ color: T.text }}>{t.titulo}.</strong> {t.texto}
                      </span>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_GRAFICAS}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

function colorNivel(n: Nivel): string {
  return n === "claro" ? OK : n === "regular" ? "#FFC75A" : NO;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MESA DE REDACCIÓN (modo «Mesa de redacción»). Todo es simulación: datos y
 * lugares son inventados. La lógica vive en tipos-graficas-sim.ts.
 * ═══════════════════════════════════════════════════════════════════════════ */
const RUTA_FOTOS = "/media/labs-sim/tipos-graficas";
const PALETA = ["#5BC8FF", "#FFC75A", "#34D399", "#C084FC", "#FB7185", "#F97316"];
const ORDEN_NIVEL: Record<Nivel, number> = { confunde: 0, regular: 1, claro: 2 };

function MesaRedaccion({
  accent,
  caso,
  onCaso,
  tipo,
  onTipo,
  recortado,
  onRecorte,
  probados,
  publicadas,
  onPublicar,
  mensaje,
  evaluacion,
}: {
  accent: string;
  caso: Caso;
  onCaso: (id: string) => void;
  tipo: Tipo | null;
  onTipo: (t: Tipo) => void;
  recortado: boolean;
  onRecorte: () => void;
  probados: Record<string, Tipo[]>;
  publicadas: Record<string, Nivel>;
  onPublicar: () => void;
  mensaje: { nivel: Nivel; texto: string } | null;
  evaluacion: Evaluacion | null;
}) {
  const hechos = probados[caso.id] ?? [];
  const col = evaluacion ? colorNivel(evaluacion.nivel) : T.text3;
  const cara = evaluacion?.nivel === "claro" ? "fa-face-smile" : evaluacion?.nivel === "regular" ? "fa-face-meh" : "fa-face-frown";
  return (
    <Mesa>
      <div style={{ ...card, padding: "16px 18px", display: "grid", gap: 14 }}>
        <div>
          <Eyebrow>Caso del día</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {CASOS.map((c, i) => (
              <button key={c.id} type="button" className="tg-op" data-on={c.id === caso.id} onClick={() => onCaso(c.id)} title={c.titulo} aria-label={`Caso ${i + 1}: ${c.titulo}`}>
                {publicadas[c.id] === "claro" && <i className="fa-solid fa-circle-check" style={{ color: OK }} aria-hidden />}
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Tipo de gráfica</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 8, marginTop: 8 }}>
            {TIPOS.map((t) => (
              <button key={t.id} type="button" className="tg-op" data-on={tipo === t.id} onClick={() => onTipo(t.id)} title={t.nombre}>
                <i className={`fa-solid ${t.icono}`} aria-hidden />
                {t.corto}
                {hechos.includes(t.id) && <i className="fa-solid fa-check" style={{ color: OK, fontSize: 14 }} aria-hidden />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Eje vertical</Eyebrow>
          <button type="button" className="tg-op" style={{ marginTop: 8, width: "100%" }} data-on={recortado} disabled={!tipo || !ejeAplica(tipo)} onClick={onRecorte}>
            <i className="fa-solid fa-scissors" aria-hidden /> {recortado ? "Eje recortado (no empieza en 0)" : "Eje desde cero"}
          </button>
          <div style={{ fontSize: 14, color: T.text3, marginTop: 6, lineHeight: 1.4 }}>Solo cambia barras, líneas y área.</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
        <div style={{ ...card, padding: "12px", display: "grid", gap: 10 }}>
          <div className="tg-foto">
            <i className={`fa-solid ${caso.icono}`} aria-hidden />
            <img src={`${RUTA_FOTOS}/${caso.imagen}.webp`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{caso.titulo} <span style={{ fontSize: 14, fontWeight: 700, color: T.text3 }}>(datos de simulación)</span></div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 4 }}>{caso.encargo}</div>
          </div>
        </div>

        <div className="tg-marco">
          {tipo ? (
            <GraficaViva caso={caso} tipo={tipo} recortado={recortado} accent={accent} />
          ) : (
            <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16, fontSize: 14, color: T.text3 }}>
              Elige un tipo de gráfica y los {caso.puntos.length} datos se dibujan aquí.
            </div>
          )}
        </div>

        {evaluacion && (
          <>
            <div className="tg-lectora" style={{ borderColor: `${col}88` }} role="status">
              <i className={`fa-solid ${cara} tg-cara`} style={{ color: col }} aria-hidden />
              <div>
                <strong style={{ color: col }}>{rotuloNivel(evaluacion.nivel)}.</strong> <span style={{ color: T.text }}>{evaluacion.lector}</span>
                <div style={{ color: T.text2, marginTop: 4 }}>{evaluacion.porque}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              <Dato label="Claridad para la lectora" value={`${evaluacion.claridad} %`} col={col} />
              {tipo && ejeAplica(tipo) ? (
                <Dato label="Diferencia real → que se ve" value={`×${evaluacion.razonReal.toFixed(1)} → ×${evaluacion.razonVisual.toFixed(1)}`} col={evaluacion.engano ? NO : undefined} />
              ) : (
                <Dato label="Datos dibujados" value={`${caso.puntos.length}`} />
              )}
            </div>
            <div className="tg-medidor" role="img" aria-label={`Claridad ${evaluacion.claridad} por ciento`}>
              <span style={{ width: `${evaluacion.claridad}%`, background: col }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button type="button" className="tg-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={onPublicar}>
                <i className="fa-solid fa-newspaper" aria-hidden /> Publicar en el diario
              </button>
              {mensaje && (
                <div role="status" style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.45, color: colorNivel(mensaje.nivel), fontWeight: 700 }}>
                  {mensaje.texto}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Mesa>
  );
}

/** Gráfica SVG que se dibuja con los datos del caso (sin librerías). */
function GraficaViva({ caso, tipo, recortado, accent }: { caso: Caso; tipo: Tipo; recortado: boolean; accent: string }) {
  const W = 480;
  const H = 300;
  const ml = 54;
  const mr = 14;
  const mt = 14;
  const mb = 56;
  const pw = W - ml - mr;
  const ph = H - mt - mb;
  const pts = caso.puntos;
  const n = pts.length;
  const ys = pts.map((p) => p.y);
  const base = baseEje(caso, tipo, recortado);
  const bins = tipo === "histograma" ? histograma(ys, 7) : [];
  const top = tipo === "histograma" ? maximoBonito(Math.max(...bins.map((b) => b.cuenta))) : maximoBonito(Math.max(...ys));
  const yv = (v: number) => mt + ph - ((v - base) / (top - base)) * ph;
  const xi = (i: number) => ml + (n === 1 ? pw / 2 : (i + 0.5) * (pw / n));
  const ticks = [0, 1, 2, 3, 4].map((k) => base + ((top - base) * k) / 4);
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  const etiquetasX = (tipo === "barras" || tipo === "linea" || tipo === "area") && n <= 12;
  const eje = { stroke: "rgba(255,255,255,0.35)", strokeWidth: 1.2 };
  const txt = { fill: "#c9d6ea", fontSize: 14 } as const;

  const xs = pts.map((p) => p.x);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const xd = (v: number) => ml + 14 + ((v - xmin) / (xmax - xmin || 1)) * (pw - 28);

  const cx = W / 2;
  const cy = H / 2 - 4;
  const r = 104;
  const arco = (a0: number, a1: number) => {
    const p0 = [cx + r * Math.sin(a0), cy - r * Math.cos(a0)];
    const p1 = [cx + r * Math.sin(a1), cy - r * Math.cos(a1)];
    return `M${cx} ${cy} L${p0[0]!.toFixed(2)} ${p0[1]!.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1[0]!.toFixed(2)} ${p1[1]!.toFixed(2)} Z`;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Gráfica ${tipo} de ${caso.titulo} (simulación)`} style={{ display: "block", maxWidth: 640, margin: "0 auto" }}>
        {tipo !== "circular" && (
          <>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={ml} x2={W - mr} y1={yv(t)} y2={yv(t)} stroke="rgba(255,255,255,0.1)" />
                <text x={ml - 6} y={yv(t) + 4} textAnchor="end" {...txt}>{fmt(t)}</text>
              </g>
            ))}
            <line x1={ml} x2={ml} y1={mt} y2={mt + ph} {...eje} />
            <line x1={ml} x2={W - mr} y1={mt + ph} y2={mt + ph} {...eje} />
            <text x={ml + pw / 2} y={H - 6} textAnchor="middle" {...txt}>{tipo === "histograma" ? `${caso.ejeY} (rangos)` : caso.ejeX}</text>
            <text transform={`translate(13 ${mt + ph / 2}) rotate(-90)`} textAnchor="middle" {...txt}>{tipo === "histograma" ? "Cuántos" : "Valor"}</text>
          </>
        )}

        {tipo === "barras" &&
          pts.map((p, i) => {
            const w = Math.min(46, (pw / n) * 0.7);
            return <rect key={i} x={xi(i) - w / 2} y={yv(p.y)} width={w} height={Math.max(0, mt + ph - yv(p.y))} fill={accent} rx="2" opacity="0.92" />;
          })}

        {tipo === "linea" && (
          <polyline points={pts.map((p, i) => `${xi(i).toFixed(1)},${yv(p.y).toFixed(1)}`).join(" ")} fill="none" stroke={accent} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {tipo === "linea" && n <= 12 && pts.map((p, i) => <circle key={i} cx={xi(i)} cy={yv(p.y)} r="3.4" fill={accent} />)}

        {tipo === "area" && (
          <>
            <polygon points={`${xi(0)},${mt + ph} ${pts.map((p, i) => `${xi(i).toFixed(1)},${yv(p.y).toFixed(1)}`).join(" ")} ${xi(n - 1)},${mt + ph}`} fill={accent} opacity="0.35" />
            <polyline points={pts.map((p, i) => `${xi(i).toFixed(1)},${yv(p.y).toFixed(1)}`).join(" ")} fill="none" stroke={accent} strokeWidth="2.4" strokeLinejoin="round" />
          </>
        )}

        {tipo === "dispersion" && pts.map((p, i) => <circle key={i} cx={xd(p.x)} cy={yv(p.y)} r="5" fill={accent} opacity="0.8" />)}
        {tipo === "dispersion" && (
          <>
            <text x={ml + 14} y={mt + ph + 18} textAnchor="middle" {...txt}>{fmt(xmin)}</text>
            <text x={W - mr - 14} y={mt + ph + 18} textAnchor="middle" {...txt}>{fmt(xmax)}</text>
          </>
        )}

        {tipo === "histograma" &&
          bins.map((b, i) => {
            const bw = pw / bins.length;
            return (
              <g key={i}>
                <rect x={ml + i * bw + 1} y={yv(b.cuenta)} width={bw - 2} height={Math.max(0, mt + ph - yv(b.cuenta))} fill={accent} opacity="0.92" />
                <text x={ml + i * bw + bw / 2} y={mt + ph + 18} textAnchor="middle" {...txt}>{Math.round(b.desde)}</text>
              </g>
            );
          })}

        {tipo === "circular" && rebanadas(pts).map((s, i) => <path key={i} d={arco(s.ini, s.fin)} fill={PALETA[i % PALETA.length]} stroke="#0a1626" strokeWidth="1.5" />)}

        {etiquetasX &&
          pts.map((p, i) => (
            <text key={i} transform={`translate(${xi(i)} ${mt + ph + 16}) rotate(${n > 6 ? -28 : 0})`} textAnchor={n > 6 ? "end" : "middle"} {...txt}>
              {p.e.length > 9 ? `${p.e.slice(0, 8)}…` : p.e}
            </text>
          ))}

        {recortado && ejeAplica(tipo) && base > 0 && (
          <text x={ml + 8} y={mt + 14} fill="#FF8A8A" fontSize="13" fontWeight="800">
            El eje empieza en {base}, no en 0
          </text>
        )}
      </svg>
      {tipo === "circular" && n <= 6 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", fontSize: 14, color: T.text2 }}>
          {rebanadas(pts).map((s, i) => (
            <span key={i}>
              <i className="fa-solid fa-square" style={{ color: PALETA[i % PALETA.length], marginRight: 6 }} aria-hidden />
              {s.e} {s.pct.toFixed(0)} %
            </span>
          ))}
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

function RowsTipos({
  accent,
  selTipo,
  shakeTipo,
  empTipo,
  onMatch,
  dropProps,
}: {
  accent: string;
  selTipo: string | null;
  shakeTipo: string | null;
  empTipo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {GRAFICAS.map((g) => {
        const done = empTipo[g.id];
        return (
          <div
            key={g.id}
            className="tg-row"
            data-shake={shakeTipo === g.id}
            data-done={done}
            onClick={() => !done && selTipo && onMatch(selTipo, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="tg-slot" data-armed={!done && !!selTipo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "tgPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <ChartGlyph glyph={g.glyph} color={accent} size={30} />
                  {g.nombre}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> gráfica
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{g.proposito}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{g.detalle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsEscenarios({
  accent,
  rgba,
  selEsc,
  shakeEsc,
  ubicEsc,
  onMatch,
  dropProps,
}: {
  accent: string;
  rgba: string;
  selEsc: string | null;
  shakeEsc: Glyph | null;
  ubicEsc: Record<string, Glyph>;
  onMatch: (escId: string, bin: Glyph) => void;
  dropProps: DropFactory;
}) {
  const bins: Glyph[] = ["barras", "linea", "circular", "dispersion", "area"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = GLYPH_INFO[bin];
        const dentro = ESCENARIOS.filter((e) => ubicEsc[e.id] === bin);
        return (
          <div
            key={bin}
            className="tg-bin"
            data-shake={shakeEsc === bin}
            onClick={() => selEsc && onMatch(selEsc, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${rgba},0.14)` }}>
                <ChartGlyph glyph={bin} color={accent} size={30} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "tgPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
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
        Cuatro afirmaciones sobre medidas estadísticas, gráficas y software libre. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="tg-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tg-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tg-btn" onClick={reintentar}>
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
