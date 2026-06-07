"use client";

/**
 * Escena 3D del laboratorio "Biomas y ecosistemas: clima → vida" — R3F.
 * Se carga de forma diferida (ssr:false) desde LabBiomas.tsx.
 *
 * Un DIORAMA circular que se transforma según el bioma que resulta del clima
 * elegido (temperatura media anual + precipitación):
 *  · el SUELO cambia de color (arena, pasto seco, verde de selva, agua de manglar);
 *  · la VEGETACIÓN cambia de tipo y densidad (cactus, pinos, selva alta, pasto,
 *    manglar sobre raíces, zacatón de tundra);
 *  · el SOL brilla más cálido cuanto mayor es la temperatura;
 *  · cae LLUVIA (o NIEVE si hace frío) en proporción a la precipitación.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las animaciones mutan REFS
 * (sin setState ni Math.random/Date.now en el render → apto React Compiler).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { biomaDe, BIOMAS, TEMP_MIN, TEMP_MAX, PRECIP_MAX, type Bioma } from "./biomas-data";

export interface BiomasSceneProps {
  temp: number;
  precip: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const DISCO_R = 3.2;   // radio del diorama
const VEG_TOTAL = 52;  // posiciones de vegetación

/* Puntos repartidos en un disco (patrón girasol) — DETERMINISTA. */
function puntosDisco(n: number, radio: number): [number, number][] {
  const pts: [number, number][] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt((i + 0.5) / n) * radio;
    const th = ga * i;
    pts.push([Math.cos(th) * r, Math.sin(th) * r]);
  }
  return pts;
}

