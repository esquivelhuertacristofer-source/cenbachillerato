"use client";

/**
 * Escena 3D del laboratorio de Gas ideal (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabGasIdeal.tsx.
 *
 * Hace visible de dónde sale la PRESIÓN: las partículas de gas chocan contra las
 * paredes y el pistón de un cilindro (sistema cerrado).
 *   · ↑ Temperatura → se mueven más rápido (v_rms ∝ √T) y chocan con más fuerza.
 *   · ↓ Volumen (baja el pistón) → caben en menos espacio y chocan más seguido.
 *   · ↑ Cantidad (n) → hay más partículas, más choques.
 * Todo respeta  PV = nRT. El manómetro lateral muestra la presión resultante.
 *
 * Patrón obligatorio de R3F: useFrame SOLO funciona dentro de <Canvas>, así que
 * la simulación vive en <GasParticulas>, un hijo del Canvas. Nada de Math.random
 * ni Date.now: la animación usa state.clock y delta, y mutamos REFS (no setState).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  presion,
  velocidadRel,
  fmtNum,
  V_MIN, V_MAX, N_MIN, N_MAX, T_MIN, T_MAX, P_GAUGE_MAX,
} from "./gas-ideal-data";

export interface GasIdealSceneProps {
  temp: number; // T (K)
  volumen: number; // V (L)
  moles: number; // n (mol)
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

// Recipiente (semiejes de la sección transversal, en unidades de mundo)
const BOX = { hx: 1.05, hz: 1.05 };
const R = 0.1; // radio de partícula
const NMAX = 56; // tope de instancias

// Altura de la columna de gas (pistón) según el volumen
const H_MIN = 0.75;
const H_MAX = 3.2;

// Manómetro lateral
const GAUGE_X = 2.55;
const GAUGE_H = 3.2;
const GAUGE_W = 0.42;

const COLD = new THREE.Color("#3aa0ff");
const HOT = new THREE.Color("#ff5a1f");

/** Altura de la columna de gas para un volumen dado. */
const alturaDeV = (V: number) => H_MIN + ((V - V_MIN) / (V_MAX - V_MIN)) * (H_MAX - H_MIN);

/** Número de partículas activas para una cantidad de sustancia dada. */
const countDeN = (n: number) => {
  const c = Math.round(8 + ((n - N_MIN) / (N_MAX - N_MIN)) * (NMAX - 8));
  return Math.min(Math.max(c, 8), NMAX);
};

