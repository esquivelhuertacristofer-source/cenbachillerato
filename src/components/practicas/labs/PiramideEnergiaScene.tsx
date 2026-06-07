"use client";

/**
 * Escena 3D del laboratorio de Pirámide de energía (flujo trófico) — R3F.
 * Se carga de forma diferida (ssr:false) desde LabPiramideEnergia.tsx.
 *
 * Cuatro plataformas apiladas forman la pirámide trófica: productores (base,
 * ancha) → primarios → secundarios → terciarios (cúspide, angosta). El ANCHO de
 * cada plataforma sigue una escala logarítmica de su energía, así la caída ×10
 * de cada salto se ve como una pirámide. Entre niveles sube un hilo DELGADO de
 * energía (solo el ~10% que se transfiere) mientras un PENACHO de calor escapa a
 * los lados (el ~90% que se pierde) — enorme en la base, mínimo arriba.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; cada pieza animada vive en un
 * hijo del Canvas y muta REFS (sin setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { NIVELES, N_NIVELES, flujo, fmtKcal, fmtPct } from "./piramide-energia-data";

export interface PiramideEnergiaSceneProps {
  e0: number;
  eficPct: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const CALOR = "#ff7a4a";
const TIER_H = 0.85;
const GAP = 0.55;
const W_BASE = 5.2; // ancho de la plataforma de productores
const W_MIN = 0.9; // ancho mínimo (cúspide)
const HEAT_N = 16; // partículas de calor por penacho
const UP_N = 9; // partículas de energía por hilo ascendente

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── Penacho de calor (90% que se pierde) ─────────────────────────────── */
function Penacho({ y, radio, intensidad, pausado }: { y: number; radio: number; intensidad: number; pausado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: HEAT_N }, (_, i) => i / HEAT_N));
  const angs = useRef<number[]>(Array.from({ length: HEAT_N }, (_, i) => (i * 2.39996))); // ángulo áureo
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(CALOR), []);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    for (let i = 0; i < HEAT_N; i++) {
      fases.current[i] = (fases.current[i]! + d * (0.28 + (i % 3) * 0.04)) % 1;
      const p = fases.current[i]!;
      const a = angs.current[i]! + p * 0.8;
      const r = radio * (0.35 + 0.65 * p);
      const lift = p * 2.4 * (0.5 + intensidad);
      dummy.position.set(Math.cos(a) * r, y + lift, Math.sin(a) * r);
      const s = clamp(intensidad, 0.04, 1) * (0.55 + 0.5 * Math.sin(Math.PI * p)) * 0.5;
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      col.setRGB(1, 0.48 - 0.28 * p, 0.26 - 0.18 * p);
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, HEAT_N]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color={CALOR} emissive={CALOR} emissiveIntensity={0.9} transparent opacity={0.7} toneMapped={false} depthWrite={false} />
    </instancedMesh>
  );
}

/* ─── Hilo de energía que sube (10% transferido) ───────────────────────── */
function Subida({ yFrom, yTo, intensidad, accent, pausado }: { yFrom: number; yTo: number; intensidad: number; accent: string; pausado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: UP_N }, (_, i) => i / UP_N));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    for (let i = 0; i < UP_N; i++) {
      fases.current[i] = (fases.current[i]! + d * 0.5) % 1;
      const p = fases.current[i]!;
      const wob = Math.sin((p + i) * 6.28) * 0.08;
      dummy.position.set(wob, yFrom + (yTo - yFrom) * p, 0);
      const s = clamp(intensidad, 0.05, 1) * 0.34;
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, UP_N]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} toneMapped={false} />
    </instancedMesh>
  );
}