/* ─── Una planta, según el tipo de vegetación del bioma ──────────────────── */
function Planta({ tipo, color, h }: { tipo: Bioma["tipoVeg"]; color: string; h: number }) {
  switch (tipo) {
    case "selva":
      return (
        <group>
          <mesh position={[0, h * 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, h * 0.7, 6]} />
            <meshStandardMaterial color="#6b4a2a" roughness={1} />
          </mesh>
          <mesh position={[0, h * 0.78, 0]} castShadow>
            <sphereGeometry args={[h * 0.34, 10, 10]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, h * 1.04, 0]} castShadow>
            <sphereGeometry args={[h * 0.24, 10, 10]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
        </group>
      );
    case "conifera":
      return (
        <group>
          <mesh position={[0, h * 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, h * 0.24, 6]} />
            <meshStandardMaterial color="#5a3d25" roughness={1} />
          </mesh>
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <coneGeometry args={[h * 0.28, h * 0.55, 7]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, h * 0.78, 0]} castShadow>
            <coneGeometry args={[h * 0.18, h * 0.42, 7]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
        </group>
      );
    case "cactus":
      return (
        <group>
          <mesh position={[0, h * 0.5, 0]} castShadow>
            <capsuleGeometry args={[0.1, h * 0.7, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0.16, h * 0.62, 0]} rotation={[0, 0, -0.5]} castShadow>
            <capsuleGeometry args={[0.05, h * 0.3, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          <mesh position={[-0.15, h * 0.5, 0]} rotation={[0, 0, 0.5]} castShadow>
            <capsuleGeometry args={[0.05, h * 0.26, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        </group>
      );
    case "pasto":
      return (
        <group>
          {[-0.06, 0, 0.06].map((dx, k) => (
            <mesh key={k} position={[dx, h * 0.45, dx * 0.5]} rotation={[0, 0, dx * 2]} castShadow>
              <coneGeometry args={[0.03, h * 0.9, 4]} />
              <meshStandardMaterial color={color} roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>
      );
    case "selvaSeca":
      return (
        <group>
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, h * 0.9, 6]} />
            <meshStandardMaterial color="#7a5a38" roughness={1} />
          </mesh>
          <mesh position={[0, h * 0.92, 0]} castShadow>
            <sphereGeometry args={[h * 0.26, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.95} flatShading />
          </mesh>
        </group>
      );
    case "manglar":
      return (
        <group>
          {[0, 1, 2, 3].map((k) => {
            const a = (k / 4) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 0.12, h * 0.22, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]} castShadow>
                <cylinderGeometry args={[0.025, 0.04, h * 0.5, 5]} />
                <meshStandardMaterial color="#6b4a32" roughness={1} />
              </mesh>
            );
          })}
          <mesh position={[0, h * 0.62, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, h * 0.4, 6]} />
            <meshStandardMaterial color="#6b4a32" roughness={1} />
          </mesh>
          <mesh position={[0, h * 0.92, 0]} castShadow>
            <sphereGeometry args={[h * 0.32, 10, 10]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
        </group>
      );
    case "tundra":
    default:
      return (
        <group>
          <mesh position={[0, h * 0.4, 0]} castShadow>
            <coneGeometry args={[0.07, h * 0.8, 5]} />
            <meshStandardMaterial color={color} roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0.1, 0.04, 0.05]}>
            <dodecahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#9aa6b2" roughness={1} flatShading />
          </mesh>
        </group>
      );
  }
}

/* ─── Vegetación: planta el diorama según densidad ──────────────────────── */
function Vegetacion({ bioma }: { bioma: Bioma }) {
  const pts = useMemo(() => puntosDisco(VEG_TOTAL, DISCO_R - 0.3), []);
  const activos = Math.round(bioma.densidad * pts.length);
  return (
    <group>
      {pts.map((p, i) => {
        if (i >= activos) return null;
        const baseH = bioma.tipoVeg === "selva" ? 1.4
          : bioma.tipoVeg === "conifera" ? 1.15
          : bioma.tipoVeg === "manglar" ? 1.0
          : bioma.tipoVeg === "cactus" ? 0.9
          : bioma.tipoVeg === "selvaSeca" ? 0.95
          : bioma.tipoVeg === "pasto" ? 0.55
          : 0.3;
        const h = baseH * (0.8 + (i % 5) * 0.08);
        const rot = (i * 1.7) % (Math.PI * 2);
        return (
          <group key={i} position={[p[0], 0, p[1]]} rotation={[0, rot, 0]}>
            <Planta tipo={bioma.tipoVeg} color={bioma.colorVeg} h={h} />
          </group>
        );
      })}
    </group>
  );
}

/* ─── Lluvia / nieve (proporción a la precipitación) ────────────────────── */
function Precipitacion({ precip, temp, pausado }: { precip: number; temp: number; pausado: boolean }) {
  const CAP = 90;
  const ref = useRef<THREE.InstancedMesh>(null);
  const nieve = temp <= 4;
  const n = Math.round(Math.min(1, precip / PRECIP_MAX) * CAP);
  const vel = nieve ? 1.1 : 4.2;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => puntosDisco(CAP, DISCO_R - 0.1), []);
  const fases = useRef<number[]>(Array.from({ length: CAP }, (_, i) => (i * 0.137) % 1));

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    for (let i = 0; i < CAP; i++) {
      if (i < n) {
        fases.current[i] = ((fases.current[i] ?? 0) + d * vel * (0.6 + (i % 3) * 0.2)) % 1;
        const t = fases.current[i]!;
        const y = 5.0 - t * 5.2;
        const drift = nieve ? Math.sin((t + i) * 3) * 0.25 : 0;
        dummy.position.set(pos[i]![0] + drift, y, pos[i]![1]);
        dummy.scale.setScalar(nieve ? 0.06 : 1);
        if (!nieve) dummy.scale.set(0.012, 0.18, 0.012);
      } else {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0.0001);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  if (n === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CAP]}>
      {nieve ? <sphereGeometry args={[1, 6, 6]} /> : <boxGeometry args={[1, 1, 1]} />}
      <meshStandardMaterial
        color={nieve ? "#ffffff" : "#bfe0ff"}
        emissive={nieve ? "#ffffff" : "#9fccff"}
        emissiveIntensity={nieve ? 0.4 : 0.6}
        transparent opacity={nieve ? 0.95 : 0.7} toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ─── El diorama ─────────────────────────────────────────────────────────── */
function Diorama(props: BiomasSceneProps) {
  const { temp, precip, pausado } = props;
  const bioma = useMemo(() => BIOMAS[biomaDe(temp, precip)], [temp, precip]);

  const disco = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (disco.current && !pausado) disco.current.rotation.y += delta * 0.05;
  });

  // color del suelo del bioma
  const suelo = useMemo(() => new THREE.Color(bioma.colorSuelo), [bioma.colorSuelo]);
  // sol: pálido y frío → intenso y cálido según temperatura
  const fTemp = Math.min(1, Math.max(0, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
  const colSol = useMemo(() => {
    const frio = new THREE.Color("#cfe6ff");
    const calido = new THREE.Color("#ffb347");
    return frio.clone().lerp(calido, fTemp);
  }, [fTemp]);
  const intSol = 1.2 + fTemp * 1.8;

  return (
    <group>
      <ContactShadows position={[0, -0.22, 0]} opacity={0.4} scale={12} blur={2.4} far={6} />

      <group ref={disco}>
        {/* SUELO del diorama */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <cylinderGeometry args={[DISCO_R, DISCO_R, 0.4, 64]} />
          <meshStandardMaterial color={suelo} roughness={0.95} flatShading />
        </mesh>
        {/* borde de tierra bajo el suelo */}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[DISCO_R, DISCO_R - 0.15, 0.5, 64]} />
          <meshStandardMaterial color="#4a3826" roughness={1} />
        </mesh>

        {/* agua del manglar */}
        {bioma.agua && (
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[DISCO_R - 0.1, 48]} />
            <meshStandardMaterial color="#2f8fb8" emissive="#1d6e92" emissiveIntensity={0.3} roughness={0.2} metalness={0.3} transparent opacity={0.78} />
          </mesh>
        )}

        {/* nieve sobre la tundra */}
        {bioma.key === "tundra" && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[DISCO_R - 0.15, 48]} />
            <meshStandardMaterial color="#eef5fb" emissive="#dbe9f5" emissiveIntensity={0.3} roughness={0.6} transparent opacity={0.7} />
          </mesh>
        )}

        <Vegetacion bioma={bioma} />
      </group>

      {/* precipitación */}
      <Precipitacion precip={precip} temp={temp} pausado={pausado} />

      {/* Sol */}
      <group position={[-4.6, 4.4, 2.2]}>
        <mesh>
          <sphereGeometry args={[0.55, 20, 20]} />
          <meshStandardMaterial color={colSol} emissive={colSol} emissiveIntensity={intSol} toneMapped={false} />
        </mesh>
      </group>

      {/* etiqueta del bioma */}
      <Html position={[0, 2.7, 0]} center distanceFactor={11} pointerEvents="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 14px", borderRadius: 13, background: "rgba(2,12,28,0.82)", border: `1px solid ${bioma.colorVeg}aa`, whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className={`fa-solid ${bioma.icono}`} style={{ color: bioma.colorVeg, fontSize: 13 }} />
            <span style={{ color: "#eaf2fb", fontSize: 12.5, fontWeight: 900 }}>{bioma.nombre}</span>
          </span>
          <span style={{ color: bioma.colorVeg, fontSize: 10.5, fontWeight: 700 }}>{bioma.ejemploMx}</span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function BiomasScene(props: BiomasSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [6.5, 4.8, 7.5], fov: 45 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: BiomasSceneProps) {
  const { accent, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#06182c"]} />
      <fog attach="fog" args={["#06182c", 16, 42]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[-4.6, 4.4, 2.2]}
        intensity={1.6}
        color="#fff2cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[5, 2, 5]} intensity={0.4} color={accent} />

      <group key={`${resetNonce}`}>
        <Diorama {...props} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.1} position={[0, 8, 4]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-8, 2, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.7} position={[8, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={20}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.3, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.3} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
