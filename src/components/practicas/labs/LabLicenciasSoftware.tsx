"use client";

/**
 * Laboratorio — Licencias digitales: ¿libre o privativo?
 * Práctica experimental para CD-I-P02-A2 (Cultura Digital I · licenciamiento).
 *
 * SIMULADOR. La radio escolar «Voz del Valle» (ficticia) necesita programas y un
 * cartel. El alumno elige licencias y luego HACE cosas con ellas (modificar,
 * compartir, vender; recortar, cobrar entradas, dar crédito) y ve la consecuencia:
 * permitido, aviso de infracción o multa que se come el presupuesto (simulación).
 *  1. «Software»   — elige sistema, oficina y editor con presupuesto fijo y prueba
 *                    qué se puede hacer con cada licencia.
 *  2. «Cartel CC»  — elige una foto con licencia Creative Commons y publica el cartel.
 *  + los modos de arrastre de siempre (clasificar, Creative Commons, cuatro
 *    libertades) y «Completa el texto», verbatim de CD-I·P02 y CD-I·P09-A1.
 *
 * DOM + SVG (sin three.js). Montos y multas: valores de simulación.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, Mesa, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { LICENCIAS_SOFTWARE_HUECOS } from "./licencias-software-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LICENCIAS_SOFTWARE_FICHA } from "./licencias-software-ficha";
import {
  PROGRAMAS,
  TIPO_INFO,
  LICENCIAS_CC,
  LIBERTADES,
  QUIZ,
  DATO_LICENCIAS,
  type TipoLic,
} from "./licencias-software-data";
import {
  ACCIONES_SOFT,
  FOTOS_CARTEL,
  MULTA_CARTEL,
  NECESIDADES,
  PRESUPUESTO,
  evaluaCartel,
  gastoDe,
  todasOpciones,
  veredictoSoft,
  type AccionSoft,
  type CCId,
  type NecesidadId,
  type ResultadoCartel,
  type UsoCartel,
  type Veredicto,
} from "./licencias-software-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-licencias-software-reto";
const RUTA_FOTOS = "/media/labs-sim/licencias-software";

type Modo = "soft" | "cartel" | "clasificar" | "creativecommons" | "libertades" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "soft", label: "Software de la radio", icono: "fa-desktop" },
  { id: "cartel", label: "Cartel con CC", icono: "fa-image" },
  { id: "clasificar", label: "¿Libre o privativo?", icono: "fa-scale-balanced" },
  { id: "creativecommons", label: "Creative Commons", icono: "fa-copyright" },
  { id: "libertades", label: "Las cuatro libertades", icono: "fa-dove" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

type DragF = (id: string) => React.ButtonHTMLAttributes<HTMLButtonElement>;
type DropF = (onDrop: (id: string) => void) => React.HTMLAttributes<HTMLDivElement>;

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");
const dinero = (n: number) => `$${n.toLocaleString("es-MX")}`;

interface Prueba {
  progId: string;
  accion: AccionSoft;
  v: Veredicto;
}

export function LabLicenciasSoftware({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("soft");

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

  // ── simulador 1: software de la radio ─────────────────────────────────
  const [elegidas, setElegidas] = useState<Partial<Record<NecesidadId, string>>>({});
  const [instalado, setInstalado] = useState(false);
  const [detenido, setDetenido] = useState(false);
  const [selProg, setSelProg] = useState<string | null>(null);
  const [probadas, setProbadas] = useState<AccionSoft[]>([]);
  const [prueba, setPrueba] = useState<Prueba | null>(null);
  const [marcas, setMarcas] = useState<Record<string, "ok" | "mal">>({});
  const [multasSoft, setMultasSoft] = useState(0);

  const gasto = gastoDe(elegidas);
  const completas = NECESIDADES.every((n) => elegidas[n.id]);
  const softDone = instalado && probadas.length >= ACCIONES_SOFT.length;

  const elegir = (n: NecesidadId, opId: string) => {
    if (instalado) return;
    setDetenido(false);
    setElegidas((e) => ({ ...e, [n]: opId }));
  };
  const instalar = () => {
    if (!completas || instalado) return;
    if (gasto > PRESUPUESTO) {
      setDetenido(true);
      sfxNo();
      return;
    }
    setDetenido(false);
    setInstalado(true);
    setSelProg(elegidas.sistema ?? null);
    sfxPlace();
  };
  const probar = (accion: AccionSoft) => {
    if (!instalado || !selProg) return;
    const op = todasOpciones().find((o) => o.id === selProg);
    if (!op) return;
    const v = veredictoSoft(op.tipo, accion);
    setPrueba({ progId: selProg, accion, v });
    setMarcas((m) => ({ ...m, [selProg]: v.permitido ? (m[selProg] === "mal" ? "mal" : "ok") : "mal" }));
    setProbadas((p) => (p.includes(accion) ? p : [...p, accion]));
    if (v.permitido) sfxPlace();
    else {
      setMultasSoft((x) => x + v.multa);
      sfxNo();
    }
  };
  const resetSoft = () => {
    setElegidas({});
    setInstalado(false);
    setDetenido(false);
    setSelProg(null);
    setProbadas([]);
    setPrueba(null);
    setMarcas({});
    setMultasSoft(0);
  };

  // ── simulador 2: cartel con licencia CC ───────────────────────────────
  const [foto, setFoto] = useState<CCId | null>(null);
  const [uso, setUso] = useState<UsoCartel>({ credito: false, modifica: false, comercial: false });
  const [publicado, setPublicado] = useState<{ res: ResultadoCartel; uso: UsoCartel; foto: CCId } | null>(null);
  const [cartelHecho, setCartelHecho] = useState(false);
  const [multasCartel, setMultasCartel] = useState(0);

  const publicarCartel = () => {
    if (!foto) return;
    const res = evaluaCartel(foto, uso);
    setPublicado({ res, uso, foto });
    if (res.ok) {
      sfxPlace();
      if (uso.modifica || uso.comercial) setCartelHecho(true);
    } else {
      setMultasCartel((x) => x + MULTA_CARTEL * res.infracciones.length);
      sfxNo();
    }
  };
  const tocaUso = (k: keyof UsoCartel) => {
    setPublicado(null);
    setUso((u) => ({ ...u, [k]: !u[k] }));
  };
  const resetCartel = () => {
    setFoto(null);
    setUso({ credito: false, modifica: false, comercial: false });
    setPublicado(null);
    setCartelHecho(false);
    setMultasCartel(0);
  };
  const resetProyecto = () => {
    resetSoft();
    resetCartel();
  };

  const multas = multasSoft + multasCartel;

  // ── modo Clasificar (programa → privativo/libre) ──────────────────────
  const [ubicProg, setUbicProg] = useState<Record<string, TipoLic>>({});
  const [selClas, setSelClas] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoLic | null>(null);
  const progLibres = PROGRAMAS.filter((p) => !ubicProg[p.id]).slice().sort(porTexto);

  const intentarProg = (progId: string, tipo: TipoLic) => {
    const p = PROGRAMAS.find((x) => x.id === progId);
    if (!p || ubicProg[progId]) return;
    if (p.tipo === tipo) {
      setUbicProg((u) => ({ ...u, [progId]: tipo }));
      setSelClas(null);
      sfxPlace();
      if (Object.keys(ubicProg).length + 1 >= PROGRAMAS.length) sfxOk();
    } else {
      setShakeTipo(tipo);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetProg = () => {
    setUbicProg({});
    setSelClas(null);
  };

  // ── modo Creative Commons (licencia → permiso) ────────────────────────
  const [empCC, setEmpCC] = useState<Record<string, boolean>>({});
  const [selCC, setSelCC] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<string | null>(null);
  const ccLibres = LICENCIAS_CC.filter((l) => !empCC[l.id]).slice().sort((a, b) => a.sigla.localeCompare(b.sigla, "es"));

  const intentarCC = (ccId: string, rowId: string) => {
    if (empCC[rowId]) return;
    if (ccId === rowId) {
      setEmpCC((e) => ({ ...e, [rowId]: true }));
      setSelCC(null);
      sfxPlace();
      if (Object.keys(empCC).length + 1 >= LICENCIAS_CC.length) sfxOk();
    } else {
      setShakeRow(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRow(null), 420);
    }
  };
  const resetCC = () => {
    setEmpCC({});
    setSelCC(null);
  };

  // ── modo Libertades (ordenar 0→3) ─────────────────────────────────────
  const [ordenLib, setOrdenLib] = useState<number[]>([]);
  const [selLib, setSelLib] = useState<number | null>(null);
  const [shakeLib, setShakeLib] = useState(false);
  const libLibres = LIBERTADES.filter((l) => !ordenLib.includes(l.numero))
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarLib = (numero: number) => {
    if (ordenLib.includes(numero)) return;
    if (numero === ordenLib.length) {
      const nuevo = [...ordenLib, numero];
      setOrdenLib(nuevo);
      setSelLib(null);
      sfxPlace();
      if (nuevo.length >= LIBERTADES.length) sfxOk();
    } else {
      setShakeLib(true);
      sfxNo();
      window.setTimeout(() => setShakeLib(false), 420);
    }
  };
  const resetLib = () => {
    setOrdenLib([]);
    setSelLib(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicProg).length >= PROGRAMAS.length;
  const ccDone = Object.keys(empCC).length >= LICENCIAS_CC.length;
  const libertadesDone = ordenLib.length >= LIBERTADES.length;
  const simDone = softDone && cartelHecho;
  const modosHechos = (simDone ? 1 : 0) + (clasificarDone ? 1 : 0) + (ccDone ? 1 : 0) + (libertadesDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar todos los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 5);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Instala el software de la radio sin pasar del presupuesto y prueba modificar, compartir y vender", done: softDone },
    { txt: "Publica el cartel modificándolo o cobrando entradas sin violar su licencia", done: cartelHecho },
    { txt: "Clasifica los 6 programas (libre / privativo)", done: clasificarDone },
    { txt: "Empareja las 4 licencias Creative Commons", done: ccDone },
    { txt: "Ordena las 4 libertades del software libre", done: libertadesDone },
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
    modo === "texto" ? resetTexto : modo === "clasificar" ? resetProg : modo === "creativecommons" ? resetCC : modo === "libertades" ? resetLib : resetProyecto;

  const lectura =
    modo === "soft"
      ? `Gasto ${dinero(gasto)} de ${dinero(PRESUPUESTO)} · multas ${dinero(multasSoft)}`
      : modo === "cartel"
        ? `Multas del cartel: ${dinero(multasCartel)}`
        : `${modosHechos}/5 · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "soft" && (
        <SimSoftware
          accent={accent}
          elegidas={elegidas}
          onElegir={elegir}
          gasto={gasto}
          multas={multasSoft}
          completas={completas}
          instalado={instalado}
          detenido={detenido}
          onInstalar={instalar}
          selProg={selProg}
          onSelProg={setSelProg}
          onProbar={probar}
          probadas={probadas}
          prueba={prueba}
          marcas={marcas}
        />
      )}

      {modo === "cartel" && (
        <SimCartel
          accent={accent}
          foto={foto}
          onFoto={(f) => {
            setFoto(f);
            setPublicado(null);
          }}
          uso={uso}
          onUso={tocaUso}
          publicado={publicado}
          onPublicar={publicarCartel}
          hecho={cartelHecho}
        />
      )}

      {modo === "clasificar" && (
        <PanelClasificar progLibres={progLibres} ubicProg={ubicProg} selClas={selClas} setSelClas={setSelClas} intentarProg={intentarProg} shakeTipo={shakeTipo} dragProps={dragProps} dropProps={dropProps} />
      )}

      {modo === "creativecommons" && (
        <PanelCC ccLibres={ccLibres} empCC={empCC} selCC={selCC} setSelCC={setSelCC} intentarCC={intentarCC} shakeRow={shakeRow} dragProps={dragProps} dropProps={dropProps} />
      )}

      {modo === "libertades" && (
        <PanelLibertades libLibres={libLibres} ordenLib={ordenLib} selLib={selLib} setSelLib={setSelLib} intentarLib={intentarLib} shakeLib={shakeLib} dragProps={dragProps} dropProps={dropProps} accent={accent} rgba={color.rgba} />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={LICENCIAS_SOFTWARE_HUECOS}
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
    soft: "Mira el medidor del presupuesto antes de instalar. Después prueba las tres acciones en un programa privativo y en uno libre: compara los avisos.",
    cartel: "Una licencia CC se lee por sus letras: BY crédito, SA compartir igual, NC no comercial, ND sin cambios. Mueve las casillas y publica.",
    clasificar: "El software privativo tiene código secreto; el libre se puede estudiar y modificar.",
    creativecommons: "A más siglas (NC, ND), más restricciones: la más restrictiva es CC BY-NC-ND.",
    libertades: "Van de menor a mayor compromiso con la comunidad: usar (0), estudiar (1), distribuir (2), mejorar (3).",
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
                  {bestEstrellas >= 3 ? "¡Dominas las licencias digitales!" : "Termina todos los modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Fondo de la radio (simulación)" icono="fa-piggy-bank">
                <div style={{ fontSize: 14, color: T.text2 }}>
                  Presupuesto {dinero(PRESUPUESTO)} · software {dinero(gasto)} · multas {dinero(multas)}
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
                <FichaTeorica data={LICENCIAS_SOFTWARE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Libre o privativo" icono="fa-scale-balanced">
                {(["privativo", "libre"] as TipoLic[]).map((t) => (
                  <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{TIPO_INFO[t].label}.</strong> {TIPO_INFO[t].descripcion}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Licencias Creative Commons" icono="fa-copyright">
                {LICENCIAS_CC.map((l) => (
                  <div key={l.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{l.sigla}.</strong> {l.permiso}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Las cuatro libertades" icono="fa-dove">
                {LIBERTADES.map((l) => (
                  <div key={l.numero} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    <strong style={{ color: T.text }}>{l.numero}.</strong> {l.texto}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_LICENCIAS}</div>
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
  @keyframes licShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes licStamp { 0%{transform:scale(1.8) rotate(-8deg);opacity:0;} 100%{transform:scale(1) rotate(-3deg);opacity:1;} }
  .lic-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:12px; }
  .lic-panel { border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:10px; min-width:0; }
  .lic-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; transition:all .14s; user-select:none; }
  .lic-chip:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .lic-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .lic-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:14px; min-height:150px; display:flex; flex-direction:column; gap:10px; transition:all .16s; min-width:0; }
  .lic-bin[data-shake="true"], .lic-row[data-shake="true"], .lic-slot[data-shake="true"] { animation:licShake .4s; border-color:${NO}; }
  .lic-pill { font-size:14px; font-weight:800; color:#fff; padding:7px 13px; border-radius:999px; border:1px solid ${T.line}; }
  .lic-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; transition:all .16s; }
  .lic-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .lic-drop { flex-shrink:0; min-width:110px; min-height:44px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; padding:4px 10px; }
  .lic-drop[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .lic-tag-no { margin-left:8px; font-size:14px; font-weight:800; color:${NO}; border:1px solid ${NO}55; border-radius:6px; padding:1px 6px; }
  .lic-slot { display:flex; align-items:center; gap:12px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:#fff; padding:12px 14px; transition:all .16s; }
  .lic-slot[data-active="true"] { border-color:${accent}; background:rgba(${rgba},0.08); cursor:pointer; }
  .lic-slot[data-sel="true"] { background:rgba(${rgba},0.22); }
  .lic-num { flex-shrink:0; width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; background:${T.inset}; }
  .lic-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .lic-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .lic-q:disabled{ cursor:default; }
  .lic-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .lic-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .lic-btn:disabled { opacity:.45; cursor:not-allowed; }
  .lic-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .lic-foto { position:relative; aspect-ratio:16/9; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(91,200,255,0.22), rgba(167,139,250,0.22)); color:rgba(255,255,255,0.4); font-size:30px; }
  .lic-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .lic-opt { position:relative; display:flex; flex-direction:column; gap:6px; text-align:left; padding:12px 14px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glass}; color:${T.text}; font-size:14px; cursor:pointer; transition:all .14s; min-width:0; }
  .lic-opt:hover:not(:disabled) { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .lic-opt[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .lic-opt:disabled { cursor:default; opacity:.7; }
  .lic-barra { height:16px; border-radius:9px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; display:flex; }
  .lic-barra > i { display:block; height:100%; transition:width .6s cubic-bezier(.2,.8,.2,1), background .4s; }
  .lic-monitor { position:relative; display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 10px; border-radius:14px; border:2px solid ${T.line};
    background:linear-gradient(180deg, rgba(10,30,50,0.9), rgba(4,14,26,0.9)); color:#fff; cursor:pointer; text-align:center; transition:all .16s; min-width:0; }
  .lic-monitor[data-sel="true"] { border-color:${accent}; box-shadow:0 0 18px -6px ${accent}; }
  .lic-monitor[data-marca="mal"] { border-color:${NO}; background:linear-gradient(180deg, rgba(60,14,18,0.9), rgba(26,6,8,0.9)); }
  .lic-monitor[data-marca="ok"] { border-color:${OK}; }
  .lic-sello { display:inline-block; padding:6px 14px; border:3px solid currentColor; border-radius:8px; font-size:16px; font-weight:900; letter-spacing:.08em;
    text-transform:uppercase; transform:rotate(-3deg); animation:licStamp .35s ease; }
  .lic-aviso { border-radius:16px; padding:14px 16px; display:grid; gap:8px; border:1.5px solid; }
  .lic-chk { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text};
    font-size:14px; font-weight:700; cursor:pointer; text-align:left; }
  .lic-chk[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); }
  .lic-chk i.lic-caja { width:22px; height:22px; border-radius:6px; border:2px solid ${T.lineStrong}; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }
  .lic-chk[data-on="true"] i.lic-caja { background:${accent}; border-color:${accent}; color:#04121f; }
  @media (prefers-reduced-motion: reduce){
    .lic-bin[data-shake="true"], .lic-row[data-shake="true"], .lic-slot[data-shake="true"], .lic-sello { animation:none; }
    .lic-chip, .lic-chip:hover, .lic-opt, .lic-opt:hover:not(:disabled) { transform:none; transition:none; }
    .lic-barra > i { transition:none; }
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
    <div className="lic-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} />}
    </div>
  );
}

function SimSoftware({
  accent,
  elegidas,
  onElegir,
  gasto,
  multas,
  completas,
  instalado,
  detenido,
  onInstalar,
  selProg,
  onSelProg,
  onProbar,
  probadas,
  prueba,
  marcas,
}: {
  accent: string;
  elegidas: Partial<Record<NecesidadId, string>>;
  onElegir: (n: NecesidadId, id: string) => void;
  gasto: number;
  multas: number;
  completas: boolean;
  instalado: boolean;
  detenido: boolean;
  onInstalar: () => void;
  selProg: string | null;
  onSelProg: (id: string) => void;
  onProbar: (a: AccionSoft) => void;
  probadas: AccionSoft[];
  prueba: Prueba | null;
  marcas: Record<string, "ok" | "mal">;
}) {
  const total = gasto + multas;
  const pct = Math.min(100, (total / PRESUPUESTO) * 100);
  const col = total > PRESUPUESTO ? NO : total > PRESUPUESTO * 0.75 ? AMBAR : OK;
  const opciones = todasOpciones();
  const instaladas = Object.values(elegidas).map((id) => opciones.find((o) => o.id === id)!).filter(Boolean);
  return (
    <>
      <div className="lic-panel">
        <Foto clave="cabina-radio" icono="fa-radio" />
        <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
          La radio escolar «Voz del Valle» (ficticia) estrena cabina con 5 computadoras. Elige qué programa instalar en cada necesidad: el presupuesto es de{" "}
          <strong style={{ color: T.text }}>{dinero(PRESUPUESTO)}</strong> (simulación).
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
            <span>Presupuesto usado</span>
            <span style={{ color: col }}>{dinero(total)} / {dinero(PRESUPUESTO)}</span>
          </div>
          <div className="lic-barra" role="img" aria-label={`Gastado ${dinero(total)} de ${dinero(PRESUPUESTO)}`}>
            <i style={{ width: `${pct}%`, background: col }} />
          </div>
        </div>
      </div>

      {NECESIDADES.map((n) => (
        <div key={n.id} className="lic-panel">
          <Etiqueta>
            <i className={`fa-solid ${n.icono}`} aria-hidden style={{ color: accent, marginRight: 8 }} />
            {n.titulo}
          </Etiqueta>
          <div className="lic-grid">
            {n.opciones.map((o) => (
              <button key={o.id} className="lic-opt" data-sel={elegidas[n.id] === o.id} disabled={instalado} onClick={() => onElegir(n.id, o.id)}>
                <strong style={{ fontSize: 16 }}>{o.nombre}</strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: TIPO_INFO[o.tipo].color, fontWeight: 800 }}>
                  <i className={`fa-solid ${TIPO_INFO[o.tipo].icono}`} aria-hidden /> {o.tipo === "libre" ? "Libre" : "Privativo"}
                </span>
                <span style={{ color: T.text2 }}>{o.costo === 0 ? "Sin costo de licencia" : `Licencia: ${dinero(o.costo)}`}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {!instalado && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="lic-btn lic-btn-main" disabled={!completas} onClick={onInstalar}>
            <i className="fa-solid fa-download" aria-hidden /> Instalar en las 5 computadoras
          </button>
          {!completas && <span style={{ fontSize: 14, color: T.text3 }}>Elige un programa en cada necesidad.</span>}
        </div>
      )}
      {detenido && (
        <div className="lic-aviso" role="alert" style={{ borderColor: NO, background: `${NO}14` }}>
          <span className="lic-sello" style={{ color: NO, justifySelf: "start" }}>Proyecto detenido</span>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Elegiste {dinero(gasto)} en licencias y la radio solo tiene {dinero(PRESUPUESTO)}: las cabinas se quedan sin programas. Cambia alguna licencia privativa por
            una libre y vuelve a instalar.
          </div>
        </div>
      )}

      {instalado && (
        <div className="lic-panel">
          <Etiqueta>
            <i className="fa-solid fa-flask" aria-hidden style={{ color: accent, marginRight: 8 }} />
            Prueba qué se puede hacer · {probadas.length}/{ACCIONES_SOFT.length}
          </Etiqueta>
          <div style={{ fontSize: 14, color: T.text2 }}>Toca un programa instalado y luego una acción.</div>
          <div className="lic-grid">
            {instaladas.map((o) => (
              <button key={o.id} className="lic-monitor" data-sel={selProg === o.id} data-marca={marcas[o.id]} onClick={() => onSelProg(o.id)}>
                <i className="fa-solid fa-display" aria-hidden style={{ fontSize: 28, color: TIPO_INFO[o.tipo].color }} />
                <strong style={{ fontSize: 15 }}>{o.nombre}</strong>
                <span style={{ fontSize: 14, color: marcas[o.id] === "mal" ? NO : marcas[o.id] === "ok" ? OK : T.text3 }}>
                  {marcas[o.id] === "mal" ? "Con aviso" : marcas[o.id] === "ok" ? "Sin problemas" : o.tipo === "libre" ? "Libre" : "Privativo"}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ACCIONES_SOFT.map((a) => (
              <button key={a.id} className="lic-btn" disabled={!selProg} onClick={() => onProbar(a.id)}>
                <i className={`fa-solid ${a.icono}`} aria-hidden /> {a.etiqueta}
              </button>
            ))}
          </div>
          {prueba && (
            <div className="lic-aviso" role="status" style={{ borderColor: prueba.v.permitido ? OK : NO, background: prueba.v.permitido ? `${OK}12` : `${NO}12` }}>
              <span className="lic-sello" style={{ color: prueba.v.permitido ? OK : NO, justifySelf: "start" }} key={`${prueba.progId}-${prueba.accion}-${multas}`}>
                {prueba.v.titulo}
              </span>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                <strong style={{ color: T.text }}>
                  {opciones.find((o) => o.id === prueba.progId)?.nombre} · {ACCIONES_SOFT.find((a) => a.id === prueba.accion)?.etiqueta}.
                </strong>{" "}
                {prueba.v.porque}
                {!prueba.v.permitido && <> Multa simulada: <strong style={{ color: NO }}>{dinero(prueba.v.multa)}</strong>.</>}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CartelSVG({ foto, uso, retirado }: { foto: CCId | null; uso: UsoCartel; retirado: boolean }) {
  const f = FOTOS_CARTEL.find((x) => x.id === foto);
  return (
    <svg viewBox="0 0 200 250" role="img" aria-label="Vista previa del cartel" style={{ width: "100%", maxWidth: 240, height: "auto", borderRadius: 12, border: `1px solid ${T.line}`, background: "#0b1a2c" }}>
      <defs>
        <linearGradient id="licCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a6e" />
          <stop offset="1" stopColor="#e0785a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="250" fill="url(#licCielo)" />
      <circle cx="140" cy="90" r="28" fill="#ffd58a" opacity="0.9" />
      <path d="M0 170 L50 120 L95 160 L140 110 L200 165 L200 250 L0 250 Z" fill="#14233b" />
      {!f && <text x="100" y="135" textAnchor="middle" fontSize="14" fill="#fff" opacity="0.8">Elige una foto</text>}
      {uso.modifica && (
        <g>
          <rect x="14" y="20" width="172" height="40" rx="6" fill="#04121f" opacity="0.7" />
          <text x="100" y="47" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff">FESTIVAL VOZ</text>
        </g>
      )}
      {uso.comercial && (
        <g>
          <rect x="132" y="186" width="56" height="30" rx="6" fill="#ffc75a" />
          <text x="160" y="207" textAnchor="middle" fontSize="16" fontWeight="900" fill="#04121f">$50</text>
        </g>
      )}
      {uso.credito && f && (
        <text x="10" y="242" fontSize="14" fill="#fff">Foto: {f.autor.split(" (")[0]}</text>
      )}
      {retirado && (
        <g transform="rotate(-18 100 125)">
          <rect x="18" y="100" width="164" height="50" rx="8" fill="none" stroke={NO} strokeWidth="5" />
          <text x="100" y="136" textAnchor="middle" fontSize="26" fontWeight="900" fill={NO}>RETIRADO</text>
        </g>
      )}
    </svg>
  );
}

function SimCartel({
  accent,
  foto,
  onFoto,
  uso,
  onUso,
  publicado,
  onPublicar,
  hecho,
}: {
  accent: string;
  foto: CCId | null;
  onFoto: (f: CCId) => void;
  uso: UsoCartel;
  onUso: (k: keyof UsoCartel) => void;
  publicado: { res: ResultadoCartel; uso: UsoCartel; foto: CCId } | null;
  onPublicar: () => void;
  hecho: boolean;
}) {
  const f = FOTOS_CARTEL.find((x) => x.id === foto);
  const retirado = !!publicado && !publicado.res.ok;
  const casillas: { k: keyof UsoCartel; etiqueta: string; icono: string }[] = [
    { k: "credito", etiqueta: "Poner el crédito de la autora o autor", icono: "fa-signature" },
    { k: "modifica", etiqueta: "Recortar la foto y ponerle el título", icono: "fa-crop-simple" },
    { k: "comercial", etiqueta: "Cobrar entradas ($50) con este cartel", icono: "fa-ticket" },
  ];
  return (
    <>
      <div className="lic-panel">
        <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>
          El festival de la radio necesita un cartel. Bajaste cuatro fotos de un banco de imágenes (autores ficticios), cada una con su licencia. Elige una, marca lo que
          harás con ella y publica.
        </div>
        <div className="lic-grid">
          {FOTOS_CARTEL.map((x) => (
            <button key={x.id} className="lic-opt" data-sel={foto === x.id} onClick={() => onFoto(x.id)}>
              <Foto clave={x.clave} icono="fa-image" />
              <strong style={{ fontSize: 15 }}>{x.titulo}</strong>
              <span style={{ color: accent, fontWeight: 900 }}>
                <i className="fa-solid fa-copyright" aria-hidden /> {x.sigla}
              </span>
              <span style={{ color: T.text3 }}>{x.autor}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lic-panel">
        <Etiqueta>Tu cartel</Etiqueta>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "0 1 240px", minWidth: 0, width: "100%", maxWidth: 240 }}>
            <CartelSVG foto={foto} uso={uso} retirado={retirado} />
          </div>
          <div style={{ flex: "1 1 220px", minWidth: 0, display: "grid", gap: 10 }}>
            {casillas.map((c) => (
              <button key={c.k} className="lic-chk" data-on={uso[c.k]} onClick={() => onUso(c.k)} aria-pressed={uso[c.k]}>
                <i className="fa-solid fa-check lic-caja" aria-hidden style={{ color: uso[c.k] ? undefined : "transparent" }} />
                <i className={`fa-solid ${c.icono}`} aria-hidden style={{ color: accent }} />
                <span>{c.etiqueta}</span>
              </button>
            ))}
            <button className="lic-btn lic-btn-main" disabled={!foto} onClick={onPublicar}>
              <i className="fa-solid fa-paper-plane" aria-hidden /> Publicar el cartel
            </button>
            {!foto && <span style={{ fontSize: 14, color: T.text3 }}>Primero elige una foto.</span>}
          </div>
        </div>
      </div>

      {publicado && f && (
        <div className="lic-aviso" role="status" style={{ borderColor: publicado.res.ok ? OK : NO, background: publicado.res.ok ? `${OK}12` : `${NO}12` }}>
          <span className="lic-sello" style={{ color: publicado.res.ok ? OK : NO, justifySelf: "start" }}>
            {publicado.res.ok ? "Cartel publicado" : "Aviso de retiro"}
          </span>
          {publicado.res.infracciones.map((t) => (
            <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-triangle-exclamation" aria-hidden style={{ color: NO, marginRight: 8 }} />
              {t}
            </div>
          ))}
          {publicado.res.condiciones.map((t) => (
            <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" aria-hidden style={{ color: AMBAR, marginRight: 8 }} />
              {t}
            </div>
          ))}
          {publicado.res.ok && publicado.res.infracciones.length === 0 && !hecho && (
            <div style={{ fontSize: 14, color: T.text2 }}>
              Está en regla con {f.sigla}, pero no hiciste nada con la foto: prueba recortarla o cobrar entradas y mira qué licencia lo permite.
            </div>
          )}
          {publicado.res.ok && hecho && (
            <div style={{ fontSize: 14, color: T.text2 }}>Con {f.sigla} tu uso está permitido: diste crédito y respetaste sus condiciones.</div>
          )}
          {!publicado.res.ok && (
            <div style={{ fontSize: 14, color: T.text2 }}>
              Multa simulada: <strong style={{ color: NO }}>{dinero(MULTA_CARTEL * publicado.res.infracciones.length)}</strong>. Cambia la foto o tus casillas e inténtalo de nuevo.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PanelClasificar({
  progLibres,
  ubicProg,
  selClas,
  setSelClas,
  intentarProg,
  shakeTipo,
  dragProps,
  dropProps,
}: {
  progLibres: typeof PROGRAMAS;
  ubicProg: Record<string, TipoLic>;
  selClas: string | null;
  setSelClas: (f: (s: string | null) => string | null) => void;
  intentarProg: (id: string, t: TipoLic) => void;
  shakeTipo: TipoLic | null;
  dragProps: DragF;
  dropProps: DropF;
}) {
  return (
    <Mesa>
      <div className="lic-panel">
        <Etiqueta>Programas · {Object.keys(ubicProg).length}/{PROGRAMAS.length}</Etiqueta>
        {progLibres.length === 0 ? (
          <Listo>¡Clasificaste los 6 programas!</Listo>
        ) : (
          progLibres.map((p) => (
            <button key={p.id} className="lic-chip" data-sel={selClas === p.id} onClick={() => setSelClas((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
              <i className="fa-solid fa-cube" aria-hidden />
              {p.texto}
            </button>
          ))
        )}
      </div>
      <div className="lic-grid">
        {(["privativo", "libre"] as TipoLic[]).map((tipo) => {
          const info = TIPO_INFO[tipo];
          const dentro = PROGRAMAS.filter((p) => ubicProg[p.id] === tipo);
          return (
            <div
              key={tipo}
              className="lic-bin"
              data-shake={shakeTipo === tipo}
              onClick={() => selClas && intentarProg(selClas, tipo)}
              {...dropProps((id) => intentarProg(id, tipo))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className={`fa-solid ${info.icono}`} aria-hidden style={{ color: info.color, fontSize: 18 }} />
                <strong style={{ fontSize: 16 }}>{info.label}</strong>
              </div>
              <div style={{ fontSize: 14, color: T.text2 }}>{info.descripcion}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {dentro.map((d) => (
                  <span key={d.id} className="lic-pill" style={{ background: `${info.color}26`, borderColor: `${info.color}55` }}>
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

function PanelCC({
  ccLibres,
  empCC,
  selCC,
  setSelCC,
  intentarCC,
  shakeRow,
  dragProps,
  dropProps,
}: {
  ccLibres: typeof LICENCIAS_CC;
  empCC: Record<string, boolean>;
  selCC: string | null;
  setSelCC: (f: (s: string | null) => string | null) => void;
  intentarCC: (a: string, b: string) => void;
  shakeRow: string | null;
  dragProps: DragF;
  dropProps: DropF;
}) {
  return (
    <Mesa>
      <div className="lic-panel">
        <Etiqueta>Licencias · {Object.keys(empCC).length}/{LICENCIAS_CC.length}</Etiqueta>
        {ccLibres.length === 0 ? (
          <Listo>¡Emparejaste las 4 licencias!</Listo>
        ) : (
          ccLibres.map((l) => (
            <button key={l.id} className="lic-chip" data-sel={selCC === l.id} onClick={() => setSelCC((s) => (s === l.id ? null : l.id))} {...dragProps(l.id)}>
              <i className="fa-solid fa-copyright" aria-hidden />
              {l.sigla}
            </button>
          ))
        )}
      </div>
      <div style={{ display: "grid", gap: 11 }}>
        {LICENCIAS_CC.map((l) => {
          const done = empCC[l.id];
          return (
            <div
              key={l.id}
              className="lic-row"
              data-shake={shakeRow === l.id}
              data-done={done}
              onClick={() => !done && selCC && intentarCC(selCC, l.id)}
              {...dropProps((id) => intentarCC(id, l.id))}
            >
              <div className="lic-drop" data-armed={!done && !!selCC}>
                {done ? <strong>{l.sigla}</strong> : <span>licencia</span>}
              </div>
              <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>
                {l.permiso}
                {l.restrictiva && <span className="lic-tag-no">MÁS RESTRICTIVA</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Mesa>
  
  );
}

function PanelLibertades({
  libLibres,
  ordenLib,
  selLib,
  setSelLib,
  intentarLib,
  shakeLib,
  dragProps,
  dropProps,
  accent,
  rgba,
}: {
  libLibres: typeof LIBERTADES;
  ordenLib: number[];
  selLib: number | null;
  setSelLib: (f: (s: number | null) => number | null) => void;
  intentarLib: (n: number) => void;
  shakeLib: boolean;
  dragProps: DragF;
  dropProps: DropF;
  accent: string;
  rgba: string;
}) {
  return (
    <Mesa>
      <div className="lic-panel">
        <Etiqueta>Libertades · {ordenLib.length}/{LIBERTADES.length}</Etiqueta>
        {libLibres.length === 0 ? (
          <Listo>¡Ordenaste las cuatro libertades!</Listo>
        ) : (
          libLibres.map((l) => (
            <button
              key={l.numero}
              className="lic-slot"
              data-active={true}
              data-sel={selLib === l.numero}
              style={{ textAlign: "left", cursor: "grab" }}
              onClick={() => setSelLib((s) => (s === l.numero ? null : l.numero))}
              {...dragProps(String(l.numero))}
            >
              <i className="fa-solid fa-grip-vertical" aria-hidden style={{ color: T.text3 }} />
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>{l.texto}</span>
            </button>
          ))
        )}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 14, color: T.text2 }}>Colócalas en orden, empezando por la libertad 0.</div>
        {LIBERTADES.map((_, i) => {
          const numColocado = ordenLib[i];
          const lib = numColocado !== undefined ? LIBERTADES.find((l) => l.numero === numColocado) : null;
          const esActivo = i === ordenLib.length;
          if (lib) {
            return (
              <div key={i} className="lic-slot" style={{ borderColor: accent, background: `rgba(${rgba},0.12)` }}>
                <span className="lic-num" style={{ background: `${accent}33` }}>{lib.numero}</span>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{lib.texto}</span>
              </div>
            );
          }
          return (
            <div
              key={i}
              className="lic-slot"
              data-active={esActivo}
              data-shake={esActivo && shakeLib}
              onClick={() => esActivo && selLib !== null && intentarLib(selLib)}
              {...(esActivo ? dropProps((id) => intentarLib(Number(id))) : {})}
            >
              <span className="lic-num" style={{ border: `1px dashed ${T.lineStrong}`, color: T.text3 }}>{i}</span>
              <span style={{ fontSize: 14, color: T.text3, fontStyle: "italic" }}>{esActivo ? "Suelta aquí la siguiente libertad…" : "—"}</span>
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

  const elegirResp = (qi: number, oi: number) => {
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
        Cinco preguntas sobre software libre/privativo y licencias Creative Commons.
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
                  <button key={oi} className="lic-q" onClick={() => elegirResp(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="lic-btn lic-btn-main" onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" /> Comprobar
          </button>
        ) : (
          <button className="lic-btn" onClick={reintentar}>
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
