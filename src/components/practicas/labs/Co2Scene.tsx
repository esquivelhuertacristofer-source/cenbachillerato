"use client";

/**
 * Escena 3D — "Reacción vinagre + bicarbonato" (CNEYT-IV-P08).
 *
 * Un frasco con vinagre y, en la boca, un globo que se infla en proporción al
 * volumen de CO₂ producido. Durante la reacción suben burbujas en el líquido.
 * El tamaño del globo ES la lectura visual del volumen de gas.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; las
 * burbujas y el latido del globo viven en refs dentro de useFrame (cosmético).
 * Lección heredada del lab de pH: la pared de cristal usa "transmission", que
 * solo deja ver objetos OPACOS detrás → líquido y burbujas son opacos.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface Co2SceneProps {
  volCO2mL: number; // volumen final de CO₂ (mL)
  progreso: number; // 0→1 avance de la reacción
  reaccionando: boolean; // hay burbujeo activo
  colorGlobo: string;
  accent: string;
  resetNonce: number;
}

const R_BOT = 1.05; // radio del cuerpo del frasco
const H_BOT = 2.5; // alto del cuerpo
const NIVEL = 0.5; // fracción de llenado (deja cámara de gas)
const R_CUELLO = 0.34;
const H_CUELLO = 0.6;

/** Volumen de CO₂ (mL) → radio del globo en unidades de escena. */
function radioGlobo(volmL: number): number {
  const v = Math.max(0, volmL); // cm³
  const rCm = Math.cbrt((3 * v) / (4 * Math.PI)); // radio de la esfera (cm)
  return Math.min(1.5, Math.max(0.12, rCm * 0.13));
}

