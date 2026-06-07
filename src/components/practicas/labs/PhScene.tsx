"use client";

/**
 * Escena 3D — "Laboratorio de pH" (CNEYT-IV-P03).
 *
 * Un vaso de precipitados con una disolución cuyo color lo fija el indicador de
 * col morada según el pH (rojo/rosa en ácido, morado en neutro, azul/verde en
 * básico). Al lado, una torre-escala de 0 a 14 con un marcador que sube o baja
 * con el pH. En modo "neutralizar", un gotero deja caer gotas de base sobre el
 * vaso (animación cosmética).
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; las
 * animaciones viven en refs dentro de useFrame (cosméticas, permitido).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { colorCol } from "./ph-data";

export interface PhSceneProps {
  ph: number;
  colorLiquido: string;
  accent: string;
  modo: "medir" | "neutralizar";
  goteando: boolean;
  resetNonce: number;
}

const R_VASO = 1.35; // radio del vaso
const H_VASO = 2.9; // alto del vaso
const NIVEL = 0.66; // fracción de llenado del líquido

/* ── Vaso de precipitados (cristal) + líquido coloreado ──────────────────── */
function Vaso({ colorLiquido }: { colorLiquido: string }) {
  const hLiquido = H_VASO * NIVEL;
  const yLiquido = -H_VASO / 2 + hLiquido / 2;
  const ySup = -H_VASO / 2 + hLiquido; // superficie del líquido

  return (
    <group>
      {/* Pared de cristal (cilindro abierto) */}
      <mesh>
        <cylinderGeometry args={[R_VASO, R_VASO, H_VASO, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#dff1ff"
          roughness={0.08}
          metalness={0}
          transmission={0.92}
          thickness={0.4}
          ior={1.46}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Fondo del vaso */}
      <mesh position={[0, -H_VASO / 2 + 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[R_VASO, R_VASO, 0.06, 48]} />
        <meshPhysicalMaterial color="#cfe6f7" roughness={0.1} transmission={0.7} transparent opacity={0.45} />
      </mesh>
      {/* Borde superior */}
      <mesh position={[0, H_VASO / 2, 0]}>
        <torusGeometry args={[R_VASO, 0.04, 12, 48]} />
        <meshStandardMaterial color="#eaf6ff" roughness={0.2} metalness={0.1} transparent opacity={0.5} />
      </mesh>

      {/* Líquido — OPACO: un material con transmisión (la pared de cristal) solo
          deja ver los objetos opacos que tiene detrás; si el líquido fuera
          transparente, el cristal no lo "vería" y el vaso saldría vacío. */}
      <mesh position={[0, yLiquido, 0]} castShadow>
        <cylinderGeometry args={[R_VASO - 0.06, R_VASO - 0.06, hLiquido, 48]} />
        <meshStandardMaterial
          color={colorLiquido}
          emissive={colorLiquido}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {/* Superficie (menisco brillante) */}
      <mesh position={[0, ySup, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R_VASO - 0.06, 48]} />
        <meshStandardMaterial
          color={colorLiquido}
          emissive={colorLiquido}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Gotero: deja caer gotas de base sobre el vaso (modo neutralizar) ────── */
function Gotero({ activo, colorGota }: { activo: boolean; colorGota: string }) {
  const gota = useRef<THREE.Mesh>(null);
  const yTop = H_VASO / 2 + 1.6;
  const yBottom = -H_VASO / 2 + H_VASO * NIVEL;

  useFrame((_, dt) => {
    if (!gota.current) return;
    if (!activo) {
      gota.current.visible = false;
      gota.current.position.y = yTop;
      return;
    }
    gota.current.visible = true;
    gota.current.position.y -= dt * 6;
    if (gota.current.position.y < yBottom) gota.current.position.y = yTop;
  });

  return (
    <group position={[0, yTop + 0.2, 0]}>
      {/* cuerpo del gotero */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.0, 20]} />
        <meshStandardMaterial color="#e6f2ff" roughness={0.25} metalness={0.1} transparent opacity={0.55} />
      </mesh>
      {/* punta */}
      <mesh position={[0, -0.18, 0]}>
        <coneGeometry args={[0.1, 0.36, 20]} />
        <meshStandardMaterial color="#cfe6f7" roughness={0.2} transparent opacity={0.6} />
      </mesh>
      {/* gota que cae */}
      <mesh ref={gota} position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={colorGota} emissive={colorGota} emissiveIntensity={0.5} roughness={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Torre-escala de pH (0 a 14) con marcador deslizante ─────────────────── */
function EscalaPh({ ph }: { ph: number }) {
  const x = R_VASO + 2.0; // a la derecha del vaso
  const alto = H_VASO + 0.6;
  const y0 = -alto / 2;

  // 14 bandas de color del indicador de col morada (de pH 14 arriba a 0 abajo).
  const bandas = useMemo(() => {
    const arr: { y: number; h: number; color: string }[] = [];
    const n = 14;
    const hb = alto / n;
    for (let i = 0; i < n; i++) {
      const phMed = i + 0.5; // 0.5,1.5,…,13.5
      arr.push({ y: y0 + i * hb + hb / 2, h: hb - 0.015, color: colorCol(phMed) });
    }
    return arr;
  }, [alto, y0]);

  const yMarca = y0 + (Math.max(0, Math.min(14, ph)) / 14) * alto;

  // Latido suave del marcador (ref en useFrame).
  const marca = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (marca.current) {
      const s = 1 + Math.sin(st.clock.elapsedTime * 3) * 0.06;
      marca.current.scale.setX(s);
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* marco */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.62, alto + 0.12, 0.04]} />
        <meshStandardMaterial color="#0a1626" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* bandas */}
      {bandas.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]}>
          <boxGeometry args={[0.5, b.h, 0.06]} />
          <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.25} roughness={0.4} toneMapped={false} />
        </mesh>
      ))}
      {/* marcador (flecha) a la altura del pH actual */}
      <group ref={marca} position={[0, yMarca, 0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.52, 0, 0]}>
          <coneGeometry args={[0.13, 0.26, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.56, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ ph, colorLiquido, accent, modo, goteando, resetNonce }: PhSceneProps) {
  const sig = `${modo}-${resetNonce}`;
  const colorGota = "#bfeaff"; // gota de NaOH (incolora → azulada)
  return (
    <>
      <color attach="background" args={["#04111c"]} />
      <fog attach="fog" args={["#04111c", 16, 44]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 7]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, 4]} intensity={8} color={accent} />
      <pointLight position={[4, 2, 5]} intensity={6} color="#ffffff" />

      <group key={sig} position={[-0.9, 0.2, 0]}>
        <Vaso colorLiquido={colorLiquido} />
        {modo === "neutralizar" && <Gotero activo={goteando} colorGota={colorGota} />}
        <EscalaPh ph={ph} />
        <ContactShadows position={[0, -H_VASO / 2 - 0.05, 0]} opacity={0.34} scale={12} blur={2.6} far={6} color="#10283e" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 4]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[5, 5, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
        target={[0.2, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function PhScene(props: PhSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0.5, 1.4, 9.5], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
