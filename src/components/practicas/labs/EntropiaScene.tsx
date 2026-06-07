"use client";

/**
 * Escena 3D del laboratorio de Entropía y leyes de la termodinámica (R3F).
 * Se carga de forma diferida (ssr:false) desde LabEntropia.tsx.
 *
 * Hace VISIBLE la flecha del tiempo: en todo proceso espontáneo la entropía sube.
 *   · MEZCLA  — quita la pared y dos gases se mezclan solos; nunca se separan.
 *   · CALOR   — pon en contacto un cuerpo caliente y uno frío; el calor fluye al
 *               frío hasta el equilibrio térmico, jamás al revés.
 *   · CRISTAL — enfría un cristal perfecto hacia 0 K: se ordena y su entropía
 *               tiende a cero, pero el cero absoluto es inalcanzable.
 *
 * Una barra lateral muestra la entropía en vivo. La simulación escribe su valor
 * en un ref compartido (sRef) y la barra lo lee; ambos usan su propio useFrame.
 *
 * Patrón obligatorio de R3F: useFrame SOLO funciona dentro de <Canvas>, así que
 * cada simulación vive en un componente hijo del Canvas. Nada de Math.random ni
 * Date.now: la animación usa state.clock y delta, y mutamos REFS (no setState).
 */

import * as THREE from "three";
import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type ProcesoKey,
  T_CRISTAL_MAX,
  fmtNum,
} from "./entropia-data";