/* ─── Contenido de la pirámide ─────────────────────────────────────────── */
function Piramide({ e0, eficPct, accent, pausado }: { e0: number; eficPct: number; accent: string; pausado: boolean }) {
  const datos = useMemo(() => flujo(e0, eficPct), [e0, eficPct]);

  // Ancho de cada plataforma según log10(energía), normalizado a la base.
  const anchos = useMemo(() => {
    const lg0 = Math.log10(Math.max(datos[0]!.energia, 1));
    return datos.map((dn) => {
      const lg = Math.log10(Math.max(dn.energia, 1));
      const frac = lg0 > 0 ? clamp(lg / lg0, 0, 1) : 0;
      return clamp(W_MIN + (W_BASE - W_MIN) * frac, W_MIN, W_BASE);
    });
  }, [datos]);

  const yDe = (i: number) => i * (TIER_H + GAP); // base de la plataforma i
  const yCentro = (i: number) => yDe(i) + TIER_H / 2;

  const maxLoss = datos[0]!.perdidaHaciaArriba || 1;

  return (
    <group position={[0, 0, 0]}>
      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[W_BASE + 2.2, 48]} />
        <meshStandardMaterial color="#0b2a1c" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* sol que alimenta a los productores */}
      <Html position={[-(W_BASE / 2) - 1.7, yCentro(0) + 0.2, 0]} center distanceFactor={13} pointerEvents="none">
        <div style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-sun" style={{ color: "#ffd24a", fontSize: 18 }} />
          <span style={{ color: "#ffe08a", fontSize: 11, fontWeight: 800 }}>energía solar</span>
        </div>
      </Html>

      {NIVELES.map((nv, i) => {
        const w = anchos[i]!;
        const dn = datos[i]!;
        return (
          <group key={nv.key} position={[0, yCentro(i), 0]}>
            {/* plataforma */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, TIER_H, w]} />
              <meshStandardMaterial color={nv.color} emissive={nv.color} emissiveIntensity={0.18} metalness={0.2} roughness={0.55} />
              <Edges threshold={15} color={"#ffffff"} />
            </mesh>
            {/* etiqueta del nivel */}
            <Html position={[w / 2 + 0.25, 0, 0]} center={false} distanceFactor={12} pointerEvents="none">
              <div style={{ background: "rgba(2,12,28,0.82)", border: `1px solid ${nv.color}66`, borderRadius: 10, padding: "6px 10px", whiteSpace: "nowrap", transform: "translateY(-50%)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${nv.icono}`} style={{ color: nv.color, fontSize: 13 }} />
                  <span style={{ color: "#eaf2fb", fontSize: 11.5, fontWeight: 800 }}>{nv.nombre}</span>
                </div>
                <div style={{ color: nv.color, fontSize: 13, fontWeight: 900, fontFamily: "ui-monospace, monospace", marginTop: 2 }}>
                  {fmtKcal(dn.energia)} kcal
                </div>
                <div style={{ color: "#9fb2c8", fontSize: 10, marginTop: 1 }}>
                  {nv.ejemplo} · {fmtPct(dn.pctDelOriginal)} del total
                </div>
              </div>
            </Html>

            {/* penacho de calor hacia el siguiente nivel (90% perdido) */}
            {i < N_NIVELES - 1 && dn.perdidaHaciaArriba > 0 && (
              <Penacho y={TIER_H / 2} radio={w * 0.42 + 0.3} intensidad={Math.sqrt(dn.perdidaHaciaArriba / maxLoss)} pausado={pausado} />
            )}
          </group>
        );
      })}

      {/* hilos de energía que suben entre niveles (10% transferido) */}
      {NIVELES.slice(0, N_NIVELES - 1).map((nv, i) => {
        const eTransferida = datos[i + 1]!.energia;
        return (
          <Subida
            key={`up-${nv.key}`}
            yFrom={yCentro(i) + TIER_H / 2}
            yTo={yCentro(i + 1) - TIER_H / 2}
            intensidad={Math.sqrt(eTransferida / Math.max(datos[0]!.energia, 1))}
            accent={accent}
            pausado={pausado}
          />
        );
      })}

      {/* etiqueta de calor disipado en la base (la mayor pérdida) */}
      <Html position={[W_BASE / 2 + 1.4, yCentro(0) + 1.0, 0]} center distanceFactor={13} pointerEvents="none">
        <div style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-fire-flame-simple" style={{ color: CALOR, fontSize: 15 }} />
          <span style={{ color: "#ffb38a", fontSize: 11, fontWeight: 800 }}>~{100 - eficPct}% se va como calor</span>
        </div>
      </Html>

      <ContactShadows position={[0, 0.0, 0]} opacity={0.34} scale={W_BASE * 2.4} blur={2.4} far={6} />
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function PiramideEnergiaScene(props: PiramideEnergiaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [6.5, 4.2, 9.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: PiramideEnergiaSceneProps) {
  const { e0, eficPct, accent, pausado, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 48]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 6, 4]} intensity={2.6} color="#ffd24a" />

      <group key={`${resetNonce}`}>
        <Piramide e0={e0} eficPct={eficPct} accent={accent} pausado={pausado} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 8, 3]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-8, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[8, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 2.4, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.75} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
