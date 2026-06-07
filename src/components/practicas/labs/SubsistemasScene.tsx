"use client";

/**
 * Escena 3D del laboratorio "Interacciones entre subsistemas terrestres" — R3F.
 * Se carga de forma diferida (ssr:false) desde LabSubsistemas.tsx.
 *
 * Una Tierra con sus cuatro subsistemas visibles a la vez:
 *  · LITOSFERA  → el núcleo rocoso del planeta.
 *  · HIDROSFERA → el océano (cambia de color con el pH; sube con el nivel del mar).
 *  · BIOSFERA   → parches de vegetación cuya cantidad/verdor sigue la cobertura.
 *  · ATMÓSFERA  → la capa exterior translúcida que se tiñe de azul a rojo con la
 *                 temperatura y se engrosa con el CO₂.
 * Casquetes polares que se encogen al calentarse, un volcán que emite una pluma
 * de SO₂/CO₂ según la actividad volcánica y burbujas de metano del permafrost
 * cuando se dispara el punto de no retorno.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las animaciones mutan REFS
 * (sin setState ni Math.random/Date.now en el render → apto React Compiler).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcularEstado, CO2_MAX, CO2_REF } from "./subsistemas-data";

export interface SubsistemasSceneProps {
  co2: number;
  veg: number;
  volc: number;
  permafrost: boolean;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const R = 2.0; // radio del planeta

/* Puntos repartidos sobre la esfera (espiral de Fibonacci) — DETERMINISTA. */
function puntosEsfera(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  return pts;
}

/* ─── Biosfera: parches de vegetación sobre la superficie ───────────────── */
const VEG_TOTAL = 80;
function Vegetacion({ veg, estresada }: { veg: number; estresada: number }) {
  // posiciones fijas; se muestran las primeras (veg%) como verdes.
  const pts = useMemo(() => puntosEsfera(VEG_TOTAL).filter((p) => p.y > -0.78), []);
  const activos = Math.round((veg / 100) * pts.length);
  // verdor: de verde sano a pardo seco según el estrés (0 sano … 1 seco)
  const colSano = useMemo(() => new THREE.Color("#36d07a"), []);
  const colSeco = useMemo(() => new THREE.Color("#b5862f"), []);
  const col = useMemo(() => colSano.clone().lerp(colSeco, Math.min(1, Math.max(0, estresada))), [colSano, colSeco, estresada]);

  return (
    <group>
      {pts.map((p, i) => {
        const activo = i < activos;
        const pos = p.clone().multiplyScalar(R + 0.02);
        const up = p.clone().normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        const h = activo ? 0.16 + (i % 5) * 0.02 : 0.0001;
        return (
          <mesh key={i} position={pos} quaternion={quat} scale={activo ? 1 : 0.0001} castShadow>
            <coneGeometry args={[0.055, h, 6]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.25} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Casquetes polares (se encogen con el calentamiento) ───────────────── */
function Casquete({ y, escala }: { y: number; escala: number }) {
  return (
    <mesh position={[0, y * (R - 0.02), 0]} scale={[escala, escala * 0.5, escala]}>
      <sphereGeometry args={[0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3.1]} />
      <meshStandardMaterial color="#eaf6ff" emissive="#bfe0ff" emissiveIntensity={0.3} roughness={0.4} transparent opacity={0.96} />
    </mesh>
  );
}

/* ─── Pluma de partículas (volcán o metano) ─────────────────────────────── */
function Pluma({ origen, dir, n, color, vel, pausado, ancho }: {
  origen: THREE.Vector3; dir: THREE.Vector3; n: number; color: string; vel: number; pausado: boolean; ancho: number;
}) {
  const CAP = 24;
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: CAP }, (_, i) => i / CAP));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => {
    // dos vectores perpendiculares a dir para dispersar lateralmente
    const u = new THREE.Vector3(1, 0, 0);
    if (Math.abs(dir.dot(u)) > 0.9) u.set(0, 0, 1);
    const a = new THREE.Vector3().crossVectors(dir, u).normalize();
    const b = new THREE.Vector3().crossVectors(dir, a).normalize();
    return { a, b };
  }, [dir]);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    for (let i = 0; i < CAP; i++) {
      if (i < n) {
        fases.current[i] = ((fases.current[i] ?? i / CAP) + d * vel) % 1;
        const t = fases.current[i]!;
        const spread = ancho * t;
        const ox = Math.sin(i * 1.7) * spread;
        const oy = Math.cos(i * 2.3) * spread;
        const p = origen.clone()
          .add(dir.clone().multiplyScalar(t * 2.4))
          .add(base.a.clone().multiplyScalar(ox))
          .add(base.b.clone().multiplyScalar(oy));
        dummy.position.copy(p);
        dummy.scale.setScalar(0.09 * (1 - t * 0.5));
      } else {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0.0001);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CAP]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} transparent opacity={0.85} />
    </instancedMesh>
  );
}

