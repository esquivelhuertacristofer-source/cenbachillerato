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
 * ecuación está resuelta. Todo se recalcula en el render dentro de un useMemo
 * (sin useFrame, sin Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { total, fmtNum } from "./ecuaciones-data";

export interface EcuacionesSceneProps {
  a: number;
  b: number;
  c: number;
  x: number;
  xNombre: string;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TARGET = 8.4; // longitud en el mundo a la que se mapea la meta c
const AMBER = "#FFD166";
const META = "#9fc0e0";
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

export default function EcuacionesScene(props: EcuacionesSceneProps) {
  const { a, b, c, x, xNombre, accent } = props;

  const M = useMemo(() => {
    const s = TARGET / c; // c se mapea a TARGET
    const L = c * s; // longitud de la meta en el mundo
    const x0 = -L / 2; // borde izquierdo (inicio de las barras)

    // ¿cuántos sub-bloques de x mostramos? Si a es entero pequeño, uno por copia.
    const sub = Number.isInteger(a) && a <= 8 && a >= 1 ? a : 1;
    const xLenWorld = x * s; // longitud de UNA x
    const axWorld = a * x * s; // longitud total de a·x
    const bWorld = b * s;

    const bloques: Bloque[] = [];
    let cursor = x0;

    if (sub > 1) {
      // a sub-bloques, cada uno representa una x
      for (let i = 0; i < sub; i++) {
        const w = Math.max(xLenWorld - GAP, 0.0001);
        bloques.push({
          key: `x${i}`,
          pos: [cursor + xLenWorld / 2, H_X / 2, 0],
          size: [w, H_X, DEPTH],
          color: accent,
          emissive: 0.16,
        });
        cursor += xLenWorld;
      }
    } else {
      // un solo bloque a·x (cuando a no es entero pequeño, p. ej. 150)
      const w = Math.max(axWorld - GAP, 0.0001);
      bloques.push({
        key: "ax",
        pos: [x0 + axWorld / 2, H_X / 2, 0],
        size: [w, H_X, DEPTH],
        color: accent,
        emissive: 0.16,
      });
      cursor = x0 + axWorld;
    }

    // bloque constante b
    if (b > 0) {
      const w = Math.max(bWorld - GAP, 0.0001);
      bloques.push({
        key: "b",
        pos: [cursor + bWorld / 2, H_B / 2, 0],
        size: [w, H_B, DEPTH],
        color: AMBER,
        emissive: 0.2,
      });
    }

    const totalWorld = axWorld + bWorld; // fin de la barra modelo
    const endX = x0 + totalWorld;
    const resuelto = Math.abs(a * x + b - c) < 1e-9;

    // Marcador de la meta (línea vertical al final de c).
    const metaLine: P3[] = [
      [x0 + L, 0, -DEPTH / 2 - 0.15],
      [x0 + L, H_X + 0.9, -DEPTH / 2 - 0.15],
    ];
    // Marcador del fin actual de la barra modelo.
    const endLine: P3[] = [
      [endX, 0, DEPTH / 2 + 0.15],
      [endX, H_X + 0.5, DEPTH / 2 + 0.15],
    ];

    return {
      s, L, x0, sub, xLenWorld, axWorld, bWorld, totalWorld, endX, resuelto,
      bloques,
      metaLine, endLine,
      labMeta: [x0 + L, H_X + 1.15, -DEPTH / 2 - 0.15] as P3,
      labEnd: [endX, H_X + 0.78, DEPTH / 2 + 0.15] as P3,
      labAx: [x0 + (sub > 1 ? (a * x * s) / 2 : (a * x * s) / 2), H_X + 0.32, DEPTH / 2 + 0.05] as P3,
      labB: [x0 + a * x * s + (b * s) / 2, H_B + 0.3, DEPTH / 2 + 0.05] as P3,
    };
  }, [a, b, c, x, accent]);

  const totalActual = total(a, b, x);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 6.6, 9.8], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 24, 56]} />

      <ambientLight intensity={0.62} />
      <directionalLight
        position={[4, 12, 7]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-9, 6, 5]} intensity={6} color={accent} />
      <pointLight position={[8, 5, -4]} intensity={4} color={M.resuelto ? "#34D399" : AMBER} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[34, 34]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Carril/meta translúcida (longitud c) */}
        <mesh position={[M.x0 + M.L / 2, H_B / 2, -DEPTH * 0.0]} >
          <boxGeometry args={[M.L, H_B * 0.5, DEPTH + 0.5]} />
          <meshStandardMaterial color={META} transparent opacity={0.1} roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Bloques de la barra modelo (a·x + b) */}
        {M.bloques.map((bl) => (
          <mesh key={bl.key} position={bl.pos} castShadow receiveShadow>
            <boxGeometry args={bl.size} />
            <meshStandardMaterial color={bl.color} roughness={0.34} metalness={0.12} emissive={bl.color} emissiveIntensity={bl.emissive} />
          </mesh>
        ))}

        {/* Marcador de la meta y su etiqueta */}
        <Line points={M.metaLine} color={M.resuelto ? "#34D399" : META} lineWidth={3.5} dashed dashSize={0.18} gapSize={0.12} />
        <Html center position={M.labMeta} distanceFactor={15} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 16, color: M.resuelto ? "#34D399" : META, textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            meta = {fmtNum(c)}
          </div>
        </Html>

        {/* Marcador del fin actual de la barra */}
        <Line points={M.endLine} color={accent} lineWidth={3} />
        <Html center position={M.labEnd} distanceFactor={15} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 15, color: M.resuelto ? "#34D399" : accent, textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap", background: "rgba(2,12,28,0.55)", padding: "2px 9px", borderRadius: 7 }}>
            {fmtNum(totalActual)} {M.resuelto ? "✓" : ""}
          </div>
        </Html>

        {/* Etiqueta de la parte a·x */}
        {M.axWorld > 0.3 && (
          <Html center position={M.labAx} distanceFactor={13} pointerEvents="none">
            <div style={{ fontWeight: 900, fontSize: 16, color: accent, textShadow: "0 2px 10px rgba(0,0,0,0.95)", whiteSpace: "nowrap" }}>
              {a === 1 ? xNombre : `${fmtNum(a)}·${xNombre}`} = {fmtNum(a * x)}
            </div>
          </Html>
        )}
        {/* Etiqueta del bloque constante b */}
        {M.bWorld > 0.3 && (
          <Html center position={M.labB} distanceFactor={13} pointerEvents="none">
            <div style={{ fontWeight: 900, fontSize: 15, color: AMBER, textShadow: "0 2px 10px rgba(0,0,0,0.95)", whiteSpace: "nowrap" }}>
              + {fmtNum(b)}
            </div>
          </Html>
        )}

        <ContactShadows position={[0, -0.02, 0]} opacity={0.34} scale={20} blur={3} far={9} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 8, 2]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-7, 4, -2]} scale={[6, 8, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[7, 3, 3]} scale={[5, 8, 1]} color={AMBER} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.4, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
