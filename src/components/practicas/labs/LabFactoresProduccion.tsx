"use client";

/**
 * Laboratorio — Factores de producción y la cadena productiva
 * Práctica experimental para CS-II-P03-A4 (Ciencias Sociales II).
 *
 * El alumno administra una TORTILLERÍA FICTICIA («La Milpa», simulación):
 *  1. «La tortillería» — asigna los cinco factores (tierra: maíz · trabajo:
 *     trabajadores · capital: máquinas · organización: nivel · tiempo: horas).
 *     La producción la fija el factor más escaso (el cuello de botella), se
 *     ven los pagos que recibe cada factor (renta, salario, interés, ganancia)
 *     y, si falta un factor, la producción se detiene con su explicación.
 *  2. «Formal o informal» — con la misma tortillería, compara un mes operando
 *     como negocio formal o informal: impuestos, crédito, mercado, accidentes.
 *  3. «La cadena productiva» — recorre en orden los cinco eslabones del tomate
 *     de Sinaloa y mira cómo se reparte el precio entre quienes participan.
 *  4. «Completa el texto» (verbatim de la progresión).
 *  + Cuestionario de comprensión (V/F verbatim de A4 y A2), en la pestaña Reto.
 *
 * DOM puro (sin three.js). Teoría VERBATIM de CS-II·P03 en la pestaña Teoría.
 * Modelo en factores-produccion-sim.ts. Negocio, precios y cifras: ficticios.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { FACTORES_PRODUCCION_HUECOS } from "./factores-produccion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { FACTORES_PRODUCCION_FICHA } from "./factores-produccion-ficha";
import {
  ITEMS_FACTOR,
  FACTOR_INFO,
  ITEMS_SECTOR,
  SECTOR_INFO,
  CADENA,
  QUIZ,
  DATO_PRODUCCION,
  type Factor,
  type Sector,
} from "./factores-produccion-data";
import {
  CONFIG_INICIAL,
  LIMITES,
  ORG_NIVELES,
  PRESUPUESTO,
  PRECIO_KG,
  DEMANDA_BARRIO,
  DIAS_MES,
  FACTOR_PAGO,
  EXPLICA_FALTA,
  EXPLICA_CUELLO,
  ESTATUS,
  CADENA_PRECIOS,
  resolver,
  mes,
  precioFinal,
  type Config,
  type Estatus,
  type FactorId,
} from "./factores-produccion-sim";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-factores-produccion-reto";
const RUTA_SIM = "/media/labs-sim/factores-produccion";

type Modo = "taller" | "sector" | "cadena" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "La tortillería", icono: "fa-shop" },
  { id: "sector", label: "Formal o informal", icono: "fa-scale-balanced" },
  { id: "cadena", label: "La cadena productiva", icono: "fa-arrow-down-up-across-line" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const FACTORES_UI: { id: FactorId; clave: string; titulo: string; icono: string }[] = [
  { id: "tierra", clave: "maiz", titulo: "Tierra · maíz", icono: "fa-mountain-sun" },
  { id: "trabajo", clave: "manos", titulo: "Trabajo · personas", icono: "fa-person-digging" },
  { id: "capital", clave: "maquina", titulo: "Capital · máquinas", icono: "fa-industry" },
  { id: "organizacion", clave: "planeacion", titulo: "Organización", icono: "fa-sitemap" },
  { id: "tiempo", clave: "", titulo: "Tiempo · horas", icono: "fa-hourglass-half" },
];

interface Dia {
  produccion: number;
  ganancia: number;
}

const dinero = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("es-MX")}`;

export function LabFactoresProduccion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("taller");

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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── modo La tortillería ───────────────────────────────────────────────
  const [cfg, setCfg] = useState<Config>(CONFIG_INICIAL);
  const [dias, setDias] = useState<Dia[]>([]);
  const [diaOk, setDiaOk] = useState(false);
  const [faltoVisto, setFaltoVisto] = useState(false);
  const [avisoTaller, setAvisoTaller] = useState<string | null>(null);

  const r = resolver(cfg);

  const cambiar = (campo: keyof Config, valor: number) => {
    const next = { ...cfg, [campo]: valor };
    setCfg(next);
    setAvisoTaller(null);
    if (resolver(next).faltan.length > 0) setFaltoVisto(true);
  };
  const registrarDia = () => {
    if (r.detenida) {
      sfxNo();
      setAvisoTaller("Hoy no se produjo nada: no hay día que registrar. Repara lo que falta y vuelve a intentarlo.");
      return;
    }
    setDias((d) => [...d.slice(-5), { produccion: r.produccion, ganancia: r.ganancia }]);
    if (r.ganancia > 0) sfxPlace();
    else sfxClick();
    setAvisoTaller(r.ganancia > 0 ? "Día registrado con ganancia." : "Día registrado, pero con pérdida: revisa cuánto gastas frente a lo que vendes.");
    if (!diaOk) {
      setDiaOk(true);
      persistMejor(true, sectoresDone, cadenaDone);
    }
  };
  const resetTaller = () => {
    setCfg(CONFIG_INICIAL);
    setDias([]);
    setDiaOk(false);
    setFaltoVisto(false);
    setAvisoTaller(null);
    partida.reiniciar();
  };

  // ── modo Formal o informal ────────────────────────────────────────────
  const [meses, setMeses] = useState<Record<Estatus, boolean>>({ formal: false, informal: false });
  const [avisoSector, setAvisoSector] = useState<string | null>(null);
  const mesF = mes(cfg, "formal");
  const mesI = mes(cfg, "informal");
  const cerrarMes = (e: Estatus) => {
    const m = e === "formal" ? mesF : mesI;
    if (m.dia.detenida) {
      sfxNo();
      setAvisoSector("Con la tortillería detenida no hay mes que cerrar: vuelve a «La tortillería» y arréglala.");
      return;
    }
    if (meses[e]) return;
    sfxPlace();
    const otro = e === "formal" ? mesI : mesF;
    setAvisoSector(
      e === "formal"
        ? `Mes formal cerrado: ganancia ${dinero(m.ganancia)}. Al día ganabas ${dinero(m.gananciaDia)}, pero el seguro, el crédito barato y el mercado más grande se notan al mes.${otro.ganancia < m.ganancia ? " Frente al informal, la formalidad resultó más rentable." : ""}`
        : `Mes informal cerrado: ganancia ${dinero(m.ganancia)}. Al día se veía mejor (${dinero(m.gananciaDia)}), pero el accidente y la multa se llevaron ${dinero(m.accidente + m.multa)} del mes.`
    );
    const nuevo = { ...meses, [e]: true };
    setMeses(nuevo);
    if (nuevo.formal && nuevo.informal) {
      sfxOk();
      persistMejor(factoresDone, true, cadenaDone);
    }
  };
  const resetSector = () => {
    setMeses({ formal: false, informal: false });
    setAvisoSector(null);
  };

  // ── modo Cadena (recorre los eslabones en orden) ──────────────────────
  const [cadenaPos, setCadenaPos] = useState(0);
  const [shakeC, setShakeC] = useState<string | null>(null);
  const [avisoCadena, setAvisoCadena] = useState<string | null>(null);
  const cadenaLibres = CADENA.filter((c) => c.orden >= cadenaPos).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarCadena = (pasoId: string) => {
    if (cadenaPos >= CADENA.length) return;
    const esperado = CADENA[cadenaPos]!;
    if (pasoId === esperado.id) {
      setCadenaPos((p) => p + 1);
      sfxPlace();
      setAvisoCadena(CADENA_PRECIOS[esperado.id]!.texto);
      if (cadenaPos + 1 >= CADENA.length) {
        sfxOk();
        persistMejor(factoresDone, sectoresDone, true);
      }
    } else {
      setShakeC(pasoId);
      sfxNo();
      window.setTimeout(() => setShakeC(null), 420);
      setAvisoCadena("Todavía no: piensa qué tiene que haber ocurrido antes de ese paso para que exista.");
    }
  };
  const resetCadena = () => {
    setCadenaPos(0);
    setAvisoCadena(null);
  };

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const factoresDone = diaOk;
  const sectoresDone = meses.formal && meses.informal;
  const cadenaDone = cadenaPos >= CADENA.length;
  const modosHechos = (factoresDone ? 1 : 0) + (sectoresDone ? 1 : 0) + (cadenaDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Asigna los 5 factores y registra un día de producción", done: factoresDone },
    { txt: "Quita un factor y descubre por qué se detiene", done: faltoVisto },
    { txt: "Prueba la tortillería formal y la informal", done: sectoresDone },
    { txt: "Ordena la cadena de la producción al consumo", done: cadenaDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const resetActual = modo === "texto" ? resetTexto : modo === "taller" ? resetTaller : modo === "sector" ? resetSector : resetCadena;

  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "taller" && (
        <Taller cfg={cfg} r={r} dias={dias} aviso={avisoTaller} accent={accent} onCambiar={cambiar} onRegistrar={registrarDia} />
      )}

      {modo === "sector" && (
        <Sector mesF={mesF} mesI={mesI} meses={meses} aviso={avisoSector} accent={accent} onCerrar={cerrarMes} />
      )}

      {modo === "cadena" && (
        <Cadena cadenaPos={cadenaPos} libres={cadenaLibres} shake={shakeC} aviso={avisoCadena} accent={accent} onElegir={intentarCadena} />
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={FACTORES_PRODUCCION_HUECOS}
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
    taller: "La producción la manda el factor más escaso, no la suma de todos. Más trabajadores no sirven si falta maíz o máquinas. Y ojo: si falta un factor, los demás se siguen pagando.",
    sector: "Al día el negocio informal parece ganar más; al mes aparecen los accidentes y las multas que nadie cubre. Cambia los factores en «La tortillería» y compara de nuevo.",
    cadena: "Cada eslabón se queda con una parte del precio final. Fíjate cuánto le toca a quien cultiva frente a quien vende.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  const lectura =
    modo === "taller"
      ? r.detenida
        ? "Producción detenida"
        : `${r.produccion} kg al día · ganancia ${dinero(r.ganancia)}`
      : `${modosHechos}/4 · ${bestEstrellas}★`;

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
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2 }}>
                  {bestEstrellas >= 3 ? "¡Entiendes cómo se combinan los factores!" : "Termina los modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
              <Bloque titulo="Quién cobra qué" icono="fa-hand-holding-dollar">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(Object.keys(FACTOR_PAGO) as (keyof typeof FACTOR_PAGO)[]).map((k) => (
                    <div key={k} style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
                      <strong style={{ color: T.text }}>{FACTOR_PAGO[k].pago}</strong> · {FACTOR_INFO[k].titulo}: lo recibe {FACTOR_PAGO[k].quien}.
                    </div>
                  ))}
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
                <FichaTeorica data={FACTORES_PRODUCCION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Los factores de producción" icono="fa-table-columns">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(Object.keys(FACTOR_INFO) as Factor[]).map((f) => (
                    <div key={f} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{FACTOR_INFO[f].titulo}.</strong> {FACTOR_INFO[f].descripcion}
                      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                        {ITEMS_FACTOR.filter((i) => i.factor === f).map((i) => (
                          <li key={i.id}>{i.texto}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Economía formal e informal" icono="fa-scale-balanced">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(Object.keys(SECTOR_INFO) as Sector[]).map((s) => (
                    <div key={s} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>{SECTOR_INFO[s].titulo}.</strong> {SECTOR_INFO[s].descripcion}.
                      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                        {ITEMS_SECTOR.filter((i) => i.sector === s).map((i) => (
                          <li key={i.id}>{i.texto}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="La cadena del tomate de Sinaloa" icono="fa-arrow-down-up-across-line">
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: T.text2, lineHeight: 1.55 }}>
                  {CADENA.map((c) => (
                    <li key={c.id}>{c.texto} <span style={{ color: T.text3 }}>({c.etapa})</span></li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_PRODUCCION}</div>
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
  @keyframes fpShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
  @keyframes fpPop { 0%{transform:scale(.85);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fp-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:11px; }
  .fp-grid2 { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:9px; }
  .fp-panel { position:relative; border-radius:16px; border:1px solid ${T.line}; background:${T.glass}; padding:14px 16px; display:flex; flex-direction:column; gap:11px; min-width:0; }
  .fp-panel[data-alerta="true"] { border-color:${NO}88; background:${NO}10; }
  .fp-fcard { display:flex; flex-direction:column; gap:9px; padding:10px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
  .fp-fcard[data-falta="true"] { border-color:${NO}88; background:${NO}10; }
  .fp-foto { position:relative; overflow:hidden; border-radius:10px; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); display:flex; align-items:center; justify-content:center; }
  .fp-foto > i { font-size:24px; color:rgba(255,255,255,0.55); }
  .fp-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .fp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; text-align:left; }
  .fp-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .fp-btn:disabled { opacity:.45; cursor:not-allowed; }
  .fp-btn[data-shake="true"] { animation:fpShake .4s; border-color:${NO}; }
  .fp-btn-main { background:${accent}; color:#04121f; border-color:transparent; }
  .fp-aviso { font-size:14px; line-height:1.5; padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; color:#fff; animation:fpPop .25s ease; }
  .fp-aviso[data-t="ok"] { border-color:${OK}77; background:${OK}14; }
  .fp-aviso[data-t="mal"] { border-color:${NO}77; background:${NO}12; }
  .fp-cadena { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:8px; }
  .fp-eslabon { display:flex; flex-direction:column; gap:4px; padding:10px; border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; font-size:14px; color:${T.text3}; min-width:0; }
  .fp-eslabon[data-ok="true"] { border-style:solid; border-color:${OK}77; background:${OK}12; color:#fff; animation:fpPop .25s ease; }
  .fp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fp-q:disabled{ cursor:default; }
  @media (prefers-reduced-motion: reduce){
    .fp-aviso, .fp-eslabon[data-ok="true"], .fp-btn[data-shake="true"] { animation:none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen de escena: gradiente + ícono detrás; la foto se oculta si falta. */
