"use client";

/**
 * Escena 3D del laboratorio de la Ecuación de la recta — R3F.
 * Se carga de forma diferida (ssr:false) desde LabEcuacionRecta.tsx.
 *
 * Sobre un plano cartesiano (cuatro cuadrantes, ejes X e Y perpendiculares), la
 * ecuación y = m·x + b se dibuja como una RECTA. Se marcan sus partes:
 *   • la ORDENADA AL ORIGEN (0, b): punto donde cruza el eje Y;
 *   • la RAÍZ (x, 0): punto donde cruza el eje X;
 *   • el TRIÁNGULO DE PENDIENTE: avance de 1 en X y subida de m en Y (m = subida/avance);
 *   • las SOLUCIONES enteras: cada punto de la recta es una solución de la ecuación.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un
 * hijo del Canvas y muta REFS (nada de setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { raizX, solucionesEnteras, RANGO, fmtNum } from "./ecuacion-recta-data";

export interface EcuacionRectaSceneProps {
  m: number;
  b: number;
  accent: string;
  showTriangulo: boolean;
  showSoluciones: boolean;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const CIAN = "#7fd4ff";
const EJE = "#9fb2c8";
const H = RANGO; // medio-ancho del plano (mundo: −H..H)

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Recorta la recta y = m·x + b a la caja [−H,H]×[−H,H]. Devuelve sus 2 extremos. */
function clipLinea(m: number, b: number): [number, number][] {
  const raw: [number, number][] = [];
  for (const x of [-H, H]) {
    const y = m * x + b;
    if (y >= -H - 1e-6 && y <= H + 1e-6) raw.push([x, clamp(y, -H, H)]);
  }
  if (m !== 0) {
    for (const y of [-H, H]) {
      const x = (y - b) / m;
      if (x >= -H - 1e-6 && x <= H + 1e-6) raw.push([clamp(x, -H, H), y]);
    }
  }
  // dedupe (puntos casi iguales) y conservar 2 extremos
  const uniq: [number, number][] = [];
  for (const p of raw) {
    if (!uniq.some((q) => Math.abs(q[0] - p[0]) < 1e-4 && Math.abs(q[1] - p[1]) < 1e-4)) uniq.push(p);
  }
  return uniq.length >= 2 ? [uniq[0]!, uniq[uniq.length - 1]!] : [];
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ m, b, accent, showTriangulo, showSoluciones, pausado }: {
  m: number; b: number; accent: string; showTriangulo: boolean; showSoluciones: boolean; pausado: boolean;
}) {
  const seg = useMemo(() => clipLinea(m, b), [m, b]);
  const xr = useMemo(() => raizX(m, b), [m, b]);
  const soluciones = useMemo(() => solucionesEnteras(m, b), [m, b]);

  // puntos de la recta (mundo, z=0)
  const linea = useMemo<[number, number, number][]>(
    () => (seg.length === 2 ? [[seg[0]![0], seg[0]![1], 0], [seg[1]![0], seg[1]![1], 0]] : []),
    [seg]
  );

  // punto que viaja sobre la recta
  const punto = useRef<THREE.Mesh>(null);
  const fase = useRef(0);
  useFrame((_, delta) => {
    const d = pausado ? 0 : delta;
    fase.current = (fase.current + d * 0.18) % 1;
    const mesh = punto.current;
    if (mesh && seg.length === 2) {
      const t = fase.current;
      const x = seg[0]![0] + (seg[1]![0] - seg[0]![0]) * t;
      const y = seg[0]![1] + (seg[1]![1] - seg[0]![1]) * t;
      mesh.position.set(x, y, 0.02);
    }
  });

  const bVisible = Math.abs(b) <= H;
  const triPunta = b + m; // (1, b+m)
  const triDentro = showTriangulo && Math.abs(b) <= H && Math.abs(triPunta) <= H && m !== 0;

  // marcas de unidades sobre los ejes (−H..H)
  const ticks = useMemo(() => {
    const t: number[] = [];
    for (let i = -H; i <= H; i++) if (i !== 0) t.push(i);
    return t;
  }, []);

  return (
    <group>
      {/* tablero del plano */}
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <planeGeometry args={[2 * H + 1.4, 2 * H + 1.4]} />
        <meshStandardMaterial color="#07182c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* rejilla del plano cartesiano */}
      <gridHelper
        args={[2 * H, 2 * H, "#274868", "#16314c"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.04]}
      />

      {/* eje X */}
      <Line points={[[-H - 0.4, 0, 0], [H + 0.5, 0, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[H + 0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[H + 0.95, 0.05, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>X</div>
      </Html>

      {/* eje Y */}
      <Line points={[[0, -H - 0.4, 0], [0, H + 0.5, 0]]} color={EJE} lineWidth={2} />
      <mesh position={[0, H + 0.6, 0]}>
        <coneGeometry args={[0.13, 0.34, 16]} />
        <meshStandardMaterial color={EJE} />
      </mesh>
      <Html position={[0.05, H + 0.95, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 12, fontWeight: 900 }}>Y</div>
      </Html>

      {/* marcas de unidad */}
      {ticks.map((i) => (
        <group key={`tx${i}`}>
          <Line points={[[i, -0.1, 0], [i, 0.1, 0]]} color={EJE} lineWidth={1} />
          <Line points={[[-0.1, i, 0], [0.1, i, 0]]} color={EJE} lineWidth={1} />
        </group>
      ))}
      <Html position={[-0.32, -0.34, 0]} center distanceFactor={16} pointerEvents="none">
        <div style={{ color: EJE, fontSize: 10, fontWeight: 700 }}>0</div>
      </Html>

      {/* soluciones de coordenadas enteras (cada punto = una solución) */}
      {showSoluciones && soluciones.map((p, i) => (
        <mesh key={`sol${i}`} position={[p.x, p.y, 0.01]}>
          <ringGeometry args={[0.1, 0.17, 22]} />
          <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* la recta */}
      {linea.length === 2 && <Line points={linea} color={accent} lineWidth={4} />}

      {/* triángulo de pendiente desde (0, b) */}
      {triDentro && (
        <>
          <Line points={[[0, b, 0], [1, b, 0]]} color={CIAN} lineWidth={2} dashed dashSize={0.12} gapSize={0.08} />
          <Line points={[[1, b, 0], [1, b + m, 0]]} color={ORO} lineWidth={2} dashed dashSize={0.12} gapSize={0.08} />
          <Html position={[0.5, b - 0.32, 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: CIAN, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>avance 1</div>
          </Html>
          <Html position={[1.42, b + m / 2, 0]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: ORO, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
              subida {fmtNum(m, 2)}
            </div>
          </Html>
        </>
      )}

      {/* ordenada al origen (0, b) */}
      {bVisible && (
        <group position={[0, b, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          <Html position={[0.1, 0.48, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${ORO}66`, borderRadius: 8, padding: "4px 8px", whiteSpace: "nowrap" }}>
              <span style={{ color: ORO, fontSize: 11, fontWeight: 900 }}>ordenada (0, {fmtNum(b, 1)})</span>
            </div>
          </Html>
        </group>
      )}

      {/* raíz / cruce con el eje X (x, 0) */}
      {xr !== null && Math.abs(xr) <= H && (
        <group position={[xr, 0, 0.02]}>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.12, 0.2, 24]} />
            <meshStandardMaterial color={CIAN} emissive={CIAN} emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, -0.42, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ color: CIAN, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
              raíz ({fmtNum(xr, 1)}, 0)
            </div>
          </Html>
        </group>
      )}

      {/* punto viajero */}
      {linea.length === 2 && (
        <mesh ref={punto} castShadow>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.5} metalness={0.1} roughness={0.4} />
        </mesh>
      )}

      <ContactShadows position={[0, 0, -0.05]} opacity={0.28} scale={2 * H + 6} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function EcuacionRectaScene(props: EcuacionRectaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 16], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: EcuacionRectaSceneProps) {
  const { m, b, accent, showTriangulo, showSoluciones, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 54]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 8, 9]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 0, 8]} intensity={2.4} color="#ffffff" />

      <group key={`${resetNonce}`}>
        <Plano m={m} b={b} accent={accent} showTriangulo={showTriangulo} showSoluciones={showSoluciones} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 7, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
