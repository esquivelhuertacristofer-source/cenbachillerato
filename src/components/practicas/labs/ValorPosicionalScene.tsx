"use client";

/**
 * Escena 3D del laboratorio de Valor posicional (R3F).
 * Se carga de forma diferida (ssr:false) desde LabValorPosicional.tsx.
 *
 * Dibuja los BLOQUES BASE-10 (material Dienes) a escala relativa REAL:
 *   · unidad  = cubito 1×1×1            (1)
 *   · decena  = barra de 10 cubitos      (10)
 *   · centena = placa de 10×10 cubitos   (100)
 *   · millar  = cubo de 10×10×10 cubitos (1000)
 * Se ve por qué cada posición vale 10 veces la de su derecha: diez cubitos
 * forman una barra, diez barras una placa, diez placas un cubo. Cada bloque
 * lleva su rejilla de cubitos para que la composición sea visible.
 * Todo se calcula en el render desde las props (sin useFrame, sin Math.random)
 * → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useState } from "react";
import { OrbitControls, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { LUGARES, type Digitos } from "./valor-data";
import { Escenario } from "./_escenario";

export interface ValorPosicionalSceneProps {
  digitos: Digitos;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

type P3 = [number, number, number];

const U = 0.3; // arista de un cubito (unidad) en el mundo 3D

const COL = Object.fromEntries(LUGARES.map((l) => [l.key, l.color])) as Record<keyof Digitos, string>;

/** Centros X de cada columna y altura de la etiqueta. */
const ZONA: Record<keyof Digitos, number> = {
  millares: -5.4,
  centenas: -1.9,
  decenas: 1.7,
  unidades: 4.9,
};

/**
 * Genera las líneas internas de la rejilla de cubitos sobre las 3 caras
 * visibles (+X, +Y, +Z) de un bloque de nx×ny×nz cubitos. Devuelve pares de
 * vértices listos para un <lineSegments>.
 */
function gridSegments(nx: number, ny: number, nz: number): Float32Array {
  const hx = (nx * U) / 2;
  const hy = (ny * U) / 2;
  const hz = (nz * U) / 2;
  const s: number[] = [];
  const push = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) =>
    s.push(x1, y1, z1, x2, y2, z2);

  // cara +Z (frente)
  for (let i = 1; i < nx; i++) { const x = -hx + i * U; push(x, -hy, hz, x, hy, hz); }
  for (let j = 1; j < ny; j++) { const y = -hy + j * U; push(-hx, y, hz, hx, y, hz); }
  // cara +Y (techo)
  for (let i = 1; i < nx; i++) { const x = -hx + i * U; push(x, hy, -hz, x, hy, hz); }
  for (let k = 1; k < nz; k++) { const z = -hz + k * U; push(-hx, hy, z, hx, hy, z); }
  // cara +X (lateral)
  for (let j = 1; j < ny; j++) { const y = -hy + j * U; push(hx, y, -hz, hx, y, hz); }
  for (let k = 1; k < nz; k++) { const z = -hz + k * U; push(hx, -hy, z, hx, hy, z); }

  return new Float32Array(s);
}

function Block({ nx, ny, nz, position, color }: { nx: number; ny: number; nz: number; position: P3; color: string }) {
  const grid = useMemo(() => gridSegments(nx, ny, nz), [nx, ny, nz]);
  const [wx, wy, wz] = [nx * U, ny * U, nz * U];
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[wx, wy, wz]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} roughness={0.45} metalness={0.12} transparent opacity={0.92} />
        <Edges threshold={15} color="#eaf2fa" />
      </mesh>
      {grid.length > 0 && (
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[grid, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#cfe0ee" transparent opacity={0.32} />
        </lineSegments>
      )}
    </group>
  );
}

