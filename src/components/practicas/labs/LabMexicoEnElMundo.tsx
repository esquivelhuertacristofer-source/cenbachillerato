"use client";

/**
 * Laboratorio — México en el mundo: procesos históricos interconectados del
 * siglo XIX al XXI.
 * Práctica experimental para CH-II-P04 (Conciencia Histórica II).
 *
 * Modo principal: simulador «Cancillería» (mapa con rutas, tres medidores y siete
 * decisiones, una por proceso de la línea del tiempo; los números son simulación).
 * Los modos de arrastre se conservan como refuerzo, dentro de <Mesa>.
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «La línea del tiempo conectada» — ordena cronológicamente los siete
 *     procesos que conectan a México con el mundo, de la Reforma al nearshoring
 *     (mecánica de orden: hueco activo + eslabones bloqueados).
 *  2. «¿De qué siglo es?» — clasifica ocho procesos en las columnas siglo XIX /
 *     XX / XXI según la fecha que la fuente fija para cada uno.
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CH-II·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { MEXICO_EN_EL_MUNDO_HUECOS } from "./mexico-en-el-mundo-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import {
  EPISODIOS,
  SOCIOS,
  INDICADORES,
  MEXICO_POS,
  calcular,
  concentracion,
  dependencia,
  metaLograda,
  decididos,
  type Estado,
} from "./mexico-en-el-mundo-sim";
import { MEXICO_EN_EL_MUNDO_FICHA } from "./mexico-en-el-mundo-ficha";
import {
  HITOS,
  PROCESOS,
  SIGLO_INFO,
  PARES,
  QUIZ,
  DATO_MEXICO,
  type Siglo,
} from "./mexico-en-el-mundo-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-mexico-en-el-mundo-reto";

type Modo = "cancilleria" | "linea" | "siglos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "cancilleria", label: "Cancillería", icono: "fa-earth-americas" },
  { id: "linea", label: "La línea del tiempo conectada", icono: "fa-timeline" },
  { id: "siglos", label: "¿De qué siglo es?", icono: "fa-table-columns" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabMexicoEnElMundo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("cancilleria");

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
  const sfxClick = () => sonido && audioRef.current?.blip();
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo Cancillería (simulador) ───────────────────────────────────────
  const [elecciones, setElecciones] = useState<(string | null)[]>(() => EPISODIOS.map(() => null));
  const [paso, setPaso] = useState(0);
  const estadoSim = calcular(elecciones);
  const elegir = (i: number, id: string) => {
    if (elecciones[i]) return;
    sfxClick();
    setElecciones((e) => e.map((v, k) => (k === i ? id : v)));
  };
  const resetSim = () => {
    setElecciones(EPISODIOS.map(() => null));
    setPaso(0);
  };
  const simDone = decididos(elecciones) >= EPISODIOS.length;
  const simMeta = simDone && metaLograda(estadoSim);

  // ── modo Línea (ordena cronológicamente) ───────────────────────────────
  const [lineaPos, setLineaPos] = useState(0);
  const [selL, setSelL] = useState<string | null>(null);
  const [shakeL, setShakeL] = useState(false);
  // mezcla determinista: por una clave de texto, NO por fecha (localeCompare)
  const lineaLibres = HITOS.filter((h) => h.orden >= lineaPos)
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarLinea = (hitoId: string) => {
    if (lineaPos >= HITOS.length) return;
    const esperado = HITOS[lineaPos]!;
    if (hitoId === esperado.id) {
      setLineaPos((p) => p + 1);
      setSelL(null);
      sfxPlace();
      if (lineaPos + 1 >= HITOS.length) {
        sfxOk();
        persistMejor(true, siglosDone, glosarioDone);
      }
    } else {
      setShakeL(true);
      sfxNo();
      window.setTimeout(() => setShakeL(false), 420);
    }
  };
  const resetLinea = () => {
    setLineaPos(0);
    setSelL(null);
  };

  // ── modo Siglos (clasifica por siglo) ──────────────────────────────────
  const [ubicSiglo, setUbicSiglo] = useState<Record<string, Siglo>>({});
  const [selS, setSelS] = useState<string | null>(null);
  const [shakeSiglo, setShakeSiglo] = useState<Siglo | null>(null);
  const siglosLibres = PROCESOS.filter((p) => !ubicSiglo[p.id])
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarSiglo = (procId: string, bin: Siglo) => {
    if (ubicSiglo[procId]) return;
    const p = PROCESOS.find((x) => x.id === procId);
    if (p && p.siglo === bin) {
      setUbicSiglo((e) => ({ ...e, [procId]: bin }));
      setSelS(null);
      sfxPlace();
      if (Object.keys(ubicSiglo).length + 1 >= PROCESOS.length) {
        sfxOk();
        persistMejor(lineaDone, true, glosarioDone);
      }
    } else {
      setShakeSiglo(bin);
      sfxNo();
      window.setTimeout(() => setShakeSiglo(null), 420);
    }
  };
  const resetSiglos = () => {
    setUbicSiglo({});
    setSelS(null);
  };

  // ── modo Glosario (empareja término → definición) ──────────────────────
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
  const lineaDone = lineaPos >= HITOS.length;
  const siglosDone = Object.keys(ubicSiglo).length >= PROCESOS.length;
  const modosHechos = (lineaDone ? 1 : 0) + (siglosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Toma las 7 decisiones de la Cancillería, de la Reforma al nearshoring", done: simDone },
    { txt: "Logra comercio y autonomía sin depender de un solo socio", done: simMeta },
    { txt: "Ordena la línea del tiempo de la Reforma al nearshoring", done: lineaDone },
    { txt: "Clasifica los 8 procesos en su siglo (XIX/XX/XXI)", done: siglosDone },
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
  const resetActual = modo === "cancilleria" ? resetSim : modo === "texto" ? resetTexto : modo === "linea" ? resetLinea : modo === "siglos" ? resetSiglos : resetGlosario;

  const pistaDe: Record<Modo, string> = {
    cancilleria: "Cada decisión mueve los tres medidores y el grosor de las rutas. Mira qué pasa cuando una sola ruta engorda mucho: crece el comercio, pero ¿qué pasa con la autonomía?",
    linea: "La Reforma abre el siglo XIX; la Revolución y el milagro mexicano el XX; el nearshoring el XXI. Sigue las fechas de inicio.",
    siglos: "Fíjate en el año de inicio: 1858 y 1876 son del XIX; de 1910 a 1994, del XX; 2020, del XXI.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const escena = (
    <div style={{ color: T.text, display: "grid", gap: 16, minWidth: 0 }}>
      <style>{`
        @keyframes memShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes memPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .mem-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
        .mem-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .mem-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .mem-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .mem-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .mem-icobtn:hover { background:rgba(255,255,255,0.12); }
        .mem-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
        .mem-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .mem-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .mem-chip:active { cursor:grabbing; }
        .mem-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .mem-row[data-shake="true"] { animation:memShake .4s; border-color:${NO}; }
        .mem-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .mem-slot { flex-shrink:0; min-width:170px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .mem-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .mem-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:210px; }
        .mem-bin[data-shake="true"] { animation:memShake .4s; border-color:${NO}; }
        .mem-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:flex-start; gap:12px; animation:memPop .25s ease; }
        .mem-fslot { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px 16px; transition:all .16s;
          display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:14px; cursor:pointer; }
        .mem-fslot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; }
        .mem-fslot[data-shake="true"] { animation:memShake .4s; border-color:${NO}; }
        .mem-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.45; }
        .mem-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .mem-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .mem-q:disabled{ cursor:default; }
        .mem-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .mem-btn:hover { border-color:${T.lineStrong}; }
        .mem-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .mem-row[data-shake="true"], .mem-bin[data-shake="true"], .mem-fslot[data-shake="true"] { animation:none; } }

        /* Identidad del tablero */
        .mem-bin, .mem-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .mem-bin:nth-of-type(6n+1), .mem-row:nth-of-type(6n+1) { --tono:188; }
        .mem-bin:nth-of-type(6n+2), .mem-row:nth-of-type(6n+2) { --tono:262; }
        .mem-bin:nth-of-type(6n+3), .mem-row:nth-of-type(6n+3) { --tono:44; }
        .mem-bin:nth-of-type(6n+4), .mem-row:nth-of-type(6n+4) { --tono:152; }
        .mem-bin:nth-of-type(6n+5), .mem-row:nth-of-type(6n+5) { --tono:330; }
        .mem-bin:nth-of-type(6n+6), .mem-row:nth-of-type(6n+6) { --tono:18; }
        .mem-bin::before, .mem-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .mem-bin[data-done="true"], .mem-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .mem-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .mem-chip:hover { transform:translateY(-2px); }
        .mem-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .mem-chip, .mem-chip:hover, .mem-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {modo === "cancilleria" && (
        <Cancilleria
          accent={accent}
          rgba={color.rgba}
          elecciones={elecciones}
          paso={paso}
          setPaso={setPaso}
          onElegir={elegir}
          estado={estadoSim}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={MEXICO_EN_EL_MUNDO_HUECOS}
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

      {modo === "linea" && (
        <Mesa>
          <div style={{ ...card, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Ordena los procesos del más antiguo al más reciente</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: lineaDone ? OK : T.text3 }}>
                {lineaPos}/{HITOS.length}
              </span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
              Arrastra el <strong style={{ color: T.text2 }}>siguiente proceso</strong> al hueco activo, de la Reforma (siglo XIX) al nearshoring (siglo XXI).
            </div>
            {lineaLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Reconstruiste la línea del tiempo conectada!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {lineaLibres.map((h) => (
                  <button key={h.id} className="mem-chip" data-sel={selL === h.id} onClick={() => setSelL((s) => (s === h.id ? null : h.id))} {...dragProps(h.id)}>
                    <i className="fa-solid fa-calendar-days" style={{ fontSize: 14, color: T.text3 }} />
                    {h.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <LineaOrden selL={selL} shakeL={shakeL} lineaPos={lineaPos} onMatch={intentarLinea} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "siglos" && (
        <Mesa>
          <div style={{ ...card, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada proceso al siglo en que inició</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: siglosDone ? OK : T.text3 }}>
                {Object.keys(ubicSiglo).length}/{PROCESOS.length}
              </span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
              Periodizar es ubicar cada proceso en su <strong style={{ color: T.text2 }}>siglo</strong>: del XIX (Reforma) al XXI (T-MEC).
            </div>
            {siglosLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {PROCESOS.length} procesos!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {siglosLibres.map((p) => (
                  <button key={p.id} className="mem-chip" data-sel={selS === p.id} onClick={() => setSelS((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <BinsSiglo selS={selS} shakeSiglo={shakeSiglo} ubicSiglo={ubicSiglo} onMatch={intentarSiglo} dropProps={dropProps} />
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
            persistMejor(lineaDone, siglosDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const mayor = concentracion(estadoSim.flujos);
  const socioMayor = SOCIOS.find((s) => s.id === mayor.socio)!;
  const lectura =
    modo === "cancilleria"
      ? `${decididos(elecciones)}/${EPISODIOS.length} decisiones · mayor socio: ${socioMayor.nombre} ${Math.round(mayor.parte * 100)} %`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

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
          icono: "fa-book-atlas",
          contenido: (
            <>
              <Bloque titulo="Tu mapa (simulación)" icono="fa-earth-americas">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                  <Dato label="Comercio" value={`${estadoSim.comercio}`} col="#38BDF8" />
                  <Dato label="Autonomía" value={`${estadoSim.autonomia}`} col="#FBBF24" />
                  <Dato label="Estabilidad" value={`${estadoSim.estabilidad}`} col="#34D399" />
                  <Dato label={`Mayor socio: ${socioMayor.nombre}`} value={`${Math.round(mayor.parte * 100)} %`} col={socioMayor.color} />
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  Los números de 0 a 100 son una simulación para comparar decisiones, no cifras históricas.
                </div>
              </Bloque>
              <Bloque titulo="Tus decisiones" icono="fa-list-check">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {EPISODIOS.map((ep, i) => {
                    const op = ep.opciones.find((o) => o.id === elecciones[i]);
                    return (
                      <div key={ep.id} style={{ fontSize: 14, color: op ? T.text2 : T.text3, lineHeight: 1.45 }}>
                        <strong style={{ color: op ? T.text : T.text3 }}>{ep.anio} · {ep.titulo}.</strong> {op ? op.texto : "Sin decidir."}
                      </div>
                    );
                  })}
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
                  {bestEstrellas >= 3 ? "¡Conectas la historia de México con el mundo!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={MEXICO_EN_EL_MUNDO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="La línea del tiempo conectada" icono="fa-timeline">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {HITOS.map((h) => (
                    <div key={h.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{h.anio} · {h.etapa}.</strong> {h.texto}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Los tres siglos" icono="fa-table-columns">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(Object.keys(SIGLO_INFO) as Siglo[]).map((s) => (
                    <div key={s} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{SIGLO_INFO[s].titulo}.</strong> {SIGLO_INFO[s].subtitulo}
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_MEXICO}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR «Cancillería»: mapa con rutas, tres medidores y siete decisiones.
 * ═══════════════════════════════════════════════════════════════════════════ */
const RUTA_SIM = "/media/labs-sim/mexico-en-el-mundo";

function FotoSim({ clave, icono, color }: { clave: string; icono: string; color: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div style={{ position: "relative", height: 120, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg, ${color}44, #0b2233)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <i className={`fa-solid ${icono}`} aria-hidden style={{ fontSize: 40, color: `${color}aa` }} />
      {!fallo && (
        <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </div>
  );
}

function Medidor({ nombre, icono, color, valor }: { nombre: string; icono: string; color: string; valor: number }) {
  return (
    <div style={{ ...card, padding: "10px 12px", display: "grid", gap: 6, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 14, fontWeight: 800, color }}>
        <span><i className={`fa-solid ${icono}`} aria-hidden style={{ marginRight: 6 }} />{nombre}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${valor}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}

function Cancilleria({
  accent,
  rgba,
  elecciones,
  paso,
  setPaso,
  onElegir,
  estado,
}: {
  accent: string;
  rgba: string;
  elecciones: (string | null)[];
  paso: number;
  setPaso: (n: number) => void;
  onElegir: (i: number, id: string) => void;
  estado: Estado;
}) {
  const total = EPISODIOS.length;
  const fin = paso >= total;
  const ep = fin ? null : EPISODIOS[paso]!;
  const elegida = ep ? ep.opciones.find((o) => o.id === elecciones[paso]) : undefined;
  const mayor = concentracion(estado.flujos);
  const nivel = dependencia(estado.flujos);
  const suma = (Object.values(estado.flujos) as number[]).reduce((s, v) => s + v, 0) || 1;
  const hecho = decididos(elecciones) >= total;
  const meta = hecho && metaLograda(estado);
  const hasta = Math.min(total, decididos(elecciones));

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
        {INDICADORES.map((ind) => (
          <Medidor key={ind.id} nombre={ind.nombre} icono={ind.icono} color={ind.color} valor={estado[ind.id]} />
        ))}
      </div>

      {/* Mapa de rutas */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "2 / 1", minHeight: 210, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.line}`, background: "radial-gradient(90% 90% at 30% 55%, rgba(56,189,248,0.12), transparent 70%), #07182a" }} role="img" aria-label="Mapa esquemático de las rutas de México con sus socios">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          {[20, 40, 60, 80].map((v) => (
            <g key={v} stroke="rgba(255,255,255,0.07)" strokeWidth={1} vectorEffect="non-scaling-stroke">
              <line x1={0} x2={100} y1={v} y2={v} vectorEffect="non-scaling-stroke" />
              <line x1={v} x2={v} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
            </g>
          ))}
          {SOCIOS.map((s) => {
            const flujo = estado.flujos[s.id];
            const cx = (MEXICO_POS.x + s.x) / 2;
            const cy = Math.min(MEXICO_POS.y, s.y) - 14;
            const contagio = estado.contagio.includes(s.id);
            return (
              <path
                key={s.id}
                d={`M ${MEXICO_POS.x} ${MEXICO_POS.y} Q ${cx} ${cy} ${s.x} ${s.y}`}
                fill="none"
                stroke={contagio ? "#FF5E5E" : s.color}
                strokeWidth={1 + flujo / 3.5}
                strokeLinecap="round"
                strokeDasharray={contagio ? "6 5" : undefined}
                opacity={0.25 + Math.min(0.65, flujo / 40)}
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke-width .7s ease, opacity .7s ease" }}
              />
            );
          })}
        </svg>
        {SOCIOS.map((s) => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -50%)", padding: "4px 9px", borderRadius: 10, background: "rgba(4,10,22,0.85)", border: `1.5px solid ${s.color}`, fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", lineHeight: 1.2, textAlign: "center" }}>
            {s.nombre}
            <div style={{ fontSize: 14, color: s.color, fontWeight: 900 }}>{Math.round((estado.flujos[s.id] / suma) * 100)} %</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: `${MEXICO_POS.x}%`, top: `${MEXICO_POS.y}%`, transform: "translate(-50%, -50%)", padding: "6px 12px", borderRadius: 12, background: accent, color: "#04121f", fontSize: 14, fontWeight: 900 }}>
          México
        </div>
      </div>
      <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
        Rutas más gruesas = más intercambio con ese socio (simulación). Una ruta roja punteada es una crisis que se contagia.
      </div>

      {/* Episodios */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {EPISODIOS.map((e, i) => {
          const abierto = i <= hasta;
          return (
            <button
              key={e.id}
              type="button"
              disabled={!abierto}
              onClick={() => setPaso(i)}
              className="mem-btn"
              style={{ padding: "7px 11px", opacity: abierto ? 1 : 0.4, borderColor: i === paso ? accent : elecciones[i] ? OK : undefined, color: elecciones[i] ? OK : T.text2 }}
            >
              {elecciones[i] ? <i className="fa-solid fa-check" aria-hidden /> : null} {e.anio}
            </button>
          );
        })}
        {hecho && (
          <button type="button" className="mem-btn" onClick={() => setPaso(total)} style={{ padding: "7px 11px", borderColor: fin ? accent : undefined }}>
            <i className="fa-solid fa-flag-checkered" aria-hidden /> Balance
          </button>
        )}
      </div>

      {ep && (
        <div style={{ ...card, padding: 16, display: "grid", gap: 12 }}>
          <FotoSim key={ep.imagen} clave={ep.imagen} icono={ep.icono} color={accent} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: accent }}>{ep.anio} · Episodio {paso + 1} de {total}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "2px 0 6px" }}>{ep.titulo}</div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{ep.contexto}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{ep.pregunta}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {ep.opciones.map((o) => {
              const sel = elegida?.id === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  className="mem-q"
                  disabled={!!elegida}
                  onClick={() => onElegir(paso, o.id)}
                  style={{ borderColor: sel ? accent : undefined, background: sel ? `rgba(${rgba},0.18)` : undefined, color: sel ? "#fff" : undefined, opacity: elegida && !sel ? 0.55 : 1 }}
                >
                  <span style={{ flex: 1, lineHeight: 1.35 }}>{o.texto}</span>
                </button>
              );
            })}
          </div>
          {elegida && (
            <div style={{ display: "grid", gap: 10, padding: "12px 14px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {INDICADORES.map((ind) => {
                  const d = elegida.efecto[ind.id];
                  return (
                    <span key={ind.id} style={{ fontSize: 14, fontWeight: 800, color: d > 0 ? OK : d < 0 ? NO : T.text3 }}>
                      {ind.nombre} {d > 0 ? `+${d}` : d}
                    </span>
                  );
                })}
              </div>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-circle-info" aria-hidden style={{ color: accent, marginRight: 8 }} />
                {elegida.porque}
              </div>
              <button type="button" className="mem-btn" style={{ background: accent, color: "#04121f", border: "none", justifySelf: "start" }} onClick={() => setPaso(paso + 1 >= total ? total : paso + 1)}>
                {paso + 1 >= total ? "Ver el balance" : "Siguiente episodio"} <i className="fa-solid fa-arrow-right" aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      {fin && (
        <div style={{ ...card, padding: 16, display: "grid", gap: 10, borderColor: meta ? `${OK}88` : undefined }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: meta ? OK : "#fff" }}>
            <i className={`fa-solid ${meta ? "fa-trophy" : "fa-compass"}`} aria-hidden style={{ marginRight: 8 }} />
            {meta ? "Un México conectado sin depender de uno solo" : "Balance de la Cancillería"}
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
            Dependencia de un solo socio: <strong style={{ color: "#fff" }}>{nivel}</strong> ({SOCIOS.find((s) => s.id === mayor.socio)!.nombre}, {Math.round(mayor.parte * 100)} % de las rutas).{" "}
            {meta
              ? "Lograste comercio alto, autonomía y estabilidad: la multicausalidad y la interconexión se manejan repartiendo relaciones, no apostando todo a una."
              : "Meta: comercio ≥ 55, autonomía ≥ 50, estabilidad ≥ 45 y ningún socio con más del 40 % de las rutas. Reinicia y prueba otra combinación: ninguna decisión es gratis, pero repartir relaciones deja más margen."}
          </div>
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

function LineaOrden({
  selL,
  shakeL,
  lineaPos,
  onMatch,
  dropProps,
}: {
  selL: string | null;
  shakeL: boolean;
  lineaPos: number;
  onMatch: (hitoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {HITOS.map((h, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < lineaPos) {
          // ya colocado
          return (
            <div key={h.id} className="mem-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: OK, color: "#04121f", marginTop: 1 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{h.anio}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {h.etapa}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.4 }}>{h.texto}</div>
              </div>
            </div>
          );
        }
        if (i === lineaPos) {
          // hueco activo
          return (
            <div
              key={h.id}
              className="mem-fslot"
              data-armed={!!selL}
              data-shake={shakeL}
              onClick={() => selL && onMatch(selL)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí el siguiente proceso</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={h.id} className="mem-locked">
            {num}
            <span style={{ fontSize: 14, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 14 }} />
              Proceso {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BinsSiglo({
  selS,
  shakeSiglo,
  ubicSiglo,
  onMatch,
  dropProps,
}: {
  selS: string | null;
  shakeSiglo: Siglo | null;
  ubicSiglo: Record<string, Siglo>;
  onMatch: (procId: string, bin: Siglo) => void;
  dropProps: DropFactory;
}) {
  const bins: Siglo[] = ["XIX", "XX", "XXI"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = SIGLO_INFO[bin];
        const dentro = PROCESOS.filter((p) => ubicSiglo[p.id] === bin);
        return (
          <div
            key={bin}
            className="mem-bin"
            data-shake={shakeSiglo === bin}
            onClick={() => selS && onMatch(selS, bin)}
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
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "memPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                    {p.texto}
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
        Cinco afirmaciones sobre la multicausalidad histórica y la interconexión de México con el mundo. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="mem-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="mem-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="mem-btn" onClick={reintentar}>
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
