"use client";

/**
 * Escena 3D del laboratorio de Ecuaciones lineales — modelo de barras (R3F).
 * Se carga de forma diferida (ssr:false) desde LabEcuaciones.tsx.
 *
 * La ecuación a·x + b = c se dibuja como una barra (tape diagram):
 *   · bloques de la incógnita (a·x) en color de acento
 *   · un bloque constante (b) en ámbar
 *   · una "meta" translúcida de longitud c, con un marcador al final.
 * Mover x alarga o acorta la barra; cuando a·x + b llega justo a la meta, la
 * ecuación está resuelta (marcador verde). Si se pasa, el EXCESO se dibuja en
 * rojo sobre la parte que sobresale de la meta.
 *
 * La escala es FIJA para todo el recorrido del deslizador (se mide con xMax), así
 * la barra crece sin que la cámara ni la meta se muevan. Todo se recalcula en el
 * render dentro de un useMemo (sin useFrame, sin Math.random).
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { total, fmtNum } from "./ecuaciones-data";
import { CurvaTubo } from "./_tablero";
import { Escenario, calidadEscena } from "./_escenario";

export interface EcuacionesSceneProps {
  a: number;
  b: number;
  c: number;
  x: number;
  /** Valor máximo del deslizador: fija la escala para que la barra siempre quepa. */
  xMax: number;
  xNombre: string;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TARGET = 8.2; // longitud en el mundo del recorrido completo del deslizador
const AMBER = "#FFD166";
const META = "#9fc0e0";
const VERDE = "#34D399";
const ROJO = "#FF6B6B";
const DEPTH = 1.0; // fondo de las barras
const H_X = 0.7; // altura de los bloques de x
const H_B = 0.5; // altura del bloque constante
const GAP = 0.04;

type P3 = [number, number, number];

interface Bloque {
  key: string;
  pos: P3;
  size: P3;
  color: string;
  emissive: number;
}

