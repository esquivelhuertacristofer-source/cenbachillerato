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
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { LUGARES, type Digitos } from "./valor-data";

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
  millares: -6.4,
  centenas: -2.0,
  decenas: 2.2,
  unidades: 5.8,
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
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} roughness={0.45} metalness={0.12} transparent opacity={0.9} />
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

function Chip({ pos, color, df = 18, children }: { pos: P3; color: string; df?: number; children: React.ReactNode }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[10, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontWeight: 800,
          fontSize: 12,
          color: "#fff",
          background: `${color}e6`,
          padding: "4px 10px",
          borderRadius: 9,
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </Html>
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

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [2, 7.5, 17], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 60]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 11, 8]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-9, 5, 6]} intensity={9} color={accent} />
      <pointLight position={[8, -2, 6]} intensity={5} color="#bfe8ff" />

      <group key={props.resetNonce}>
        {/* Plataforma base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, -0.01, 0]} receiveShadow>
          <planeGeometry args={[26, 16]} />
          <meshStandardMaterial color="#08192c" roughness={0.95} metalness={0.05} />
        </mesh>

        {bloques.map((b) => (
          <Block key={b.key} nx={b.nx} ny={b.ny} nz={b.nz} position={b.position} color={b.color} />
        ))}

        {/* Etiqueta por columna: nombre · cifra × valor = aporte */}
        {LUGARES.map((l) => {
          const cifra = digitos[l.key];
          const aporte = cifra * l.valor;
          return (
            <Chip key={l.key} pos={[ZONA[l.key], 3.7, 0]} color={cifra > 0 ? l.color : "#16263a"} df={20}>
              <span style={{ display: "block", fontSize: 10, opacity: 0.85, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l.nombre}</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 900 }}>
                {cifra} × {l.valor.toLocaleString("es-MX")} = {aporte.toLocaleString("es-MX")}
              </span>
            </Chip>
          );
        })}

        <ContactShadows position={[-0.4, 0, 0]} opacity={0.32} scale={26} blur={2.6} far={7} color="#020a16" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 7, 4]} scale={[12, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-9, 0, -2]} scale={[6, 10, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, -2, 4]} scale={[6, 8, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={30}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        target={[-0.4, 1.5, 0]}
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
