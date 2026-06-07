"use client";

/**
 * Escena 3D del laboratorio de Semejanza de triángulos / medición indirecta — R3F.
 * Se carga de forma diferida (ssr:false) desde LabSemejanza.tsx.
 *
 * El Sol ilumina con rayos PARALELOS a una persona (referencia, de altura
 * conocida) y a una torre (el objeto inalcanzable). Cada uno con su sombra forma
 * un triángulo rectángulo: lado vertical = altura, lado horizontal = sombra,
 * hipotenusa = el rayo del Sol. Como los rayos son paralelos, AMBOS triángulos
 * comparten el mismo ángulo en la punta de la sombra → son SEMEJANTES (criterio
 * AA). El laboratorio dibuja las dos hipotenusas (con fotones viajando), marca el
 * ángulo igual en cada punta y deja ver que, al mover el Sol, las dos sombras se
 * alargan a la par: la proporción —y la altura calculada— no cambia.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; cada pieza animada vive en un
 * hijo del Canvas y muta REFS (sin setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { sombra, fmtM } from "./semejanza-data";

export interface SemejanzaSceneProps {
  ang: number;
  hRef: number;
  hObj: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const SCALE = 0.22; // 1 m del problema = 0.22 unidades de escena
const BASE_X = -3.6; // ambos objetos arrancan aquí; las sombras crecen hacia +X
const Z_PERSONA = 2.0;
const Z_TORRE = -2.0;

const SOL = "#ffd24a";
const SOMBRA_COL = "#0a1c14";
const PH_N = 6; // fotones por rayo

const rad = (deg: number): number => (deg * Math.PI) / 180;

/* ─── Hipotenusa: rayo del Sol con fotones viajando ────────────────────── */
function Rayo({ apex, tip, color: _color, pausado }: { apex: [number, number, number]; tip: [number, number, number]; color: string; pausado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: PH_N }, (_, i) => i / PH_N));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    for (let i = 0; i < PH_N; i++) {
      fases.current[i] = (fases.current[i]! + d * 0.32) % 1;
      const p = fases.current[i]!;
      dummy.position.set(
        apex[0] + (tip[0] - apex[0]) * p,
        apex[1] + (tip[1] - apex[1]) * p,
        apex[2] + (tip[2] - apex[2]) * p,
      );
      dummy.scale.setScalar(0.07);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Line points={[apex, tip]} color={SOL} lineWidth={1.6} transparent opacity={0.55} dashed dashSize={0.18} gapSize={0.12} />
      <instancedMesh ref={ref} args={[undefined, undefined, PH_N]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={SOL} emissive={SOL} emissiveIntensity={1.4} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ─── Un triángulo: objeto + sombra + hipotenusa + ángulo ──────────────── */
function Triangulo({
  z, hReal, sombraReal, angDeg, color, children, etiqueta, pausado,
}: {
  z: number; hReal: number; sombraReal: number; angDeg: number; color: string;
  children: React.ReactNode; etiqueta: string; pausado: boolean;
}) {
  const h = hReal * SCALE;
  const s = sombraReal * SCALE;
  const apex: [number, number, number] = [BASE_X, h, z];
  const tip: [number, number, number] = [BASE_X + s, 0.001, z];
  const base: [number, number, number] = [BASE_X, 0.001, z];

  return (
    <group>
      {/* objeto vertical */}
      <group position={[BASE_X, 0, z]}>{children}</group>

      {/* sombra proyectada en el suelo */}
      <mesh position={[BASE_X + s / 2, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[s, 0.5]} />
        <meshBasicMaterial color={SOMBRA_COL} transparent opacity={0.62} />
      </mesh>

      {/* contorno del triángulo: vertical (altura) + horizontal (sombra) */}
      <Line points={[base, apex]} color={color} lineWidth={2.4} />
      <Line points={[base, tip]} color={color} lineWidth={2.4} transparent opacity={0.85} />

      {/* hipotenusa = rayo del Sol con fotones */}
      <Rayo apex={apex} tip={tip} color={color} pausado={pausado} />

      {/* marca del ángulo (igual en ambos triángulos) en la punta de la sombra */}
      <Html position={tip} center distanceFactor={16} pointerEvents="none">
        <div style={{ transform: "translate(26px,-6px)", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
          <span style={{ color: SOL, fontSize: 12, fontWeight: 900 }}>θ = {Math.round(angDeg)}°</span>
        </div>
      </Html>

      {/* etiqueta de la altura */}
      <Html position={[BASE_X - 0.25, h + 0.15, z]} center distanceFactor={15} pointerEvents="none">
        <div style={{ background: "rgba(2,12,28,0.82)", border: `1px solid ${color}66`, borderRadius: 9, padding: "4px 9px", whiteSpace: "nowrap" }}>
          <span style={{ color: "#eaf2fb", fontSize: 11, fontWeight: 800 }}>{etiqueta} </span>
          <span style={{ color, fontSize: 12, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>{fmtM(hReal)}</span>
        </div>
      </Html>

      {/* etiqueta de la sombra */}
      <Html position={[BASE_X + s / 2, 0.02, z + 0.55]} center distanceFactor={15} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: "#9fb2c8", fontSize: 10.5, fontWeight: 700 }}>sombra </span>
          <span style={{ color: "#cfe0d6", fontSize: 11.5, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>{fmtM(sombraReal)}</span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Persona de referencia ────────────────────────────────────────────── */
function Persona({ h, color }: { h: number; color: string }) {
  const cuerpo = h * 0.62;
  const cabeza = h * 0.16;
  return (
    <group>
      <mesh position={[0, cuerpo / 2 + h * 0.04, 0]} castShadow>
        <capsuleGeometry args={[h * 0.13, cuerpo, 6, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, cuerpo + h * 0.04 + cabeza, 0]} castShadow>
        <sphereGeometry args={[cabeza, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} roughness={0.45} />
      </mesh>
    </group>
  );
}

/* ─── Torre del reloj ──────────────────────────────────────────────────── */
function Torre({ h }: { h: number }) {
  const w = Math.max(0.34, h * 0.13);
  const relojY = h * 0.82;
  const relojR = w * 0.42;
  return (
    <group>
      {/* fuste */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color="#b9c2cc" roughness={0.7} metalness={0.15} />
        <Edges threshold={15} color="#ffffff" />
      </mesh>
      {/* techo */}
      <mesh position={[0, h + w * 0.35, 0]} castShadow>
        <coneGeometry args={[w * 0.85, w * 0.8, 4]} />
        <meshStandardMaterial color="#7c5cff" emissive="#7c5cff" emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
      {/* carátula del reloj en la cara +Z (hacia la cámara) */}
      <group position={[0, relojY, w / 2 + 0.01]}>
        <mesh>
          <circleGeometry args={[relojR, 28]} />
          <meshStandardMaterial color="#fffdf5" emissive="#fff7d6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, relojR * 0.28, 0.01]}>
          <boxGeometry args={[relojR * 0.07, relojR * 0.6, 0.01]} />
          <meshStandardMaterial color="#1a2230" />
        </mesh>
        <mesh position={[relojR * 0.2, 0, 0.01]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[relojR * 0.07, relojR * 0.45, 0.01]} />
          <meshStandardMaterial color="#1a2230" />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Rayos paralelos de fondo (refuerzan "mismo ángulo") ──────────────── */
function RayosParalelos({ angDeg }: { angDeg: number }) {
  const lineas = useMemo(() => {
    const t = Math.tan(rad(angDeg));
    const L = 7; // largo del segmento
    const dx = L / Math.sqrt(1 + t * t);
    const dy = -t * dx;
    const starts: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const sx = BASE_X - 3 + i * 1.5;
      starts.push([sx, 6.2, 4.2]);
    }
    return starts.map((s) => ({
      a: s,
      b: [s[0] + dx, s[1] + dy, s[2]] as [number, number, number],
    }));
  }, [angDeg]);

  return (
    <group>
      {lineas.map((l, i) => (
        <Line key={i} points={[l.a, l.b]} color={SOL} lineWidth={1} transparent opacity={0.16} />
      ))}
    </group>
  );
}

/* ─── Contenido de la escena ───────────────────────────────────────────── */
function Mundo({ ang, hRef, hObj, accent, pausado }: { ang: number; hRef: number; hObj: number; accent: string; pausado: boolean }) {
  const sombraRef = useMemo(() => sombra(hRef, ang), [hRef, ang]);
  const sombraObj = useMemo(() => sombra(hObj, ang), [hObj, ang]);

  return (
    <group>
      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 24]} />
        <meshStandardMaterial color="#0b2a1c" roughness={0.96} metalness={0.04} />
      </mesh>
      <gridHelper args={[40, 40, "#1d4a37", "#10241b"]} position={[0, 0.005, 0]} />

      {/* Sol */}
      <group position={[BASE_X - 4.5, 6.2, 3.0]}>
        <mesh>
          <sphereGeometry args={[0.7, 24, 24]} />
          <meshStandardMaterial color={SOL} emissive={SOL} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={16} pointerEvents="none">
          <div style={{ transform: "translateY(34px)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-sun" style={{ color: SOL, fontSize: 14 }} />
            <span style={{ color: "#ffe08a", fontSize: 11, fontWeight: 800 }}>rayos paralelos</span>
          </div>
        </Html>
      </group>

      <RayosParalelos angDeg={ang} />

      {/* Triángulo de la referencia (persona) */}
      <Triangulo z={Z_PERSONA} hReal={hRef} sombraReal={sombraRef} angDeg={ang} color={accent} etiqueta="persona" pausado={pausado}>
        <Persona h={hRef * SCALE} color={accent} />
      </Triangulo>

      {/* Triángulo del objeto inalcanzable (torre) */}
      <Triangulo z={Z_TORRE} hReal={hObj} sombraReal={sombraObj} angDeg={ang} color="#34D399" etiqueta="torre" pausado={pausado}>
        <Torre h={hObj * SCALE} />
      </Triangulo>

      <ContactShadows position={[0, 0.0, 0]} opacity={0.3} scale={26} blur={2.6} far={8} />
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function SemejanzaScene(props: SemejanzaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [7.5, 5.5, 11.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: SemejanzaSceneProps) {
  const { ang, hRef, hObj, accent, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 26, 60]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[BASE_X - 4.5, 6.2, 3.0]}
        intensity={1.5}
        color="#fff2cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />

      <group key={`${resetNonce}`}>
        <Mundo ang={ang} hRef={hRef} hObj={hObj} accent={accent} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.3} position={[0, 8, 4]} scale={[14, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[-8, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.9} position={[8, 2, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={30}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.6, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