function Contenido({ a, b, c, x, xMax, xNombre, accent, autoRotate, resetNonce }: EcuacionesSceneProps) {
  const ancho = useThree((s) => s.size.width);
  const angosto = ancho < 640;
  const calidad = useMemo(() => calidadEscena(), []);

  const M = useMemo(() => {
    const Lmax = Math.max(c, a * xMax + b);
    const s = TARGET / Lmax;
    const L = c * s; // longitud de la meta en el mundo
    const x0 = -TARGET / 2; // borde izquierdo (inicio de las barras)

    // ¿cuántos sub-bloques de x mostramos? Si a es entero pequeño, uno por copia.
    const sub = Number.isInteger(a) && a <= 8 && a >= 1 ? a : 1;
    const xLenWorld = x * s; // longitud de UNA x
    const axWorld = a * x * s; // longitud total de a·x
    const bWorld = b * s;

    const bloques: Bloque[] = [];
    let cursor = x0;

    if (sub > 1) {
      for (let i = 0; i < sub; i++) {
        const w = Math.max(xLenWorld - GAP, 0.0001);
        bloques.push({ key: `x${i}`, pos: [cursor + xLenWorld / 2, H_X / 2, 0], size: [w, H_X, DEPTH], color: accent, emissive: 0.16 });
        cursor += xLenWorld;
      }
    } else {
      const w = Math.max(axWorld - GAP, 0.0001);
      bloques.push({ key: "ax", pos: [x0 + axWorld / 2, H_X / 2, 0], size: [w, H_X, DEPTH], color: accent, emissive: 0.16 });
      cursor = x0 + axWorld;
    }

    if (b > 0) {
      const w = Math.max(bWorld - GAP, 0.0001);
      bloques.push({ key: "b", pos: [cursor + bWorld / 2, H_B / 2, 0], size: [w, H_B, DEPTH], color: AMBER, emissive: 0.2 });
    }

    const totalWorld = axWorld + bWorld; // fin de la barra modelo
    const endX = x0 + totalWorld;
    const metaX = x0 + L;
    const resuelto = Math.abs(a * x + b - c) < 1e-9;
    const exceso = totalWorld > L + 1e-6 ? totalWorld - L : 0;

    const metaLine: P3[] = [
      [metaX, 0, -DEPTH / 2 - 0.15],
      [metaX, H_X + 0.9, -DEPTH / 2 - 0.15],
    ];
    const endLine: P3[] = [
      [endX, 0, DEPTH / 2 + 0.15],
      [endX, H_X + 0.5, DEPTH / 2 + 0.15],
    ];

    return {
      L, x0, axWorld, bWorld, endX, metaX, resuelto, exceso,
      bloques,
      metaLine, endLine,
      labMeta: [metaX, H_X + 1.35, -DEPTH / 2 - 0.15] as P3,
      labEnd: [endX, H_X + 0.85, DEPTH / 2 + 0.15] as P3,
      labAx: [x0 + axWorld / 2, 0.02, DEPTH / 2 + 0.75] as P3,
      labB: [x0 + axWorld + bWorld / 2, 0.02, DEPTH / 2 + 0.75] as P3,
    };
  }, [a, b, c, x, xMax, accent]);

  const totalActual = total(a, b, x);
  const lbl = { fontWeight: 900, fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" as const, textShadow: "0 2px 10px rgba(0,0,0,0.95)" };
  const colFin = M.resuelto ? VERDE : M.exceso > 0 ? ROJO : accent;

  return (
    <>
      <Escenario acento={accent} suelo={0} calidad={calidad} />

      <group key={`${resetNonce}`}>
        {/* Carril/meta translúcida (longitud c) */}
        <mesh position={[M.x0 + M.L / 2, H_B / 4, 0]}>
          <boxGeometry args={[M.L, H_B * 0.5, DEPTH + 0.5]} />
          <meshStandardMaterial color={META} transparent opacity={0.16} roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Bloques de la barra modelo (a·x + b) */}
        {M.bloques.map((bl) => (
          <mesh key={bl.key} position={bl.pos} castShadow receiveShadow>
            <boxGeometry args={bl.size} />
            <meshStandardMaterial color={bl.color} roughness={0.34} metalness={0.12} emissive={bl.color} emissiveIntensity={bl.emissive} />
          </mesh>
        ))}

        {/* Exceso: lo que sobresale de la meta, en rojo */}
        {M.exceso > 0.02 && (
          <mesh position={[M.metaX + M.exceso / 2, (H_X + 0.12) / 2, 0]}>
            <boxGeometry args={[M.exceso, H_X + 0.12, DEPTH + 0.18]} />
            <meshStandardMaterial color={ROJO} transparent opacity={0.55} roughness={0.4} emissive={ROJO} emissiveIntensity={0.3} />
          </mesh>
        )}

        {/* Marcador de la meta y su etiqueta */}
        <Line points={M.metaLine} color={M.resuelto ? VERDE : META} lineWidth={3.5} dashed dashSize={0.18} gapSize={0.12} />
        <Html center position={M.labMeta} pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ ...lbl, fontSize: 15, color: M.resuelto ? VERDE : META, background: "rgba(4,10,22,0.82)", padding: "3px 10px", borderRadius: 8 }}>
            meta = {fmtNum(c)}{M.resuelto ? " ✓" : ""}
          </div>
        </Html>

        {/* Marcador del fin actual de la barra (si ya coincide con la meta, la etiqueta de la meta basta) */}
        <CurvaTubo puntos={M.endLine} color={colFin} grosor={0.054} />
        {!M.resuelto && (
          <Html center position={M.labEnd} pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ ...lbl, fontSize: 15, color: colFin, background: "rgba(4,10,22,0.82)", padding: "3px 10px", borderRadius: 8 }}>
              {fmtNum(totalActual)}
            </div>
          </Html>
        )}

        {/* Etiquetas de las partes, al pie de la barra (solo si caben) */}
        {M.axWorld > 1.7 && !angosto && (
          <Html center position={M.labAx} pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ ...lbl, fontSize: 15, color: accent }}>
              {a === 1 ? xNombre : `${fmtNum(a)}·${xNombre}`} = {fmtNum(a * x)}
            </div>
          </Html>
        )}
        {M.bWorld > 0.9 && (
          <Html center position={M.labB} pointerEvents="none" zIndexRange={[20, 0]}>
            <div style={{ ...lbl, fontSize: 15, color: AMBER }}>+ {fmtNum(b)}</div>
          </Html>
        )}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.2, 0.9]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function EcuacionesScene(props: EcuacionesSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }} camera={{ position: [0, 6.4, 10.2], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
