"use client";

/**
 * Laboratorio 3D — Semejanza de triángulos: mido una altura inalcanzable.
 * Práctica experimental para PM-III-P05-A2 (progresión 5).
 *
 * El Sol proyecta rayos PARALELOS sobre una persona (referencia, de altura
 * conocida) y sobre una torre (el objeto que no podemos medir directamente).
 * Cada objeto con su sombra forma un triángulo rectángulo; como los rayos son
 * paralelos, ambos triángulos comparten el mismo ángulo → son SEMEJANTES (AA), y
 * sus lados son proporcionales:  altura_obj / sombra_obj = altura_ref / sombra_ref.
 * De ahí se despeja la altura de la torre midiendo solo sombras y una estatura.
 * Experimento central: al mover el Sol, las dos sombras se alargan a la par, pero
 * la razón de semejanza k y la altura calculada NO cambian (medidor en la escena).
 * Pensamiento Matemático III — semejanza y congruencia (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { SEMEJANZA_FICHA } from "./semejanza-triangulos-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./semejanza-triangulos-data";
import { LabSfx } from "./lab-audio";
import {
  CASO,
  CRITERIOS_SEMEJANZA,
  CRITERIOS_CONGRUENCIA,
  sombra,
  razonK,
  alturaIndirecta,
  fmtM,
  fmtNum,
  ANG_MIN, ANG_MAX, ANG_STEP, ANG_DEFAULT,
  HREF_MIN, HREF_MAX, HREF_STEP, HREF_DEFAULT,
  HOBJ_MIN, HOBJ_MAX, HOBJ_STEP, HOBJ_DEFAULT,
} from "./semejanza-data";

const SemejanzaScene = dynamic(() => import("./SemejanzaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-vertical fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const SOL = "#ffd24a";
const AZUL = "#7fb2ff";

const RETO_KEY = "cen-semejanza-triangulos-reto";

export function LabSemejanza({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [ang, setAng] = useState(ANG_DEFAULT);
  const [hRef, setHRef] = useState(HREF_DEFAULT);
  const [hObj, setHObj] = useState(HOBJ_DEFAULT);
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

  // objetivos
  const [movioSol, setMovioSol] = useState(false);
  const [solBajo, setSolBajo] = useState(false);
  const [solAlto, setSolAlto] = useState(false);
  const [movioAlturas, setMovioAlturas] = useState(false);
  const [usoCaso, setUsoCaso] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarAng = (v: number) => {
    setAng(v);
    setMovioSol(true);
    if (v <= 35) setSolBajo(true);
    if (v >= 70) setSolAlto(true);
    if (sonido) audioRef.current?.blip();
  };
  const cambiarHRef = (v: number) => { setHRef(v); setMovioAlturas(true); };
  const cambiarHObj = (v: number) => { setHObj(v); setMovioAlturas(true); };
  const reset = () => { setAng(ANG_DEFAULT); setHRef(HREF_DEFAULT); setHObj(HOBJ_DEFAULT); bump(); };
  const ponerCaso = () => { setHRef(CASO.hRef); setHObj(CASO.hObj); setAng(CASO.ang); setUsoCaso(true); bump(); if (sonido) audioRef.current?.blip(); };

  const sRef = useMemo(() => sombra(hRef, ang), [hRef, ang]);
  const sObj = useMemo(() => sombra(hObj, ang), [hObj, ang]);
  const k = useMemo(() => razonK(hObj, hRef), [hObj, hRef]);
  const hCalc = useMemo(() => alturaIndirecta(hRef, sObj, sRef), [hRef, sObj, sRef]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mido una altura sin treparme a ella</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una persona y una torre proyectan sombras al mismo Sol. Como los triángulos son semejantes, altura_obj / sombra_obj = altura_ref / sombra_ref.
      </div>
    </div>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <SemejanzaScene ang={ang} hRef={hRef} hObj={hObj} accent={accent} pausado={pausado} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar los rayos" : "Pausar los rayos"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-clock" titulo="Caso de Sofía" onClick={ponerCaso} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorSombras sRef={sRef} sObj={sObj} k={k} accent={accent} />}
      lectura={<>Torre = {fmtM(hCalc)} · k = {fmtNum(k)} (no cambia con el Sol)</>}
      objetivos={[
        { txt: "Mueve el Sol y mira cómo cambian las sombras", done: movioSol },
        { txt: "Baja el Sol a 35° o menos y luego súbelo a 70° o más: las sombras cambian, k NO", done: solBajo && solAlto },
        { txt: "Cambia las alturas", done: movioAlturas },
        { txt: "Reproduce el caso de Sofía", done: usoCaso },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Ajusta la escena" icono="fa-sliders">
                <Deslizador label="Elevación del Sol" icon="fa-sun" colr={SOL}
                  valor={`${ang}°`} min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={ang} onChange={cambiarAng}
                  hintL="Sol bajo: sombras largas" hintR="Sol alto: sombras cortas" />
                <Deslizador label="Altura de la persona" icon="fa-person" colr={accent}
                  valor={fmtM(hRef)} min={HREF_MIN} max={HREF_MAX} step={HREF_STEP} value={hRef} onChange={cambiarHRef}
                  hintL="1.20 m" hintR="2.00 m" />
                <Deslizador label="Altura real de la torre" icon="fa-tower-observation" colr={VERDE}
                  valor={fmtM(hObj)} min={HOBJ_MIN} max={HOBJ_MAX} step={HOBJ_STEP} value={hObj} onChange={cambiarHObj}
                  hintL="5 m" hintR="40 m" />
              </Bloque>

              <Bloque titulo="¿Qué dicen las sombras?" icono="fa-chart-simple">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Sombra persona" value={fmtM(sRef)} col={accent} />
                  <Dato label="Sombra torre" value={fmtM(sObj)} col={VERDE} />
                  <Dato label="Razón k" value={fmtNum(k)} col={SOL} />
                  <Dato label="Altura calculada" value={fmtM(hCalc)} col={VERDE} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  altura_torre / {fmtNum(sObj)} = {fmtNum(hRef)} / {fmtNum(sRef)}, así que altura_torre = <strong style={{ color: SOL }}>{fmtM(hCalc)}</strong>. Baja el Sol y las dos sombras crecen a la par: la proporción y este resultado no cambian.
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
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El caso de la actividad" icono="fa-clock">
                <p style={{ margin: 0, color: T.text2 }}>
                  Sofía mide <strong style={{ color: accent }}>1.60 m</strong> y proyecta <strong>0.80 m</strong> de sombra; la torre del reloj proyecta <strong>12.40 m</strong>. Entonces la torre mide <strong style={{ color: VERDE }}>24.8 m</strong> y k = <strong style={{ color: SOL }}>15.5</strong>. Un monumento con sombra de <strong>3.2 m</strong>, en el mismo instante, mide <strong style={{ color: VERDE }}>6.4 m</strong>. Pulsa el reloj de la escena para reproducirlo.
                </p>
              </Bloque>
              <Bloque titulo="Criterios de semejanza (≈)" icono="fa-shapes">
                {CRITERIOS_SEMEJANZA.map((c) => <CriterioFila key={c.sigla} c={c} col={SOL} />)}
              </Bloque>
              <Bloque titulo="Criterios de congruencia (≅)" icono="fa-equals">
                {CRITERIOS_CONGRUENCIA.map((c) => <CriterioFila key={c.sigla} c={c} col={AZUL} />)}
                <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>
                  Congruentes (≅): misma forma <em>y</em> tamaño. Semejantes (≈): misma forma, distinto tamaño (k ≠ 1). Toda figura es semejante a sí misma con k = 1. Las áreas crecen con k², los volúmenes con k³.
                </p>
              </Bloque>
              <Bloque titulo="Una técnica milenaria" icono="fa-landmark">
                <p style={{ margin: 0, color: T.text2 }}>
                  Egipcios y griegos ya medían pirámides y barcos lejanos con sombras y proporciones. Hoy la <strong style={{ color: accent }}>semejanza</strong> sostiene la topografía, la arquitectura, los mapas a escala y hasta la fotografía. Medir lo inalcanzable sin tocarlo: pura geometría.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={SEMEJANZA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: las sombras crecen, la razón k se queda ─────────────────── */
function MedidorSombras({ sRef, sObj, k, accent }: { sRef: number; sObj: number; k: number; accent: string }) {
  const TOPE = sombra(HOBJ_MAX, ANG_MIN); // sombra más larga posible
  const barra = (txt: string, val: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtM(val)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / TOPE) * 100)}%`, minWidth: 3, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 190 }}>
      {barra("sombra persona", sRef, accent)}
      {barra("sombra torre", sObj, VERDE)}
      <div style={{ fontSize: 14, fontWeight: 900, color: SOL }}>
        k = {fmtNum(k)} <span style={{ color: "#9fb2c8", fontWeight: 700 }}>siempre igual</span>
      </div>
    </div>
  );
}

function CriterioFila({ c, col }: { c: { sigla: string; desc: string }; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, minWidth: 74, textAlign: "center", padding: "3px 8px", borderRadius: 7, fontSize: 14, fontWeight: 900, color: col, background: `${col}1f` }}>{c.sigla}</div>
      <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.45 }}>{c.desc}</div>
    </div>
  );
}