function Chip({ pos, color, children }: { pos: P3; color: string; children: React.ReactNode }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontWeight: 900,
          fontSize: 14,
          fontFamily: "system-ui, sans-serif",
          color: "#fff",
          background: "rgba(4,10,22,0.88)",
          padding: "4px 10px",
          borderRadius: 9,
          border: `1.5px solid ${color}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Una etiqueta por columna (se ocultan en pantallas angostas: la info está en el panel). */
function Etiquetas({ digitos }: { digitos: Digitos }) {
  const angosto = useThree((st) => st.size.width) < 640;
  if (angosto) return null;
  return (
    <>
      {LUGARES.map((l) => {
        const cifra = digitos[l.key];
        return (
          <Chip key={l.key} pos={[ZONA[l.key], 4.3, 0]} color={l.color}>
            <span style={{ display: "block", fontSize: 14, color: l.color }}>{l.nombre}</span>
            <span style={{ display: "block", fontSize: 14 }}>
              {cifra} × {l.valor} = {(cifra * l.valor).toLocaleString("es-MX")}
            </span>
          </Chip>
        );
      })}
    </>
  );
}

export default function ValorPosicionalScene(props: ValorPosicionalSceneProps) {
  const { digitos, accent } = props;

  // Posiciones de cada bloque, derivadas de las cifras (puro useMemo).
  const bloques = useMemo(() => {
    const out: { key: string; nx: number; ny: number; nz: number; position: P3; color: string }[] = [];

    // Unidades: cubitos apilados en Y.
    const cu = digitos.unidades;
    for (let i = 0; i < cu; i++) {
      out.push({ key: `u${i}`, nx: 1, ny: 1, nz: 1, color: COL.unidades, position: [ZONA.unidades, (i + 0.5) * U, 0] });
    }
    // Decenas: barras verticales (1×10×1) en fila a lo largo de X.
    const cd = digitos.decenas;
    for (let i = 0; i < cd; i++) {
      const x = ZONA.decenas + (i - (cd - 1) / 2) * (U * 1.55);
      out.push({ key: `d${i}`, nx: 1, ny: 10, nz: 1, color: COL.decenas, position: [x, (10 * U) / 2, 0] });
    }
    // Centenas: placas (10×1×10) apiladas en Y como hojas.
    const cc = digitos.centenas;
    for (let i = 0; i < cc; i++) {
      out.push({ key: `c${i}`, nx: 10, ny: 1, nz: 10, color: COL.centenas, position: [ZONA.centenas, (i + 0.5) * U, 0] });
    }
    // Millares: cubos (10×10×10) en fila a lo largo de Z.
    const cm = digitos.millares;
    for (let i = 0; i < cm; i++) {
      const z = (i - (cm - 1) / 2) * (10 * U * 1.15);
      out.push({ key: `m${i}`, nx: 10, ny: 10, nz: 10, color: COL.millares, position: [ZONA.millares, (10 * U) / 2, z] });
    }
    return out;
  }, [digitos]);

  const [camZ] = useState(() => (typeof window !== "undefined" && window.innerWidth < 640 ? 24 : 15.5));
  const unid = digitos.unidades;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [1.5, 6.5, camZ], fov: 42 }}
    >
      <Escenario acento={accent} suelo={0} />

      <group key={props.resetNonce}>
        {bloques.map((b) => (
          <Block key={b.key} nx={b.nx} ny={b.ny} nz={b.nz} position={b.position} color={b.color} />
        ))}

        {/* Medidor del canje: la altura de UNA barra (10 cubitos) junto a las unidades.
            Cuando los cubitos la llenan, ya se pueden cambiar por una decena. */}
        <mesh position={[ZONA.unidades + 0.55, (10 * U) / 2, 0]}>
          <boxGeometry args={[U * 1.15, 10 * U, U * 1.15]} />
          <meshStandardMaterial color="#cfe0ee" transparent opacity={unid >= 9 ? 0.22 : 0.1} depthWrite={false} />
          <Edges threshold={15} color={unid >= 9 ? "#fde68a" : "#8aa2b6"} />
        </mesh>

        <Etiquetas digitos={digitos} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={10}
        maxDistance={30}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        target={[-0.2, 1.4, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur radius={0.66} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
