"use client";

/**
 * Escena 3D del laboratorio de Potencias y raíces (R3F).
 * Se carga de forma diferida (ssr:false) desde LabPotencias.tsx.
 *
 * Construye n^e con cubitos unitarios:
 *   - e = 2  →  una capa n×n  (un CUADRADO: el área n²).
 *   - e = 3  →  un bloque n×n×n  (un CUBO: el volumen n³).
 * El número de cubitos ES el valor de la potencia. Si `resaltarLado`, se pinta
 * de otro color la arista de n cubitos: ese lado es la RAÍZ (√n² = n, ∛n³ = n).
 *
 * Todo se calcula en el render a partir de las props (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Exponente } from "./potencias-data";

export interface PotenciasSceneProps {
  base: number;
  exponente: Exponente;
  resaltarLado: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const S = 0.66; // paso entre centros de cubitos
const C = 0.6; // arista del cubito
const LADO = "#FFD166"; // color del lado resaltado (la raíz)

interface Cubo {
  key: string;
  pos: [number, number, number];
  lado: boolean;
}

/** Genera los cubitos de n^e centrados en el origen. */
function construir(n: number, e: Exponente, resaltarLado: boolean): Cubo[] {
  const cubos: Cubo[] = [];
  const kMax = e === 3 ? n : 1; // capas en altura
  const off = (n - 1) / 2;
  const offY = (kMax - 1) / 2;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < kMax; k++) {
        // el "lado" es la arista frontal-inferior de n cubitos (j al frente, k abajo)
        const lado = resaltarLado && j === n - 1 && k === 0;
        cubos.push({
          key: `${i}-${j}-${k}`,
          pos: [(i - off) * S, (k - offY) * S, (j - off) * S],
          lado,
        });
      }
    }
  }
  return cubos;
}

function Bloque({ base, exponente, resaltarLado, accent }: { base: number; exponente: Exponente; resaltarLado: boolean; accent: string }) {
  const cubos = useMemo(() => construir(base, exponente, resaltarLado), [base, exponente, resaltarLado]);
  return (
    <group>
      {cubos.map((c) => (
        <mesh key={c.key} position={c.pos} castShadow receiveShadow>
          <boxGeometry args={[C, C, C]} />
          <meshStandardMaterial
            color={c.lado ? LADO : accent}
            emissive={c.lado ? LADO : accent}
            emissiveIntensity={c.lado ? 0.5 : 0.18}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PotenciasScene(props: PotenciasSceneProps) {
  const n = useMemo(() => Math.max(1, Math.min(6, Math.round(props.base))), [props.base]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [5.5, 4.5, 7.5], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 40]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, 4]} intensity={11} color={props.accent} />
      <pointLight position={[5, 1, 5]} intensity={7} color="#ffffff" />

      <group key={`${n}-${props.exponente}-${props.resetNonce}`}>
        <Bloque base={n} exponente={props.exponente} resaltarLado={props.resaltarLado} accent={props.accent} />
        <ContactShadows position={[0, -(props.exponente === 3 ? (n - 1) / 2 : 0) * S - C * 0.6, 0]} opacity={0.34} scale={18} blur={3} far={7} color="#2a3f57" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={22}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.42} luminanceThreshold={0.68} luminanceSmoothing={0.3} mipmapBlur radius={0.62} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
