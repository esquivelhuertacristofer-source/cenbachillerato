"use client";

/**
 * Laboratorio 3D — Teorema de Pitágoras.
 * Práctica experimental para PM-III-P01-A2 (calcular distancias reales).
 *
 * Sobre cada lado de un triángulo RECTÁNGULO se construye un cuadrado. El de la
 * hipotenusa (c²) tiene siempre la misma área que la suma de los de los catetos
 * (a² + b²): por eso a² + b² = c². Moviendo los catetos el estudiante descubre
 * la relación, reconoce ternas pitagóricas (lados enteros) y calcula la distancia
 * real (la escalera, la diagonal, el hilo del papalote) cuando conoce dos lados.
 * Pensamiento Matemático III — Triángulo rectángulo y Teorema de Pitágoras (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { PITAGORAS_FICHA } from "./teorema-pitagoras-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./teorema-pitagoras-data";
import { LabSfx } from "./lab-audio";
import {
  ESCENARIOS,
  CAT_MIN,
  CAT_MAX,
  CAT_STEP,
  hipotenusa,
  esTerna,
  fmtNum,
  type Escenario,
} from "./pitagoras-data";

const PitagorasScene = dynamic(() => import("./PitagorasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const B_COL = "#5EE6C5";
const C_COL = "#FFD166";

const RETO_KEY = "cen-teorema-pitagoras-reto";

export function LabPitagoras({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [a, setA] = useState(ESCENARIOS[0]!.a);
  const [b, setB] = useState(ESCENARIOS[0]!.b);
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
  const [movioCateto, setMovioCateto] = useState(false);
  const [vioTerna, setVioTerna] = useState(false);
  const [vioDecimal, setVioDecimal] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());

  const c = useMemo(() => hipotenusa(a, b), [a, b]);
  const terna = useMemo(() => esTerna(a, b), [a, b]);
  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 + b2;

  const aplicarCatetos = (na: number, nb: number) => {
    setA(na);
    setB(nb);
    if (esTerna(na, nb)) setVioTerna(true);
    else setVioDecimal(true);
  };

  const cambiarA = (na: number) => {
    aplicarCatetos(na, b);
    setMovioCateto(true);
  };
  const cambiarB = (nb: number) => {
    aplicarCatetos(a, nb);
    setMovioCateto(true);
  };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    aplicarCatetos(e.a, e.b);
    setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    setResetNonce((n) => n + 1);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    aplicarCatetos(esc.a, esc.b);
    setResetNonce((n) => n + 1);
  };

  const estadoColor = terna ? C_COL : accent;

  const objetivos = [
    { txt: "Mueve un cateto y observa cómo cambia c²", done: movioCateto },
    { txt: "Forma una terna pitagórica (los tres lados enteros)", done: vioTerna },
    { txt: "Encuentra un caso con hipotenusa decimal", done: vioDecimal },
    { txt: "Explora 3 situaciones reales", done: explorados.size >= 3 },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`${a}² + ${b}² = ${c2}`}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: con catetos{" "}
        <strong>{a}</strong> y <strong>{b}</strong>, la hipotenusa mide <strong>{fmtNum(c)} {esc.unidad}</strong> porque a² + b² = c².
      </div>
    </div>
  );

  // Medidor: las áreas de los catetos (apiladas) frente al área de la hipotenusa.
  const barraA = (a2 / c2) * 100;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <PitagorasScene a={a} b={b} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Volver al escenario" onClick={reset} />
        </>
      }
      leyenda={
        <div style={{ width: 176, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Áreas</div>
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
            <div style={{ width: `${barraA}%`, background: accent, transition: "width 150ms" }} />
            <div style={{ flex: 1, background: B_COL, transition: "width 150ms" }} />
          </div>
          <div style={{ fontSize: 14, color: T.text2, ...NUM }}>a² + b² = {c2}</div>
          <div style={{ height: 12, borderRadius: 6, background: C_COL }} />
          <div style={{ fontSize: 14, color: C_COL, fontWeight: 800, ...NUM }}>c² = {c2}</div>
        </div>
      }
      lectura={
        <>
          <span style={{ color: accent, ...NUM }}>{a}²</span> + <span style={{ color: B_COL, ...NUM }}>{b}²</span> = <span style={{ color: C_COL, ...NUM }}>{c2}</span> → c = {fmtNum(c)} {esc.unidad}
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
                <Deslizador label={`Cateto a · ${esc.aNombre}`} colr={accent} valor={`${a} ${esc.unidad}`} min={CAT_MIN} max={CAT_MAX} step={CAT_STEP} value={a} onChange={cambiarA} />
                <Deslizador label={`Cateto b · ${esc.bNombre}`} colr={B_COL} valor={`${b} ${esc.unidad}`} min={CAT_MIN} max={CAT_MAX} step={CAT_STEP} value={b} onChange={cambiarB} />
              </Bloque>
              <Bloque titulo="Las áreas ahora" icono="fa-vector-square">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="a²" value={String(a2)} col={accent} />
                  <Dato label="b²" value={String(b2)} col={B_COL} />
                  <Dato label="c² = a² + b²" value={String(c2)} col={C_COL} />
                  <Dato label={`c (${esc.cNombre})`} value={`${fmtNum(c)} ${esc.unidad}`} col={terna ? C_COL : "#c8d6e6"} />
                  <Dato label="Explorados" value={`${explorados.size}/${ESCENARIOS.length}`} col={accent} />
                  <Dato label="Triángulo" value={terna ? "Lados enteros" : "Con decimales"} col={terna ? C_COL : "#c8d6e6"} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${estadoColor}55`, background: `${estadoColor}14`, fontWeight: 700 }}>
                  <i className={`fa-solid ${terna ? "fa-star" : "fa-square-root-variable"}`} style={{ color: estadoColor, marginRight: 8 }} aria-hidden />
                  {terna
                    ? `Los tres lados son enteros: ${a}, ${b} y ${fmtNum(c)} forman una terna pitagórica.`
                    : `La hipotenusa es c = √${c2} = ${fmtNum(c)} ${esc.unidad}: no todos los triángulos rectángulos tienen lados enteros.`}
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
              <Bloque titulo="Por qué funciona" icono="fa-down-left-and-up-right-to-center">
                <p style={{ margin: 0, color: T.text2 }}>
                  El cuadrado dorado de la hipotenusa contiene exactamente <strong style={{ color: T.text }}>tantos cuadritos</strong> como los dos cuadrados de los catetos juntos. Cuéntalos: el área del grande (<strong style={{ color: C_COL }}>c²</strong>) es igual a la suma de las áreas de los chicos (<strong style={{ color: accent }}>a²</strong> + <strong style={{ color: B_COL }}>b²</strong>). Por eso, si conoces dos lados de un triángulo rectángulo, puedes calcular el tercero: <strong style={{ color: T.text }}>c = √(a² + b²)</strong>.
                </p>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, fontWeight: 700 }}>{esc.porque}</p>
              </Bloque>
              <Bloque titulo="Cómo calcular un lado" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>Identifica el ángulo recto: sus dos lados son los <strong>catetos</strong> (a y b).</li>
                  <li>El lado frente al ángulo recto es la <strong>hipotenusa</strong> (c), siempre el más largo.</li>
                  <li>Eleva al cuadrado, suma y saca raíz: <strong style={{ color: T.text }}>c = √(a² + b²)</strong>.</li>
                </ol>
              </Bloque>
              <Bloque titulo="Ternas pitagóricas" icono="fa-star">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una <strong style={{ color: C_COL }}>terna pitagórica</strong> (como 3-4-5 o 5-12-13) es un triángulo rectángulo con los tres lados enteros. Son raras: la mayoría dan hipotenusa con decimales. El Teorema de Pitágoras convierte dos medidas que sí puedes tomar (los catetos) en una que no siempre alcanzas a medir: la <strong style={{ color: T.text }}>distancia en diagonal</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PITAGORAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
