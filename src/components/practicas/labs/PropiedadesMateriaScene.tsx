"use client";

/**
 * Escena 3D del laboratorio de Propiedades y cambios de la materia (R3F).
 * Se carga de forma diferida (ssr:false) desde LabPropiedadesMateria.tsx.
 *
 * Una muestra (conjunto de partículas) sobre un platillo. Al aplicar la
 * transformación (progreso 0 → 1) la muestra se comporta según `modo`:
 *   - estado:    el sólido se funde y se extiende (mismo material).
 *   - fragmenta: el bloque se rompe en trozos que se separan.
 *   - gas:       las partículas suben y se desvanecen (evaporación).
 *   - reaccion:  cambia de color y emite humo/burbujas (sustancia nueva).
 * Si `flama`, se enciende un mechero cuya intensidad crece con el progreso.
 *
 * Las posiciones se calculan en el render a partir de `progreso` (sin useFrame),
 * con desplazamientos pseudoaleatorios DETERMINISTAS (hash por índice) para no
 * usar Math.random en render (regla del React Compiler).
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Modo, Emision } from "./propiedades-data";

export interface PropiedadesSceneProps {
  transKey: string;
  modo: Modo;
  colorInicial: string;
  colorFinal: string;
  emite: Emision;
  flama: boolean;
  progreso: number; // 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const N = 20; // partículas de la muestra
const M = 16; // partículas de emisión (humo / burbujas)
const RAD = 0.62;
const Y0 = -0.35; // base de la muestra

/** Hash determinista [0,1) por índice (sin Math.random, válido en render). */
function prand(i: number, salt = 0): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** Posición base de la partícula i dentro de la muestra (espiral apilada). */
function baseAt(i: number): [number, number, number] {
  const a = i * 2.3999632;
  const r = RAD * Math.sqrt((i + 0.5) / N);
  const layer = i % 4;
  return [Math.cos(a) * r, Y0 + layer * 0.16, Math.sin(a) * r];
}

/** Posición viva de una partícula de la muestra según el modo y el progreso. */
function posMuestra(modo: Modo, base: [number, number, number], off: number, p: number): [number, number, number] {
  const [bx, by, bz] = base;
  if (modo === "estado") {
    // se funde: baja al platillo y se extiende
    const spread = 1 + 0.75 * p;
    return [bx * spread, by * (1 - p) + (Y0 - 0.18 + off * 0.05) * p, bz * spread];
  }
  if (modo === "fragmenta") {
    // se rompe: cada trozo sale hacia afuera con un pequeño salto
    const dir = Math.hypot(bx, bz) || 1;
    const push = p * 0.9;
    return [bx + (bx / dir) * push, by + (off - 0.5) * p * 0.7, bz + (bz / dir) * push];
  }
  if (modo === "gas") {
    // se evapora: sube y se dispersa
    const spread = 1 + 1.3 * p;
    return [bx * spread, by + p * (2.4 + off * 1.4), bz * spread];
  }
  // reaccion: se mantiene con leve vibración (el color es lo que cambia)
  const j = (off - 0.5) * 0.18 * p;
  return [bx + j, by + Math.abs(j) * 0.6, bz - j];
}

