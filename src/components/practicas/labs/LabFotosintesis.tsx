"use client";

/**
 * Laboratorio 3D — Fotosíntesis: la fábrica de vida del planeta.
 * Práctica experimental para CNEYT-III-P03-A1 (progresión 3).
 *
 * UN VIAJE DE ESCALAS, como «Powers of Ten»: de la planta en su maceta al
 * corte de la hoja, de ahí al cloroplasto y hasta la membrana del tilacoide,
 * con un zoom continuo (cada escala vive DENTRO de la anterior).
 *
 * El experimento central es el de siempre —la ecuación
 * 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂ y el FACTOR LIMITANTE: la tasa es el
 * producto de luz × CO₂ × temperatura, cada factor satura y siempre hay uno
 * que manda— más una variable nueva: el COLOR de la luz. La clorofila absorbe
 * el rojo y el azul y refleja el verde: con luz verde casi todos los fotones
 * rebotan y la planta casi no hace fotosíntesis. Todo se VE: fotones que se
 * absorben o rebotan, burbujas de O₂, estomas que se abren, electrones, H⁺,
 * el rotor de la ATP sintasa y el ciclo de Calvin, que aceleran con la tasa.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { FOTOSINTESIS_FICHA } from "./fotosintesis-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import {
  FASES,
  TIPOS_PLANTA,
  factorCO2,
  factorTemp,
  factorLuz,
  ETIQUETA_FACTOR,
  fmtPct,
  LUZ_MIN, LUZ_MAX, LUZ_STEP, LUZ_DEFAULT,
  CO2_MIN, CO2_MAX, CO2_STEP, CO2_DEFAULT,
  TEMP_MIN, TEMP_MAX, TEMP_STEP, TEMP_DEFAULT, TEMP_OPT,
  QUIZ_A2,
  COLORES_LUZ,
  ESCALAS,
  ABSORCION_COLOR,
  absorcionLuz,
  luzEfectiva,
  tasaConColor,
  factorLimitanteConColor,
  aperturaEstoma,
  burbujasPorMinuto,
  type ColorLuz,
  type EscalaId,
} from "./fotosintesis-data";
import { LabSfx } from "./lab-audio";

const FotosintesisScene = dynamic(() => import("./FotosintesisScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-leaf fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const SOL = "#ffd24a";
const AZUL = "#7fb2ff";
const O2_COL = "#8fd8ff";

const RETO_KEY = "cen-fotosintesis-reto";

/** Lo que se ve moverse en cada escala (leyenda corta sobre la escena). */
const LEYENDA: Record<EscalaId, { col: string; txt: string }[]> = {
  planta: [{ col: SOL, txt: "fotones" }, { col: O2_COL, txt: "burbujas de O₂" }, { col: "#ff6b5e", txt: "CO₂" }],
  hoja: [{ col: "#ff6b5e", txt: "CO₂ / O₂" }, { col: "#67e8f9", txt: "H₂O (xilema)" }, { col: "#ffb454", txt: "glucosa (floema)" }],
  cloroplasto: [{ col: VERDE, txt: "tilacoides" }, { col: "#ff6b5e", txt: "CO₂ / O₂" }, { col: "#ffb454", txt: "glucosa" }],
  tilacoide: [{ col: "#fff3a0", txt: "electrones" }, { col: "#ff8a3d", txt: "H⁺" }, { col: "#ffa53d", txt: "ATP" }, { col: "#c39bff", txt: "NADPH" }],
};

