"use client";

/**
 * Laboratorio 3D — Biomas y ecosistemas: clima → vida.
 * Práctica experimental para CNEYT-III-P01-A1 (infografía; progresión 1).
 *
 * El alumno mueve la temperatura media anual y la precipitación y descubre qué
 * BIOMA emerge —tipo diagrama de Whittaker— sobre un diorama 3D que se
 * transforma (selva, desierto, bosque templado, pastizal, manglar, tundra),
 * anclado a ejemplos reales de México: el país megadiverso con 12 de los 14
 * biomas terrestres, su fauna emblemática y su estado de conservación.
 * EXPERIMENTO CENTRAL: dos medidores 3D (termómetro y pluviómetro) junto al
 * diorama muestran el clima elegido, con marcas blancas en los umbrales donde
 * el bioma cambia; el diagrama de Whittaker del panel se puede tocar.
 * Ecosistemas, interacciones y energía — biomas y biodiversidad (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import {
  BIOMAS, BIOMAS_LISTA, ESCENARIOS, CIFRAS_MX, DATOS_MX, biomaDe,
  TEMP_MIN, TEMP_MAX, TEMP_STEP, TEMP_DEFAULT,
  PRECIP_MIN, PRECIP_MAX, PRECIP_STEP, PRECIP_DEFAULT,
  fmt0, type BiomaKey,
} from "./biomas-data";
import { FichaTeorica } from "./_ficha";
import { BIOMAS_FICHA } from "./biomas-ecosistemas-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./biomas-ecosistemas-data";
import { LabSfx } from "./lab-audio";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-biomas-ecosistemas-reto";

const BiomasScene = dynamic(() => import("./BiomasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Sembrando el bioma…</span>
    </div>
  ),
});

const AZUL = "#3aa0ff";

export function LabBiomas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [temp, setTemp] = useState(TEMP_DEFAULT);
  const [precip, setPrecip] = useState(PRECIP_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
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

  // objetivos: descubrir biomas distintos
  const [vistos, setVistos] = useState<Record<string, boolean>>({});

  const bump = () => setResetNonce((n) => n + 1);

  const bioma = useMemo(() => BIOMAS[biomaDe(temp, precip)], [temp, precip]);

  // registra el bioma actual como "visto"
  if (!vistos[bioma.key]) setVistos((v) => ({ ...v, [bioma.key]: true }));
  const nVistos = Object.keys(vistos).length;

  const cargar = (t: number, p: number) => {
    setTemp(t); setPrecip(p); bump();
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => cargar(TEMP_DEFAULT, PRECIP_DEFAULT);

  // ── diagrama de Whittaker: malla coloreada por biomaDe ──
  const COLS = 28, ROWS = 20;
  const celdas = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; col: string }[] = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const t = TEMP_MIN + ((c + 0.5) / COLS) * (TEMP_MAX - TEMP_MIN);
        const p = PRECIP_MIN + ((r + 0.5) / ROWS) * (PRECIP_MAX - PRECIP_MIN);
        out.push({
          x: (c / COLS) * 100,
          y: 100 - ((r + 1) / ROWS) * 100, // precip crece hacia arriba
          w: 100 / COLS + 0.4,
          h: 100 / ROWS + 0.4,
          col: BIOMAS[biomaDe(t, p)].colorVeg,
        });
      }
    }
    return out;
  }, []);
  const markX = ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
  const markY = 100 - ((precip - PRECIP_MIN) / (PRECIP_MAX - PRECIP_MIN)) * 100;

  // Tocar o arrastrar sobre el diagrama fija el clima de ese punto.
  const alDiagrama = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === "pointermove" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setTemp(Math.round((TEMP_MIN + fx * (TEMP_MAX - TEMP_MIN)) / TEMP_STEP) * TEMP_STEP);
    setPrecip(Math.round((PRECIP_MIN + (1 - fy) * (PRECIP_MAX - PRECIP_MIN)) / PRECIP_STEP) * PRECIP_STEP);
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-seedling" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El clima dibuja la vida</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el diorama en 3D, pero la idea sigue: la temperatura y la lluvia de un lugar deciden qué bioma se forma —selva, desierto, bosque o manglar— y qué seres vivos lo habitan. Usa el diagrama del panel para explorarlo.
      </div>
    </div>
  );

  const nombreCorto = bioma.nombre.split(" (")[0]!.split(" / ")[0]!;
  const lectura = <>{fmt0(temp)} °C y {fmt0(precip)} mm → {nombreCorto}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <BiomasScene
            temp={temp} precip={precip}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontWeight: 900, color: bioma.colorVeg }}>
            <i className={`fa-solid ${bioma.icono}`} style={{ marginRight: 7 }} />
            {nombreCorto}
          </div>
          <div style={{ color: T.text2 }}>Medidores: marca blanca = cambia el bioma</div>
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Enfría el lugar por debajo de 2 °C y mira aparecer la tundra", done: !!vistos.tundra },
        { txt: "Seca el lugar: baja la lluvia hasta que solo queden cactus", done: !!vistos.desierto },
        { txt: "Mueve la temperatura y mira cómo cambia el bioma", done: temp !== TEMP_DEFAULT },
        { txt: "Mueve la precipitación y encuentra un bioma seco", done: precip !== PRECIP_DEFAULT },
        { txt: "Descubre al menos cuatro de los siete biomas", done: Object.keys(vistos).length >= 4 },
        { txt: "Descubre los siete biomas", done: Object.keys(vistos).length >= BIOMAS_LISTA.length },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="El clima del lugar" icono="fa-sliders">
                <Deslizador label="Temperatura media anual" icon="fa-temperature-half" colr={accent}
                  valor={`${fmt0(temp)} °C`} min={TEMP_MIN} max={TEMP_MAX} step={TEMP_STEP} value={temp}
                  onChange={setTemp} hintL={`${TEMP_MIN}° (frío)`} hintR={`${TEMP_MAX}° (cálido)`} />
                <Deslizador label="Precipitación anual" icon="fa-cloud-showers-heavy" colr={AZUL}
                  valor={`${fmt0(precip)} mm`} min={PRECIP_MIN} max={PRECIP_MAX} step={PRECIP_STEP} value={precip}
                  onChange={setPrecip} hintL="0 mm (árido)" hintR={`${fmt0(PRECIP_MAX)} mm (muy húmedo)`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => (
                    <button key={e.label} title={e.desc} onClick={() => cargar(e.temp, e.precip)}
                      style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, color: T.text2, fontSize: 14, fontWeight: 800, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                      {e.label}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Diagrama de Whittaker: toca un punto" icono="fa-chart-area">
                <div style={{ position: "relative" }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Diagrama de Whittaker: toca para elegir temperatura y precipitación"
                    onPointerDown={alDiagrama} onPointerMove={alDiagrama}
                    style={{ width: "100%", height: 220, borderRadius: 10, border: `1px solid ${T.line}`, display: "block", cursor: "crosshair", touchAction: "none" }}>
                    {celdas.map((c, i) => (
                      <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.col} opacity={0.9} />
                    ))}
                    <circle cx={markX} cy={markY} r={3.4} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1.1} />
                    <circle cx={markX} cy={markY} r={6.2} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.7} />
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 14, color: T.text3, fontWeight: 700 }}>
                    <span>↑ Lluvia (mm/año)</span>
                    <span>Temperatura (°C) →</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 6 }}>
                  {BIOMAS_LISTA.map((b) => {
                    const activo = b.key === bioma.key;
                    const visto = !!vistos[b.key as BiomaKey];
                    return (
                      <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8, opacity: activo ? 1 : 0.7, fontWeight: activo ? 800 : 500 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, background: b.colorVeg, border: activo ? "2px solid #fff" : "none", flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: activo ? "#fff" : T.text2 }}>{b.nombre.split(" (")[0]!.split(" / ")[0]}{visto ? " ✓" : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </Bloque>

              <Bloque titulo="Lectura del bioma" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Temperatura" value={`${fmt0(temp)} °C`} col={accent} />
                  <Dato label="Precipitación" value={`${fmt0(precip)} mm`} col={AZUL} />
                  <Dato label="Vegetación" value={`${fmt0(bioma.densidad * 100)} %`} col={bioma.colorVeg} />
                  <Dato label="Biomas vistos" value={`${nVistos} / 7`} col="#34D399" />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{bioma.resumen}</p>
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
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
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
              <Bloque titulo={bioma.nombre} icono={bioma.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{bioma.resumen}</p>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: bioma.colorVeg }}>EN MÉXICO</div>
                <p style={{ margin: 0, color: T.text2 }}>{bioma.ejemploMx}</p>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: bioma.colorVeg }}>ESPECIES REPRESENTATIVAS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {bioma.especies.map((sp, i) => (
                    <span key={i} style={{ fontSize: 14, fontWeight: 700, color: "#eaf2fb", padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: `1px solid ${T.line}` }}>{sp}</span>
                  ))}
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 10, background: "rgba(2,12,28,0.4)", border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: bioma.colorVeg, marginRight: 7 }} />
                  {bioma.dato}
                </p>
              </Bloque>
              <Bloque titulo="México megadiverso" icono="fa-earth-americas">
                {CIFRAS_MX.map((cf, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${cf.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{cf.valor}</strong>
                      <div style={{ color: T.text2 }}>{cf.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Megadiversidad y conservación" icono="fa-shield-halved">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {DATOS_MX.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={BIOMAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Modelo cualitativo con fines didácticos: los umbrales de temperatura y precipitación siguen el esquema clásico de Whittaker para mostrar la relación clima→bioma, no para clasificar un sitio con precisión. El manglar, además, depende de ser costa salobre (agua salada poco profunda) y no solo del clima; aquí se aproxima en el extremo cálido y muy húmedo. Datos de México verbatim: CONABIO 2023, CONAFOR 2020 y SEMARNAT 2022.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