/* ── Platillo / cápsula que sostiene la muestra ───────────────────────── */
function Platillo() {
  return (
    <group position={[0, Y0 - 0.42, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.15, 1.0, 0.16, 40]} />
        <meshStandardMaterial color="#D7DEE6" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[1.12, 0.05, 12, 40]} />
        <meshStandardMaterial color="#EDF2F7" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Mechero (aparece la flama si se aplica calor) ─────────────────────── */
function Mechero({ flama, p, accent }: { flama: boolean; p: number; accent: string }) {
  return (
    <group position={[0, Y0 - 1.0, 0]}>
      {/* base del mechero */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.62, 0.3, 28]} />
        <meshStandardMaterial color="#3A4453" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.4, 20]} />
        <meshStandardMaterial color="#566273" roughness={0.4} metalness={0.7} />
      </mesh>
      {flama && p > 0.02 && (
        <>
          <mesh position={[0, 0.62 + p * 0.18, 0]} scale={[1, 0.8 + p * 0.9, 1]}>
            <coneGeometry args={[0.18, 0.6, 18]} />
            <meshStandardMaterial color="#FF8A3C" emissive="#FF6A1A" emissiveIntensity={1.2 + p} toneMapped={false} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0.55 + p * 0.12, 0]} scale={[1, 0.8 + p * 0.6, 1]}>
            <coneGeometry args={[0.1, 0.4, 16]} />
            <meshStandardMaterial color="#9FE8FF" emissive="#5BC8FF" emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0, 0.9, 0]} color={accent} intensity={(0.4 + p * 1.4) * 7} distance={9} />
        </>
      )}
    </group>
  );
}

/* ── Muestra (conjunto de partículas que se transforma) ────────────────── */
function Muestra({ modo, color, p }: { modo: Modo; color: THREE.Color; p: number }) {
  const opacity = modo === "gas" ? Math.max(0.06, 1 - p * 0.92) : 1;
  const trans = modo === "gas";
  return (
    <>
      {Array.from({ length: N }, (_, i) => {
        const base = baseAt(i);
        const off = prand(i, 1);
        const pos = posMuestra(modo, base, off, p);
        return (
          <mesh key={i} position={pos} castShadow>
            <icosahedronGeometry args={[0.17, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} roughness={0.4} metalness={0.2} transparent={trans} opacity={opacity} />
          </mesh>
        );
      })}
    </>
  );
}

/* ── Emisión: humo (gris, sube y se difumina) o burbujas (claras) ──────── */
function Emisiones({ emite, p }: { emite: Emision; p: number }) {
  if (emite === "ninguno" || p <= 0.02) return null;
  const esHumo = emite === "humo";
  const color = esHumo ? "#7A7A7A" : "#DCEBF5";
  const size = esHumo ? 0.2 : 0.1;
  const op = Math.min(0.85, p * 1.6) * (esHumo ? 0.7 : 0.9);
  return (
    <>
      {Array.from({ length: M }, (_, j) => {
        const ph = prand(j, 7);
        const x = (prand(j, 3) - 0.5) * 0.9 * (1 + p);
        const z = (prand(j, 5) - 0.5) * 0.9 * (1 + p);
        const y = Y0 + 0.2 + p * (2.0 + ph * 1.4);
        const s = size * (esHumo ? 1 + p * 0.8 : 1);
        return (
          <mesh key={j} position={[x, y, z]}>
            <sphereGeometry args={[s, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={esHumo ? 0 : 0.25} roughness={0.8} transparent opacity={op} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
}

/* ── Escena completa ───────────────────────────────────────────────────── */
export default function PropiedadesMateriaScene(props: PropiedadesSceneProps) {
  const color = useMemo(() => {
    const mix = props.modo === "fragmenta" ? 0 : smooth(props.progreso);
    return new THREE.Color(props.colorInicial).lerp(new THREE.Color(props.colorFinal), mix);
  }, [props.colorInicial, props.colorFinal, props.modo, props.progreso]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 1.2, 10.5], fov: 44 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 38]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-6, 3, 3]} intensity={12} color={props.accent} />
      <pointLight position={[5, 1, 5]} intensity={7} color="#ffffff" />

      <group key={`${props.transKey}-${props.resetNonce}`}>
        <Platillo />
        <Mechero flama={props.flama} p={props.progreso} accent={props.accent} />
        <Muestra modo={props.modo} color={color} p={props.progreso} />
        <Emisiones emite={props.emite} p={props.progreso} />
        <ContactShadows position={[0, Y0 - 0.5, 0]} opacity={0.32} scale={16} blur={3} far={6} color="#2a3f57" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.1} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.1, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.42} luminanceThreshold={0.68} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
