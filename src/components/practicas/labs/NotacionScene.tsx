"use client";

/**
 * Escena 3D del laboratorio de Notación científica (R3F).
 * Se carga de forma diferida (ssr:false) desde LabNotacionCientifica.tsx.
 *
 * Dibuja una TORRE LOGARÍTMICA vertical: cada decena (10ⁿ) es un peldaño, del
 * átomo (abajo) al Sol (arriba). Un marcador luminoso viaja a la altura
 * log₁₀(a × 10ⁿ); su tamaño crece con la mantisa dentro de cada decena y se
 * reinicia al pasar a la siguiente potencia — así se ve que 1 ≤ a < 10.
 * Todo se calcula en el render desde las props (sin useFrame, sin Math.random)
 * → cumple las reglas del React Compiler.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { N_MIN, N_MAX, logPos, REFERENCIAS, fmtA } from "./notacion-data";

export interface NotacionSceneProps {
  a: number;
  n: number;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
}

const H = 10; // alto de la torre en el mundo 3D
const RANGE = N_MAX - N_MIN;

type P3 = [number, number, number];

const posY = (logv: number) => ((logv - N_MIN) / RANGE) * H - H / 2;

function Chip({ pos, color, df = 16, children }: { pos: P3; color: string; df?: number; children: React.ReactNode }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[10, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontWeight: 800,
          fontSize: 12,
          color: "#fff",
          background: `${color}e6`,
          padding: "3px 9px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

export default function NotacionScene(props: NotacionSceneProps) {
  const { a, n, accent } = props;

  const decenas = useMemo(() => {
    const out: number[] = [];
    for (let i = N_MIN; i <= N_MAX; i++) out.push(i);
    return out;
  }, []);

  const yMark = posY(logPos(a, n));
  // radio del marcador: crece con la mantisa dentro de la decena (1→10) y se
  // reinicia al subir de potencia → muestra que la mantisa va de 1 a (casi) 10.
  const rMark = 0.18 + Math.log10(a) * 0.42;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [7.5, 1.5, 13.5], fov: 42 }}
    >
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 24, 52]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 9, 7]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-7, 4, 5]} intensity={9} color={accent} />
      <pointLight position={[6, -3, 5]} intensity={5} color="#bfe8ff" />

      <group key={props.resetNonce}>
        {/* Eje vertical de la torre */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, H + 0.6, 16]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.25} />
        </mesh>
        {/* Flecha superior (hacia lo grande) */}
        <mesh position={[0, H / 2 + 0.45, 0]}>
          <coneGeometry args={[0.16, 0.4, 20]} />
          <meshStandardMaterial color="#8aa2b6" emissive="#8aa2b6" emissiveIntensity={0.3} />
        </mesh>

        {/* Peldaños 10ⁿ con su etiqueta */}
        {decenas.map((i) => {
          const y = posY(i);
          const mayor = i % 5 === 0 || i === 0;
          const col = i === 0 ? "#cfe0ee" : "#34506a";
          return (
            <group key={i} position={[0, y, 0]}>
              <mesh position={[-0.32, 0, 0]}>
                <boxGeometry args={[mayor ? 0.66 : 0.4, mayor ? 0.05 : 0.035, 0.05]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={mayor ? 0.4 : 0.2} />
              </mesh>
              {mayor && (
                <Chip pos={[-1.35, 0, 0]} color={i === 0 ? "#1b3147" : "#16263a"} df={17}>
                  10<sup style={{ fontSize: 8 }}>{i}</sup>
                </Chip>
              )}
            </group>
          );
        })}

        {/* Referencias reales a su altura verdadera */}
        {REFERENCIAS.map((r) => {
          const y = posY(logPos(r.a, r.n));
          const activo = r.n === n;
          return (
            <group key={r.key} position={[0.32, y, 0]}>
              <mesh position={[0.18, 0, 0]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color={activo ? accent : "#6f8aa3"} emissive={activo ? accent : "#6f8aa3"} emissiveIntensity={activo ? 0.7 : 0.3} />
              </mesh>
              <Chip pos={[1.55, 0, 0]} color={activo ? accent : "#142231"} df={17}>
                <i className={`fa-solid ${r.icono}`} style={{ marginRight: 6, opacity: 0.9 }} />
                {r.nombre}
              </Chip>
            </group>
          );
        })}

        {/* Marcador del valor actual */}
        <group position={[0, yMark, 0]}>
          {/* línea hasta la base para leer la "altura" = magnitud */}
          <Line points={[[0, -H / 2 - yMark, 0], [0, 0, 0]]} color={accent} lineWidth={1.6} transparent opacity={0.35} dashed dashSize={0.18} gapSize={0.14} />
          <mesh castShadow>
            <sphereGeometry args={[rMark, 40, 40]} />
            <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.95} roughness={0.2} metalness={0.35} />
          </mesh>
          {/* anillo ecuatorial */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[rMark + 0.12, 0.018, 12, 48]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
          </mesh>
          <Chip pos={[0, rMark + 0.55, 0]} color={accent} df={14}>
            {fmtA(a)} × 10<sup style={{ fontSize: 8 }}>{n}</sup> m
          </Chip>
        </group>

        <ContactShadows position={[0, -H / 2 - 0.5, 0]} opacity={0.22} scale={16} blur={3} far={6} color="#16263a" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 6, 3]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-7, 0, -2]} scale={[5, 10, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[7, -2, 3]} scale={[5, 8, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
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