/* ─── Etiqueta de un subsistema ─────────────────────────────────────────── */
function Etiqueta({ pos, color, icono, nombre, dato }: {
  pos: [number, number, number]; color: string; icono: string; nombre: string; dato: string;
}) {
  return (
    <Html position={pos} center distanceFactor={15} pointerEvents="none">
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "5px 11px", borderRadius: 12, background: "rgba(2,12,28,0.82)", border: `1px solid ${color}88`, whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className={`fa-solid ${icono}`} style={{ color, fontSize: 12 }} />
          <span style={{ color: "#eaf2fb", fontSize: 11.5, fontWeight: 800 }}>{nombre}</span>
        </span>
        <span style={{ color, fontSize: 10.5, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{dato}</span>
      </div>
    </Html>
  );
}

/* ─── El planeta y sus subsistemas ──────────────────────────────────────── */
function Planeta(props: SubsistemasSceneProps) {
  const { co2, veg, volc, permafrost, pausado } = props;
  const est = useMemo(() => calcularEstado(co2, veg, volc, permafrost), [co2, veg, volc, permafrost]);

  const planeta = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (planeta.current && !pausado) planeta.current.rotation.y += delta * 0.06;
  });

  // ── colores derivados del estado ──
  // atmósfera: azul frío → rojo caliente según deltaT (0…4 °C)
  const tintAtmos = useMemo(() => {
    const frio = new THREE.Color("#6fc0ff");
    const calido = new THREE.Color("#ff5532");
    return frio.clone().lerp(calido, Math.min(1, Math.max(0, est.deltaT / 4)));
  }, [est.deltaT]);
  // opacidad de la atmósfera con el CO₂
  const opAtmos = 0.10 + Math.min(0.22, ((co2 - CO2_REF) / (CO2_MAX - CO2_REF)) * 0.22);

  // océano: azul (pH alto) → verdoso ácido (pH bajo)
  const tintOceano = useMemo(() => {
    const sano = new THREE.Color("#1d72c4");
    const acido = new THREE.Color("#3fae8f");
    const f = Math.min(1, Math.max(0, (8.2 - est.ph) / 0.4));
    return sano.clone().lerp(acido, f);
  }, [est.ph]);

  const hielo = Math.min(1, Math.max(0.12, 1 - est.deltaT / 4));
  const nivelMarShell = 1 + Math.min(0.05, est.nivelMar / 2400); // crecimiento sutil del océano
  const estresVeg = Math.max(0, Math.min(1, est.deltaT / 3 + (100 - veg) / 200));

  // volcán: posición fija sobre la superficie
  const volcPos = useMemo(() => new THREE.Vector3(1.4, -0.5, 1.1).normalize().multiplyScalar(R + 0.05), []);
  const volcDir = useMemo(() => volcPos.clone().normalize(), [volcPos]);
  const metPolo = useMemo(() => new THREE.Vector3(0, R + 0.1, 0), []);

  return (
    <group>
      <ContactShadows position={[0, -3.1, 0]} opacity={0.3} scale={16} blur={2.6} far={8} />

      {/* grupo que rota lentamente: litosfera + océano + biosfera + casquetes + volcán */}
      <group ref={planeta}>
        {/* LITOSFERA: núcleo rocoso */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[R - 0.06, 48, 48]} />
          <meshStandardMaterial color="#7a5a3a" emissive="#2c1d10" emissiveIntensity={0.2} roughness={0.95} flatShading />
        </mesh>

        {/* HIDROSFERA: océano translúcido */}
        <mesh scale={nivelMarShell}>
          <sphereGeometry args={[R, 56, 56]} />
          <meshStandardMaterial color={tintOceano} emissive={tintOceano} emissiveIntensity={0.25} roughness={0.25} metalness={0.2} transparent opacity={0.82} />
        </mesh>

        {/* BIOSFERA: vegetación */}
        <Vegetacion veg={veg} estresada={estresVeg} />

        {/* casquetes polares */}
        <Casquete y={1} escala={hielo} />
        <Casquete y={-1} escala={hielo} />

        {/* volcán (litosfera → atmósfera) */}
        <mesh position={volcPos} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), volcDir)}>
          <coneGeometry args={[0.18, 0.34, 8]} />
          <meshStandardMaterial color="#5b4636" emissive="#1a0f08" emissiveIntensity={0.3} roughness={1} />
        </mesh>
        {volc > 0 && (
          <Pluma origen={volcPos.clone().add(volcDir.clone().multiplyScalar(0.2))} dir={volcDir} n={Math.round(volc * 2)} color="#ffb24a" vel={0.5} pausado={pausado} ancho={0.5} />
        )}

        {/* metano del permafrost (punto de no retorno) */}
        {est.puntoNoRetorno && (
          <Pluma origen={metPolo} dir={new THREE.Vector3(0, 1, 0)} n={14} color="#c084fc" vel={0.4} pausado={pausado} ancho={0.7} />
        )}
      </group>

      {/* ATMÓSFERA: capa exterior (no rota, se tiñe con la temperatura) */}
      <mesh scale={1.16}>
        <sphereGeometry args={[R, 40, 40]} />
        <meshStandardMaterial color={tintAtmos} emissive={tintAtmos} emissiveIntensity={0.5} transparent opacity={opAtmos} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.165}>
        <sphereGeometry args={[R, 40, 40]} />
        <meshStandardMaterial color={tintAtmos} emissive={tintAtmos} emissiveIntensity={0.35} transparent opacity={opAtmos * 0.5} side={THREE.FrontSide} depthWrite={false} />
      </mesh>

      {/* etiquetas de los cuatro subsistemas */}
      <Etiqueta pos={[0, 3.0, 0]} color="#7cc4ff" icono="fa-wind" nombre="Atmósfera" dato={`${Math.round(co2)} ppm CO₂`} />
      <Etiqueta pos={[3.0, 0.4, 0.6]} color="#3aa0ff" icono="fa-water" nombre="Hidrosfera" dato={`pH ${est.ph.toFixed(2)}`} />
      <Etiqueta pos={[-2.9, -1.0, 0.8]} color="#c2895a" icono="fa-mountain" nombre="Litosfera" dato={volc > 0 ? "volcán activo" : "estable"} />
      <Etiqueta pos={[0.4, -0.3, 3.0]} color="#34D399" icono="fa-leaf" nombre="Biosfera" dato={`${Math.round(veg)}% cobertura`} />

      {/* Sol como motor energético */}
      <group position={[-5.0, 4.0, 2.4]}>
        <mesh>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial color="#ffd24a" emissive="#ffd24a" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={16} pointerEvents="none">
          <div style={{ transform: "translateY(28px)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-sun" style={{ color: "#ffd24a", fontSize: 13 }} />
            <span style={{ color: "#ffe08a", fontSize: 11, fontWeight: 800 }}>energía solar</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function SubsistemasScene(props: SubsistemasSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [8.5, 4, 10.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: SubsistemasSceneProps) {
  const { accent, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 56]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[-5.0, 4.0, 2.4]}
        intensity={1.5}
        color="#fff2cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <pointLight position={[6, 2, 6]} intensity={0.4} color={accent} />

      <group key={`${resetNonce}`}>
        <Planeta {...props} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.2} position={[0, 8, 4]} scale={[14, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.8} position={[-8, 2, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.8} position={[8, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={28}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.44} />
      </EffectComposer>
    </>
  );
}
