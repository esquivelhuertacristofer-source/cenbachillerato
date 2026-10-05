"use client";

/**
 * Laboratorio — Carreras y profesiones en el campo digital: panorama con
 * perspectiva de género.
 * Práctica experimental para CD-III-P03-A4 (Cultura Digital III).
 *
 * EXPERIMENTO CENTRAL: «Ruta de Ximena». Ximena es una estudiante ficticia que
 * cursa del 3.º al 6.º semestre. En cada semestre el alumno elige una actividad
 * (curso, proyecto, comunidad o práctica); un radar SVG de seis habilidades
 * crece con cada elección y los ocho perfiles de la infografía A1 se iluminan
 * cuando se alcanzan TODAS las habilidades que piden, o muestran cuál falta.
 * Se descubre que el campo digital es amplio y que programar no es la única
 * puerta (los niveles son de simulación). Modelo puro en carreras-digitales-sim.ts.
 *
 * Modos extra (se conservan): clasificar perfiles por área, empareja perfil y
 * función, «Escribe el término» (glosario A5) y «Completa el texto».
 *
 * DOM puro (sin three.js). Contenido VERBATIM de CD-III·P03 en la pestaña Teoría.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, Mesa, Dato, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { CARRERAS_DIGITALES_HUECOS } from "./carreras-digitales-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { CARRERAS_DIGITALES_FICHA } from "./carreras-digitales-ficha";
import {
  PERFILES,
  AREA_INFO,
  FUNCIONES,
  PARES,
  QUIZ,
  DATO_CARRERAS,
  type Area,
} from "./carreras-digitales-data";
import {
  HABS,
  INICIO,
  NIVEL_MAX,
  META_PERFILES,
  ROLES,
  SEMESTRES,
  actividadDe,
  estadoRol,
  habilidades,
  nombreHab,
  rolesAbiertos,
  semestresHechos,
  type Hab,
  type Rol,
  type Ruta,
} from "./carreras-digitales-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-carreras-digitales-reto";
const RUTA_FOTOS = "/media/labs-sim/carreras-digitales";

type Modo = "ruta" | "area" | "funciones" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ruta", label: "Ruta de Ximena", icono: "fa-route" },
  { id: "area", label: "¿A qué área pertenece?", icono: "fa-shapes" },
  { id: "funciones", label: "¿Qué hace cada perfil?", icono: "fa-briefcase" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabCarrerasDigitales({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ruta");

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
  // y todos los fallos de los modos de refuerzo, así que la partida se lleva aquí.
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
  // El simulador explora: sus elecciones suenan pero no gastan errores de la partida.
  const sfxSuave = () => (sonido ? audioRef.current?.blip() : undefined);

  // ── simulador «Ruta de Ximena» ─────────────────────────────────────────
  const [ruta, setRuta] = useState<Ruta>({});
  const [rolSel, setRolSel] = useState<string | null>(null);
  const [rutaCompletaAlguna, setRutaCompletaAlguna] = useState(false);
  const [metaAlguna, setMetaAlguna] = useState(false);
  const hab = habilidades(ruta);
  const abiertos = rolesAbiertos(hab);

  const elegirActividad = (semestreId: string, actividadId: string) => {
    const nueva: Ruta = { ...ruta, [semestreId]: actividadId };
    setRuta(nueva);
    sfxSuave();
    if (semestresHechos(nueva) >= SEMESTRES.length) setRutaCompletaAlguna(true);
    if (rolesAbiertos(habilidades(nueva)).length >= META_PERFILES) {
      setMetaAlguna(true);
      if (sonido) audioRef.current?.correcto();
    }
  };
  const otraRuta = () => {
    setRuta({});
    setRolSel(null);
  };
  const resetSim = () => {
    setRuta({});
    setRolSel(null);
    setRutaCompletaAlguna(false);
    setMetaAlguna(false);
  };

  // ── modo área (clasifica por área digital) ─────────────────────────────
  const [ubicArea, setUbicArea] = useState<Record<string, Area>>({});
  const [selArea, setSelArea] = useState<string | null>(null);
  const [shakeArea, setShakeArea] = useState<Area | null>(null);
  const areaLibres = PERFILES.filter((p) => !ubicArea[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarArea = (perfilId: string, bin: Area) => {
    if (ubicArea[perfilId]) return;
    const p = PERFILES.find((x) => x.id === perfilId);
    if (p && p.area === bin) {
      setUbicArea((e) => ({ ...e, [perfilId]: bin }));
      setSelArea(null);
      sfxPlace();
      if (Object.keys(ubicArea).length + 1 >= PERFILES.length) {
        sfxOk();
        persistMejor(true, funcionesDone, glosarioDone);
      }
    } else {
      setShakeArea(bin);
      sfxNo();
      window.setTimeout(() => setShakeArea(null), 420);
    }
  };
  const resetArea = () => {
    setUbicArea({});
    setSelArea(null);
  };

  // ── modo funciones (empareja perfil → función) ─────────────────────────
  const [empFun, setEmpFun] = useState<Record<string, boolean>>({});
  const [selFun, setSelFun] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<string | null>(null);
  const funLibres = FUNCIONES.filter((f) => !empFun[f.id]).slice().sort((a, b) => a.perfil.localeCompare(b.perfil, "es"));

  const intentarFun = (chipId: string, rowId: string) => {
    if (empFun[rowId]) return;
    if (chipId === rowId) {
      setEmpFun((e) => ({ ...e, [rowId]: true }));
      setSelFun(null);
      sfxPlace();
      if (Object.keys(empFun).length + 1 >= FUNCIONES.length) {
        sfxOk();
        persistMejor(areaDone, true, glosarioDone);
      }
    } else {
      setShakeFun(rowId);
      sfxNo();
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetFunciones = () => {
    setEmpFun({});
    setSelFun(null);
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
  const areaDone = Object.keys(ubicArea).length >= PERFILES.length;
  const funcionesDone = Object.keys(empFun).length >= FUNCIONES.length;
  const modosHechos = (areaDone ? 1 : 0) + (funcionesDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Arma la ruta de Ximena: elige una actividad en cada semestre", done: rutaCompletaAlguna },
    { txt: `Ilumina al menos ${META_PERFILES} perfiles digitales con tu ruta`, done: metaAlguna },
    { txt: "Clasifica los 8 perfiles por su área digital", done: areaDone },
    { txt: "Empareja los 4 perfiles con su función", done: funcionesDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "area" ? resetArea : modo === "funciones" ? resetFunciones : modo === "glosario" ? resetGlosario : resetSim;

  const lectura =
    modo === "ruta"
      ? `${semestresHechos(ruta)}/${SEMESTRES.length} semestres · ${abiertos.length} de ${ROLES.length} perfiles abiertos`
      : `${modosHechos}/4 modos · ${bestEstrellas}★`;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "ruta" && (
        <Trayectoria
          accent={accent}
          rgba={color.rgba}
          ruta={ruta}
          hab={hab}
          abiertos={abiertos}
          rolSel={rolSel}
          onRol={(id) => setRolSel((s) => (s === id ? null : id))}
          onElegir={elegirActividad}
          onOtra={otraRuta}
        />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={CARRERAS_DIGITALES_HUECOS}
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

      {modo === "area" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada perfil a su área</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: areaDone ? OK : T.text3 }}>
                {Object.keys(ubicArea).length}/{PERFILES.length}
              </span>
            </div>
            {areaLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {PERFILES.length} perfiles!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {areaLibres.map((p) => (
                  <button key={p.id} className="cad-chip" data-sel={selArea === p.id} onClick={() => setSelArea((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
          <BinsArea selArea={selArea} shakeArea={shakeArea} ubicArea={ubicArea} onMatch={intentarArea} dropProps={dropProps} />
        </Mesa>
      )}

      {modo === "funciones" && (
        <Mesa>
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <Eyebrow>Arrastra cada perfil a su función</Eyebrow>
              <span style={{ fontSize: 14, fontWeight: 800, color: funcionesDone ? OK : T.text3 }}>
                {Object.keys(empFun).length}/{FUNCIONES.length}
              </span>
            </div>
            {funLibres.length === 0 ? (
              <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {FUNCIONES.length} perfiles!
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {funLibres.map((f) => (
                  <button key={f.id} className="cad-chip" data-sel={selFun === f.id} onClick={() => setSelFun((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                    <i className="fa-solid fa-briefcase" style={{ fontSize: 14, color: T.text3 }} />
                    {f.perfil}
                  </button>
                ))}
              </div>
            )}
          </div>
          <RowsFunciones selFun={selFun} shakeFun={shakeFun} empFun={empFun} onMatch={intentarFun} dropProps={dropProps} />
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
            persistMejor(areaDone, funcionesDone, true);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    ruta: "Cada perfil pide VARIAS habilidades a la vez. Toca un perfil bloqueado para ver en el radar qué le falta y prueba otra ruta.",
    area: "Piensa qué problema resuelve cada perfil: proteger, analizar, construir o comunicar.",
    funciones: "Cada perfil tiene un dato de mercado distinto: demanda, crecimiento, empleadores o presencia de mujeres.",
    glosario: "Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };
  const mejorHab = HABS.slice().sort((a, b) => hab[b.id] - hab[a.id])[0]!;

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
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "ruta" ? "Reiniciar la ruta" : "Reiniciar este modo"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Cuaderno",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Ruta de Ximena (simulación)" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <Dato label="Perfiles abiertos" value={`${abiertos.length}/${ROLES.length}`} col={abiertos.length >= META_PERFILES ? OK : undefined} />
                  <Dato label="Semestres" value={`${semestresHechos(ruta)}/${SEMESTRES.length}`} />
                  <Dato label="Habilidad más alta" value={`${mejorHab.nombre} ${hab[mejorHab.id]}`} col={accent} />
                  <Dato label="Parte de" value={`Diseño ${INICIO.dis}`} />
                </div>
              </Bloque>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "¡Conoces el panorama de las carreras digitales!" : "Termina los tres modos de refuerzo para ganar 2★; la tercera pide 2 errores o menos."}
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
                <FichaTeorica data={CARRERAS_DIGITALES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Funciones y datos de mercado" icono="fa-briefcase">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FUNCIONES.map((f) => (
                    <div key={f.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{f.perfil}.</strong> {f.funcion}
                      <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{f.ejemplo}</div>
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
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_CARRERAS}</div>
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
  @keyframes cadShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes cadPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .cad-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:100%; text-align:left; line-height:1.4; }
  .cad-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .cad-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .cad-chip:active { cursor:grabbing; }
  .cad-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .cad-row[data-shake="true"] { animation:cadShake .4s; border-color:${NO}; }
  .cad-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .cad-slot { flex-shrink:0; min-width:150px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .cad-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .cad-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
  .cad-bin[data-shake="true"] { animation:cadShake .4s; border-color:${NO}; }
  .cad-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .cad-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .cad-q:disabled{ cursor:default; }
  .cad-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
  .cad-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .cad-btn:disabled { opacity:.45; cursor:not-allowed; }
  .cad-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .cad-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .cad-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:11px; }
  .cad-opc, .cad-rol { position:relative; display:flex; flex-direction:column; gap:7px; text-align:left; padding:13px 14px; border-radius:14px; min-width:0;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; line-height:1.45; cursor:pointer; transition:transform .14s, border-color .14s, background .14s; }
  .cad-opc:hover, .cad-rol:hover { border-color:${T.lineStrong}; transform:translateY(-2px); }
  .cad-opc[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); box-shadow:0 0 18px -6px ${accent}; }
  .cad-rol[data-abierto="true"] { border-color:${OK}88; background:${OK}14; box-shadow:0 0 18px -8px ${OK}; }
  .cad-rol[data-abierto="false"] { opacity:.86; }
  .cad-rol[data-sel="true"] { outline:2px dashed ${AMBAR}; outline-offset:2px; }
  .cad-paso { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:8px 12px; border-radius:10px; font-size:14px; font-weight:800;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; }
  .cad-paso[data-on="true"] { border-color:${accent}; color:#fff; background:rgba(${rgba},0.16); }
  .cad-paso[data-hecho="true"] i.cad-ck { color:${OK}; }
  .cad-barra { height:8px; border-radius:6px; background:${T.inset}; overflow:hidden; border:1px solid ${T.line}; }
  .cad-barra > i { display:block; height:100%; border-radius:6px; transition:width .6s cubic-bezier(.2,.8,.2,1); }
  .cad-tag { display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:700; padding:3px 9px; border-radius:8px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; }
  .cad-radar path { transition:d .6s cubic-bezier(.2,.8,.2,1); }
  @media (prefers-reduced-motion: reduce){
    .cad-row[data-shake="true"], .cad-bin[data-shake="true"] { animation:none; }
    .cad-opc, .cad-rol, .cad-opc:hover, .cad-rol:hover { transform:none; transition:none; }
    .cad-barra > i, .cad-radar path { transition:none; }
  }

  /* Identidad del tablero */
  .cad-bin, .cad-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .cad-bin:nth-of-type(6n+1), .cad-row:nth-of-type(6n+1) { --tono:188; }
  .cad-bin:nth-of-type(6n+2), .cad-row:nth-of-type(6n+2) { --tono:262; }
  .cad-bin:nth-of-type(6n+3), .cad-row:nth-of-type(6n+3) { --tono:44; }
  .cad-bin:nth-of-type(6n+4), .cad-row:nth-of-type(6n+4) { --tono:152; }
  .cad-bin:nth-of-type(6n+5), .cad-row:nth-of-type(6n+5) { --tono:330; }
  .cad-bin:nth-of-type(6n+6), .cad-row:nth-of-type(6n+6) { --tono:18; }
  .cad-bin::before, .cad-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .cad-bin[data-done="true"], .cad-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  .cad-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .cad-chip:hover { transform:translateY(-2px); }
  .cad-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
  @media (prefers-reduced-motion: reduce){
    .cad-chip, .cad-chip:hover, .cad-chip[data-sel="true"] { transform:none; transition:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador «Ruta de Ximena»
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Foto con respaldo: si el archivo aún no existe, queda el degradado y el ícono. */
function Foto({ clave, icono, rgba, alto = 120 }: { clave: string; icono: string; rgba: string; alto?: number }) {
  const [falla, setFalla] = useState(false);
  return (
    <span
      aria-hidden
      style={{ position: "relative", display: "block", height: alto, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg, rgba(${rgba},0.38), rgba(8,19,31,0.92))` }}
    >
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: "rgba(255,255,255,0.35)" }}>
        <i className={`fa-solid ${icono}`} />
      </span>
      {!falla && (
        <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFalla(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </span>
  );
}

const CORTO: Record<Hab, string> = { prog: "Programar", datos: "Datos", seg: "Seguridad", dis: "Diseño", com: "Comunicar", eq: "Equipo" };

/** Radar SVG de seis habilidades; el contorno punteado es lo que pide el perfil elegido. */
function Radar({ hab, rol, accent }: { hab: Record<Hab, number>; rol: Rol | null; accent: string }) {
  const C = 150;
  const R = 86;
  const punto = (i: number, v: number): [number, number] => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    const r = (R * Math.max(0, Math.min(NIVEL_MAX, v))) / NIVEL_MAX;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  };
  const trazo = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${punto(i, v)[0].toFixed(1)} ${punto(i, v)[1].toFixed(1)}`).join(" ") + " Z";
  const actual = HABS.map((h) => hab[h.id]);
  const pide = rol ? HABS.map((h) => rol.requiere[h.id] ?? 0) : null;
  const resumen = HABS.map((h) => `${CORTO[h.id]} ${hab[h.id]}`).join(", ");
  return (
    <svg className="cad-radar" viewBox="0 0 300 300" role="img" aria-label={`Radar de habilidades: ${resumen}`} style={{ width: "100%", maxWidth: 340, height: "auto", justifySelf: "center" }}>
      {[2.5, 5, 7.5, 10].map((n) => (
        <path key={n} d={trazo(HABS.map(() => n))} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1} />
      ))}
      {HABS.map((h, i) => {
        const [x, y] = punto(i, NIVEL_MAX);
        return <line key={h.id} x1={C} y1={C} x2={x} y2={y} stroke="rgba(255,255,255,0.13)" strokeWidth={1} />;
      })}
      {pide && <path d={trazo(pide)} fill={`${AMBAR}22`} stroke={AMBAR} strokeWidth={2} strokeDasharray="6 4" />}
      <path d={trazo(actual)} fill={`${accent}44`} stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
      {HABS.map((h, i) => {
        const [x, y] = punto(i, hab[h.id]);
        const [lx, ly] = punto(i, NIVEL_MAX + 2.6);
        return (
          <g key={h.id}>
            <circle cx={x} cy={y} r={4} fill={accent} />
            <text x={lx} y={ly} textAnchor={Math.abs(lx - C) < 8 ? "middle" : lx > C ? "start" : "end"} dominantBaseline="middle" fontSize={14} fontWeight={800} fill="#fff">
              {CORTO[h.id]} {hab[h.id]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Trayectoria({
  accent,
  rgba,
  ruta,
  hab,
  abiertos,
  rolSel,
  onRol,
  onElegir,
  onOtra,
}: {
  accent: string;
  rgba: string;
  ruta: Ruta;
  hab: Record<Hab, number>;
  abiertos: Rol[];
  rolSel: string | null;
  onRol: (id: string) => void;
  onElegir: (semestreId: string, actividadId: string) => void;
  onOtra: () => void;
}) {
  const [sel, setSel] = useState(0);
  const sem = SEMESTRES[Math.min(sel, SEMESTRES.length - 1)]!;
  const elegida = actividadDe(sem.id, ruta[sem.id]);
  const completa = semestresHechos(ruta) >= SEMESTRES.length;
  const rol = ROLES.find((r) => r.id === rolSel) ?? null;
  const dato = (r: Rol) => FUNCIONES.find((f) => f.id === r.funcion);

  return (
    <>
      {/* ── Ximena y su radar ─────────────────────────────────────────── */}
      <div className="cad-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Ruta de Ximena · estudiante ficticia</Eyebrow>
          <span className="cad-tag">
            <i className="fa-solid fa-flask" aria-hidden /> Simulación: niveles ficticios
          </span>
        </div>
        <div className="cad-grid" style={{ alignItems: "center" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Foto clave="ximena" icono="fa-user-graduate" rgba={rgba} alto={150} />
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              A Ximena le gusta dibujar y organizar eventos. Va a cursar cuatro semestres y en cada uno elige UNA actividad. Mira cómo crece el radar.
            </div>
          </div>
          <Radar hab={hab} rol={rol} accent={accent} />
        </div>
      </div>

      {/* ── Semestres ─────────────────────────────────────────────────── */}
      <div className="cad-panel">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="tablist" aria-label="Semestres">
          {SEMESTRES.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === sel} className="cad-paso" data-on={i === sel} data-hecho={!!ruta[s.id]} onClick={() => setSel(i)}>
              <i className={`fa-solid ${ruta[s.id] ? "fa-circle-check" : "fa-circle"} cad-ck`} aria-hidden />
              {s.titulo}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <Foto clave={sem.foto} icono="fa-graduation-cap" rgba={rgba} alto={100} />
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{sem.contexto}</div>
        </div>
        <div className="cad-grid">
          {sem.actividades.map((a) => (
            <button key={a.id} type="button" className="cad-opc" data-sel={elegida?.id === a.id} onClick={() => onElegir(sem.id, a.id)}>
              <span className="cad-tag" style={{ alignSelf: "flex-start" }}>
                {a.tipo}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                <i className={`fa-solid ${a.icono}`} aria-hidden style={{ color: accent }} />
                {a.titulo}
              </span>
              <span style={{ color: T.text2 }}>{a.detalle}</span>
            </button>
          ))}
        </div>
        {elegida && (
          <div role="status" style={{ display: "flex", gap: 11, padding: "11px 13px", borderRadius: 12, fontSize: 14, lineHeight: 1.5, border: `1px solid ${OK}66`, background: `${OK}12` }}>
            <i className="fa-solid fa-seedling" aria-hidden style={{ color: OK, marginTop: 3 }} />
            <span>
              <strong style={{ color: "#fff" }}>
                {(Object.keys(elegida.aporta) as Hab[]).map((k) => `+${elegida.aporta[k]} ${nombreHab(k)}`).join(" · ")}.
              </strong>{" "}
              {elegida.porque}
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {sel < SEMESTRES.length - 1 && (
            <button type="button" className="cad-btn" onClick={() => setSel(sel + 1)}>
              Siguiente semestre <i className="fa-solid fa-arrow-right" aria-hidden />
            </button>
          )}
          {completa && (
            <button type="button" className="cad-btn cad-btn-main" onClick={onOtra}>
              <i className="fa-solid fa-route" aria-hidden /> Probar otra ruta
            </button>
          )}
        </div>
      </div>

      {/* ── Perfiles ──────────────────────────────────────────────────── */}
      <div className="cad-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Perfiles digitales (toca uno para ver qué pide)</Eyebrow>
          <span className="cad-tag" style={{ color: abiertos.length >= META_PERFILES ? OK : T.text2 }}>
            {abiertos.length} de {ROLES.length} abiertos
          </span>
        </div>
        <div className="cad-grid">
          {ROLES.map((r) => {
            const e = estadoRol(r, hab);
            const d = dato(r);
            return (
              <button key={r.id} type="button" className="cad-rol" data-abierto={e.abierto} data-sel={rolSel === r.id} onClick={() => onRol(r.id)}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                  <i className={`fa-solid ${e.abierto ? r.icono : "fa-lock"}`} aria-hidden style={{ color: e.abierto ? OK : T.text3 }} />
                  {r.nombre}
                </span>
                <span style={{ color: T.text2 }}>{r.hace}</span>
                <span className="cad-barra" aria-hidden>
                  <i style={{ width: `${Math.round(e.avance * 100)}%`, background: e.abierto ? OK : accent }} />
                </span>
                {e.abierto ? (
                  <span style={{ color: OK, fontWeight: 700 }}>
                    <i className="fa-solid fa-circle-check" aria-hidden /> Abierto{d ? `: ${d.funcion}` : ""}
                  </span>
                ) : (
                  <span style={{ color: AMBAR, fontWeight: 700 }}>
                    Te falta: {e.faltan.map((f) => `${CORTO[f.hab]} ${f.tiene}/${f.pide}`).join(", ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {completa && (
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            {abiertos.length >= META_PERFILES
              ? `Tu ruta abrió ${abiertos.length} perfiles. Observa que no todos piden programar: el sector digital incluye diseño, datos, seguridad y comunicación.`
              : `Tu ruta abrió ${abiertos.length}. Cada perfil pide varias habilidades a la vez; prueba combinar actividades de áreas que se complementen.`}
          </div>
        )}
      </div>
    </>
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

function BinsArea({
  selArea,
  shakeArea,
  ubicArea,
  onMatch,
  dropProps,
}: {
  selArea: string | null;
  shakeArea: Area | null;
  ubicArea: Record<string, Area>;
  onMatch: (perfilId: string, bin: Area) => void;
  dropProps: DropFactory;
}) {
  const bins: Area[] = ["datos-ia", "seguridad", "diseno", "comunicacion"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = AREA_INFO[bin];
        const dentro = PERFILES.filter((p) => ubicArea[p.id] === bin);
        return (
          <div
            key={bin}
            className="cad-bin"
            data-shake={shakeArea === bin}
            onClick={() => selArea && onMatch(selArea, bin)}
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
                  <span key={p.id} style={{ animation: "cadPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
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

function RowsFunciones({
  selFun,
  shakeFun,
  empFun,
  onMatch,
  dropProps,
}: {
  selFun: string | null;
  shakeFun: string | null;
  empFun: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FUNCIONES.map((f) => {
        const done = empFun[f.id];
        return (
          <div
            key={f.id}
            className="cad-row"
            data-shake={shakeFun === f.id}
            data-done={done}
            onClick={() => !done && selFun && onMatch(selFun, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div className="cad-slot" data-armed={!done && !!selFun} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "cadPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-briefcase" />
                  {f.perfil}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> perfil
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{f.funcion}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{f.ejemplo}</div>
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
        Cinco afirmaciones sobre las carreras digitales, la perspectiva de género en las TIC y las habilidades del siglo XXI. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="cad-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cad-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cad-btn" onClick={reintentar}>
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
