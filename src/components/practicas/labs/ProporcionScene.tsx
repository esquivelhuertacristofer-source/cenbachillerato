"use client";

/**
 * Escena 3D del laboratorio de Razón y proporción (R3F).
 * Se carga de forma diferida (ssr:false) desde LabProporcion.tsx.
 *
 * Es un GRAFICADOR en un plano vertical (eje X = cantidad que controlas, eje Y
 * hacia arriba = cantidad que responde). Hace visible el invariante:
 *   · directa  →  la curva es una RECTA por el origen (la razón y/x es constante).
 *   · inversa  →  la curva es una HIPÉRBOLA y el RECTÁNGULO O→P mantiene su ÁREA
 *                 constante (x·y = k): al ensancharlo se aplana, y viceversa.
 * El punto P=(x,y) se sitúa según las props y un rectángulo translúcido lo une
 * con el origen. Todo se calcula en el render a partir de las props (sin
 * useFrame, sin Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Tipo } from "./proporcion-data";

export interface ProporcionSceneProps {
  tipo: Tipo;
  x: number;
  y: number;
  k: number;
  xMin: number;
  xMax: number;
  yMax: number; // máximo de y en el rango (para normalizar)
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const W = 8; // ancho del plano (eje X)
const H = 6; // alto del plano (eje Y)
const K_COL = "#FFD166"; // color del invariante (razón / producto)

type P3 = [number, number, number];

export default function ProporcionScene(props: ProporcionSceneProps) {
  const { tipo, x, y, k, xMin, xMax, yMax, accent } = props;

  const nx = useMemo(() => (vx: number) => (vx / xMax) * W, [xMax]);
  const ny = useMemo(() => (vy: number) => (yMax > 0 ? (vy / yMax) * H : 0), [yMax]);

  // Curva de la proporción
  const curva = useMemo<P3[]>(() => {
    if (tipo === "directa") {
      return [
        [0, 0, 0],
        [nx(xMax), ny(k * xMax), 0],
      ];
    }
    const N = 60;
    const pts: P3[] = [];
    for (let i = 0; i <= N; i++) {
      const vx = xMin + (xMax - xMin) * (i / N);
      pts.push([nx(vx), ny(k / vx), 0]);
    }
    return pts;
  }, [tipo, k, xMin, xMax, nx, ny]);

  // Líneas de la cuadrícula de fondo
  const grid = useMemo<P3[][]>(() => {
    const lines: P3[][] = [];
    const divX = 8;
    const divY = 6;
    for (let i = 0; i <= divX; i++) {
      const gx = (i / divX) * W;
      lines.push([[gx, 0, 0], [gx, H, 0]]);
    }
    for (let j = 0; j <= divY; j++) {
      const gy = (j / divY) * H;
      lines.push([[0, gy, 0], [W, gy, 0]]);
    }
    return lines;
  }, []);

  const px = nx(x);
  const py = ny(y);

  // Rectángulo O→P (su ÁREA es x·y; constante en la inversa)
  const rectW = Math.max(0.0001, px);
  const rectH = Math.max(0.0001, py);

  // Líneas guía punteadas de P a los ejes
  const guiaX: P3[] = [[px, 0, 0], [px, py, 0]];
  const guiaY: P3[] = [[0, py, 0], [px, py, 0]];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [1.5, 1.2, 13.5], fov: 40 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 20, 46]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 9, 7]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-7, 3, 5]} intensity={10} color={accent} />
      <pointLight position={[6, 1, 5]} intensity={6} color="#ffffff" />

      {/* Todo el graficador, centrado en el origen del mundo */}
      <group key={`${tipo}-${props.resetNonce}`} position={[-W / 2, -H / 2, 0]}>
        {/* Cuadrícula de fondo */}
        {grid.map((l, i) => (
          <Line key={`g${i}`} points={l} color="#1d3147" lineWidth={1} transparent opacity={0.55} />
        ))}

        {/* Ejes */}
        <mesh position={[W / 2, -0.04, 0]}>
          <boxGeometry args={[W, 0.07, 0.07]} />
          <meshStandardMaterial color="#5d7488" emissive="#5d7488" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-0.04, H / 2, 0]}>
          <boxGeometry args={[0.07, H, 0.07]} />
          <meshStandardMaterial color="#5d7488" emissive="#5d7488" emissiveIntensity={0.25} />
        </mesh>

        {/* Rectángulo O→P: caja delgada translúcida (su área = x·y) */}
        <mesh position={[rectW / 2, rectH / 2, -0.12]}>
          <boxGeometry args={[rectW, rectH, 0.12]} />
          <meshStandardMaterial
            color={tipo === "inversa" ? K_COL : accent}
            emissive={tipo === "inversa" ? K_COL : accent}
            emissiveIntensity={0.16}
            transparent
            opacity={0.16}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>

        {/* Curva de la proporción */}
        <Line points={curva} color={accent} lineWidth={4} />

        {/* Guías punteadas a los ejes */}
        <Line points={guiaX} color={K_COL} lineWidth={2} dashed dashSize={0.22} gapSize={0.14} transparent opacity={0.85} />
        <Line points={guiaY} color={K_COL} lineWidth={2} dashed dashSize={0.22} gapSize={0.14} transparent opacity={0.85} />

        {/* Punto P = (x, y) */}
        <mesh position={[px, py, 0]} castShadow>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.9} roughness={0.25} metalness={0.3} />
        </mesh>

        {/* Marcas en los ejes para el valor actual */}
        <mesh position={[px, -0.04, 0]}>
          <boxGeometry args={[0.12, 0.34, 0.12]} />
          <meshStandardMaterial color={K_COL} emissive={K_COL} emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.04, py, 0]}>
          <boxGeometry args={[0.34, 0.12, 0.12]} />
          <meshStandardMaterial color={K_COL} emissive={K_COL} emissiveIntensity={0.6} />
        </mesh>

        <ContactShadows position={[W / 2, -0.1, 1.2]} rotation={[Math.PI / 2, 0, 0]} opacity={0.22} scale={20} blur={3} far={6} color="#16263a" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 2, -2]} scale={[6, 6, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.46} luminanceThreshold={0.65} luminanceSmoothing={0.3} mipmapBlur radius={0.64} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
