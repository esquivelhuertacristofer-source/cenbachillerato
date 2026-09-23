"use client";

/**
 * Escena 3D del laboratorio de Fracciones, decimales y porcentajes (R3F).
 * Se carga de forma diferida (ssr:false) desde LabFracciones.tsx.
 *
 * Representa la fracción n/d de DOS formas a la vez, para que se vea que son la
 * misma cantidad:
 *   - un PASTEL dividido en `d` rebanadas, con `n` rebanadas rellenas (la parte
 *     coloreada es la fracción / el porcentaje del círculo).
 *   - una BARRA dividida en `d` segmentos, con `n` segmentos rellenos.
 *
 * Todo se calcula en el render a partir de las props (numerador, denominador):
 * sin useFrame, sin Math.random, sin estado interno → cumple las reglas del
 * React Compiler. Las rebanadas usan cylinderGeometry con thetaStart/thetaLength.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";

export interface FraccionesSceneProps {
  numerador: number;
  denominador: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TAU = Math.PI * 2;
const PIE_R = 2.0;
const PIE_H = 0.5;
const PIE_Y = 0.7;
const GAP = 0.04; // separación angular relativa entre rebanadas
const VACIO = "#27384B"; // color de la parte no rellena
const VACIO_EM = "#0E1822";

/* ── Pastel: d rebanadas, n rellenas ──────────────────────────────────────── */
function Pastel({ n, d, accent }: { n: number; d: number; accent: string }) {
  const seg = TAU / d;
  const fill = new THREE.Color(accent);
  return (
    <group position={[0, PIE_Y, 0]}>
      {Array.from({ length: d }, (_, i) => {
        const lleno = i < n;
        const thetaStart = i * seg + seg * (GAP / 2) + Math.PI / 2;
        const thetaLength = seg * (1 - GAP);
        // las rebanadas llenas se adelantan un poco hacia la cámara
        const z = lleno ? 0.18 : 0;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]} castShadow>
            <cylinderGeometry args={[PIE_R, PIE_R, PIE_H, 14, 1, false, thetaStart, thetaLength]} />
            <meshStandardMaterial
              color={lleno ? fill : VACIO}
              emissive={lleno ? fill : VACIO_EM}
              emissiveIntensity={lleno ? 0.35 : 0.04}
              roughness={lleno ? 0.32 : 0.6}
              metalness={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Barra: d segmentos, n rellenos ───────────────────────────────────────── */
function Barra({ n, d, accent }: { n: number; d: number; accent: string }) {
  const total = 5.4;
  const segW = total / d;
  const w = segW * 0.86;
  const x0 = -total / 2 + segW / 2;
  const y = -1.85;
  const fill = new THREE.Color(accent);
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: d }, (_, i) => {
        const lleno = i < n;
        const x = x0 + i * segW;
        return (
          <mesh key={i} position={[x, lleno ? 0.06 : 0, 0]} castShadow>
            <boxGeometry args={[w, lleno ? 0.78 : 0.6, 0.8]} />
            <meshStandardMaterial
              color={lleno ? fill : VACIO}
              emissive={lleno ? fill : VACIO_EM}
              emissiveIntensity={lleno ? 0.32 : 0.04}
              roughness={lleno ? 0.32 : 0.6}
              metalness={0.15}
            />
          </mesh>
        );
      })}
      {/* riel base de la barra */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <boxGeometry args={[total + 0.3, 0.12, 1.0]} />
        <meshStandardMaterial color="#D7DEE6" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ── Escena completa ──────────────────────────────────────────────────────── */
export default function FraccionesScene(props: FraccionesSceneProps) {
  // saneamos las props para la geometría (d ≥ 1, 0 ≤ n ≤ d)
  const d = useMemo(() => Math.max(1, Math.round(props.denominador)), [props.denominador]);
  const n = useMemo(() => Math.max(0, Math.min(d, Math.round(props.numerador))), [props.numerador, d]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0.6, 9.5], fov: 42 }}
    >
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={props.accent} suelo={-2.85} />


      <group key={`${d}-${props.resetNonce}`}>
        <Pastel n={n} d={d} accent={props.accent} />
        <Barra n={n} d={d} accent={props.accent} />
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.4, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