// PRNG determinista (sin Math.random): mismo índice → mismo valor en cada render.
function rng(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ── Gas: nube de partículas que chocan contra las paredes y el pistón ─── */
function GasParticulas({ temp, volumen, moles, accent, pausado, resetNonce }: {
  temp: number;
  volumen: number;
  moles: number;
  accent: string;
  pausado: boolean;
  resetNonce: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useRef(new THREE.Object3D());
  const scratch = useRef(new THREE.Color());

  // Buffers mutables de la simulación (en un ref, se mutan cada frame).
  const buf = useRef<{ home: Float32Array; pos: Float32Array; vel: Float32Array } | null>(null);
  if (buf.current === null) {
    const home = new Float32Array(NMAX * 3);
    const pos = new Float32Array(NMAX * 3);
    const vel = new Float32Array(NMAX * 3);
    for (let i = 0; i < NMAX; i++) {
      const i3 = i * 3;
      const x = (rng(i + 1) * 2 - 1) * (BOX.hx - R);
      const z = (rng(i + 7) * 2 - 1) * (BOX.hz - R);
      const y = R + rng(i + 13) * (H_MIN - 2 * R);
      home[i3] = x; home[i3 + 1] = y; home[i3 + 2] = z;
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      // dirección de velocidad unitaria, pseudoaleatoria pero determinista
      const a = rng(i + 23) * Math.PI * 2;
      const b = Math.acos(2 * rng(i + 41) - 1);
      vel[i3] = Math.sin(b) * Math.cos(a);
      vel[i3 + 1] = Math.cos(b);
      vel[i3 + 2] = Math.sin(b) * Math.sin(a);
    }
    buf.current = { home, pos, vel };
  }

  // Reordenar al pulsar "reiniciar"
  useEffect(() => {
    const { home, pos } = buf.current!;
    for (let i = 0; i < NMAX * 3; i++) pos[i] = home[i]!;
  }, [resetNonce]);

  useFrame((_state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const { pos, vel } = buf.current!;
    const d = dummy.current;
    const delta = Math.min(rawDelta, 0.05);

    const h = alturaDeV(volumen);
    const count = countDeN(moles);
    const speed = 1.7 * velocidadRel(temp);

    const bx = BOX.hx - R, bz = BOX.hz - R;
    const topY = h - R, botY = R;

    for (let i = 0; i < NMAX; i++) {
      const i3 = i * 3;

      if (i >= count) {
        // partícula inactiva: ocúltala fuera de cámara
        d.position.set(0, -99, 0);
        d.scale.setScalar(0);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        continue;
      }

      let x = pos[i3]!, y = pos[i3 + 1]!, z = pos[i3 + 2]!;
      let vx = vel[i3]!, vy = vel[i3 + 1]!, vz = vel[i3 + 2]!;

      if (!pausado) {
        x += vx * speed * delta;
        y += vy * speed * delta;
        z += vz * speed * delta;

        // Rebote elástico contra las paredes laterales, el piso y el pistón.
        if (x > bx) { x = bx; vx = -Math.abs(vx); }
        else if (x < -bx) { x = -bx; vx = Math.abs(vx); }
        if (z > bz) { z = bz; vz = -Math.abs(vz); }
        else if (z < -bz) { z = -bz; vz = Math.abs(vz); }
        if (y > topY) { y = topY; vy = -Math.abs(vy); }
        else if (y < botY) { y = botY; vy = Math.abs(vy); }

        vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
      }

      // El pistón puede haber bajado (compresión): mantén las partículas dentro.
      if (y > topY) y = topY;
      if (y < botY) y = botY;

      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;

      d.position.set(x, y, z);
      d.scale.setScalar(1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Color y brillo según la temperatura: frío azul → caliente naranja.
    const tFrac = THREE.MathUtils.clamp((temp - T_MIN) / (T_MAX - T_MIN), 0, 1);
    if (matRef.current) {
      scratch.current.copy(COLD).lerp(HOT, tFrac);
      matRef.current.emissive.copy(scratch.current);
      matRef.current.emissiveIntensity = 0.2 + tFrac * 0.95;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, NMAX]} castShadow frustumCulled={false}>
      <sphereGeometry args={[R, 18, 18]} />
      <meshStandardMaterial ref={matRef} color={accent} emissive={COLD} emissiveIntensity={0.4} roughness={0.3} metalness={0.1} envMapIntensity={0.9} />
    </instancedMesh>
  );
}

/* ── Pared de vidrio translúcida ─────────────────────────────────────── */
function GlassPanel({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial transparent opacity={0.07} roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.04} color="#dff1ff" envMapIntensity={1.1} depthWrite={false} />
    </mesh>
  );
}

/* ── Cilindro (recipiente) ───────────────────────────────────────────── */
function Cilindro() {
  const w = BOX.hx * 2, d = BOX.hz * 2, t = 0.05;
  return (
    <group>
      {/* Piso */}
      <mesh position={[0, -t / 2, 0]} receiveShadow>
        <boxGeometry args={[w + 0.06, t, d + 0.06]} />
        <meshStandardMaterial color="#13314f" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Paredes */}
      <GlassPanel args={[w, H_MAX, t]} position={[0, H_MAX / 2, -BOX.hz]} />
      <GlassPanel args={[w, H_MAX, t]} position={[0, H_MAX / 2, BOX.hz]} />
      <GlassPanel args={[t, H_MAX, d]} position={[-BOX.hx, H_MAX / 2, 0]} />
      <GlassPanel args={[t, H_MAX, d]} position={[BOX.hx, H_MAX / 2, 0]} />
      {/* Aristas para leer el recipiente */}
      <mesh position={[0, H_MAX / 2, 0]}>
        <boxGeometry args={[w, H_MAX, d]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges threshold={15} color="#bfe8ff" />
      </mesh>
    </group>
  );
}

/* ── Pistón (tapa móvil que marca el volumen) ─────────────────────────── */
function Piston({ h }: { h: number }) {
  const w = BOX.hx * 2 - 0.06, d = BOX.hz * 2 - 0.06;
  return (
    <group position={[0, h, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, 0.14, d]} />
        <meshStandardMaterial color="#9fc0e0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Vástago */}
      <mesh position={[0, (H_MAX + 0.6 - h) / 2 + 0.07, 0]}>
        <cylinderGeometry args={[0.07, 0.07, H_MAX + 0.6 - h, 16]} />
        <meshStandardMaterial color="#6f8aa6" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Mango */}
      <mesh position={[0, H_MAX + 0.6 - h + 0.12, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.2]} />
        <meshStandardMaterial color="#b9d2ec" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Manómetro (barra de presión) ────────────────────────────────────── */
function Manometro({ P, accent }: { P: number; accent: string }) {
  const frac = THREE.MathUtils.clamp(P / P_GAUGE_MAX, 0.001, 1);
  const barH = frac * GAUGE_H;
  return (
    <group position={[GAUGE_X, 0, 0]}>
      {/* Carril */}
      <mesh position={[0, GAUGE_H / 2, 0]}>
        <boxGeometry args={[GAUGE_W + 0.06, GAUGE_H + 0.06, GAUGE_W + 0.06]} />
        <meshStandardMaterial color="#0a2138" roughness={0.85} metalness={0.1} transparent opacity={0.55} />
      </mesh>
      {/* Barra de presión */}
      <mesh position={[0, barH / 2, 0]}>
        <boxGeometry args={[GAUGE_W, barH, GAUGE_W]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function GasIdealScene(props: GasIdealSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [3.6, 2.4, 5.2], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: GasIdealSceneProps) {
  const { temp, volumen, moles, accent, pausado, autoRotate, resetNonce } = props;

  const h = useMemo(() => alturaDeV(volumen), [volumen]);
  const P = useMemo(() => presion(moles, temp, volumen), [moles, temp, volumen]);

  // Luz que pasa de fría a cálida con la temperatura.
  const heat = useMemo(
    () => COLD.clone().lerp(HOT, THREE.MathUtils.clamp((temp - T_MIN) / (T_MAX - T_MIN), 0, 1)),
    [temp]
  );

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 14, 30]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 10, 6]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 4, -3]} intensity={16} color={`#${heat.getHexString()}`} />
      <pointLight position={[4, 2, 5]} intensity={8} color="#ffffff" />

      <group key={`${resetNonce}`} position={[-0.5, -1.5, 0]}>
        {/* Pedestal */}
        <mesh position={[0.6, -0.2, 0]} receiveShadow>
          <cylinderGeometry args={[2.4, 2.7, 0.28, 64]} />
          <meshStandardMaterial color="#22344b" metalness={0.45} roughness={0.55} />
        </mesh>

        <Cilindro />
        <Piston h={h} />
        <GasParticulas temp={temp} volumen={volumen} moles={moles} accent={accent} pausado={pausado} resetNonce={resetNonce} />
        <Manometro P={P} accent={accent} />

        {/* Etiquetas */}
        <Html center position={[0, h + 0.95, 0]} distanceFactor={14} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
            <div style={{ fontWeight: 900, fontSize: 12, color: "#bfe8ff" }}>Pistón</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>V = {fmtNum(volumen, 1)} L</div>
          </div>
        </Html>
        <Html center position={[GAUGE_X, GAUGE_H + 0.4, 0]} distanceFactor={14} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
            <div style={{ fontWeight: 900, fontSize: 12, color: accent }}>Presión</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>{fmtNum(P, 0)} kPa</div>
          </div>
        </Html>

        <ContactShadows position={[0, -0.06, 0]} opacity={0.36} scale={10} blur={2.6} far={5} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 6, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-6, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.1} position={[6, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0.3, 0.2, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