export interface EntropiaSceneProps {
  proceso: ProcesoKey;
  activo: boolean; // pared quitada / en contacto
  tempCristal: number; // K (solo proceso "cristal")
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

type SRef = RefObject<{ value: number }>;

const AZUL = new THREE.Color("#3a86ff");
const ROJO = new THREE.Color("#ff4d4d");
const COLD = new THREE.Color("#2a5cd0");
const WARM = new THREE.Color("#ff6a2a");
const HOT = new THREE.Color("#ffd24a");

// PRNG determinista (sin Math.random): mismo índice → mismo valor en cada render.
function rng(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const colorCalor = (out: THREE.Color, t: number) => {
  if (t < 0.5) out.copy(COLD).lerp(WARM, t / 0.5);
  else out.copy(WARM).lerp(HOT, (t - 0.5) / 0.5);
  return out;
};

/* ════════════════════════════════════════════════════════════════════════
   BARRA DE ENTROPÍA — lee sRef.value (0–1) y crece; nunca baja sola
   ════════════════════════════════════════════════════════════════════════ */
const BAR_X = 3.25;
const BAR_H = 2.8;
const BAR_W = 0.42;

function BarraEntropia({ sRef, accent }: { sRef: SRef; accent: string }) {
  const bar = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const label = useRef<HTMLSpanElement>(null);
  const scratch = useRef(new THREE.Color());

  useFrame(() => {
    const v = THREE.MathUtils.clamp(sRef.current?.value ?? 0, 0, 1);
    const b = bar.current;
    if (b) {
      const h = 0.02 + v * BAR_H;
      b.scale.y = h;
      b.position.y = h / 2;
    }
    if (matRef.current) {
      colorCalor(scratch.current, v);
      matRef.current.color.copy(scratch.current);
      matRef.current.emissive.copy(scratch.current);
      matRef.current.emissiveIntensity = 0.3 + v * 0.9;
    }
    if (label.current) label.current.textContent = `${Math.round(v * 100)}%`;
  });

  return (
    <group position={[BAR_X, -0.9, 0]}>
      {/* Carril */}
      <mesh position={[0, BAR_H / 2, 0]}>
        <boxGeometry args={[BAR_W + 0.07, BAR_H + 0.07, BAR_W + 0.07]} />
        <meshStandardMaterial color="#0a2138" roughness={0.85} metalness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Barra que crece */}
      <mesh ref={bar} position={[0, 0, 0]}>
        <boxGeometry args={[BAR_W, 1, BAR_W]} />
        <meshStandardMaterial ref={matRef} color={accent} emissive={accent} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      <Html center position={[0, BAR_H + 0.55, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: accent }}>Entropía (S)</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>
            <span ref={label}>0%</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MEZCLA — dos gases que al quitar la pared se mezclan y no se separan
   ════════════════════════════════════════════════════════════════════════ */
const M_N = 88; // partículas (mitad A, mitad B)
const M_HX = 2.1;
const M_HY = 1.25;
const M_HZ = 0.9;
const M_R = 0.11;
const M_CY = 0.45; // altura del centro de la caja

function Mezcla({ activo, accent, pausado, sRef }: {
  activo: boolean;
  accent: string;
  pausado: boolean;
  sRef: SRef;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const col = useRef(new THREE.Color());

  const buf = useRef<{ pos: Float32Array; vel: Float32Array } | null>(null);
  if (buf.current === null) {
    const pos = new Float32Array(M_N * 3);
    const vel = new Float32Array(M_N * 3);
    for (let i = 0; i < M_N; i++) {
      const i3 = i * 3;
      const esA = i % 2 === 0;
      // A a la izquierda (x<0), B a la derecha (x>0)
      const x = esA
        ? -M_R - rng(i + 1) * (M_HX - 2 * M_R)
        : M_R + rng(i + 1) * (M_HX - 2 * M_R);
      const y = (rng(i + 5) * 2 - 1) * (M_HY - M_R);
      const z = (rng(i + 11) * 2 - 1) * (M_HZ - M_R);
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      const a = rng(i + 23) * Math.PI * 2;
      const b = Math.acos(2 * rng(i + 41) - 1);
      vel[i3] = Math.sin(b) * Math.cos(a);
      vel[i3 + 1] = Math.cos(b);
      vel[i3 + 2] = Math.sin(b) * Math.sin(a);
    }
    buf.current = { pos, vel };
  }

  useFrame((_state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);
    const { pos, vel } = buf.current!;
    const d = dummy.current;
    const speed = 1.6;
    const bx = M_HX - M_R, by = M_HY - M_R, bz = M_HZ - M_R;

    let aDerecha = 0, bIzquierda = 0;

    for (let i = 0; i < M_N; i++) {
      const i3 = i * 3;
      const esA = i % 2 === 0;
      let x = pos[i3]!, y = pos[i3 + 1]!, z = pos[i3 + 2]!;
      let vx = vel[i3]!, vy = vel[i3 + 1]!, vz = vel[i3 + 2]!;

      if (!pausado) {
        x += vx * speed * delta;
        y += vy * speed * delta;
        z += vz * speed * delta;

        // Paredes de la caja
        if (x > bx) { x = bx; vx = -Math.abs(vx); }
        else if (x < -bx) { x = -bx; vx = Math.abs(vx); }
        if (y > by) { y = by; vy = -Math.abs(vy); }
        else if (y < -by) { y = -by; vy = Math.abs(vy); }
        if (z > bz) { z = bz; vz = -Math.abs(vz); }
        else if (z < -bz) { z = -bz; vz = Math.abs(vz); }

        // Pared central: solo si NO está activo (sin quitar)
        if (!activo) {
          if (esA && x > -M_R) { x = -M_R; vx = -Math.abs(vx); }
          if (!esA && x < M_R) { x = M_R; vx = Math.abs(vx); }
        }

        vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      }

      if (esA && x > 0) aDerecha++;
      if (!esA && x < 0) bIzquierda++;

      d.position.set(x, y + M_CY, z);
      d.scale.setScalar(1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, esA ? col.current.copy(AZUL) : col.current.copy(ROJO));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // Entropía ≈ grado de mezcla (0 separados, 1 totalmente mezclados)
    const mezcla = (aDerecha + bIzquierda) / M_N; // ~0.5 al mezclar del todo
    if (sRef.current) sRef.current.value = THREE.MathUtils.clamp(mezcla * 2, 0, 1);
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, M_N]} castShadow frustumCulled={false}>
        <sphereGeometry args={[M_R, 14, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} envMapIntensity={0.9} />
      </instancedMesh>

      {/* Caja de vidrio */}
      <mesh position={[0, M_CY, 0]}>
        <boxGeometry args={[M_HX * 2, M_HY * 2, M_HZ * 2]} />
        <meshPhysicalMaterial transparent opacity={0.05} roughness={0.1} clearcoat={1} color="#dff1ff" depthWrite={false} />
        <Edges threshold={15} color="#7fa8d8" />
      </mesh>

      {/* Pared central (se desvanece al quitarla) */}
      <mesh position={[0, M_CY, 0]} visible={!activo}>
        <boxGeometry args={[0.05, M_HY * 2 - 0.02, M_HZ * 2 - 0.02]} />
        <meshPhysicalMaterial transparent opacity={activo ? 0 : 0.32} roughness={0.05} metalness={0.2} color="#cfe6ff" />
      </mesh>

      <Html center position={[0, M_CY + M_HY + 0.45, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: activo ? accent : "#cfe6ff", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          {activo ? "se mezclan solos →" : "pared puesta"}
        </div>
      </Html>

      <ContactShadows position={[0, M_CY - M_HY - 0.05, 0]} opacity={0.28} scale={9} blur={2.6} far={5} color="#020c1c" />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   FLUJO DE CALOR — caliente + frío en contacto → equilibrio térmico
   ════════════════════════════════════════════════════════════════════════ */
const Q_COLS = 3, Q_ROWS = 3, Q_DEP = 2;
const Q_PER = Q_COLS * Q_ROWS * Q_DEP; // átomos por bloque
const Q_N = Q_PER * 2;
const Q_SP = 0.34; // separación de red
const Q_R = 0.13;
const Q_CY = 0.5;
const Q_GAPX = 1.45; // separación entre centros de bloque

function Calor({ activo, accent, pausado, sRef }: {
  activo: boolean;
  accent: string;
  pausado: boolean;
  sRef: SRef;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const col = useRef(new THREE.Color());
  const TL = useRef(1); // bloque izquierdo: caliente
  const TR = useRef(0); // bloque derecho: frío

  // posiciones base de cada átomo en su red
  const base = useMemo(() => {
    const arr = new Float32Array(Q_N * 3);
    let i = 0;
    for (let blk = 0; blk < 2; blk++) {
      const cx = blk === 0 ? -Q_GAPX : Q_GAPX;
      for (let x = 0; x < Q_COLS; x++)
        for (let y = 0; y < Q_ROWS; y++)
          for (let z = 0; z < Q_DEP; z++) {
            arr[i * 3] = cx + (x - (Q_COLS - 1) / 2) * Q_SP;
            arr[i * 3 + 1] = Q_CY + (y - (Q_ROWS - 1) / 2) * Q_SP;
            arr[i * 3 + 2] = (z - (Q_DEP - 1) / 2) * Q_SP;
            i++;
          }
    }
    return arr;
  }, []);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);

    if (!pausado && activo) {
      // El calor fluye del caliente (TL) al frío (TR) hasta igualar.
      const flow = 0.9 * delta * (TL.current - TR.current);
      TL.current -= flow;
      TR.current += flow;
    }

    const time = state.clock.elapsedTime;
    const d = dummy.current;
    for (let i = 0; i < Q_N; i++) {
      const i3 = i * 3;
      const enIzq = i < Q_PER;
      const tBlk = enIzq ? TL.current : TR.current;
      const amp = 0.01 + tBlk * 0.09; // vibran más si están calientes
      const ph = rng(i + 1) * Math.PI * 2;
      const fr = 9 + rng(i + 7) * 6;
      const ox = Math.sin(time * fr + ph) * amp;
      const oy = Math.cos(time * fr * 0.9 + ph) * amp;
      const oz = Math.sin(time * fr * 1.1 + ph * 1.3) * amp;
      d.position.set(base[i3]! + ox, base[i3 + 1]! + oy, base[i3 + 2]! + oz);
      d.scale.setScalar(1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, colorCalor(col.current, THREE.MathUtils.clamp(tBlk, 0, 1)));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // Entropía sube a medida que las temperaturas se igualan (Δ→0).
    const dif = Math.abs(TL.current - TR.current);
    if (sRef.current) sRef.current.value = THREE.MathUtils.clamp(1 - dif, 0, 1);
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, Q_N]} castShadow frustumCulled={false}>
        <sphereGeometry args={[Q_R, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.15} envMapIntensity={0.85} />
      </instancedMesh>

      {/* Puente de contacto (solo cuando están en contacto) */}
      <mesh position={[0, Q_CY, 0]} visible={activo}>
        <boxGeometry args={[Q_GAPX * 2 - Q_COLS * Q_SP, 0.12, 0.12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>

      <Html center position={[-Q_GAPX, Q_CY + 0.95, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: "#ff8a5a", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>caliente 🔥</div>
      </Html>
      <Html center position={[Q_GAPX, Q_CY + 0.95, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: "#7fb8ff", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>frío ❄️</div>
      </Html>
      <Html center position={[0, Q_CY - 0.95, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 700, fontSize: 11.5, color: activo ? accent : "#9fb6d6", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          {activo ? "el calor fluye → equilibrio" : "separados"}
        </div>
      </Html>

      <ContactShadows position={[0, Q_CY - 0.7, 0]} opacity={0.28} scale={9} blur={2.6} far={5} color="#020c1c" />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CRISTAL — al enfriar hacia 0 K se ordena; S → 0 (3.ª ley)
   ════════════════════════════════════════════════════════════════════════ */
const X_COLS = 4, X_ROWS = 3, X_DEP = 3;
const X_N = X_COLS * X_ROWS * X_DEP;
const X_SP = 0.42;
const X_R = 0.14;
const X_CY = 0.5;

function Cristal({ tempCristal, pausado, sRef }: {
  tempCristal: number;
  pausado: boolean;
  sRef: SRef;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const col = useRef(new THREE.Color());

  const base = useMemo(() => {
    const arr = new Float32Array(X_N * 3);
    let i = 0;
    for (let x = 0; x < X_COLS; x++)
      for (let y = 0; y < X_ROWS; y++)
        for (let z = 0; z < X_DEP; z++) {
          arr[i * 3] = (x - (X_COLS - 1) / 2) * X_SP;
          arr[i * 3 + 1] = X_CY + (y - (X_ROWS - 1) / 2) * X_SP;
          arr[i * 3 + 2] = (z - (X_DEP - 1) / 2) * X_SP;
          i++;
        }
    return arr;
  }, []);

  useFrame((state, _rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const tNorm = THREE.MathUtils.clamp(tempCristal / T_CRISTAL_MAX, 0, 1);
    const time = state.clock.elapsedTime;
    const amp = pausado ? 0 : tNorm * 0.13; // casi sin vibrar cerca de 0 K
    const d = dummy.current;
    for (let i = 0; i < X_N; i++) {
      const i3 = i * 3;
      const ph = rng(i + 1) * Math.PI * 2;
      const fr = 10 + rng(i + 7) * 6;
      const ox = Math.sin(time * fr + ph) * amp;
      const oy = Math.cos(time * fr * 0.9 + ph) * amp;
      const oz = Math.sin(time * fr * 1.1 + ph * 1.3) * amp;
      d.position.set(base[i3]! + ox, base[i3 + 1]! + oy, base[i3 + 2]! + oz);
      d.scale.setScalar(1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, colorCalor(col.current, tNorm));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (sRef.current) sRef.current.value = tNorm; // S → 0 al enfriar
  });

  const ordenado = tempCristal <= 30;

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, X_N]} castShadow frustumCulled={false}>
        <sphereGeometry args={[X_R, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.2} envMapIntensity={0.95} />
      </instancedMesh>

      {/* Líneas de la red (aristas) para que se lea el orden del cristal */}
      <mesh position={[0, X_CY, 0]}>
        <boxGeometry args={[(X_COLS - 1) * X_SP + 0.1, (X_ROWS - 1) * X_SP + 0.1, (X_DEP - 1) * X_SP + 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges threshold={15} color={ordenado ? "#9fdcff" : "#5b7fa6"} />
      </mesh>

      <Html center position={[0, X_CY + 1.15, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: ordenado ? "#9fdcff" : "#ff8a5a" }}>{ordenado ? "cristal ordenado" : "vibrando"}</div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>{fmtNum(tempCristal, 0)} K</div>
        </div>
      </Html>
      <Html center position={[0, X_CY - 1.2, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 700, fontSize: 11, color: "#9fb6d6", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>0 K es inalcanzable</div>
      </Html>

      <ContactShadows position={[0, X_CY - 0.9, 0]} opacity={0.28} scale={9} blur={2.6} far={5} color="#020c1c" />
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function EntropiaScene(props: EntropiaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.3, 1.8, 8.8], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: EntropiaSceneProps) {
  const { proceso, activo, tempCristal, accent, pausado, autoRotate, resetNonce } = props;

  // ref compartido: el proceso escribe la entropía, la barra la lee.
  const sRef = useRef<{ value: number }>({ value: 0 });

  const heat = useMemo(() => COLD.clone().lerp(WARM, 0.4), []);

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 34]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 9, 6]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 4, 3]} intensity={10} color={`#${heat.getHexString()}`} />
      <pointLight position={[5, 3, 4]} intensity={6} color="#ffffff" />

      <group key={`${proceso}-${resetNonce}`}>
        {proceso === "mezcla" && (
          <Mezcla activo={activo} accent={accent} pausado={pausado} sRef={sRef} />
        )}
        {proceso === "calor" && (
          <Calor activo={activo} accent={accent} pausado={pausado} sRef={sRef} />
        )}
        {proceso === "cristal" && (
          <Cristal tempCristal={tempCristal} pausado={pausado} sRef={sRef} />
        )}
        <BarraEntropia sRef={sRef} accent={accent} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.8} position={[0, 6, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[6, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0.4, 0.4, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
