"use client";

/**
 * Escena 3D del laboratorio de Concentración de una disolución (R3F).
 * Se carga de forma diferida (ssr:false) desde LabConcentracion.tsx.
 *
 * Un vaso de precipitados con disolvente (agua) hasta cierto nivel. El soluto
 * disuelto se ve como partículas suspendidas y como TINTE del líquido: a mayor
 * concentración, más partículas y color más intenso. Si se agrega más soluto
 * del que el agua admite, el excedente NO se disuelve y cae al fondo como
 * cristales (disolución SATURADA).
 *
 * Todo se calcula en el render a partir de las props (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler. Las posiciones
 * "aleatorias" usan un hash determinista (prand).
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface ConcentracionSceneProps {
  /** Nivel del líquido (0..1) según el agua agregada. */
  nivel: number;
  /** Color del soluto / tinte de la disolución. */
  solutoColor: string;
  /** Intensidad de la concentración (0..1): tinte y densidad de partículas. */
  intensidad: number;
  /** ¿La disolución está saturada? (hay cristales sin disolver) */
  saturada: boolean;
  /** Fracción de excedente (0..1): tamaño del montón de cristales. */
  excedenteFrac: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TAU = Math.PI * 2;
const VASO_R = 1.5; // radio interior del vaso
const VASO_H = 3.2; // altura del vaso
const FONDO_Y = -VASO_H / 2; // y del fondo interior

/** Hash determinista en [0,1) — evita Math.random en el render. */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Vaso de precipitados: paredes de vidrio + base + pico. */
function Vaso() {
  return (
    <group>
      {/* paredes de vidrio (cilindro abierto) */}
      <mesh>
        <cylinderGeometry args={[VASO_R, VASO_R, VASO_H, 56, 1, true]} />
        <meshPhysicalMaterial
          color="#cfe8ff"
          transparent
          opacity={0.16}
          roughness={0.08}
          metalness={0}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* base */}
      <mesh position={[0, FONDO_Y, 0]}>
        <cylinderGeometry args={[VASO_R, VASO_R, 0.12, 56]} />
        <meshPhysicalMaterial color="#cfe8ff" transparent opacity={0.28} roughness={0.1} transmission={0.7} thickness={0.6} />
      </mesh>
      {/* aro superior (borde) */}
      <mesh position={[0, VASO_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[VASO_R, 0.035, 12, 56]} />
        <meshStandardMaterial color="#dff0ff" roughness={0.3} metalness={0.3} emissive="#9fd0ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/** Líquido teñido + partículas de soluto disueltas. */
function Liquido({ nivel, solutoColor, intensidad }: { nivel: number; solutoColor: string; intensidad: number }) {
  const H = Math.max(0.25, nivel * (VASO_H - 0.3)); // altura del líquido
  const topY = FONDO_Y + 0.06 + H;
  const centerY = FONDO_Y + 0.06 + H / 2;

  // color: del agua casi clara al color del soluto, según la intensidad
  const color = useMemo(() => {
    const base = new THREE.Color("#bfe8ff");
    return base.lerp(new THREE.Color(solutoColor), Math.min(1, 0.15 + intensidad * 0.85));
  }, [solutoColor, intensidad]);

  // partículas disueltas suspendidas
  const particulas = useMemo(() => {
    const n = Math.round(6 + Math.min(1, intensidad) * 48);
    const arr: { key: number; pos: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < n; i++) {
      const ang = prand(i, 1) * TAU;
      const r = Math.sqrt(prand(i, 2)) * (VASO_R - 0.22);
      const y = FONDO_Y + 0.14 + prand(i, 3) * (H - 0.18);
      const s = 0.05 + prand(i, 4) * 0.05;
      arr.push({ key: i, pos: [Math.cos(ang) * r, y, Math.sin(ang) * r], s });
    }
    return arr;
  }, [intensidad, H]);

  return (
    <group>
      {/* volumen del líquido */}
      <mesh position={[0, centerY, 0]}>
        <cylinderGeometry args={[VASO_R - 0.04, VASO_R - 0.04, H, 56]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.62} roughness={0.18} transmission={0.55} thickness={1.2} ior={1.33} />
      </mesh>
      {/* superficie (menisco) */}
      <mesh position={[0, topY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[VASO_R - 0.05, 56]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} roughness={0.12} metalness={0.1} emissive={color} emissiveIntensity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* partículas de soluto disuelto */}
      {particulas.map((p) => (
        <mesh key={p.key} position={p.pos}>
          <sphereGeometry args={[p.s, 10, 10]} />
          <meshStandardMaterial color={solutoColor} emissive={solutoColor} emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Cristales sin disolver al fondo (cuando la disolución está saturada). */
function Cristales({ excedenteFrac, solutoColor }: { excedenteFrac: number; solutoColor: string }) {
  const cristales = useMemo(() => {
    const n = Math.round(Math.min(1, excedenteFrac) * 26);
    const arr: { key: number; pos: [number, number, number]; s: number; rot: [number, number, number] }[] = [];
    for (let i = 0; i < n; i++) {
      const ang = prand(i, 5) * TAU;
      const r = Math.sqrt(prand(i, 6)) * (VASO_R - 0.3);
      const y = FONDO_Y + 0.12 + prand(i, 7) * 0.22;
      const s = 0.09 + prand(i, 8) * 0.07;
      arr.push({
        key: i,
        pos: [Math.cos(ang) * r, y, Math.sin(ang) * r],
        s,
        rot: [prand(i, 9) * TAU, prand(i, 10) * TAU, prand(i, 11) * TAU],
      });
    }
    return arr;
  }, [excedenteFrac]);

  return (
    <group>
      {cristales.map((c) => (
        <mesh key={c.key} position={c.pos} rotation={c.rot} castShadow>
          <boxGeometry args={[c.s, c.s, c.s]} />
          <meshStandardMaterial color={solutoColor} emissive={solutoColor} emissiveIntensity={0.3} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

export default function ConcentracionScene(props: ConcentracionSceneProps) {
  const nivel = Math.max(0, Math.min(1, props.nivel));
  const intensidad = Math.max(0, Math.min(1, props.intensidad));
  const excedenteFrac = Math.max(0, Math.min(1, props.excedenteFrac));

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.9, 7.4], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 40]} />

      <ambientLight intensity={0.62} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, 4]} intensity={10} color={props.accent} />
      <pointLight position={[5, 1, 5]} intensity={6} color="#ffffff" />

      <group key={props.resetNonce}>
        <Vaso />
        <Liquido nivel={nivel} solutoColor={props.solutoColor} intensidad={intensidad} />
        {props.saturada && <Cristales excedenteFrac={excedenteFrac} solutoColor={props.solutoColor} />}
        <ContactShadows position={[0, FONDO_Y - 0.08, 0]} opacity={0.36} scale={9} blur={3} far={6} color="#2a3f57" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        maxDistance={20}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.95}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
