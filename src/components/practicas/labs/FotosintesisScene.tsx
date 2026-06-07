"use client";

/**
 * Escena 3D del laboratorio de Fotosíntesis — R3F.
 * Se carga de forma diferida (ssr:false) desde LabFotosintesis.tsx.
 *
 * Un cloroplasto estilizado (cuerpo verde translúcido con pilas de tilacoides /
 * grana en su interior) recibe los REACTIVOS y emite los PRODUCTOS de la
 * ecuación 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂:
 *   · fotones de luz solar que bajan del Sol (caudal ∝ intensidad luminosa),
 *   · moléculas de CO₂ que entran (caudal ∝ concentración de CO₂),
 *   · moléculas de H₂O que suben desde la raíz,
 *   · O₂ que escapa hacia arriba y glucosa que baja al tallo (caudal ∝ TASA).
 * El NÚMERO de partículas que fluye en cada chorro es proporcional a su factor,
 * así se ve cómo la luz, el CO₂ y la temperatura limitan el proceso.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; cada chorro vive en un hijo del
 * Canvas y muta REFS sobre un InstancedMesh (sin setState ni Math.random).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { factorLuz, factorCO2, tasa } from "./fotosintesis-data";

export interface FotosintesisSceneProps {
  luz: number;
  co2: number;
  temp: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const SOL = "#ffd24a";
const VERDE = "#34D399";
const AZUL_CO2 = "#7fb2ff";
const CIAN_H2O = "#67e8f9";
const O2_COL = "#e8f4ff";
const GLU = "#ffb454";

type Vec3 = [number, number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── Chorro de partículas a lo largo de un camino (caudal ∝ rate) ─────── */
function Chorro({
  count, from, to, color, rate, pausado, size = 0.13, speed = 0.45, wobble = 0.22,
}: {
  count: number; from: Vec3; to: Vec3; color: string; rate: number;
  pausado: boolean; size?: number; speed?: number; wobble?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: count }, (_, i) => i / count));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // dirección perpendicular para el bamboleo (estable, no aleatoria)
  const perp = useMemo(() => {
    const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3().crossVectors(dir, up).normalize();
  }, [from, to]);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    const activos = Math.round(clamp(rate, 0, 1) * count);
    for (let i = 0; i < count; i++) {
      fases.current[i] = (fases.current[i]! + d * (speed + (i % 3) * 0.04)) % 1;
      const p = fases.current[i]!;
      const x = from[0] + (to[0] - from[0]) * p;
      const y = from[1] + (to[1] - from[1]) * p;
      const z = from[2] + (to[2] - from[2]) * p;
      const w = Math.sin((p + i * 0.3) * Math.PI * 2) * wobble * Math.sin(Math.PI * p);
      dummy.position.set(x + perp.x * w, y + perp.y * w, z + perp.z * w);
      const visible = i < activos;
      const s = visible ? size * (0.6 + 0.4 * Math.sin(Math.PI * p)) : 0.0001;
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} toneMapped={false} />
    </instancedMesh>
  );
}

