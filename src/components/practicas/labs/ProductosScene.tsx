"use client";

/**
 * Escena 3D del laboratorio de Productos notables (R3F).
 * Se carga de forma diferida (ssr:false) desde LabProductos.tsx.
 *
 * Tres modos, todos como descomposición geométrica de una figura:
 *   · "cuadrado"   → (a+b)² = área de un cuadrado de lado (a+b), 4 piezas.
 *   · "cubo"       → (a+b)³ = volumen de un cubo de arista (a+b), 8 piezas.
 *   · "conjugados" → (a+b)(a−b) = a² − b²: un cuadrado a² menos un cuadrado b².
 * El control "separación" (sep ∈ [0,1]) despieza la figura para ver cada término.
 * Todo se recalcula en el render dentro de un useMemo (sin useFrame, sin
 * Math.random) → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, TIPO_POR_UNOS, type TipoPieza } from "./productos-data";

export interface ProductosSceneProps {
  modo: Modo;
  a: number;
  b: number;
  sep: number; // separación / despiece, 0..1
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const PINK = "#FF6FA5";
const META = "#9fc0e0";

type P3 = [number, number, number];

interface Pieza {
  key: string;
  pos: P3;
  size: P3;
  color: string;
  emissive: number;
  opacity?: number;
}

const COLOR_TIPO = (accent: string): Record<TipoPieza, string> => ({
  a3: accent,
  a2b: TEAL,
  ab2: AMBER,
  b3: PINK,
});

export default function ProductosScene(props: ProductosSceneProps) {
  const { modo, a, b, sep, accent } = props;

  const M = useMemo(() => {
    const colorTipo = COLOR_TIPO(accent);
    const piezas: Pieza[] = [];
    const lineas: { key: string; pts: P3[]; color: string }[] = [];
    const etiquetas: { key: string; pos: P3; text: string; color: string; size: number }[] = [];

    const EXPLODE = 1.5; // separación máxima en el mundo

    if (modo === "cubo") {
      const side = a + b;
      const half = side / 2;
      // 8 sub-cajas: por cada eje, 0 → segmento a, 1 → segmento b
      for (let ix = 0; ix < 2; ix++) {
        for (let iy = 0; iy < 2; iy++) {
          for (let iz = 0; iz < 2; iz++) {
            const lx = ix ? b : a;
            const ly = iy ? b : a;
            const lz = iz ? b : a;
            const cx = (ix ? a + b / 2 : a / 2) - half;
            const cy = (iy ? a + b / 2 : a / 2) - half;
            const cz = (iz ? a + b / 2 : a / 2) - half;
            // despiece: a-parte hacia −, b-parte hacia +
            const ox = (ix ? 1 : -1) * sep * EXPLODE;
            const oy = (iy ? 1 : -1) * sep * EXPLODE;
            const oz = (iz ? 1 : -1) * sep * EXPLODE;
            const unos = ix + iy + iz;
            const tipo = TIPO_POR_UNOS[unos]!;
            piezas.push({
              key: `c${ix}${iy}${iz}`,
              pos: [cx + ox, cy + oy + half, cz + oz], // levantar para apoyar en el piso
              size: [lx, ly, lz],
              color: colorTipo[tipo],
              emissive: 0.16,
            });
          }
        }
      }
      etiquetas.push({ key: "lbl", pos: [0, side + 0.9, 0], text: "(a + b)³", color: META, size: 17 });
    } else if (modo === "cuadrado") {
      const side = a + b;
      const half = side / 2;
      const TH = 0.28; // grosor de las losetas
      // 4 losetas en el plano XZ: por cada eje X y Z, 0 → a, 1 → b
      for (let ix = 0; ix < 2; ix++) {
        for (let iz = 0; iz < 2; iz++) {
          const lx = ix ? b : a;
          const lz = iz ? b : a;
          const cx = (ix ? a + b / 2 : a / 2) - half;
          const cz = (iz ? a + b / 2 : a / 2) - half;
          const ox = (ix ? 1 : -1) * sep * EXPLODE;
          const oz = (iz ? 1 : -1) * sep * EXPLODE;
          const unos = ix + iz; // 0 → a², 1 → ab, 2 → b²
          const tipo: TipoPieza = unos === 0 ? "a3" : unos === 1 ? "a2b" : "ab2";
          piezas.push({
            key: `q${ix}${iz}`,
            pos: [cx + ox, TH / 2, cz + oz],
            size: [lx, TH, lz],
            color: colorTipo[tipo],
            emissive: 0.18,
          });
        }
      }
      etiquetas.push({ key: "lbl", pos: [0, 1.1, 0], text: "(a + b)²", color: META, size: 17 });
    } else {
      // conjugados: cuadrado a² menos cuadrado b² → rectángulo (a+b)(a−b)
      const TH = 0.28;
      const ladoCorto = a - b; // a − b
      // Cuadrado grande a², en L: lo dibujamos como cuadrado completo (accent)
      // y un cubo b² "fantasma" rojo en la esquina que se retira.
      const halfA = a / 2;
      piezas.push({
        key: "a2",
        pos: [0, TH / 2, 0],
        size: [a, TH, a],
        color: accent,
        emissive: 0.16,
      });
      // esquina b² que se quita (fantasma, sube y se aleja con sep)
      piezas.push({
        key: "b2",
        pos: [halfA - b / 2, TH / 2 + sep * 1.4, halfA - b / 2 + sep * 1.4],
        size: [b, TH, b],
        color: PINK,
        emissive: 0.25,
        opacity: 0.42 + 0.4 * (1 - sep),
      });
      etiquetas.push({ key: "lblA", pos: [0, TH + 0.5, -halfA - 0.55], text: "a²", color: accent, size: 16 });
      etiquetas.push({ key: "lblB", pos: [halfA - b / 2, TH + 0.6 + sep * 1.4, halfA - b / 2 + sep * 1.4], text: "− b²", color: PINK, size: 15 });

      // rectángulo equivalente (a+b)(a−b), a un lado, aparece con sep
      if (ladoCorto > 0.001) {
        const lx = a + b;
        const lz = ladoCorto;
        const offsetZ = a / 2 + ladoCorto / 2 + 1.4; // colocado "detrás"
        piezas.push({
          key: "rect",
          pos: [0, TH / 2, -offsetZ],
          size: [lx, TH, lz],
          color: TEAL,
          emissive: 0.16,
          opacity: 0.35 + 0.6 * sep, // se materializa al separar
        });
        etiquetas.push({ key: "lblR", pos: [0, TH + 0.5, -offsetZ], text: "(a + b)(a − b)", color: TEAL, size: 14 });
      }
    }

    return { piezas, lineas, etiquetas };
  }, [modo, a, b, sep, accent]);

  // distancia de cámara según el tamaño de la figura
  const dist = useMemo(() => 6 + (a + b) * 1.4, [a, b]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [dist * 0.7, dist * 0.75, dist], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 64]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 13, 8]}
        intensity={1.75}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={48}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-10, 7, 5]} intensity={6} color={accent} />
      <pointLight position={[9, 5, -5]} intensity={3.5} color={AMBER} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[44, 44]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Piezas */}
        {M.piezas.map((p) => (
          <mesh key={p.key} position={p.pos} castShadow receiveShadow>
            <boxGeometry args={p.size} />
            <meshStandardMaterial
              color={p.color}
              roughness={0.34}
              metalness={0.12}
              emissive={p.color}
              emissiveIntensity={p.emissive}
              transparent={p.opacity !== undefined}
              opacity={p.opacity ?? 1}
            />
          </mesh>
        ))}

        {/* Etiquetas */}
        {M.etiquetas.map((e) => (
          <Html key={e.key} center position={e.pos} distanceFactor={15} pointerEvents="none">
            <div style={{ fontWeight: 900, fontSize: e.size, color: e.color, textShadow: "0 2px 12px rgba(0,0,0,0.95)", whiteSpace: "nowrap" }}>
              {e.text}
            </div>
          </Html>
        ))}

        <ContactShadows position={[0, -0.02, 0]} opacity={0.34} scale={26} blur={3} far={11} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 9, 2]} scale={[18, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-8, 5, -2]} scale={[6, 9, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[8, 4, 4]} scale={[5, 9, 1]} color={AMBER} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={40}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, (a + b) / 3, 0]}
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
