"use client";

/**
 * Escena 3D del laboratorio del volumen de un cilindro (R3F).
 * Se carga de forma diferida (ssr:false) desde LabCilindro.tsx.
 *
 * Un tanque cilíndrico transparente que se llena de líquido. El volumen es el
 * área de la base (π·r²) por la altura (h): se sugiere "apilar discos" con
 * anillos horizontales. Mover el radio o la altura, o el nivel de llenado,
 * recalcula todo en el render (sin useFrame, sin Math.random) → cumple las
 * reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { DoubleSide } from "three";
import { litros, fmtNum } from "./cilindro-data";

export interface CilindroSceneProps {
  r: number; // radio en metros
  h: number; // altura en metros
  fill: number; // fracción de llenado 0..1
  accent: string;
  fillColor: string; // color del líquido
  autoRotate: boolean;
  resetNonce: number;
}

const TARGET = 5.4; // tamaño objetivo de la dimensión mayor en el mundo

type P3 = [number, number, number];

// Puntos de un círculo horizontal (en el plano XZ) a una altura y.
function circulo(radius: number, y: number, n = 64): P3[] {
  const pts: P3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([Math.cos(t) * radius, y, Math.sin(t) * radius]);
  }
  return pts;
}

export default function CilindroScene(props: CilindroSceneProps) {
  const { r, h, fill, accent, fillColor } = props;

  const L = useMemo(() => {
    const s = TARGET / Math.max(2 * r, h);
    const wR = r * s;
    const wH = h * s;
    const wWater = wH * fill;

    // Anillos para sugerir "discos apilados".
    const nRings = Math.min(10, Math.max(3, Math.round(h * 2)));
    const rings: P3[][] = [];
    for (let k = 0; k <= nRings; k++) rings.push(circulo(wR, (wH * k) / nRings));

    // Guías de medida.
    const lineaRadio: P3[] = [[0, 0.015, 0], [wR, 0.015, 0]];
    const xOff = wR + 0.45;
    const lineaAltura: P3[] = [[xOff, 0, 0], [xOff, wH, 0]];
    const topAltura: P3[] = [[xOff - 0.12, wH, 0], [xOff + 0.12, wH, 0]];
    const botAltura: P3[] = [[xOff - 0.12, 0, 0], [xOff + 0.12, 0, 0]];

    return {
      s, wR, wH, wWater,
      baseCirc: circulo(wR, 0.01),
      rings,
      lineaRadio, lineaAltura, topAltura, botAltura,
      midY: wH / 2,
      labRadio: [wR / 2, 0.18, 0.18] as P3,
      labAltura: [xOff + 0.35, wH / 2, 0] as P3,
      labAgua: [0, wWater + 0.001, 0] as P3,
    };
  }, [r, h, fill]);

  const Lt = litros(r, h);
  const Lagua = Lt * fill;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [6.2, 5, 8.4], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 20, 50]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 11, 6]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-8, 6, 5]} intensity={8} color={accent} />
      <pointLight position={[7, 4, -4]} intensity={5} color={fillColor} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Líquido dentro del tanque */}
        {L.wWater > 0.001 && (
          <mesh position={[0, L.wWater / 2, 0]} castShadow>
            <cylinderGeometry args={[L.wR * 0.985, L.wR * 0.985, L.wWater, 64]} />
            <meshStandardMaterial color={fillColor} transparent opacity={0.62} emissive={fillColor} emissiveIntensity={0.18} roughness={0.25} metalness={0.1} />
          </mesh>
        )}
        {/* Superficie del líquido */}
        {L.wWater > 0.001 && (
          <mesh position={[0, L.wWater, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[L.wR * 0.985, 64]} />
            <meshStandardMaterial color={fillColor} transparent opacity={0.85} emissive={fillColor} emissiveIntensity={0.3} side={DoubleSide} />
          </mesh>
        )}

        {/* Pared del tanque (transparente) */}
        <mesh position={[0, L.wH / 2, 0]}>
          <cylinderGeometry args={[L.wR, L.wR, L.wH, 64, 1, true]} />
          <meshStandardMaterial color="#cfe2f5" transparent opacity={0.14} roughness={0.1} metalness={0.2} side={DoubleSide} />
        </mesh>
        {/* Base del tanque */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[L.wR, 64]} />
          <meshStandardMaterial color="#9fc0e0" transparent opacity={0.35} roughness={0.4} metalness={0.2} side={DoubleSide} />
        </mesh>

        {/* Anillos "discos apilados" */}
        {L.rings.map((c, i) => (
          <Line key={`ring${i}`} points={c} color="#cfe2f5" lineWidth={i === 0 || i === L.rings.length - 1 ? 2 : 1} transparent opacity={i === 0 || i === L.rings.length - 1 ? 0.7 : 0.22} />
        ))}
        <Line points={L.baseCirc} color={accent} lineWidth={2.5} />

        {/* Guías de medida */}
        <Line points={L.lineaRadio} color={accent} lineWidth={3} />
        <Line points={L.lineaAltura} color="#cfe2f5" lineWidth={2.5} />
        <Line points={L.topAltura} color="#cfe2f5" lineWidth={2.5} />
        <Line points={L.botAltura} color="#cfe2f5" lineWidth={2.5} />

        <Html center position={L.labRadio} distanceFactor={12} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 19, color: accent, textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            r = {fmtNum(r)} m
          </div>
        </Html>
        <Html center position={L.labAltura} distanceFactor={12} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 19, color: "#eaf4ff", textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            h = {fmtNum(h)} m
          </div>
        </Html>
        {L.wWater > 0.18 && (
          <Html center position={L.labAgua} distanceFactor={13} pointerEvents="none">
            <div style={{ fontWeight: 800, fontSize: 15, color: "#eaf4ff", textShadow: "0 2px 10px rgba(0,0,0,0.9)", whiteSpace: "nowrap", background: "rgba(2,12,28,0.5)", padding: "2px 8px", borderRadius: 7 }}>
              {fmtNum(Lagua, 0)} L
            </div>
          </Html>
        )}

        <ContactShadows position={[0, -0.02, 0]} opacity={0.32} scale={16} blur={3} far={7} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 8, 2]} scale={[12, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-7, 4, -2]} scale={[6, 8, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[7, 3, 3]} scale={[5, 8, 1]} color={fillColor} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={22}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, L.midY, 0]}
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