/* ─── Cloroplasto con sus tilacoides (grana) ──────────────────────────── */
function Cloroplasto({ intensidad, pausado }: { intensidad: number; pausado: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const fase = useRef(0);

  useFrame((_, delta) => {
    const g = grupo.current;
    if (!g) return;
    if (!pausado) fase.current += delta;
    // latido sutil proporcional a la actividad fotosintética
    const s = 1 + Math.sin(fase.current * 2) * 0.012 * (0.4 + intensidad);
    g.scale.set(s, s, s);
  });

  // posiciones de las pilas de grana (estables)
  const grana: { pos: Vec3; n: number }[] = useMemo(
    () => [
      { pos: [-0.55, 1.15, 0.15], n: 5 },
      { pos: [0.5, 1.35, -0.2], n: 6 },
      { pos: [0.15, 0.85, 0.5], n: 4 },
      { pos: [-0.35, 1.5, -0.4], n: 4 },
    ],
    []
  );

  return (
    <group ref={grupo} position={[0, 0, 0]}>
      {/* membrana externa translúcida */}
      <mesh scale={[2.25, 1.5, 1.7]} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1, 40, 32]} />
        <meshPhysicalMaterial
          color={"#0e6b3f"}
          emissive={VERDE}
          emissiveIntensity={0.12 + intensidad * 0.22}
          transmission={0.55}
          thickness={1.2}
          roughness={0.35}
          metalness={0}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* estroma interior (relleno tenue) */}
      <mesh scale={[2.05, 1.32, 1.52]} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color={"#0a5a34"} emissive={VERDE} emissiveIntensity={0.06} transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* pilas de tilacoides (grana): discos verdes apilados */}
      {grana.map((gr, gi) => (
        <group key={gi} position={gr.pos}>
          {Array.from({ length: gr.n }).map((_, di) => (
            <mesh key={di} position={[0, di * 0.12 - (gr.n * 0.12) / 2, 0]} rotation={[0, gi * 0.7, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.07, 20]} />
              <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.35 + intensidad * 0.5} roughness={0.4} metalness={0.1} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ─── Contenido de la escena ──────────────────────────────────────────── */
function Mundo({ luz, co2, temp, accent: _accent, pausado }: { luz: number; co2: number; temp: number; accent: string; pausado: boolean }) {
  const fLuz = useMemo(() => factorLuz(luz), [luz]);
  const fCO2 = useMemo(() => factorCO2(co2), [co2]);
  const t = useMemo(() => tasa(luz, co2, temp), [luz, co2, temp]);

  const solPos: Vec3 = [-4.6, 4.2, 0.6];
  const cloEntradaLuz: Vec3 = [-0.9, 1.7, 0.4];
  const co2Inicio: Vec3 = [4.8, 1.5, -0.6];
  const co2Fin: Vec3 = [1.1, 1.25, 0];
  const h2oInicio: Vec3 = [-2.4, -1.6, 0.9];
  const h2oFin: Vec3 = [-0.7, 0.6, 0.4];
  const o2Inicio: Vec3 = [0.5, 1.9, 0.6];
  const o2Fin: Vec3 = [3.6, 3.4, 0.5];
  const gluInicio: Vec3 = [0, 0.8, 0];
  const gluFin: Vec3 = [0.2, -1.7, -0.2];

  return (
    <group position={[0, 0, 0]}>
      {/* suelo / superficie de la hoja */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#06241a" roughness={0.95} metalness={0.04} />
      </mesh>

      {/* Sol */}
      <mesh position={solPos}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color={SOL} emissive={SOL} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <Html position={[solPos[0], solPos[1] + 0.9, solPos[2]]} center distanceFactor={13} pointerEvents="none">
        <div style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-sun" style={{ color: SOL, fontSize: 16 }} />
          <span style={{ color: "#ffe08a", fontSize: 11, fontWeight: 800 }}>luz solar</span>
        </div>
      </Html>

      <Cloroplasto intensidad={t} pausado={pausado} />

      {/* ── Reactivos entrando ── */}
      {/* fotones de luz (caudal ∝ intensidad luminosa) */}
      <Chorro count={16} from={solPos} to={cloEntradaLuz} color={SOL} rate={fLuz} pausado={pausado} size={0.12} speed={0.7} wobble={0.12} />
      {/* CO₂ (caudal ∝ concentración de CO₂) */}
      <Chorro count={12} from={co2Inicio} to={co2Fin} color={AZUL_CO2} rate={fCO2} pausado={pausado} size={0.15} speed={0.4} />
      {/* H₂O subiendo desde la raíz */}
      <Chorro count={12} from={h2oInicio} to={h2oFin} color={CIAN_H2O} rate={0.85} pausado={pausado} size={0.13} speed={0.45} />

      {/* ── Productos saliendo (caudal ∝ TASA) ── */}
      {/* O₂ */}
      <Chorro count={14} from={o2Inicio} to={o2Fin} color={O2_COL} rate={t} pausado={pausado} size={0.15} speed={0.5} />
      {/* glucosa */}
      <Chorro count={12} from={gluInicio} to={gluFin} color={GLU} rate={t} pausado={pausado} size={0.17} speed={0.4} wobble={0.1} />

      {/* etiquetas de moléculas */}
      <MolLabel pos={[co2Inicio[0] + 0.2, co2Inicio[1] + 0.5, co2Inicio[2]]} color={AZUL_CO2} icon="fa-arrow-left" txt="6 CO₂" />
      <MolLabel pos={[h2oInicio[0] - 0.2, h2oInicio[1] - 0.1, h2oInicio[2]]} color={CIAN_H2O} icon="fa-arrow-up" txt="6 H₂O" />
      <MolLabel pos={[o2Fin[0] + 0.3, o2Fin[1] + 0.4, o2Fin[2]]} color={O2_COL} icon="fa-arrow-up" txt="6 O₂" />
      <MolLabel pos={[gluFin[0] + 0.6, gluFin[1] + 0.2, gluFin[2]]} color={GLU} icon="fa-arrow-down" txt="C₆H₁₂O₆" />

      <ContactShadows position={[0, -1.93, 0]} opacity={0.32} scale={11} blur={2.6} far={6} />
    </group>
  );
}

function MolLabel({ pos, color, icon, txt }: { pos: Vec3; color: string; icon: string; txt: string }) {
  return (
    <Html position={pos} center distanceFactor={13} pointerEvents="none">
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(2,12,28,0.8)", border: `1px solid ${color}66`, borderRadius: 9, padding: "5px 9px", whiteSpace: "nowrap" }}>
        <i className={`fa-solid ${icon}`} style={{ color, fontSize: 11 }} />
        <span style={{ color: "#eaf2fb", fontSize: 12, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{txt}</span>
      </div>
    </Html>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function FotosintesisScene(props: FotosintesisSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [5.5, 3.2, 8.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: FotosintesisSceneProps) {
  const { luz, co2, temp, accent, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#041520"]} />
      <fog attach="fog" args={["#041520", 18, 42]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-4.6, 6, 3]}
        intensity={1.5}
        color={SOL}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[4, 3, 4]} intensity={1.6} color="#bfe8ff" />

      <group key={`${resetNonce}`}>
        <Mundo luz={luz} co2={co2} temp={temp} accent={accent} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.3} position={[0, 8, 3]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-8, 3, -2]} scale={[5, 6, 1]} color={SOL} />
        <Lightformer intensity={1.0} position={[8, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={20}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.95}
        target={[0, 1.1, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.65} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.78} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
