"use client";

/**
 * Laboratorio 3D — Volumen de un cilindro (la capacidad de un tanque).
 * Práctica experimental para PM-III-P04-A2.
 *
 * Un tanque cilíndrico que se llena de líquido. El volumen es el área de la base
 * circular (π·r²) por la altura (h): V = π·r²·h. Moviendo el radio, la altura y
 * el nivel de llenado el estudiante descubre la fórmula, lee la capacidad real en
 * litros (1 m³ = 1000 L) y comprueba que —como el radio está al cuadrado—
 * ensanchar el tanque sube el volumen mucho más rápido que hacerlo más alto.
 * Pensamiento Matemático III — Perímetros, áreas y volúmenes (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CILINDRO_FICHA } from "./volumen-cilindro-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./volumen-cilindro-data";
import { LabSfx } from "./lab-audio";
import {
  ESCENARIOS,
  R_MIN, R_MAX, R_STEP,
  H_MIN, H_MAX, H_STEP,
  volumen,
  areaBase,
  litros,
  fmtNum,
  type Escenario,
} from "./cilindro-data";

const CilindroScene = dynamic(() => import("./CilindroScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fill-drip fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AGUA = "#3BA7FF";

function colorLiquido(liquido: string): string {
  const l = liquido.toLowerCase();
  if (l.includes("combustible")) return "#F0A030";
  if (l.includes("grano")) return "#E0B341";
  return AGUA;
}

const RETO_KEY = "cen-volumen-cilindro-reto";

export function LabCilindro({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [r, setR] = useState(ESCENARIOS[0]!.r);
  const [h, setH] = useState(ESCENARIOS[0]!.h);
  const [fill, setFill] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

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

  // seguimiento de objetivos
  const [movioRadio, setMovioRadio] = useState(false);
  const [movioAltura, setMovioAltura] = useState(false);
  const [llenoLlenado, setLlenoLlenado] = useState(false);
  const [duplicoRadio, setDuplicoRadio] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());

  const V = useMemo(() => volumen(r, h), [r, h]);
  const Lt = useMemo(() => litros(r, h), [r, h]);
  const A = useMemo(() => areaBase(r), [r]);
  const Lagua = Lt * fill;
  const vecesOrig = Lt / litros(esc.r, esc.h);
  const fillColor = useMemo(() => colorLiquido(esc.liquido), [esc]);

  const cambiarR = (nr: number) => {
    setR(nr);
    setMovioRadio(true);
    if (Math.abs(nr - 2 * esc.r) < 0.05) setDuplicoRadio(true);
  };
  const cambiarH = (nh: number) => { setH(nh); setMovioAltura(true); };
  const cambiarFill = (f: number) => {
    setFill(f);
    if (f >= 0.999) setLlenoLlenado(true);
  };

  const cargar = (e: Escenario) => {
    if (sonido) audioRef.current?.blip();
    setEscKey(e.key);
    setR(e.r);
    setH(e.h);
    setFill(1);
    setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setR(esc.r);
    setH(esc.h);
    setFill(1);
    setResetNonce((n) => n + 1);
  };

  const objetivos = [
    { txt: "Duplica el radio y comprueba que el volumen se hace 4 veces mayor", done: duplicoRadio },
    { txt: "Mueve el radio y observa cómo cambia el volumen", done: movioRadio },
    { txt: "Mueve la altura y compara su efecto con el del radio", done: movioAltura },
    { txt: "Llena un tanque al 100 % y lee su capacidad", done: llenoLlenado },
    { txt: "Explora 3 tanques reales distintos", done: explorados.size >= 3 },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`V = π·${fmtNum(r)}²·${fmtNum(h)} = ${fmtNum(V, 3)} m³`}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: un tanque de radio{" "}
        <strong>{fmtNum(r)} m</strong> y altura <strong>{fmtNum(h)} m</strong> almacena <strong>{fmtNum(Lt, 0)} litros</strong>.
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
          <CilindroScene r={r} h={h} fill={fill} accent={accent} fillColor={fillColor} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCENARIOS.map((e) => ({ id: e.key, etiqueta: e.titulo, icono: e.icono })),
        valor: escKey,
        cambiar: (id) => {
          const e = ESCENARIOS.find((x) => x.key === id);
          if (e) cargar(e);
        },
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Volver al tanque" onClick={reset} />
        </>
      }
      leyenda={
        <div style={{ width: 176, display: "grid", gap: 4 }}>
          <div style={{ fontSize: 14, color: T.text2 }}>Capacidad vs. tanque original</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: accent, ...NUM }}>×{fmtNum(vecesOrig, 2)}</div>
          <div style={{ fontSize: 14, color: T.text2, ...NUM }}>{fmtNum(Lt, 0)} L</div>
        </div>
      }
      lectura={
        <>
          V = π·r²·h = <span style={{ color: accent, ...NUM }}>{fmtNum(V, 3)} m³</span> = {fmtNum(Lt, 0)} L · lleno {Math.round(fill * 100)} %
        </>
      }
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={esc.titulo} icono={esc.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{esc.contexto}</p>
                <Deslizador label="Radio · r" colr={accent} valor={`${fmtNum(r)} m`} min={R_MIN} max={R_MAX} step={R_STEP} value={r} onChange={cambiarR} />
                <Deslizador label="Altura · h" colr="#cfe2f5" valor={`${fmtNum(h)} m`} min={H_MIN} max={H_MAX} step={H_STEP} value={h} onChange={cambiarH} />
                <Deslizador label={`Nivel de llenado · ${esc.liquido}`} colr={fillColor} valor={`${Math.round(fill * 100)} %`} min={0} max={1} step={0.01} value={fill} onChange={cambiarFill} />
              </Bloque>
              <Bloque titulo="Las medidas ahora" icono="fa-layer-group">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Área base π·r²" value={`${fmtNum(A, 3)} m²`} col={accent} />
                  <Dato label="Volumen total" value={`${fmtNum(V, 3)} m³`} col="#cfe2f5" />
                  <Dato label="Capacidad" value={`${fmtNum(Lt, 0)} L`} col={accent} />
                  <Dato label="Contenido actual" value={`${fmtNum(Lagua, 0)} L`} col={fillColor} />
                  <Dato label="Explorados" value={`${explorados.size}/${ESCENARIOS.length}`} col={accent} />
                  <Dato label="Llenado" value={`${Math.round(fill * 100)}%`} col={fillColor} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)`, fontWeight: 700 }}>
                  <i className="fa-solid fa-layer-group" style={{ color: accent, marginRight: 8 }} aria-hidden />
                  El volumen es <strong>apilar discos</strong>: cada disco mide π·r² = {fmtNum(A, 3)} m², y hay {fmtNum(h)} m de altura → V = {fmtNum(A, 3)} × {fmtNum(h)} = {fmtNum(V, 3)} m³.
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
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Por qué funciona" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>
                  Un cilindro es una <strong style={{ color: T.text }}>pila de discos</strong> iguales. El área de cada disco es la de un círculo, <strong style={{ color: accent }}>π·r²</strong>, y al multiplicarla por la <strong style={{ color: "#cfe2f5" }}>altura</strong> obtienes cuánto espacio ocupa: <strong style={{ color: T.text }}>V = π·r²·h</strong>. Si pasas los metros cúbicos a litros (×1000) tienes la capacidad real del tanque. Como el radio va <strong style={{ color: T.text }}>al cuadrado</strong>, ensanchar el tanque almacena mucho más que hacerlo más alto.
                </p>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, fontWeight: 700 }}>{esc.porque}</p>
              </Bloque>
              <Bloque titulo="Cómo calcular la capacidad" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>Área de la base: <strong>π·r²</strong> (el círculo de la tapa).</li>
                  <li>Multiplica por la altura: <strong>V = π·r²·h</strong> (en m³).</li>
                  <li>Pasa a litros: <strong>×1000</strong> (1 m³ = 1000 L).</li>
                </ol>
              </Bloque>
              <Bloque titulo="Radio al cuadrado" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Prueba: <strong style={{ color: T.text }}>duplica el radio</strong> y mira el volumen: se hace <strong style={{ color: accent }}>4 veces mayor</strong>, porque el radio está al cuadrado. Duplicar la altura solo lo duplica. Saber el volumen de un cilindro te dice cuánta agua cabe en un tinaco, cuánto combustible en un tambo o cuánto grano en un silo: una sola fórmula, <strong style={{ color: accent }}>V = π·r²·h</strong>, para todos.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CILINDRO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