/* ── Frasco de vidrio + vinagre ──────────────────────────────────────────── */
function Frasco() {
  const hLiq = H_BOT * NIVEL;
  const yLiq = -H_BOT / 2 + hLiq / 2;
  const ySup = -H_BOT / 2 + hLiq;
  const yTop = H_BOT / 2;

  return (
    <group>
      {/* Pared del cuerpo */}
      <mesh>
        <cylinderGeometry args={[R_BOT, R_BOT * 0.96, H_BOT, 48, 1, true]} />
        <meshPhysicalMaterial color="#dff1ff" roughness={0.08} metalness={0} transmission={0.92} thickness={0.4} ior={1.46} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Hombro (cono que estrecha al cuello) */}
      <mesh position={[0, yTop + 0.12, 0]}>
        <cylinderGeometry args={[R_CUELLO, R_BOT, 0.26, 48, 1, true]} />
        <meshPhysicalMaterial color="#dff1ff" roughness={0.1} metalness={0} transmission={0.9} thickness={0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Cuello */}
      <mesh position={[0, yTop + 0.25 + H_CUELLO / 2, 0]}>
        <cylinderGeometry args={[R_CUELLO, R_CUELLO, H_CUELLO, 32, 1, true]} />
        <meshPhysicalMaterial color="#eaf6ff" roughness={0.12} metalness={0.05} transmission={0.85} transparent opacity={0.34} side={THREE.DoubleSide} />
      </mesh>
      {/* Fondo */}
      <mesh position={[0, -H_BOT / 2 + 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[R_BOT * 0.96, R_BOT * 0.96, 0.06, 48]} />
        <meshPhysicalMaterial color="#cfe6f7" roughness={0.1} transmission={0.7} transparent opacity={0.45} />
      </mesh>

      {/* Vinagre (OPACO para que se vea a través del cristal) */}
      <mesh position={[0, yLiq, 0]} castShadow>
        <cylinderGeometry args={[R_BOT - 0.05, R_BOT * 0.96 - 0.05, hLiq, 48]} />
        <meshStandardMaterial color="#eef2cf" emissive="#cdd49a" emissiveIntensity={0.18} roughness={0.3} metalness={0.04} />
      </mesh>
      {/* Superficie del líquido */}
      <mesh position={[0, ySup, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R_BOT - 0.05, 48]} />
        <meshStandardMaterial color="#f3f6dc" emissive="#d8de9e" emissiveIntensity={0.3} roughness={0.18} metalness={0.08} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Burbujas de CO₂ que suben durante la reacción ───────────────────────── */
function Burbujas({ activo }: { activo: boolean }) {
  const N = 14;
  const grupo = useRef<THREE.Group>(null);
  const refs = useRef<THREE.Mesh[]>([]);

  // Posiciones/fases deterministas por índice (sin Math.random → React Compiler).
  const semillas = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const ang = (i * 2.39996); // ángulo áureo
        const rad = 0.18 + ((i * 37) % 70) / 100 * (R_BOT - 0.35);
        return {
          x: Math.cos(ang) * rad,
          z: Math.sin(ang) * rad,
          fase: (i / N),
          vel: 0.35 + ((i * 53) % 50) / 100, // 0.35–0.85
          esc: 0.035 + ((i * 17) % 40) / 1000, // 0.035–0.075
        };
      }),
    [],
  );

  const yBase = -H_BOT / 2 + 0.12;
  const yTope = -H_BOT / 2 + H_BOT * NIVEL - 0.05;
  const span = yTope - yBase;

  useFrame((st) => {
    const g = grupo.current;
    if (g) g.visible = activo;
    if (!activo) return;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i];
      const s = semillas[i];
      if (!m || !s) continue;
      const u = (s.fase + t * s.vel) % 1; // 0→1 cíclico
      m.position.y = yBase + u * span;
      const fade = u < 0.85 ? 1 : (1 - u) / 0.15;
      m.scale.setScalar(s.esc * (0.6 + fade));
    }
  });

  return (
    <group ref={grupo}>
      {semillas.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[s.x, yBase, s.z]}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#eafff4" emissiveIntensity={0.5} roughness={0.2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Globo que se infla con el CO₂ ───────────────────────────────────────── */
function Globo({ volCO2mL, progreso, colorGlobo }: { volCO2mL: number; progreso: number; colorGlobo: string }) {
  const objetivo = radioGlobo(volCO2mL);
  const r = 0.12 + Math.max(0, Math.min(1, progreso)) * (objetivo - 0.12);
  const yBocaCuello = H_BOT / 2 + 0.25 + H_CUELLO;

  const globo = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (globo.current) {
      const w = 1 + Math.sin(st.clock.elapsedTime * 2.2) * 0.012; // leve respiración
      globo.current.scale.set(r * w, r, r * w);
    }
  });

  return (
    <group position={[0, yBocaCuello, 0]}>
      {/* boca/anudado del globo sobre el cuello */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[R_CUELLO + 0.03, R_CUELLO + 0.05, 0.16, 24]} />
        <meshStandardMaterial color={colorGlobo} roughness={0.4} metalness={0.05} />
      </mesh>
      {/* cuerpo del globo (su escala = volumen de CO₂) */}
      <group ref={globo} position={[0, 0.12 + r * 0.9, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color={colorGlobo}
            roughness={0.22}
            metalness={0}
            transmission={0.25}
            thickness={0.5}
            transparent
            opacity={0.78}
            clearcoat={0.6}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {/* nudo inferior */}
        <mesh position={[0, -0.98, 0]}>
          <coneGeometry args={[0.12, 0.22, 12]} />
          <meshStandardMaterial color={colorGlobo} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ volCO2mL, progreso, reaccionando, colorGlobo, accent, resetNonce }: Co2SceneProps) {
  const sig = `${resetNonce}`;
  return (
    <>
      <color attach="background" args={["#04111c"]} />
      <fog attach="fog" args={["#04111c", 16, 44]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 7]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, 4]} intensity={8} color={accent} />
      <pointLight position={[4, 2, 5]} intensity={6} color="#ffffff" />

      <group key={sig} position={[0, -0.4, 0]}>
        <Frasco />
        <Burbujas activo={reaccionando} />
        <Globo volCO2mL={volCO2mL} progreso={progreso} colorGlobo={colorGlobo} />
        <ContactShadows position={[0, -H_BOT / 2 - 0.05, 0]} opacity={0.34} scale={12} blur={2.6} far={6} color="#10283e" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 4]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[5, 5, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls makeDefault enablePan={false} minDistance={5} maxDistance={16} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.7} target={[0, 0.6, 0]} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function Co2Scene(props: Co2SceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0.4, 1.8, 9.5], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
