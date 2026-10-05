"use client";

/**
 * Laboratorio — Taller de hardware y software.
 * Práctica experimental para CD-I-P01-A2 (Cultura Digital I · Ciudadanía digital).
 *
 * Experimento central: «Arma la PC del cliente». Un cliente ficticio pide un
 * equipo con presupuesto; el alumno elige piezas (hardware) y programas
 * (software) y VE qué pasa: el dibujo de la tarjeta madre cambia, el monitor
 * muestra si enciende, si arranca y si la app del cliente abre, y los
 * medidores de fluidez, precio y espacio se mueven. Una pieza que falta = no
 * enciende; un sistema equivocado o poca RAM = la app no corre.
 *
 * Modos de refuerzo (se conservan): «Hardware o software», «¿Por qué se
 * traba?» y «Completa el texto». Cuestionario en la pestaña «Reto».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de la lectura A1 «¿Qué hay
 * dentro de mis dispositivos?». Clientes y cifras: ficticios (simulación).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { HARDWARE_SOFTWARE_HUECOS } from "./hardware-software-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { HARDWARE_SOFTWARE_FICHA } from "./hardware-software-ficha";
import {
  PIEZAS,
  ITEMS,
  CAT_INFO,
  CAUSAS,
  DIAGNOSTICOS,
  QUIZ,
  DATO_ENDUTIH,
  type Cat,
} from "./hardware-software-data";
import {
  SLOTS,
  OPCIONES,
  SISTEMAS,
  CLIENTES,
  CONFIG_VACIA,
  GB_CONTROLADOR,
  evaluar,
  opcionDe,
  dinero,
  type Config,
  type SlotId,
  type SoId,
  type Evaluacion,
  type Cliente,
} from "./hardware-software-sim";

const NO = "#FF5E5E";
const AMBAR = "#F2A33C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-hardware-reto";
const RUTA_FOTOS = "/media/labs-sim/hardware-software";

type Modo = "armar" | "clasificar" | "diagnostico" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "armar", label: "Arma la PC", icono: "fa-screwdriver-wrench" },
  { id: "clasificar", label: "Hardware o software", icono: "fa-layer-group" },
  { id: "diagnostico", label: "¿Por qué se traba?", icono: "fa-stethoscope" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const itemById = (id: string) => ITEMS.find((i) => i.id === id);
const causaById = (id: string) => CAUSAS.find((c) => c.id === id);

export function LabHardwareSoftware({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("armar");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };
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

  // ── modo Arma la PC (simulador) ───────────────────────────────────────
  const [cliIdx, setCliIdx] = useState(0);
  const [cfg, setCfg] = useState<Config>(CONFIG_VACIA);
  const [encendio, setEncendio] = useState(false);
  const [atendidos, setAtendidos] = useState<string[]>([]);
  const [entrega, setEntrega] = useState<{ ok: boolean; txt: string } | null>(null);
  const cliente = CLIENTES[cliIdx]!;
  const ev = evaluar(cfg, cliente);

  /** Todo cambio del equipo pasa por aquí: se recalcula y se recuerda lo logrado. */
  const cambiar = (siguiente: Config) => {
    const nuevo = evaluar(siguiente, cliente);
    setCfg(siguiente);
    setEntrega(null);
    if (nuevo.enciende && !encendio) {
      setEncendio(true);
      sfxPlace();
    } else {
      sfxClick();
    }
  };
  const elegir = (slot: SlotId, id: string) => cambiar({ ...cfg, [slot]: cfg[slot] === id ? null : id });
  const elegirSo = (so: SoId) => cambiar({ ...cfg, so });
  const alternarApp = () => cambiar({ ...cfg, appInstalada: !cfg.appInstalada });
  const alternarControlador = () => cambiar({ ...cfg, controlador: !cfg.controlador });
  const elegirCliente = (i: number) => {
    setCliIdx(i);
    setCfg((c) => ({ ...c, appInstalada: false }));
    setEntrega(null);
    sfxClick();
  };
  const resetArmar = () => {
    setCfg(CONFIG_VACIA);
    setEntrega(null);
  };
  const entregar = () => {
    if (ev.satisfecho) {
      if (!atendidos.includes(cliente.id)) setAtendidos((a) => [...a, cliente.id]);
      setEntrega({ ok: true, txt: `¡${cliente.nombre} está contenta! La app corre fluida y el equipo cuesta ${dinero(ev.precio)}, dentro de su presupuesto.` });
      sfxPlace();
      sfxOk();
      return;
    }
    let txt = ev.motivo;
    if (ev.estado === "corre" && !ev.dentroPresupuesto) {
      txt = `Funciona, pero cuesta ${dinero(ev.precio - cliente.presupuesto)} más de lo que ${cliente.nombre.split(" ")[0]} puede pagar. Busca una pieza que no le haga falta a su trabajo.`;
    } else if (ev.estado === "escritorio") {
      txt = `Arrancó, pero no has instalado «${cliente.app}»: sin el software no hay trabajo que hacer.`;
    }
    setEntrega({ ok: false, txt });
    sfxNo();
  };

  // ── modo Clasificar ───────────────────────────────────────────────────
  const [ubic, setUbic] = useState<Record<string, Cat>>({});
  const [selItem, setSelItem] = useState<string | null>(null);
  const [intentadas, setIntentadas] = useState<Set<string>>(() => new Set<string>());
  const [primeros, setPrimeros] = useState<Set<string>>(() => new Set<string>());
  const [shakeBin, setShakeBin] = useState<Cat | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);

  const intentarClasificar = (itemId: string, cat: Cat) => {
    const item = itemById(itemId);
    if (!item || ubic[itemId]) return;
    const primeraVez = !intentadas.has(itemId);
    if (primeraVez) setIntentadas((s) => new Set(s).add(itemId));

    if (item.cat === cat) {
      const next = { ...ubic, [itemId]: cat };
      setUbic(next);
      setSelItem(null);
      sfxPlace();
      let nextPrimeros = primeros;
      if (primeraVez) {
        nextPrimeros = new Set(primeros).add(itemId);
        setPrimeros(nextPrimeros);
      }
      if (Object.keys(next).length >= ITEMS.length) {
        const est = nextPrimeros.size >= ITEMS.length ? 3 : nextPrimeros.size >= 8 ? 2 : 1;
        setEstrellas(est);
        sfxOk();
        registraEstrellas(est);
      }
    } else {
      setShakeBin(cat);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbic({});
    setSelItem(null);
    setIntentadas(new Set());
    setPrimeros(new Set());
    setEstrellas(0);
  };

  // ── modo Diagnóstico ──────────────────────────────────────────────────
  const [empar, setEmpar] = useState<Record<string, string>>({}); // diagId -> causaId (solo correctos)
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeDiag, setShakeDiag] = useState<string | null>(null);

  const intentarDiag = (causaId: string, diagId: string) => {
    const diag = DIAGNOSTICOS.find((d) => d.id === diagId);
    if (!diag || empar[diagId]) return;
    if (diag.causaId === causaId) {
      setEmpar((e) => ({ ...e, [diagId]: causaId }));
      setSelCausa(null);
      sfxPlace();
      if (Object.keys(empar).length + 1 >= DIAGNOSTICOS.length) sfxOk();
    } else {
      setShakeDiag(diagId);
      sfxNo();
      window.setTimeout(() => setShakeDiag(null), 420);
    }
  };
  const resetDiag = () => {
    setEmpar({});
    setSelCausa(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const armarDone = encendio;
  const clasifDone = Object.keys(ubic).length >= ITEMS.length;
  const diagDone = Object.keys(empar).length >= DIAGNOSTICOS.length;
  // Los cuatro modos cuentan, no sólo la clasificación: el modo de escribir
  // es trabajo real y antes no dejaba marca. La regla de precisión propia de
  // este lab se conserva, y se toma la mejor de las dos.
  const modosHechos = (armarDone ? 1 : 0) + (clasifDone ? 1 : 0) + (diagDone ? 1 : 0) + (textoDone ? 1 : 0);
  const bestEstrellas = Math.max(estrellas, partida.estrellasCon(modosHechos, 4), mejor);

  const objetivos = [
    { txt: "Entrega un equipo que corra fluido dentro del presupuesto", done: atendidos.length >= 1 },
    { txt: "Atiende a los 3 clientes", done: atendidos.length >= CLIENTES.length },
    { txt: "Arma el equipo completo", done: armarDone },
    { txt: "Clasifica las 12 piezas (hardware / software)", done: clasifDone },
    { txt: "Resuelve los 3 diagnósticos", done: diagDone },
    { txt: "Consigue 3★ en la clasificación", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const causasLibres = CAUSAS.filter((c) => !Object.values(empar).includes(c.id));
  const itemsLibres = ITEMS.filter((i) => !ubic[i.id]);

  // helper para arrastre nativo
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

  const resetActual = modo === "texto" ? resetHuecos : modo === "armar" ? resetArmar : modo === "clasificar" ? resetClasificar : resetDiag;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={HARDWARE_SOFTWARE_HUECOS}
          accent={accent}
          rgba={color.rgba}
          completado={textoDone}
          onCompletado={() => {
            setTextoDone(true);
            sfxOk();
            registraEstrellas(partida.estrellasCon((armarDone ? 1 : 0) + (clasifDone ? 1 : 0) + (diagDone ? 1 : 0) + 1, 4));
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "armar" && (
        <TallerEscena
          cliente={cliente}
          cliIdx={cliIdx}
          cfg={cfg}
          ev={ev}
          atendidos={atendidos}
          entrega={entrega}
          onCliente={elegirCliente}
          onEntregar={entregar}
        />
      )}

      {modo === "clasificar" && (
        <ClasificarPanel
          accent={accent}
          rgba={color.rgba}
          ubic={ubic}
          selItem={selItem}
          shakeBin={shakeBin}
          itemsLibres={itemsLibres}
          estrellas={bestEstrellas}
          onSelItem={(id) => setSelItem((p) => (p === id ? null : id))}
          onBin={(cat) => {
            if (selItem) intentarClasificar(selItem, cat);
          }}
          onDropBin={(itemId, cat) => intentarClasificar(itemId, cat)}
          dragProps={dragProps}
          dropProps={dropProps}
        />
      )}

      {modo === "diagnostico" && (
        <DiagnosticoPanel
          accent={accent}
          rgba={color.rgba}
          empar={empar}
          selCausa={selCausa}
          shakeDiag={shakeDiag}
          causasLibres={causasLibres}
          onSelCausa={(id) => setSelCausa((p) => (p === id ? null : id))}
          onDiag={(diagId) => {
            if (selCausa) intentarDiag(selCausa, diagId);
          }}
          onDropDiag={(causaId, diagId) => intentarDiag(causaId, diagId)}
          dragProps={dragProps}
          dropProps={dropProps}
        />
      )}
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    armar: "Prueba a quitar una pieza y mira el monitor. El hardware es lo que se toca; sin software el equipo enciende pero no sabe qué hacer.",
    clasificar: "Pregúntate: ¿lo puedo tocar? Si sí, es hardware; si es un programa o instrucción, es software.",
    diagnostico: "Conocer los componentes ayuda a entender por qué falla un equipo. Empareja cada síntoma con su causa.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const lectura =
    modo === "armar"
      ? ev.estado === "apagado"
        ? `${ev.piezas}/4 piezas · no enciende · ${dinero(ev.precio)}`
        : `Fluidez ${ev.fluidez} · ${dinero(ev.precio)} de ${dinero(cliente.presupuesto)}`
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
          id: "taller",
          etiqueta: "Taller",
          icono: "fa-screwdriver-wrench",
          contenido: (
            <>
              {modo === "armar" && <Selectores cfg={cfg} cliente={cliente} onElegir={elegir} onSo={elegirSo} onApp={alternarApp} onControlador={alternarControlador} />}
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Dominas hardware y software!" : "Atiende clientes y completa los modos; acierta las 12 piezas a la primera para 3★."}
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
                <FichaTeorica data={HARDWARE_SOFTWARE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los componentes y su función" icono="fa-microchip">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {PIEZAS.map((p) => (
                    <div key={p.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{p.nombre}.</strong> {p.funcion}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-chart-simple">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_ENDUTIH}</div>
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
  @keyframes hsShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes hsPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  @keyframes hsBarra { 0%,100%{opacity:.75;} 50%{opacity:1;} }
  .hs-chip { cursor:grab; display:inline-flex; align-items:center; gap:9px; padding:10px 13px; border-radius:12px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:${T.text}; font-size:14px; font-weight:700; text-align:left;
    user-select:none; width:100%; transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .hs-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .hs-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .hs-chip:active { cursor:grabbing; }
  .hs-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:150px; transition:all .16s; }
  .hs-bin[data-sel="true"] { cursor:pointer; }
  .hs-bin[data-shake="true"] { animation:hsShake .4s; }
  .hs-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .hs-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .hs-q:disabled{ cursor:default; }
  .hs-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:15px; font-weight:800; transition:all .14s; }
  .hs-btn:hover { border-color:${T.lineStrong}; }
  .hs-btn:disabled { opacity:.5; cursor:default; }

  /* Simulador */
  .hs-clis { display:flex; gap:8px; flex-wrap:wrap; }
  .hs-cli-btn { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; }
  .hs-cli-btn:hover { color:#fff; border-color:${T.lineStrong}; }
  .hs-cli-btn[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
  .hs-cli-btn[data-ok="true"] { border-color:${OK}88; }
  .hs-cliente { display:grid; grid-template-columns:84px minmax(0,1fr); gap:14px; padding:14px; border-radius:16px;
    border:1px solid ${T.line}; background:${T.glass}; align-items:center; }
  .hs-foto { position:relative; width:84px; height:84px; border-radius:14px; overflow:hidden; display:flex; align-items:center; justify-content:center;
    font-size:30px; color:rgba(255,255,255,0.55); background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(2,12,28,0.85)); }
  .hs-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hs-build { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:12px; align-items:stretch; }
  .hs-board { border-radius:16px; border:1px solid ${T.line}; background:rgba(2,12,28,0.55); padding:10px; display:flex; align-items:center; }
  .hs-board svg { width:100%; height:auto; display:block; }
  .hs-monitor { border-radius:16px; border:3px solid #2b3a4d; background:#04080f; min-height:210px; padding:16px;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center; font-size:14px; line-height:1.45; color:#e6eefb; }
  .hs-monitor i.hs-mon-ic { font-size:34px; }
  .hs-monitor[data-estado="apagado"] { background:#02040a; }
  .hs-monitor[data-estado="sinSO"] { background:#0a1a5a; font-family:ui-monospace, monospace; }
  .hs-monitor[data-estado="escritorio"] { background:linear-gradient(160deg,#1c5fa8,#0e2d57); }
  .hs-monitor[data-estado="noCorre"] { background:#2a0f14; border-color:#7a2a35; }
  .hs-monitor[data-estado="corre"] { background:linear-gradient(160deg,#0c3b30,#06201b); border-color:#2d7a64; }
  .hs-eq { display:flex; align-items:flex-end; gap:6px; height:56px; }
  .hs-eq span { width:12px; border-radius:3px 3px 0 0; background:${OK}; animation:hsBarra 1.1s ease-in-out infinite; }
  .hs-medidores { display:grid; gap:12px; }
  .hs-med { display:grid; gap:5px; font-size:14px; font-weight:700; color:${T.text2}; }
  .hs-med-top { display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; }
  .hs-med-top strong { color:#fff; font-variant-numeric:tabular-nums; }
  .hs-pista { position:relative; height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:hidden; }
  .hs-pista > span { position:absolute; left:0; top:0; bottom:0; border-radius:99px; transition:width .35s ease, background .35s; }
  .hs-pista > i { position:absolute; top:-2px; bottom:-2px; width:3px; background:#fff; opacity:.85; }
  .hs-resp { padding:12px 14px; border-radius:14px; font-size:15px; line-height:1.45; font-weight:700; border:1px solid ${T.line}; }
  .hs-resp[data-ok="true"] { border-color:${OK}; background:${OK}18; color:#fff; }
  .hs-resp[data-ok="false"] { border-color:${NO}88; background:${NO}14; color:#fff; }
  .hs-ops { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
  .hs-op { cursor:pointer; display:grid; gap:2px; text-align:left; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14px; min-width:0; transition:all .14s; }
  .hs-op:hover { border-color:${T.lineStrong}; }
  .hs-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 14px -6px ${accent}; }
  .hs-op b { font-size:15px; font-weight:900; }
  .hs-op span { font-size:14px; color:${T.text2}; }
  .hs-op em { font-style:normal; font-size:14px; font-weight:800; color:${AMBAR}; font-variant-numeric:tabular-nums; }
  .hs-sw { cursor:pointer; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:${T.text}; font-size:14px; font-weight:700; text-align:left; width:100%; }
  .hs-sw[data-on="true"] { border-color:${OK}; background:${OK}18; }
  .hs-sw:disabled { opacity:.45; cursor:default; }
  @media (prefers-reduced-motion: reduce){ .hs-bin[data-shake="true"], .hs-eq span { animation:none; } .hs-pista > span { transition:none; } }

  /* Identidad del tablero */
  .hs-bin { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .hs-bin:nth-of-type(6n+1) { --tono:188; }
  .hs-bin:nth-of-type(6n+2) { --tono:262; }
  .hs-bin:nth-of-type(6n+3) { --tono:44; }
  .hs-bin:nth-of-type(6n+4) { --tono:152; }
  .hs-bin:nth-of-type(6n+5) { --tono:330; }
  .hs-bin:nth-of-type(6n+6) { --tono:18; }
  .hs-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .hs-bin[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .hs-chip:hover { transform:translateY(-2px); }
  .hs-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .hs-chip, .hs-chip:hover, .hs-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «Arma la PC del cliente»
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono }: { clave: string; icono: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span className="hs-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </span>
  );
}

const TONO_CPU: Record<number, string> = { 25: "#6b7a90", 55: "#5BA8FF", 90: "#C792EA" };

/** La tarjeta madre dibujada: cada pieza elegida aparece en su ranura. */
function TarjetaMadre({ cfg, ev }: { cfg: Config; ev: Evaluacion }) {
  const cpu = opcionDe(cfg.cpu);
  const ram = opcionDe(cfg.ram);
  const alm = opcionDe(cfg.alm);
  const gpu = opcionDe(cfg.gpu);
  const PALOS: Record<number, number> = { 4: 1, 8: 2, 16: 3, 32: 4 };
  const palos = ram ? PALOS[ram.gb ?? 4] ?? 1 : 0;
  const nucleos = cpu ? (cpu.nivel >= 90 ? 8 : cpu.nivel >= 55 ? 4 : 2) : 0;
  const tonoCpu = cpu ? TONO_CPU[cpu.nivel] ?? "#5BA8FF" : "#fff";
  const vacio = { fill: "none", stroke: "rgba(255,255,255,0.35)", strokeWidth: 1.5, strokeDasharray: "5 4" } as const;
  const gpuAncho = gpu ? (gpu.nivel >= 95 ? 200 : gpu.dedicada ? 150 : 90) : 0;
  return (
    <svg viewBox="0 0 320 230" role="img" aria-label="Tarjeta madre con las piezas elegidas">
      <rect x="4" y="4" width="312" height="222" rx="14" fill="#0c1b2c" stroke="#2b3a4d" strokeWidth="2" />
      <rect x="14" y="14" width="292" height="202" rx="8" fill="#0f3a35" stroke="#1f6f63" />
      {/* procesador */}
      {cpu ? (
        <g style={{ animation: "hsPop .25s ease", transformOrigin: "75px 69px" }}>
          <rect x="40" y="34" width="70" height="70" rx="6" fill="#1b2433" stroke={tonoCpu} strokeWidth="3" />
          {Array.from({ length: nucleos }).map((_, i) => {
            const cols = nucleos === 2 ? 2 : nucleos === 4 ? 2 : 4;
            const w = nucleos === 8 ? 12 : 20;
            const gx = i % cols;
            const gy = Math.floor(i / cols);
            return <rect key={i} x={(nucleos === 8 ? 47 : 53) + gx * (w + 4)} y={(nucleos === 2 ? 56 : 46) + gy * (w + 4)} width={w} height={w} rx="3" fill={tonoCpu} />;
          })}
        </g>
      ) : (
        <rect x="40" y="34" width="70" height="70" rx="6" {...vacio} />
      )}
      {/* memoria */}
      {[0, 1, 2, 3].map((i) =>
        i < palos ? (
          <g key={i} style={{ animation: "hsPop .25s ease", transformOrigin: `${147 + i * 22}px 70px` }}>
            <rect x={140 + i * 22} y="30" width="14" height="80" rx="3" fill="#0b6b4f" stroke={OK} strokeWidth="1.5" />
            <rect x={143 + i * 22} y="38" width="8" height="12" fill="#1b2433" />
            <rect x={143 + i * 22} y="56" width="8" height="12" fill="#1b2433" />
            <rect x={143 + i * 22} y="74" width="8" height="12" fill="#1b2433" />
          </g>
        ) : (
          <rect key={i} x={140 + i * 22} y="30" width="14" height="80" rx="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
        )
      )}
      {/* almacenamiento */}
      {alm ? (
        <g style={{ animation: "hsPop .25s ease", transformOrigin: "262px 60px" }}>
          {alm.nivel <= 20 ? (
            <>
              <rect x="232" y="34" width="60" height="52" rx="6" fill="#2a3340" stroke="#9AA6B2" strokeWidth="2" />
              <circle cx="258" cy="60" r="16" fill="#111822" stroke="#9AA6B2" />
              <circle cx="258" cy="60" r="4" fill="#9AA6B2" />
              <line x1="258" y1="60" x2="276" y2="46" stroke="#cfd8e6" strokeWidth="2.5" />
            </>
          ) : (
            <>
              <rect x="232" y="42" width="60" height="36" rx="6" fill="#1d2f4a" stroke="#5BA8FF" strokeWidth="2" />
              <rect x="240" y="50" width="22" height="20" rx="2" fill="#5BA8FF" opacity=".85" />
              <rect x="268" y="50" width="16" height="20" rx="2" fill="#5BA8FF" opacity=".45" />
            </>
          )}
        </g>
      ) : (
        <rect x="232" y="34" width="60" height="52" rx="6" {...vacio} />
      )}
      {/* gráficos */}
      {gpu ? (
        <g style={{ animation: "hsPop .25s ease", transformOrigin: "30px 160px" }}>
          <rect x="30" y="140" width={gpuAncho} height={gpu.nivel >= 95 ? 46 : gpu.dedicada ? 36 : 22} rx="6" fill={gpu.nivel >= 95 ? "#3b2a63" : gpu.dedicada ? "#1d3a63" : "#2a3340"} stroke={gpu.nivel >= 95 ? "#C792EA" : gpu.dedicada ? "#5BA8FF" : "#9AA6B2"} strokeWidth="2" />
          {gpu.dedicada && <circle cx="58" cy={gpu.nivel >= 95 ? 163 : 158} r={gpu.nivel >= 95 ? 15 : 11} fill="#0a1220" stroke="#cfd8e6" />}
          {gpu.nivel >= 95 && <circle cx="108" cy="163" r="15" fill="#0a1220" stroke="#cfd8e6" />}
          {gpu.dedicada && !cfg.controlador && (
            <g>
              <circle cx={30 + gpuAncho - 14} cy="150" r="9" fill={NO} />
              <text x={30 + gpuAncho - 14} y="155" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff">!</text>
            </g>
          )}
        </g>
      ) : (
        <rect x="30" y="140" width="200" height="40" rx="6" {...vacio} />
      )}
      {/* luz de encendido */}
      <circle cx="288" cy="198" r="7" fill={ev.enciende ? OK : NO} style={{ transition: "fill .3s" }} />
    </svg>
  );
}

function Monitor({ ev, cliente }: { ev: Evaluacion; cliente: Cliente }) {
  const barras = [0.5, 0.8, 0.6, 1, 0.7].map((f) => Math.max(8, Math.round(ev.fluidez * 0.56 * f)));
  return (
    <div className="hs-monitor" data-estado={ev.estado} role="status" aria-live="polite">
      {ev.estado === "apagado" && (
        <>
          <i className="fa-solid fa-power-off hs-mon-ic" style={{ color: "#566" }} />
          <strong>Pantalla negra</strong>
          <span>{ev.motivo}</span>
        </>
      )}
      {ev.estado === "sinSO" && (
        <>
          <i className="fa-solid fa-triangle-exclamation hs-mon-ic" style={{ color: "#ffd166" }} />
          <strong>Sin sistema operativo</strong>
          <span>{ev.motivo}</span>
        </>
      )}
      {ev.estado === "escritorio" && (
        <>
          <i className="fa-solid fa-desktop hs-mon-ic" style={{ color: "#9ed0ff" }} />
          <strong>Escritorio listo</strong>
          <span>{ev.motivo}</span>
        </>
      )}
      {ev.estado === "noCorre" && (
        <>
          <i className="fa-solid fa-circle-xmark hs-mon-ic" style={{ color: NO }} />
          <strong>No se pudo abrir «{cliente.app}»</strong>
          <span>{ev.motivo}</span>
        </>
      )}
      {ev.estado === "corre" && (
        <>
          <i className={`fa-solid ${cliente.appIcono} hs-mon-ic`} style={{ color: OK }} />
          <strong>«{cliente.app}» abierta</strong>
          <div className="hs-eq" aria-hidden>
            {barras.map((h, i) => (
              <span key={i} style={{ height: h, animationDelay: `${i * 0.15}s`, background: ev.fluidez >= cliente.fluidezMin ? OK : AMBAR }} />
            ))}
          </div>
          <span>{ev.motivo}</span>
        </>
      )}
    </div>
  );
}

function Medidor({ etiqueta, valor, fraccion, color, marca }: { etiqueta: string; valor: string; fraccion: number; color: string; marca?: number }) {
  return (
    <div className="hs-med">
      <div className="hs-med-top">
        <span>{etiqueta}</span>
        <strong>{valor}</strong>
      </div>
      <div className="hs-pista" role="presentation">
        <span style={{ width: `${Math.max(0, Math.min(1, fraccion)) * 100}%`, background: color }} />
        {marca !== undefined && <i style={{ left: `${marca * 100}%` }} />}
      </div>
    </div>
  );
}

function TallerEscena({
  cliente,
  cliIdx,
  cfg,
  ev,
  atendidos,
  entrega,
  onCliente,
  onEntregar,
}: {
  cliente: Cliente;
  cliIdx: number;
  cfg: Config;
  ev: Evaluacion;
  atendidos: string[];
  entrega: { ok: boolean; txt: string } | null;
  onCliente: (i: number) => void;
  onEntregar: () => void;
}) {
  const colorFluidez = ev.fluidez >= cliente.fluidezMin ? OK : ev.fluidez > 0 ? AMBAR : NO;
  return (
    <>
      <div className="hs-clis" role="tablist" aria-label="Cliente">
        {CLIENTES.map((c, i) => (
          <button key={c.id} type="button" role="tab" aria-selected={cliIdx === i} className="hs-cli-btn" data-on={cliIdx === i} data-ok={atendidos.includes(c.id)} onClick={() => onCliente(i)}>
            <i className={`fa-solid ${atendidos.includes(c.id) ? "fa-circle-check" : "fa-user"}`} aria-hidden />
            {c.nombre.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="hs-cliente">
        <Foto clave={cliente.clave} icono="fa-user" />
        <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
          <strong style={{ fontSize: 17 }}>{cliente.nombre}</strong>
          <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.4 }}>{cliente.perfil}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: AMBAR }}>
            <i className={`fa-solid ${cliente.appIcono}`} aria-hidden /> Necesita «{cliente.app}» · presupuesto {dinero(cliente.presupuesto)}
          </span>
        </div>
      </div>

      <div className="hs-build">
        <div className="hs-board">
          <TarjetaMadre cfg={cfg} ev={ev} />
        </div>
        <Monitor ev={ev} cliente={cliente} />
      </div>

      <div className="hs-medidores">
        <Medidor
          etiqueta="Fluidez para su trabajo"
          valor={ev.enciende ? `${ev.fluidez} de ${cliente.fluidezMin} mínimo` : "apagado"}
          fraccion={ev.fluidez / 100}
          color={colorFluidez}
          marca={cliente.fluidezMin / 100}
        />
        <Medidor
          etiqueta="Precio (simulación)"
          valor={`${dinero(ev.precio)} de ${dinero(cliente.presupuesto)}`}
          fraccion={ev.precio / cliente.presupuesto}
          color={ev.dentroPresupuesto ? OK : NO}
          marca={1}
        />
        <Medidor
          etiqueta="Espacio en el almacenamiento"
          valor={ev.capacidad ? `${ev.usado} de ${ev.capacidad} GB` : "sin almacenamiento"}
          fraccion={ev.capacidad ? ev.usado / ev.capacidad : 0}
          color={ev.capacidad && ev.usado > ev.capacidad ? NO : "#5BA8FF"}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="hs-btn" style={{ background: "#34D399", color: "#04121f", border: "none" }} onClick={onEntregar}>
          <i className="fa-solid fa-handshake" aria-hidden />
          Entregar a {cliente.nombre.split(" ")[0]}
        </button>
        <span style={{ fontSize: 14, color: T.text3 }}>Elige las piezas en la pestaña «Taller».</span>
      </div>
      {entrega && (
        <div className="hs-resp" data-ok={entrega.ok} role="status">
          <i className={`fa-solid ${entrega.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden style={{ marginRight: 8, color: entrega.ok ? OK : NO }} />
          {entrega.txt}
        </div>
      )}
    </>
  );
}

/** Los selectores de piezas y programas: viven en el panel, junto a la escena. */
function Selectores({
  cfg,
  cliente,
  onElegir,
  onSo,
  onApp,
  onControlador,
}: {
  cfg: Config;
  cliente: Cliente;
  onElegir: (slot: SlotId, id: string) => void;
  onSo: (so: SoId) => void;
  onApp: () => void;
  onControlador: () => void;
}) {
  const gpu = opcionDe(cfg.gpu);
  return (
    <>
      {SLOTS.map((s) => (
        <Bloque key={s.id} titulo={`Hardware · ${s.titulo}`} icono={s.icono}>
          <div className="hs-ops">
            {OPCIONES.filter((o) => o.slot === s.id).map((o) => (
              <button key={o.id} type="button" className="hs-op" data-on={cfg[s.id] === o.id} onClick={() => onElegir(s.id, o.id)} aria-pressed={cfg[s.id] === o.id}>
                <b>{o.nombre}</b>
                <span>{o.spec}</span>
                <em>{o.precio === 0 ? "Incluido" : dinero(o.precio)}</em>
              </button>
            ))}
          </div>
        </Bloque>
      ))}
      <Bloque titulo="Software" icono="fa-code">
        <div className="hs-ops">
          {SISTEMAS.map((s) => (
            <button key={s.id} type="button" className="hs-op" data-on={cfg.so === s.id} onClick={() => onSo(s.id)} aria-pressed={cfg.so === s.id}>
              <b>{s.id === "ninguno" ? "Sin sistema" : s.nombre}</b>
              <span>{s.id === "ninguno" ? "Solo hardware" : "Sistema operativo"}</span>
              <em>{s.precio === 0 ? "Gratis" : dinero(s.precio)}</em>
            </button>
          ))}
        </div>
        <button type="button" className="hs-sw" data-on={cfg.appInstalada} onClick={onApp} disabled={cfg.so === "ninguno"}>
          <i className={`fa-solid ${cfg.appInstalada ? "fa-square-check" : "fa-square"}`} aria-hidden />
          Instalar «{cliente.app}» ({cliente.gb} GB)
        </button>
        <button type="button" className="hs-sw" data-on={cfg.controlador} onClick={onControlador} disabled={cfg.so === "ninguno" || !gpu?.dedicada}>
          <i className={`fa-solid ${cfg.controlador ? "fa-square-check" : "fa-square"}`} aria-hidden />
          Instalar controlador de la tarjeta ({GB_CONTROLADOR} GB)
        </button>
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
          El sistema operativo coordina el hardware; los controladores (drivers) le enseñan a usar cada pieza.
        </div>
      </Bloque>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Hardware o software»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ClasificarPanel({
  accent,
  rgba,
  ubic,
  selItem,
  shakeBin,
  itemsLibres,
  estrellas,
  onSelItem,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  ubic: Record<string, Cat>;
  selItem: string | null;
  shakeBin: Cat | null;
  itemsLibres: typeof ITEMS;
  estrellas: number;
  onSelItem: (id: string) => void;
  onBin: (cat: Cat) => void;
  onDropBin: (itemId: string, cat: Cat) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const cats: Cat[] = ["hw", "sw"];
  const colocadasN = Object.keys(ubic).length;
  return (
    <Mesa>
      {/* bandeja de elementos por clasificar */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada elemento a su caja</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: colocadasN >= ITEMS.length ? OK : T.text3 }}>{colocadasN}/{ITEMS.length}</span>
        </div>
        {itemsLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste las 12 piezas!{estrellas >= 3 ? " Y a la primera: 3★." : ""}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
            {itemsLibres.map((it) => (
              <button key={it.id} className="hs-chip" data-sel={selItem === it.id} onClick={() => onSelItem(it.id)} {...dragProps(it.id)} title={it.pista}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className={`fa-solid ${it.icono}`} />
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>{it.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* las dos cajas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 16 }}>
        {cats.map((cat) => {
          const info = CAT_INFO[cat];
          const dentro = ITEMS.filter((i) => ubic[i.id] === cat);
          return (
            <div
              key={cat}
              className="hs-bin"
              data-sel={selItem !== null}
              data-shake={shakeBin === cat}
              onClick={() => onBin(cat)}
              {...dropProps((itemId) => onDropBin(itemId, cat))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 14, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((it) => (
                  <span key={it.id} style={{ animation: "hsPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, fontSize: 14, fontWeight: 700, color: "#fff", background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    <i className={`fa-solid ${it.icono}`} style={{ fontSize: 14 }} />
                    {it.nombre.replace(/ \(.*\)/, "")}
                  </span>
                ))}
                {dentro.length === 0 && (
                  <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>Vacío — suelta elementos aquí.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Mesa>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «¿Por qué se traba?»
 * ═══════════════════════════════════════════════════════════════════════════ */
function DiagnosticoPanel({
  accent,
  rgba,
  empar,
  selCausa,
  shakeDiag,
  causasLibres,
  onSelCausa,
  onDiag,
  onDropDiag,
  dragProps,
  dropProps,
}: {
  accent: string;
  rgba: string;
  empar: Record<string, string>;
  selCausa: string | null;
  shakeDiag: string | null;
  causasLibres: typeof CAUSAS;
  onSelCausa: (id: string) => void;
  onDiag: (diagId: string) => void;
  onDropDiag: (causaId: string, diagId: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  return (
    <Mesa>
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Causas posibles</Eyebrow>
        {causasLibres.length === 0 ? (
          <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Diagnóstico completo! Emparejaste cada síntoma con su causa.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {causasLibres.map((c) => (
              <button key={c.id} className="hs-chip" data-sel={selCausa === c.id} onClick={() => onSelCausa(c.id)} {...dragProps(c.id)}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${rgba},0.16)` }}>
                  <i className="fa-solid fa-wrench" />
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>{c.texto}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8, color: accent }} />
          Síntomas — arrastra a cada uno su causa
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DIAGNOSTICOS.map((d) => {
            const causaId = empar[d.id];
            const resuelto = !!causaId;
            const causa = causaId ? causaById(causaId) : null;
            return (
              <div
                key={d.id}
                {...dropProps((cid) => onDropDiag(cid, d.id))}
                onClick={() => !resuelto && onDiag(d.id)}
                style={{
                  borderRadius: 14,
                  border: `1.5px ${resuelto ? "solid" : "dashed"} ${resuelto ? OK : selCausa ? accent : T.lineStrong}`,
                  background: resuelto ? `${OK}12` : selCausa ? `rgba(${rgba},0.08)` : T.inset,
                  padding: "13px 16px",
                  cursor: resuelto ? "default" : selCausa ? "pointer" : "default",
                  animation: shakeDiag === d.id ? "hsShake .4s" : undefined,
                  transition: "all .16s",
                }}
              >
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-question"}`} style={{ color: resuelto ? OK : accent, fontSize: 16, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{d.sintoma}</div>
                    {resuelto && causa && (
                      <div style={{ animation: "hsPop .25s ease", marginTop: 8, fontSize: 14, color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 9, background: `${OK}26`, border: `1px solid ${OK}55` }}>
                        <i className="fa-solid fa-arrow-right-long" style={{ opacity: 0.7 }} />
                        {causa.texto}
                      </div>
                    )}
                    {!resuelto && (
                      <div style={{ marginTop: 6, fontSize: 14, color: T.text3, fontStyle: "italic" }}>Suelta aquí la causa probable.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Mesa>
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
        Cinco preguntas sobre hardware, software y los componentes de un dispositivo. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="hs-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="hs-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="hs-btn" onClick={reintentar}>
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