export function LabFotosintesis({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [luz, setLuz] = useState(LUZ_DEFAULT);
  const [co2, setCo2] = useState(CO2_DEFAULT);
  const [temp, setTemp] = useState(TEMP_DEFAULT);
  const [colorLuz, setColorLuz] = useState<ColorLuz>("blanca");
  const [modo, setModo] = useState<EscalaId>("planta");
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [recorrido, setRecorrido] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioProceso] = useState(true);
  const [movioLuz, setMovioLuz] = useState(false);
  const [movioCO2, setMovioCO2] = useState(false);
  const [movioTemp, setMovioTemp] = useState(false);
  const [visitadas, setVisitadas] = useState<EscalaId[]>(["planta"]);
  const [probados, setProbados] = useState<ColorLuz[]>([]);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const irA = useCallback((id: EscalaId) => {
    setModo(id);
    setVisitadas((v) => (v.includes(id) ? v : [...v, id]));
  }, []);

  // Recorrido automático: de la planta al tilacoide y de regreso.
  const modoRef = useRef(modo);
  useEffect(() => { modoRef.current = modo; }, [modo]);
  useEffect(() => {
    if (!recorrido) return undefined;
    const t = window.setInterval(() => {
      const i = ESCALAS.findIndex((e) => e.id === modoRef.current);
      irA(ESCALAS[(i + 1) % ESCALAS.length]!.id);
    }, 7000);
    return () => window.clearInterval(t);
  }, [recorrido, irA]);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarLuz = (v: number) => { setLuz(v); setMovioLuz(true); if (sonido) audioRef.current?.blip(); };
  const cambiarCO2 = (v: number) => { setCo2(v); setMovioCO2(true); if (sonido) audioRef.current?.blip(); };
  const cambiarTemp = (v: number) => { setTemp(v); setMovioTemp(true); if (sonido) audioRef.current?.blip(); };
  const cambiarColor = (c: ColorLuz) => {
    setColorLuz(c);
    setProbados((p) => (p.includes(c) ? p : [...p, c]));
    if (sonido) audioRef.current?.blip();
  };
  const cambiarModo = (id: EscalaId) => { setRecorrido(false); irA(id); if (sonido) audioRef.current?.blip(); };
  const reset = () => { setLuz(LUZ_DEFAULT); setCo2(CO2_DEFAULT); setTemp(TEMP_DEFAULT); setColorLuz("blanca"); bump(); };

  const tPct = useMemo(() => tasaConColor(luz, co2, temp, colorLuz) * 100, [luz, co2, temp, colorLuz]);
  const luzEf = useMemo(() => luzEfectiva(luz, colorLuz), [luz, colorLuz]);
  const fl = useMemo(() => factorLuz(luzEf) * 100, [luzEf]);
  const fc = useMemo(() => factorCO2(co2) * 100, [co2]);
  const ft = useMemo(() => factorTemp(temp) * 100, [temp]);
  const limit = useMemo(() => factorLimitanteConColor(luz, co2, temp, colorLuz), [luz, co2, temp, colorLuz]);
  const absorbe = absorcionLuz(colorLuz) * 100;
  const apertura = aperturaEstoma(luz, temp) * 100;
  const escala = ESCALAS.find((e) => e.id === modo)!;
  const nivel = ESCALAS.findIndex((e) => e.id === modo);
  const opcionColor = COLORES_LUZ.find((c) => c.id === colorLuz)!;

  const visitoTodas = ESCALAS.every((e) => visitadas.includes(e.id));
  const comparoColores = probados.includes("verde") && (probados.includes("roja") || probados.includes("azul"));

  const objetivos = [
    { txt: "Haz zoom: viaja de la planta a la membrana del tilacoide", done: visitoTodas },
    { txt: "Ilumina con luz verde y luego con roja o azul: compara el O₂", done: comparoColores },
    { txt: "Observa el cloroplasto y la ecuación", done: vioProceso },
    { txt: "Sube y baja la luz (mira la saturación)", done: movioLuz },
    { txt: "Cambia la concentración de CO₂", done: movioCO2 },
    { txt: "Busca la temperatura óptima", done: movioTemp },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: VERDE, boxShadow: `0 10px 30px -6px ${VERDE}` }}>
        <i className="fa-solid fa-leaf" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La planta convierte luz en glucosa</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: 6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂. La velocidad del proceso depende de la luz, el CO₂ y la temperatura.
      </div>
    </div>
  );

  // Una frase corta sobre la escena (≤ 10 palabras).
  const lectura = colorLuz === "verde"
    ? <>Luz verde: casi todos los fotones rebotan · tasa {fmtPct(tPct)}</>
    : <>Tasa {fmtPct(tPct)} · ahora limita {ETIQUETA_FACTOR[limit]}</>;

  const retro =
    colorLuz === "verde"
      ? <>Con luz <strong style={{ color: "#3ddc6a" }}>verde</strong> la clorofila absorbe solo ≈ {Math.round(ABSORCION_COLOR.verde * 100)} % de los fotones: los demás rebotan (por eso la hoja se ve verde). Sin energía absorbida casi no se rompe el agua, así que casi no sale O₂.</>
      : colorLuz === "blanca"
        ? <>La luz <strong>blanca</strong> trae fotones rojos, verdes y azules: la clorofila se queda con los rojos y azules y rebota los verdes. Prueba un solo color y compara.</>
        : <>Con luz <strong style={{ color: opcionColor.hex }}>{opcionColor.nombre.toLowerCase()}</strong> la clorofila absorbe ≈ {Math.round(absorbe)} % de los fotones: casi toda la luz se aprovecha y la planta trabaja mejor que con la misma intensidad de luz verde.</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <FotosintesisScene
            luz={luz}
            co2={co2}
            temp={temp}
            color={colorLuz}
            nivel={nivel}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCALAS.map((e) => ({ id: e.id, etiqueta: e.etiqueta, icono: e.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as EscalaId),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-route" titulo={recorrido ? "Detener el recorrido de escalas" : "Recorrido automático por las escalas"} activo={recorrido} onClick={() => setRecorrido((r) => !r)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ display: "grid", gap: 4, minWidth: 150 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span>Tasa</span>
              <span style={{ color: VERDE, fontFamily: "ui-monospace, monospace" }}>{fmtPct(tPct)}</span>
            </div>
            <div style={{ height: 7, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, tPct)}%`, height: "100%", background: `linear-gradient(90deg, ${VERDE}, #b6f36a)`, transition: "width 200ms linear" }} />
            </div>
          </div>
          {LEYENDA[modo].map((l) => (
            <div key={l.txt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#dce6f5" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.col, boxShadow: `0 0 8px ${l.col}`, flexShrink: 0 }} />
              {l.txt}
            </div>
          ))}
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={`Escala: ${escala.etiqueta}`} icono={escala.icono}>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: T.text }}>Tamaño {escala.tamano}.</strong> {escala.queVes}
                </p>
              </Bloque>

              <Bloque titulo="La luz" icono="fa-sun">
                <Deslizador label="Intensidad luminosa" icon="fa-sun" colr={SOL}
                  valor={`${luz}%`} min={LUZ_MIN} max={LUZ_MAX} step={LUZ_STEP} value={luz} onChange={cambiarLuz}
                  hintL="oscuridad" hintR="pleno sol" />
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginTop: 6 }}>Color de la luz</div>
                <div role="radiogroup" aria-label="Color de la luz" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 74px), 1fr))", gap: 6 }}>
                  {COLORES_LUZ.map((c) => {
                    const on = c.id === colorLuz;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => cambiarColor(c.id)}
                        style={{
                          cursor: "pointer", display: "grid", justifyItems: "center", gap: 4, padding: "9px 4px", borderRadius: 12,
                          border: `1px solid ${on ? c.hex : T.line}`, background: on ? `${c.hex}22` : "rgba(2,12,28,0.45)",
                          color: on ? "#fff" : T.text2, fontSize: 14, fontWeight: 800, boxShadow: on ? `0 0 16px -6px ${c.hex}` : "none",
                        }}
                      >
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: c.id === "blanca" ? "conic-gradient(#ff4a3d, #ffd24a, #3ddc6a, #4d7dff, #b07bff, #ff4a3d)" : c.hex, boxShadow: `0 0 10px ${c.hex}` }} />
                        {c.nombre}
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${opcionColor.hex}55`, background: `${opcionColor.hex}12`, color: T.text2 }}>
                  {retro}
                </p>
              </Bloque>

              <Bloque titulo="El aire y el calor" icono="fa-wind">
                <Deslizador label="Concentración de CO₂" icon="fa-wind" colr={AZUL}
                  valor={`${co2}%`} min={CO2_MIN} max={CO2_MAX} step={CO2_STEP} value={co2} onChange={cambiarCO2}
                  hintL="poco CO₂" hintR="mucho CO₂" />
                <Deslizador label="Temperatura" icon="fa-temperature-half" colr={VERDE}
                  valor={`${temp} °C`} min={TEMP_MIN} max={TEMP_MAX} step={TEMP_STEP} value={temp} onChange={cambiarTemp}
                  hintL="frío" hintR={`óptimo ~${TEMP_OPT} °C`} />
              </Bloque>

              <Bloque titulo="¿Qué tan rápido va la fotosíntesis?" icono="fa-chart-simple">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Factor luz" value={fmtPct(fl)} col={SOL} />
                  <Dato label="Factor CO₂" value={fmtPct(fc)} col={AZUL} />
                  <Dato label="Factor temp." value={fmtPct(ft)} col={VERDE} />
                  <Dato label="Tasa total" value={fmtPct(tPct)} col={accent} />
                  <Dato label="Luz absorbida" value={`${Math.round(absorbe)} %`} col={opcionColor.hex} />
                  <Dato label="O₂ (burbujas/min)" value={`${burbujasPorMinuto(tPct / 100)}`} col={O2_COL} />
                  <Dato label="Estomas abiertos" value={`${Math.round(apertura)} %`} col="#ff6b5e" />
                  <Dato label="Giro ATP sintasa" value={fmtPct(tPct)} col="#e85d5d" />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${SOL}55`, background: `${SOL}10` }}>
                  Ahora mismo, lo que más limita la tasa es <strong style={{ color: SOL }}>{ETIQUETA_FACTOR[limit]}</strong>: súbelo y verás acelerar el proceso.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  La tasa total es el producto de los tres factores: si <strong>uno</strong> está bajo, frena a todos los demás (ley del <strong>factor limitante</strong>). Por eso, en un invernadero con mucha luz pero poco CO₂, agregar CO₂ —no más luz— es lo que acelera el crecimiento. La luz y el CO₂ <strong style={{ color: SOL }}>saturan</strong> (pasado cierto punto, más ya casi no ayuda) y la temperatura tiene un <strong style={{ color: VERDE }}>óptimo</strong>: si te pasas, las enzimas del ciclo de Calvin se vuelven menos eficientes.
                </p>
                <p style={{ margin: 0, color: T.text3, fontSize: 14 }}>
                  Burbujas por minuto y giro de la ATP sintasa: simulación proporcional a la tasa, no mediciones de una especie.
                </p>
              </Bloque>

              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Baja la luz casi a cero: el cloroplasto casi deja de emitir O₂ y glucosa. Súbela poco a poco y verás que llega un punto donde más luz ya no acelera nada: ahí el <strong style={{ color: AZUL }}>CO₂</strong> o la <strong style={{ color: VERDE }}>temperatura</strong> pasaron a ser el factor limitante.
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
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="La ecuación" icono="fa-flask">
                <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(4,10,22,0.45)", border: `1px solid ${VERDE}33`, fontSize: 15, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800 }}>
                  <span style={{ color: AZUL }}>6 CO₂</span> + <span style={{ color: "#67e8f9" }}>6 H₂O</span> + <span style={{ color: SOL }}>luz</span> → <span style={{ color: "#ffb454" }}>C₆H₁₂O₆</span> + <span style={{ color: "#e8f4ff" }}>6 O₂</span>
                </div>
              </Bloque>
              <Bloque titulo="El proceso en dos fases" icono="fa-bolt">
                {FASES.map((f) => (
                  <div key={f.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: f.color, background: `${f.color}1f` }}>
                      <i className={`fa-solid ${f.key === "luz" ? "fa-bolt" : "fa-arrows-spin"}`} />
                    </div>
                    <div style={{ color: T.text2, lineHeight: 1.45 }}>
                      <strong style={{ color: f.color }}>{f.nombre}</strong> <span style={{ color: T.text3 }}>({f.lugar})</span> — {f.resumen}
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="¿Por qué las plantas son verdes?" icono="fa-leaf">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: VERDE }}>clorofila</strong> absorbe la luz <strong style={{ color: "#ff6b6b" }}>roja</strong> y la <strong style={{ color: AZUL }}>azul-violeta</strong> para impulsar la fotosíntesis, pero <strong>refleja la verde</strong>: por eso la vemos verde. El <strong>O₂</strong> que respiramos no sale del CO₂, sino de romper el agua (<strong>fotólisis</strong>).
                </p>
                <p style={{ margin: 0, color: T.text3, fontSize: 14 }}>
                  En este laboratorio la clorofila absorbe ≈ {Math.round(ABSORCION_COLOR.roja * 100)} % de los fotones rojos, ≈ {Math.round(ABSORCION_COLOR.azul * 100)} % de los azules y ≈ {Math.round(ABSORCION_COLOR.verde * 100)} % de los verdes (modelo cualitativo, como la clorofila extraída). En una hoja real, los carotenoides y la dispersión de la luz dentro de la hoja aprovechan algo más del verde.
                </p>
              </Bloque>
              <Bloque titulo="Tres estrategias de planta" icono="fa-seedling">
                {TIPOS_PLANTA.map((tp) => (
                  <div key={tp.tipo} style={{ color: T.text2, lineHeight: 1.45 }}>
                    <strong style={{ color: T.text }}>Plantas {tp.tipo}</strong> <span style={{ color: T.text3 }}>({tp.ejemplo})</span>: {tp.ventaja}.
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="En México: la milpa" icono="fa-wheat-awn">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: VERDE }}>milpa</strong> (maíz, frijol y calabaza juntos) aprovecha al máximo la luz por metro cuadrado: el maíz capta la luz directa, el frijol trepa a niveles medios y la calabaza cubre el suelo con la luz difusa. Biodiversidad agrícola al servicio de una fotosíntesis eficiente (UNAM, 2022).
                </p>
              </Bloque>
              <Bloque titulo="Las cuatro escalas del viaje" icono="fa-magnifying-glass-plus">
                {ESCALAS.map((e) => (
                  <div key={e.id} style={{ color: T.text2, lineHeight: 1.45 }}>
                    <strong style={{ color: T.text }}>{e.etiqueta}</strong> <span style={{ color: T.text3 }}>({e.tamano})</span>: {e.queVes}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FOTOSINTESIS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                El modelo de tasa es cualitativo (relativo, en %): muestra la saturación y el factor limitante, no mediciones de una especie concreta. Los tamaños de las escalas son aproximados; moléculas y fotones se dibujan mucho más grandes de lo que son para que se vean.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