function Foto({ clave, icono, alto }: { clave: string; icono: string; alto: number }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="fp-foto" style={{ height: alto }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {clave && !fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

/** Barras SVG de capacidad por factor, demanda y producción neta. */
function GraficaProduccion({ r, accent }: { r: ReturnType<typeof resolver>; accent: string }) {
  const MAX = 300;
  const W = 340;
  const x0 = 96;
  const ancho = W - x0 - 10;
  const px = (v: number) => (Math.min(MAX, Math.max(0, v)) / MAX) * ancho;
  const filas: { id: string; txt: string; v: number; col: string }[] = [
    { id: "tierra", txt: "Maíz", v: r.cap.tierra, col: r.cuello === "tierra" ? AMBAR : "#34D39988" },
    { id: "trabajo", txt: "Personas", v: r.cap.trabajo, col: r.cuello === "trabajo" ? AMBAR : "#5BC8FF88" },
    { id: "capital", txt: "Máquinas", v: r.cap.capital, col: r.cuello === "capital" ? AMBAR : "#C084FC88" },
    { id: "prod", txt: "Producción", v: r.produccion, col: r.detenida ? NO : accent },
  ];
  const yDem = 12 + 4 * 34;
  return (
    <svg viewBox={`0 0 ${W} ${yDem + 6}`} width="100%" role="img" aria-label="Capacidad de cada factor y producción neta en kilos de tortilla al día" style={{ display: "block" }}>
      {filas.map((f, i) => {
        const y = 10 + i * 34;
        return (
          <g key={f.id}>
            <text x={0} y={y + 18} fontSize={14} fill="#fff" fontWeight={700}>{f.txt}</text>
            <rect x={x0} y={y} width={ancho} height={24} rx={6} fill="rgba(255,255,255,0.07)" />
            <rect x={x0} y={y} width={Math.max(f.v > 0 ? 3 : 0, px(f.v))} height={24} rx={6} fill={f.col} style={{ transition: "width .5s" }} />
            <text x={x0 + 6} y={y + 17} fontSize={14} fill="#fff" fontWeight={800}>{Math.round(f.v)} kg</text>
          </g>
        );
      })}
      <line x1={x0 + px(DEMANDA_BARRIO)} x2={x0 + px(DEMANDA_BARRIO)} y1={4} y2={yDem - 8} stroke="#FF8A5B" strokeWidth={2} strokeDasharray="5 4" />
      <text x={x0 + px(DEMANDA_BARRIO)} y={yDem + 4} fontSize={13} fill="#FF8A5B" textAnchor="middle" fontWeight={700}>demanda del barrio {DEMANDA_BARRIO} kg</text>
    </svg>
  );
}

function Taller({ cfg, r, dias, aviso, accent, onCambiar, onRegistrar }: { cfg: Config; r: ReturnType<typeof resolver>; dias: Dia[]; aviso: string | null; accent: string; onCambiar: (c: keyof Config, v: number) => void; onRegistrar: () => void }) {
  const falta = (id: FactorId) => r.faltan.includes(id);
  const nivel = ORG_NIVELES[cfg.org]!;
  const maxGan = Math.max(1, ...dias.map((d) => Math.abs(d.ganancia)));
  return (
    <>
      <div className="fp-panel">
        <Eyebrow>
          <i className="fa-solid fa-shop" style={{ marginRight: 8, color: accent }} />
          Tortillería «La Milpa» (simulación)
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12, alignItems: "center" }}>
          <Foto clave="tortilleria" icono="fa-shop" alto={110} />
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Reparte tus factores con un presupuesto de {dinero(PRESUPUESTO)} al día. Cada tortilla se vende a ${PRECIO_KG} el kilo y el barrio compra hasta {DEMANDA_BARRIO} kg. Mueve un deslizador y mira qué pasa abajo.
          </div>
        </div>
      </div>

      <div className="fp-grid">
        {FACTORES_UI.map((f) => (
          <div key={f.id} className="fp-fcard" data-falta={falta(f.id)}>
            <Foto clave={f.clave} icono={f.icono} alto={64} />
            {f.id === "tierra" && (
              <Deslizador label="Maíz" icon={f.icono} colr="#34D399" valor={`${cfg.maiz} kg`} min={LIMITES.maiz.min} max={LIMITES.maiz.max} step={LIMITES.maiz.paso} value={cfg.maiz} onChange={(v) => onCambiar("maiz", v)} hintL="0" hintR="160 kg" />
            )}
            {f.id === "trabajo" && (
              <Deslizador label="Trabajadores" icon={f.icono} colr="#5BC8FF" valor={`${cfg.trab}`} min={LIMITES.trab.min} max={LIMITES.trab.max} step={LIMITES.trab.paso} value={cfg.trab} onChange={(v) => onCambiar("trab", v)} hintL="0" hintR="6" />
            )}
            {f.id === "capital" && (
              <Deslizador label="Máquinas" icon={f.icono} colr="#C084FC" valor={`${cfg.maq}`} min={LIMITES.maq.min} max={LIMITES.maq.max} step={LIMITES.maq.paso} value={cfg.maq} onChange={(v) => onCambiar("maq", v)} hintL="0" hintR="3" />
            )}
            {f.id === "organizacion" && (
              <Deslizador label="Nivel" icon={f.icono} colr="#FF8A5B" valor={`${cfg.org}`} min={LIMITES.org.min} max={LIMITES.org.max} step={LIMITES.org.paso} value={cfg.org} onChange={(v) => onCambiar("org", v)} hintL="ninguna" hintR="completa" />
            )}
            {f.id === "tiempo" && (
              <Deslizador label="Horas al día" icon={f.icono} colr="#FFC75A" valor={`${cfg.horas} h`} min={LIMITES.horas.min} max={LIMITES.horas.max} step={LIMITES.horas.paso} value={cfg.horas} onChange={(v) => onCambiar("horas", v)} hintL="0" hintR="12 h" />
            )}
            <div style={{ fontSize: 14, color: falta(f.id) ? NO : T.text2, lineHeight: 1.4 }}>
              {f.id === "organizacion" ? `${nivel.nombre}${nivel.costo ? ` · ${dinero(nivel.costo)}` : ""}` : falta(f.id) ? "¡Falta este factor!" : f.titulo}
            </div>
          </div>
        ))}
      </div>

      {r.detenida ? (
        <div className="fp-panel" data-alerta="true" role="status">
          <div style={{ fontSize: 16, fontWeight: 900, color: NO }}>
            <i className="fa-solid fa-triangle-exclamation" aria-hidden style={{ marginRight: 9 }} />
            Producción detenida
          </div>
          {r.faltan.map((id) => (
            <div key={id} style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>
              <strong>Falta {id === "organizacion" ? "organización" : id}.</strong> {EXPLICA_FALTA[id]}
            </div>
          ))}
          {r.sinFondos && (
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>
              <strong>Te pasaste del presupuesto.</strong> Gastas {dinero(r.gasto)} y solo tienes {dinero(PRESUPUESTO)}: no puedes pagar a todos los factores, así que hoy no se abre.
            </div>
          )}
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Aun así los demás factores se siguen pagando: hoy gastarías {dinero(r.gasto)} sin vender nada.
          </div>
        </div>
      ) : (
        <div className="fp-panel">
          <Eyebrow>
            <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
            Qué puede producir cada factor
          </Eyebrow>
          <GraficaProduccion r={r} accent={accent} />
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            <strong style={{ color: AMBAR }}>Cuello de botella:</strong> {r.cuello ? EXPLICA_CUELLO[r.cuello] : ""}
            {r.merma > 0.05 && ` Además, con tu nivel de organización se desperdicia ${Math.round(r.merma * 100)} % de lo que se hace.`}
            {r.excedente > 0 && ` Sobran ${r.excedente} kg: el barrio no los compra.`}
          </div>
        </div>
      )}

      <div className="fp-panel">
        <Eyebrow>
          <i className="fa-solid fa-hand-holding-dollar" style={{ marginRight: 8, color: accent }} />
          Quién cobra hoy (simulación)
        </Eyebrow>
        <div className="fp-grid2">
          <Dato label="Ingresos por ventas" value={dinero(r.ingresos)} col={accent} />
          <Dato label="Renta · tierra" value={dinero(r.renta)} col="#34D399" />
          <Dato label="Salario · trabajo" value={dinero(r.salarios)} col="#5BC8FF" />
          <Dato label="Interés · capital" value={dinero(r.interes)} col="#C084FC" />
          <Dato label="Costo de organizar" value={dinero(r.costoOrg)} col="#FF8A5B" />
          <Dato label="Ganancia · organización" value={dinero(r.ganancia)} col={r.ganancia >= 0 ? OK : NO} />
        </div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          La ganancia es lo que le queda a quien organiza después de pagar a los demás factores; por eso puede ser negativa.
        </div>
      </div>

      <div className="fp-panel">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="fp-btn fp-btn-main" onClick={onRegistrar}>
            <i className="fa-solid fa-clipboard-check" aria-hidden /> Registrar el día
          </button>
          <span style={{ fontSize: 14, color: T.text2 }}>Guarda esta combinación para compararla con otra.</span>
        </div>
        {dias.length > 0 && (
          <svg viewBox={`0 0 340 ${dias.length * 30 + 4}`} width="100%" role="img" aria-label="Ganancia de los días registrados" style={{ display: "block" }}>
            {dias.map((d, i) => {
              const w = (Math.abs(d.ganancia) / maxGan) * 190;
              return (
                <g key={i}>
                  <text x={0} y={i * 30 + 19} fontSize={14} fill="#fff" fontWeight={700}>Día {i + 1}</text>
                  <rect x={60} y={i * 30 + 4} width={Math.max(3, w)} height={22} rx={5} fill={d.ganancia >= 0 ? OK : NO} />
                  <text x={66 + Math.max(3, w)} y={i * 30 + 20} fontSize={14} fill="#fff" fontWeight={800}>{dinero(d.ganancia)} · {d.produccion} kg</text>
                </g>
              );
            })}
          </svg>
        )}
        {aviso && <div className="fp-aviso" data-t={aviso.startsWith("Día registrado con ganancia") ? "ok" : "mal"} role="status">{aviso}</div>}
      </div>
    </>
  );
}

function Sector({ mesF, mesI, meses, aviso, accent, onCerrar }: { mesF: ReturnType<typeof mes>; mesI: ReturnType<typeof mes>; meses: Record<Estatus, boolean>; aviso: string | null; accent: string; onCerrar: (e: Estatus) => void }) {
  const max = Math.max(1, Math.abs(mesF.ganancia), Math.abs(mesI.ganancia));
  const col = (e: Estatus) => (e === "formal" ? "#34D399" : "#FFC75A");
  const m = (e: Estatus) => (e === "formal" ? mesF : mesI);
  return (
    <>
      <div className="fp-panel">
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Un mes de la tortillería (simulación, {DIAS_MES} días)
        </Eyebrow>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Usa los factores que dejaste en «La tortillería». Compara cómo le va a la misma tortillería si opera registrada o sin registro, y cierra un mes de cada una.
        </div>
        <svg viewBox="0 0 340 100" width="100%" role="img" aria-label="Ganancia del mes: formal frente a informal" style={{ display: "block" }}>
          {(["formal", "informal"] as Estatus[]).map((e, i) => {
            const g = m(e).ganancia;
            const w = (Math.abs(g) / max) * 190;
            return (
              <g key={e}>
                <text x={0} y={i * 46 + 30} fontSize={14} fill="#fff" fontWeight={700}>{ESTATUS[e].titulo}</text>
                <rect x={78} y={i * 46 + 10} width={Math.max(3, w)} height={32} rx={7} fill={g >= 0 ? col(e) : NO} style={{ transition: "width .5s" }} />
                <text x={84 + Math.max(3, w)} y={i * 46 + 32} fontSize={14} fill="#fff" fontWeight={800}>{dinero(g)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="fp-grid">
        {(["formal", "informal"] as Estatus[]).map((e) => {
          const k = ESTATUS[e];
          const x = m(e);
          return (
            <div key={e} className="fp-panel" style={{ borderColor: meses[e] ? `${OK}88` : undefined }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: col(e) }}>
                <i className={`fa-solid ${k.icono}`} aria-hidden style={{ marginRight: 9 }} />
                Negocio {k.titulo.toLowerCase()}
              </div>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{k.nota}</div>
              <div className="fp-grid2">
                <Dato label="Ganancia por día" value={dinero(x.gananciaDia)} col={col(e)} />
                <Dato label="Vende hasta" value={`${k.demanda} kg`} />
                <Dato label="Impuestos y IMSS" value={dinero(x.impuestos + x.imss)} />
                <Dato label="Accidente y multa" value={dinero(x.accidente + x.multa)} col={x.accidente + x.multa > 0 ? NO : undefined} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: x.ganancia >= 0 ? OK : NO }}>Ganancia del mes: {dinero(x.ganancia)}</div>
              <button type="button" className="fp-btn fp-btn-main" disabled={meses[e]} onClick={() => onCerrar(e)}>
                <i className={`fa-solid ${meses[e] ? "fa-circle-check" : "fa-calendar-check"}`} aria-hidden />
                {meses[e] ? "Mes cerrado" : `Cerrar el mes como ${k.titulo.toLowerCase()}`}
              </button>
            </div>
          );
        })}
      </div>
      {aviso && <div className="fp-aviso" data-t={aviso.startsWith("Con la tortillería") ? "mal" : "ok"} role="status">{aviso}</div>}
    </>
  );
}

function Cadena({ cadenaPos, libres, shake, aviso, accent, onElegir }: { cadenaPos: number; libres: typeof CADENA; shake: string | null; aviso: string | null; accent: string; onElegir: (id: string) => void }) {
  const total = precioFinal();
  const hecho = cadenaPos >= CADENA.length;
  return (
    <>
      <div className="fp-panel">
        <Eyebrow>
          <i className="fa-solid fa-arrow-down-up-across-line" style={{ marginRight: 8, color: accent }} />
          El tomate de Sinaloa: ¿qué sigue? (precios de simulación)
        </Eyebrow>
        <Foto clave="tomates" icono="fa-seedling" alto={90} />
        <div className="fp-cadena">
          {CADENA.map((c, i) => {
            const ok = i < cadenaPos;
            const p = CADENA_PRECIOS[c.id]!;
            return (
              <div key={c.id} className="fp-eslabon" data-ok={ok}>
                <strong style={{ color: ok ? "#fff" : T.text2 }}>{i + 1}. {ok ? p.quien : "¿?"}</strong>
                {ok ? <span>{c.etapa}{p.aporte > 0 ? ` · $${p.aporte}/kg` : ""}</span> : <span>por descubrir</span>}
              </div>
            );
          })}
        </div>
        <svg viewBox="0 0 340 62" width="100%" role="img" aria-label="Cómo se reparte el precio final del kilo de tomate" style={{ display: "block" }}>
          <rect x={0} y={8} width={340} height={26} rx={7} fill="rgba(255,255,255,0.07)" />
          {CADENA.slice(0, cadenaPos).map((c, i) => {
            const antes = CADENA.slice(0, i).reduce((acc, q) => acc + CADENA_PRECIOS[q.id]!.aporte, 0);
            const p = CADENA_PRECIOS[c.id]!;
            return p.aporte > 0 ? <rect key={c.id} x={(antes / total) * 340} y={8} width={(p.aporte / total) * 340} height={26} fill={p.color} /> : null;
          })}
          <text x={0} y={56} fontSize={14} fill="#fff" fontWeight={700}>Precio por kilo: ${CADENA.slice(0, cadenaPos).reduce((s, c) => s + CADENA_PRECIOS[c.id]!.aporte, 0)} de ${total}</text>
        </svg>
        {hecho && (
          <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>
            De los ${total} que paga la familia, quien cultiva recibe ${CADENA_PRECIOS["cp-cultivo"]!.aporte} (alrededor de {Math.round((CADENA_PRECIOS["cp-cultivo"]!.aporte / total) * 100)} %). Estudiar la cadena muestra quién se beneficia más en cada eslabón.
          </div>
        )}
      </div>

      {!hecho && (
        <div className="fp-panel">
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Elige el eslabón que sigue</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {libres.map((c) => (
              <button key={c.id} type="button" className="fp-btn" data-shake={shake === c.id} onClick={() => onElegir(c.id)}>
                {c.texto}
              </button>
            ))}
          </div>
        </div>
      )}
      {aviso && <div className="fp-aviso" data-t={aviso.startsWith("Todavía no") ? "mal" : "ok"} role="status">{aviso}</div>}
    </>
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
        Cinco afirmaciones sobre los factores de producción y la cadena productiva. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
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
                    <button key={oi} className="fp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="fp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fp-btn" onClick={reintentar}>
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
