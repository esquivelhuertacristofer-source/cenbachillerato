"use client";

/**
 * Laboratorio 3D — Productos notables: área y volumen.
 * Práctica experimental para PM-II-P08-A8 ("Ejercicio — Productos notables y
 * operaciones con polinomios").
 *
 * Un producto notable no se memoriza, se VE como una figura que se descompone:
 *   (a+b)²        → área de un cuadrado de lado (a+b)  → a² + 2ab + b²
 *   (a+b)³        → volumen de un cubo de arista (a+b) → a³ + 3a²b + 3ab² + b³
 *   (a+b)(a−b)    → un cuadrado a² menos un cuadrado b² → a² − b²
 * EXPERIMENTO CENTRAL: despiezar la figura con el deslizador de separación y
 * comparar contra el error clásico (a+b)² = a² + b²: el medidor muestra cuánto
 * falta (los dos rectángulos ab, o las losas y columnas del cubo).
 * El cubo (a+b)³ es donde el 3D realmente aporta: es imposible verlo en 2D.
 * Pensamiento Matemático II — Productos notables (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { PRODUCTOS_NOTABLES_FICHA } from "./productos-notables-3d-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./productos-notables-3d-data";
import { LabSfx } from "./lab-audio";
import {
  MODOS,
  cuadrado,
  cubo,
  conjugados,
  numerico,
  fmtNum,
  A_MIN, A_MAX, A_STEP,
  B_MIN, B_MAX, B_STEP,
  type Modo,
  type ModoInfo,
} from "./productos-data";

const ProductosScene = dynamic(() => import("./ProductosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cube fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const PINK = "#FF6FA5";
const ROJO = "#FF6B6B";

const RETO_KEY = "cen-productos-notables-3d-reto";

export function LabProductos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modoKey, setModoKey] = useState<Modo>("cuadrado");
  const modo = useMemo<ModoInfo>(() => MODOS.find((m) => m.key === modoKey) ?? MODOS[0]!, [modoKey]);

  const [a, setA] = useState(3);
  const [b, setB] = useState(1.5);
  const [sep, setSep] = useState(0);
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

  // objetivos
  const [vioCuadrado, setVioCuadrado] = useState(true); // arranca en cuadrado
  const [vioCubo, setVioCubo] = useState(false);
  const [vioConjugados, setVioConjugados] = useState(false);
  const [despiezo, setDespiezo] = useState(false);
  const [despiezoCuadrado, setDespiezoCuadrado] = useState(false);
  const [movioLados, setMovioLados] = useState(false);

  const cuad = cuadrado(a, b);
  const cub = cubo(a, b);
  const conj = conjugados(a, b);
  const conjValido = a > b;

  const cambiarModo = (id: string) => {
    const k = id as Modo;
    if (sonido) audioRef.current?.blip();
    setModoKey(k);
    setSep(0);
    setResetNonce((n) => n + 1);
    if (k === "cuadrado") setVioCuadrado(true);
    if (k === "cubo") setVioCubo(true);
    if (k === "conjugados") setVioConjugados(true);
  };

  const cambiarA = (v: number) => { setA(v); setMovioLados(true); };
  const cambiarB = (v: number) => { setB(v); setMovioLados(true); };
  const cambiarSep = (v: number) => {
    setSep(v);
    if (v > 0.5) {
      setDespiezo(true);
      if (modoKey === "cuadrado") setDespiezoCuadrado(true);
    }
  };

  const reset = () => { setSep(0); setResetNonce((n) => n + 1); };

  const objetivos = [
    { txt: "Despieza el cuadrado y descubre cuánto falta si solo sumas a² + b²", done: despiezoCuadrado },
    { txt: "Mueve los lados a y b y observa la figura", done: movioLados },
    { txt: "Despieza la figura para ver cada término", done: despiezo },
    { txt: "Explora el cubo (a + b)³ en 3D", done: vioCubo },
    { txt: "Explora los tres productos notables", done: vioCuadrado && vioCubo && vioConjugados },
    { txt: "Resuelve el reto evaluable de la actividad A8", done: ejercicioAprobado },
  ];

  // chips de términos según el modo
  const terminos = useMemo(() => {
    if (modoKey === "cuadrado") {
      return [
        { lbl: "a²", val: fmtNum(cuad.a2), col: accent },
        { lbl: "2ab", val: fmtNum(cuad.dosAB), col: TEAL },
        { lbl: "b²", val: fmtNum(cuad.b2), col: AMBER },
        { lbl: "(a+b)²", val: fmtNum(cuad.total), col: T.text },
      ];
    }
    if (modoKey === "cubo") {
      return [
        { lbl: "a³", val: fmtNum(cub.a3), col: accent },
        { lbl: "3a²b", val: fmtNum(cub.tresA2B), col: TEAL },
        { lbl: "3ab²", val: fmtNum(cub.tresAB2), col: AMBER },
        { lbl: "b³", val: fmtNum(cub.b3), col: PINK },
        { lbl: "(a+b)³", val: fmtNum(cub.total), col: T.text },
      ];
    }
    return [
      { lbl: "a²", val: fmtNum(conj.a2), col: accent },
      { lbl: "b²", val: fmtNum(conj.b2), col: PINK },
      { lbl: "a²−b²", val: fmtNum(conj.resultado), col: T.text },
    ];
  }, [modoKey, cuad, cub, conj, accent]);

  // El medidor: lo que daría la «suma ingenua» contra el valor real de la figura.
  const med = useMemo(() => {
    if (modoKey === "cuadrado") {
      return { nombreIngenuo: "a² + b²", ingenuo: cuad.a2 + cuad.b2, nombreReal: "(a + b)²", real: cuad.total, falta: cuad.dosAB, nombreFalta: "2ab" };
    }
    if (modoKey === "cubo") {
      return { nombreIngenuo: "a³ + b³", ingenuo: cub.a3 + cub.b3, nombreReal: "(a + b)³", real: cub.total, falta: cub.tresA2B + cub.tresAB2, nombreFalta: "3a²b + 3ab²" };
    }
    return { nombreIngenuo: "a² − b²", ingenuo: conj.resultado, nombreReal: "(a + b)(a − b)", real: conjValido ? conj.ladoLargo * conj.ladoCorto : 0, falta: 0, nombreFalta: "" };
  }, [modoKey, cuad, cub, conj, conjValido]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${modo.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>{modo.identidad}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {modo.descripcion}
      </div>
    </div>
  );

  // Lectura corta (≤ 10 palabras) y su explicación completa para el panel.
  let lectura: ReactNode;
  let porque: string;
  if (modoKey === "conjugados") {
    lectura = conjValido ? <>a² − b² = {fmtNum(conj.resultado)}: el rectángulo mide lo mismo</> : <>Necesitas a &gt; b para ver el rectángulo</>;
    porque = conjValido
      ? `Al cuadrado a² = ${fmtNum(conj.a2)} le quitas b² = ${fmtNum(conj.b2)} y queda ${fmtNum(conj.resultado)}. Reacomodado, es un rectángulo de ${fmtNum(conj.ladoLargo)} por ${fmtNum(conj.ladoCorto)}: su área también es ${fmtNum(conj.ladoLargo * conj.ladoCorto)}.`
      : "Para recortar el cuadrado b² del cuadrado a², a debe ser mayor que b. Sube a o baja b.";
  } else {
    const dif = med.real - med.ingenuo;
    lectura = <>{med.nombreIngenuo} = {fmtNum(med.ingenuo)} · real = {fmtNum(med.real)}</>;
    porque = `Sumar solo ${med.nombreIngenuo} da ${fmtNum(med.ingenuo)}, pero la figura vale ${fmtNum(med.real)}: faltan ${fmtNum(dif)}. Esa diferencia es exactamente ${med.nombreFalta}, las piezas que se ven al despiezar.`;
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ProductosScene modo={modoKey} a={a} b={b} sep={sep} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.key, etiqueta: m.titulo, icono: m.icono })),
        valor: modoKey,
        cambiar: cambiarModo,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar (juntar piezas)" onClick={reset} />
        </>
      }
      leyenda={
        modoKey === "conjugados" ? (
          <>
            <LegItem col={accent} txt="a²" />
            <LegItem col={PINK} txt="b² (se recorta)" />
            <LegItem col={TEAL} txt="rectángulo (a+b)(a−b)" />
          </>
        ) : (
          <div style={{ display: "grid", gap: 6, width: 200 }}>
            <MedidorFigura etiqueta={med.nombreIngenuo} valor={med.ingenuo} tope={med.real} col={ROJO} />
            <MedidorFigura etiqueta={med.nombreReal} valor={med.real} tope={med.real} col={TEAL} />
            <div style={{ fontSize: 14, fontWeight: 900, color: AMBER }}>Faltan {med.nombreFalta} = {fmtNum(med.real - med.ingenuo)}</div>
          </div>
        )
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
              <Bloque titulo={modo.titulo} icono={modo.icono}>
                <Deslizador label="lado a" icon="fa-ruler" colr={accent} valor={fmtNum(a, 1)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={cambiarA} />
                <Deslizador label="lado b" icon="fa-ruler" colr={AMBER} valor={fmtNum(b, 1)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB} />
                <Deslizador label="separación (despiezar)" icon="fa-up-down-left-right" colr={TEAL} valor={`${Math.round(sep * 100)}%`} min={0} max={1} step={0.01} value={sep} onChange={cambiarSep} />
                {modoKey === "conjugados" && !conjValido && (
                  <p style={{ margin: 0, color: AMBER, fontWeight: 700 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} aria-hidden />
                    Para el rectángulo (a − b) necesitas a &gt; b.
                  </p>
                )}
              </Bloque>

              <Bloque titulo="Los términos ahora" icono="fa-vector-square">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {terminos.map((t) => <Dato key={t.lbl} label={t.lbl} value={t.val} col={t.col} />)}
                </div>
                <div style={{ color: T.text2, ...NUM }}>
                  a = {fmtNum(a, 1)}, b = {fmtNum(b, 1)} → <strong style={{ color: accent }}>{numerico(modoKey, a, b)}</strong>
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${AMBER}55`, background: `${AMBER}12` }}>
                  {porque}
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
              <Bloque titulo="Por qué funciona" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{modo.descripcion}</p>
                <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
                  <div style={{ fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>PIEZAS</div>
                  <div style={{ color: T.text2 }}>{modo.piezas}</div>
                  <div style={{ marginTop: 9, fontSize: 17, fontWeight: 900, color: accent, ...NUM }}>{modo.identidad}</div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  El término del medio nunca es casualidad: en <strong style={{ color: T.text }}>(a+b)²</strong> son los <strong style={{ color: TEAL }}>dos</strong> rectángulos ab; en <strong style={{ color: T.text }}>(a+b)³</strong> son las <strong style={{ color: TEAL }}>tres</strong> losas a²b y las <strong style={{ color: AMBER }}>tres</strong> columnas ab². Por eso los coeficientes son 2 y 3.
                </p>
              </Bloque>
              <Bloque titulo="El ejercicio de la actividad" icono="fa-pen-ruler">
                <div style={{ color: T.text2 }}>
                  Una plaza cuadrada mide <strong style={{ color: T.text }}>(x + 5)</strong> metros por lado:
                </div>
                <div style={{ color: T.text2, lineHeight: 1.7, display: "grid", gap: 6, ...NUM }}>
                  <div><strong style={{ color: accent }}>(a)</strong> (x + 5)² = x² + 10x + 25</div>
                  <div><strong style={{ color: TEAL }}>(b)</strong> (x + 5)(x − 5) = x² − 25</div>
                  <div><strong style={{ color: AMBER }}>(c)</strong> (x² + 2x − 1) + (3x² − x + 4) = 4x² + x + 3</div>
                </div>
              </Bloque>
              <Bloque titulo="Las reglas" icono="fa-list-check">
                <div style={{ color: T.text2, lineHeight: 1.7, display: "grid", gap: 4, ...NUM }}>
                  <div>(a + b)² = a² + 2ab + b²</div>
                  <div>(a − b)² = a² − 2ab + b²</div>
                  <div>(a + b)(a − b) = a² − b²</div>
                  <div>(a + b)³ = a³ + 3a²b + 3ab² + b³</div>
                </div>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PRODUCTOS_NOTABLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: valor de la «suma ingenua» vs. el valor real de la figura ───── */
function MedidorFigura({ etiqueta, valor, tope, col }: { etiqueta: string; valor: number; tope: number; col: string }) {
  const t = Math.max(tope, valor, 0.0001);
  return (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{etiqueta}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum(valor)}</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (valor / t) * 100)}%`, height: "100%", background: col, transition: "width 140ms linear" }} />
      </div>
    </div>
  );
}

/* ── Item de leyenda ──────────────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: col, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
