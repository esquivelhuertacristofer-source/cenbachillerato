"use client";

/**
 * Escena 3D del laboratorio de Factorización — modelo de área (R3F).
 * Se carga de forma diferida (ssr:false) desde LabFactorizacion.tsx.
 *
 * Un trinomio x² + bx + c se construye con "algebra tiles" que tapizan un
 * rectángulo de lados (x + p) y (x + q):
 *   · 1 pieza x²  (cuadrado x·x)            → color de acento
 *   · (p + q) piezas x  (rectángulos x·1)   → color teal
 *   · p·q piezas 1  (cuadraditos 1·1)       → color ámbar
 * Los dos lados del rectángulo SON los factores. Todo se recalcula en el render
 * dentro de un useMemo (sin useFrame, sin Math.random) → cumple el React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { XLEN, desarrolla } from "./factorizacion-data";

export interface FactorizacionSceneProps {
  p: number;
  q: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const TARGET = 6.2; // tamaño objetivo del lado mayor en el mundo
const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const GAP = 0.07; // separación entre piezas (en unidades de pieza)

type P3 = [number, number, number];

interface Tile {
  key: string;
  pos: P3; // centro en el mundo
  size: P3; // [ancho X, alto Y, fondo Z]
  color: string;
}

export default function FactorizacionScene(props: FactorizacionSceneProps) {
  const { p, q, accent } = props;

  const M = useMemo(() => {
    const W = XLEN + p; // ancho del rectángulo = x + p
    const H = XLEN + q; // alto (fondo) del rectángulo = x + q
    const s = TARGET / Math.max(W, H);
    const cx = W / 2;
    const cz = H / 2;

    // Convierte un rect en coords de pieza [x0,x1]×[z0,z1] a un Tile centrado y escalado.
    const tile = (key: string, x0: number, x1: number, z0: number, z1: number, color: string, th: number): Tile => {
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      return {
        key,
        pos: [(mx - cx) * s, th / 2, (mz - cz) * s],
        size: [((x1 - x0) - GAP) * s, th, ((z1 - z0) - GAP) * s],
        color,
      };
    };

    const tiles: Tile[] = [];
    // 1) pieza x²
    tiles.push(tile("x2", 0, XLEN, 0, XLEN, accent, 0.22));
    // 2) p piezas x (columnas a la derecha del x²)
    for (let i = 0; i < p; i++) tiles.push(tile(`xp${i}`, XLEN + i, XLEN + i + 1, 0, XLEN, TEAL, 0.15));
    // 3) q piezas x (filas arriba del x²)
    for (let j = 0; j < q; j++) tiles.push(tile(`xq${j}`, 0, XLEN, XLEN + j, XLEN + j + 1, TEAL, 0.15));
    // 4) p·q piezas 1 (esquina)
    for (let i = 0; i < p; i++)
      for (let j = 0; j < q; j++) tiles.push(tile(`u${i}-${j}`, XLEN + i, XLEN + i + 1, XLEN + j, XLEN + j + 1, AMBER, 0.09));

    // Contorno del rectángulo completo (en el piso).
    const outline: P3[] = [
      [(0 - cx) * s, 0.005, (0 - cz) * s],
      [(W - cx) * s, 0.005, (0 - cz) * s],
      [(W - cx) * s, 0.005, (H - cz) * s],
      [(0 - cx) * s, 0.005, (H - cz) * s],
      [(0 - cx) * s, 0.005, (0 - cz) * s],
    ];

    // Guías de los lados (los factores).
    const zEdge = (H - cz) * s + 0.5;
    const xEdge = (W - cx) * s + 0.5;
    const ladoAncho: P3[] = [[(0 - cx) * s, 0.02, zEdge], [(W - cx) * s, 0.02, zEdge]];
    const ladoAlto: P3[] = [[xEdge, 0.02, (0 - cz) * s], [xEdge, 0.02, (H - cz) * s]];

    return {
      s, W, H,
      tiles,
      outline,
      ladoAncho,
      ladoAlto,
      labAncho: [0, 0.05, zEdge + 0.35] as P3,
      labAlto: [xEdge + 0.35, 0.05, 0] as P3,
      labX2: [(XLEN / 2 - cx) * s, 0.3, (XLEN / 2 - cz) * s] as P3,
      labArea: [0, 0.05, (0 - cz) * s - 0.5] as P3,
    };
  }, [p, q, accent]);

  const { b, c } = desarrolla(p, q);
  const esCuadrado = p === q;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [4.6, 7.4, 7.6], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 54]} />

      <ambientLight intensity={0.62} />
      <directionalLight
        position={[5, 12, 6]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-8, 6, 5]} intensity={7} color={accent} />
      <pointLight position={[7, 5, -4]} intensity={4} color={TEAL} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Piezas (algebra tiles) */}
        {M.tiles.map((t) => (
          <mesh key={t.key} position={t.pos} castShadow receiveShadow>
            <boxGeometry args={t.size} />
            <meshStandardMaterial
              color={t.color}
              roughness={0.34}
              metalness={0.12}
              emissive={t.color}
              emissiveIntensity={0.14}
            />
          </mesh>
        ))}

        {/* Contorno del rectángulo y guías de los lados */}
        <Line points={M.outline} color="#eaf4ff" lineWidth={2} transparent opacity={0.5} />
        <Line points={M.ladoAncho} color={accent} lineWidth={3.5} />
        <Line points={M.ladoAlto} color={TEAL} lineWidth={3.5} />

        {/* Etiqueta del lado ancho = x + p */}
        <Html center position={M.labAncho} distanceFactor={13} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 18, color: accent, textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            x + {p}
          </div>
        </Html>
        {/* Etiqueta del lado alto = x + q */}
        <Html center position={M.labAlto} distanceFactor={13} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 18, color: TEAL, textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            x + {q}
          </div>
        </Html>
        {/* Etiqueta de la pieza x² */}
        <Html center position={M.labX2} distanceFactor={12} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 17, color: "#03101f", textShadow: "0 1px 4px rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
            x²
          </div>
        </Html>
        {/* Área = polinomio desarrollado */}
        <Html center position={M.labArea} distanceFactor={14} pointerEvents="none">
          <div style={{ fontWeight: 800, fontSize: 15, color: "#eaf4ff", textShadow: "0 2px 10px rgba(0,0,0,0.9)", whiteSpace: "nowrap", background: "rgba(2,12,28,0.55)", padding: "3px 10px", borderRadius: 8 }}>
            Área = x² + {b}x + {c}{esCuadrado ? "  ·  ¡cuadrado!" : ""}
          </div>
        </Html>

        <ContactShadows position={[0, -0.02, 0]} opacity={0.34} scale={18} blur={3} far={8} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 8, 2]} scale={[14, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-7, 4, -2]} scale={[6, 8, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[7, 3, 3]} scale={[5, 8, 1]} color={TEAL} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={24}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
