"use client";

/**
 * Escena 3D del laboratorio del Teorema de Pitágoras (R3F).
 * Se carga de forma diferida (ssr:false) desde LabPitagoras.tsx.
 *
 * Sobre cada lado del triángulo rectángulo se construye un CUADRADO. La gracia:
 * el cuadrado de la hipotenusa (c²) tiene la misma área que la suma de los
 * cuadrados de los catetos (a² + b²). Cada cuadrado se cuadricula en unidades
 * para poder CONTAR su área, y se etiqueta con su valor. Al mover los catetos
 * todo se recalcula en el render (sin useFrame, sin Math.random) → cumple las
 * reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from "three";
import { hipotenusa, esTerna, fmtNum } from "./pitagoras-data";

export interface PitagorasSceneProps {
  a: number; // cateto horizontal
  b: number; // cateto vertical
  accent: string; // color del área (cuadrado del cateto a)
  autoRotate: boolean;
  resetNonce: number;
}

const B_COL = "#5EE6C5"; // cuadrado del cateto b
const C_COL = "#FFD166"; // cuadrado de la hipotenusa
const TARGET = 8.6; // tamaño objetivo de la figura en el mundo
const TH = 0.16; // grosor de las losas

type P3 = [number, number, number];

export default function PitagorasScene(props: PitagorasSceneProps) {
  const { a, b, accent } = props;

  const L = useMemo(() => {
    const c = hipotenusa(a, b);
    const terna = esTerna(a, b);

    // Esquinas de todo (en coords de datos) para centrar y escalar la figura.
    const pts: [number, number][] = [
      [0, 0], [a, 0], [0, b], // triángulo
      [a, -a], [0, -a], // cuadrado del cateto a
      [-b, b], [-b, 0], // cuadrado del cateto b
      [b, a + b], [a + b, a], // cuadrado de la hipotenusa
    ];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const s = TARGET / Math.max(maxX - minX, maxY - minY);

    // datos (dx, dy) → mundo (x, z). Pre-escalado para no deformar líneas/labels.
    const f = (dx: number, dy: number, y = 0): P3 => [(dx - cx) * s, y, (dy - cy) * s];

    const top = TH + 0.012; // altura de líneas/etiquetas sobre las losas

    // Cuadrículas de los catetos (siempre enteros).
    const gridA: P3[][] = [];
    for (let i = 0; i <= a; i++) gridA.push([f(i, 0, top), f(i, -a, top)]);
    for (let j = 0; j <= a; j++) gridA.push([f(0, -j, top), f(a, -j, top)]);
    const gridB: P3[][] = [];
    for (let i = 0; i <= b; i++) gridB.push([f(-i, 0, top), f(-i, b, top)]);
    for (let j = 0; j <= b; j++) gridB.push([f(-b, j, top), f(0, j, top)]);

    // Cuadrícula de la hipotenusa (solo si los tres lados son enteros).
    const gridC: P3[][] = [];
    if (terna) {
      const ci = Math.round(c);
      const ux = -a / c, uy = b / c; // a lo largo de la hipotenusa
      const nx = b / c, ny = a / c; // hacia afuera del triángulo
      for (let i = 0; i <= ci; i++) {
        gridC.push([f(a + i * ux, i * uy, top), f(a + i * ux + b, i * uy + a, top)]);
      }
      for (let j = 0; j <= ci; j++) {
        gridC.push([f(a + j * nx, j * ny, top), f(a + j * nx - a, j * ny + b, top)]);
      }
    }

    // Contorno del triángulo y marca de ángulo recto.
    const triLine: P3[] = [f(0, 0, top), f(a, 0, top), f(0, b, top), f(0, 0, top)];
    const mk = Math.min(0.8, Math.min(a, b) * 0.28);
    const anguloRecto: P3[] = [f(mk, 0, top), f(mk, mk, top), f(0, mk, top)];

    // Triángulo translúcido.
    const triGeom = new BufferGeometry();
    triGeom.setAttribute(
      "position",
      new Float32BufferAttribute([...f(0, 0, TH + 0.004), ...f(a, 0, TH + 0.004), ...f(0, b, TH + 0.004)], 3),
    );
    triGeom.computeVertexNormals();

    return {
      c, terna, s, f,
      gridA, gridB, gridC, triLine, anguloRecto, triGeom,
      // losas
      slabA: { pos: f(a / 2, -a / 2, TH / 2), size: a * s } as const,
      slabB: { pos: f(-b / 2, b / 2, TH / 2), size: b * s } as const,
      slabC: { pos: f((a + b) / 2, (a + b) / 2, TH / 2), size: c * s, rot: Math.atan2(-b, -a) } as const,
      // centros de etiqueta
      labA: f(a / 2, -a / 2, top),
      labB: f(-b / 2, b / 2, top),
      labC: f((a + b) / 2, (a + b) / 2, top),
      // etiquetas de longitud (en los lados del triángulo)
      ladoA: f(a / 2, 0, top),
      ladoB: f(0, b / 2, top),
      ladoC: f(a / 2, b / 2, top),
    };
  }, [a, b]);

  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 + b2;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 9.2, 11], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 20, 48]} />

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
      <pointLight position={[-8, 5, 5]} intensity={8} color={accent} />
      <pointLight position={[7, 4, -4]} intensity={5} color={B_COL} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Losa cuadrado del cateto a */}
        <mesh position={L.slabA.pos} castShadow receiveShadow>
          <boxGeometry args={[L.slabA.size, TH, L.slabA.size]} />
          <meshStandardMaterial color={accent} transparent opacity={0.5} emissive={accent} emissiveIntensity={0.18} roughness={0.5} />
        </mesh>
        {/* Losa cuadrado del cateto b */}
        <mesh position={L.slabB.pos} castShadow receiveShadow>
          <boxGeometry args={[L.slabB.size, TH, L.slabB.size]} />
          <meshStandardMaterial color={B_COL} transparent opacity={0.5} emissive={B_COL} emissiveIntensity={0.18} roughness={0.5} />
        </mesh>
        {/* Losa cuadrado de la hipotenusa */}
        <mesh position={L.slabC.pos} rotation={[0, L.slabC.rot, 0]} castShadow receiveShadow>
          <boxGeometry args={[L.slabC.size, TH, L.slabC.size]} />
          <meshStandardMaterial color={C_COL} transparent opacity={0.5} emissive={C_COL} emissiveIntensity={0.22} roughness={0.5} />
        </mesh>

        {/* Cuadrículas */}
        {L.gridA.map((l, i) => (
          <Line key={`ga${i}`} points={l} color="#ffffff" lineWidth={1} transparent opacity={0.28} />
        ))}
        {L.gridB.map((l, i) => (
          <Line key={`gb${i}`} points={l} color="#ffffff" lineWidth={1} transparent opacity={0.28} />
        ))}
        {L.gridC.map((l, i) => (
          <Line key={`gc${i}`} points={l} color="#ffffff" lineWidth={1} transparent opacity={0.32} />
        ))}

        {/* Triángulo */}
        <mesh geometry={L.triGeom}>
          <meshBasicMaterial color="#bfe8ff" transparent opacity={0.16} side={DoubleSide} />
        </mesh>
        <Line points={L.triLine} color="#eaf4ff" lineWidth={3.5} />
        <Line points={L.anguloRecto} color="#eaf4ff" lineWidth={2} transparent opacity={0.85} />

        {/* Etiquetas de área */}
        <Html center position={L.labA} distanceFactor={10} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 24, color: accent, textShadow: "0 2px 12px rgba(0,0,0,0.85)", whiteSpace: "nowrap" }}>
            a² = {a2}
          </div>
        </Html>
        <Html center position={L.labB} distanceFactor={10} pointerEvents="none">
          <div style={{ fontWeight: 900, fontSize: 24, color: B_COL, textShadow: "0 2px 12px rgba(0,0,0,0.85)", whiteSpace: "nowrap" }}>
            b² = {b2}
          </div>
        </Html>
        <Html center position={L.labC} distanceFactor={10} pointerEvents="none">
          <div style={{ textAlign: "center", textShadow: "0 2px 12px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 900, fontSize: 24, color: C_COL }}>c² = {c2}</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#ffffff", opacity: 0.85, ...{ fontVariantNumeric: "tabular-nums" } }}>
              {a2} + {b2} = {c2}
            </div>
          </div>
        </Html>

        {/* Etiquetas de longitud de los lados */}
        <Html center position={L.ladoA} distanceFactor={14} pointerEvents="none">
          <div style={{ fontWeight: 800, fontSize: 17, color: accent, textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>a = {a}</div>
        </Html>
        <Html center position={L.ladoB} distanceFactor={14} pointerEvents="none">
          <div style={{ fontWeight: 800, fontSize: 17, color: B_COL, textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>b = {b}</div>
        </Html>
        <Html center position={L.ladoC} distanceFactor={14} pointerEvents="none">
          <div style={{ fontWeight: 800, fontSize: 17, color: C_COL, textShadow: "0 1px 8px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
            c = {fmtNum(L.c)}
          </div>
        </Html>

        <ContactShadows position={[0, -0.02, 0]} opacity={0.3} scale={18} blur={3} far={7} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 7, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-7, 4, -2]} scale={[6, 6, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[7, 3, 3]} scale={[5, 5, 1]} color={B_COL} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
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
