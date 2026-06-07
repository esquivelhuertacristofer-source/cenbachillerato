"use client";

/**
 * Escena 3D del laboratorio de Transferencia de calor (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabTransferenciaCalor.tsx.
 *
 * Muestra los TRES mecanismos por los que viaja el calor, uno a la vez según el
 * mecanismo elegido:
 *   · CONDUCCIÓN — una barra de átomos: el extremo en contacto con la fuente se
 *     calienta y el calor avanza partícula a partícula. Con un metal (cobre) el
 *     frente de calor corre rápido; con un aislante (madera) apenas avanza.
 *   · CONVECCIÓN — un fluido en un recipiente calentado por debajo: el fluido
 *     caliente sube y el frío baja, formando corrientes circulares.
 *   · RADIACIÓN — el Sol calienta a la Tierra lanzando ondas (fotones) a través
 *     del vacío, sin ningún medio material de por medio.
 *
 * Patrón obligatorio de R3F: useFrame SOLO funciona dentro de <Canvas>, así que
 * cada simulación vive en un componente hijo del Canvas. Nada de Math.random ni
 * Date.now: la animación usa state.clock y delta, y mutamos REFS (no setState).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type MecanismoKey,
  getMaterial,
  intensidadFuente,
  fmtNum,
} from "./transferencia-calor-data";

export interface TransferenciaCalorSceneProps {
  mecanismo: MecanismoKey;
  materialKey: string;
  tFuente: number; // °C
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const COLD = new THREE.Color("#2a5cd0");
const WARM = new THREE.Color("#ff6a2a");
const HOT = new THREE.Color("#ffd24a");

// PRNG determinista (sin Math.random): mismo índice → mismo valor en cada render.
function rng(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ════════════════════════════════════════════════════════════════════════
   CONDUCCIÓN — barra de átomos; el calor avanza partícula a partícula
   ════════════════════════════════════════════════════════════════════════ */
const C_COLS = 22; // columnas a lo largo de la barra
const C_ROWS = 3; // filas (alto)
const C_N = C_COLS * C_ROWS;
const C_X0 = -2.25; // x del extremo caliente
const C_X1 = 2.25; // x del extremo frío
const C_AR = 0.12; // radio de átomo
const C_Y = 0.7; // altura del centro de la barra

function Conduccion({ materialKey, tFuente, accent, pausado }: {
  materialKey: string;
  tFuente: number;
  accent: string;
  pausado: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const scratch = useRef(new THREE.Color());

  // Temperatura normalizada (0–1) por columna; se difunde hacia el extremo frío.
  const temps = useRef<Float32Array | null>(null);
  if (temps.current === null) temps.current = new Float32Array(C_COLS);

  const colW = (C_X1 - C_X0) / (C_COLS - 1);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = temps.current!;
    const mat = getMaterial(materialKey);
    const inten = intensidadFuente(tFuente);

    if (!pausado) {
      // El extremo en contacto con la fuente se mantiene caliente.
      t[0] = inten;
      // Difusión 1D (ecuación del calor discreta). El extremo frío está aislado.
      const alpha = mat.rate * 2.6 * delta;
      const prev = Float32Array.from(t);
      for (let c = 1; c < C_COLS; c++) {
        const left = prev[c - 1]!;
        const here = prev[c]!;
        const right = c < C_COLS - 1 ? prev[c + 1]! : prev[c]!; // aislado a la derecha
        t[c] = here + alpha * (left + right - 2 * here);
      }
    }

    const time = state.clock.elapsedTime;
    const d = dummy.current;
    for (let c = 0; c < C_COLS; c++) {
      const tc = t[c]!;
      const xc = C_X0 + c * colW;
      const amp = 0.012 + tc * 0.10; // vibración crece con la temperatura
      for (let r = 0; r < C_ROWS; r++) {
        const i = c * C_ROWS + r;
        const yr = C_Y + (r - (C_ROWS - 1) / 2) * 0.34;
        const ph = rng(i + 1) * Math.PI * 2;
        const fr = 8 + rng(i + 9) * 6;
        const ox = Math.sin(time * fr + ph) * amp;
        const oy = Math.cos(time * (fr * 0.9) + ph) * amp;
        const oz = Math.sin(time * (fr * 1.1) + ph * 1.7) * amp;
        d.position.set(xc + ox, yr + oy, oz);
        d.scale.setScalar(1);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        // Color frío→cálido→caliente según la temperatura local.
        const col = scratch.current;
        if (tc < 0.5) col.copy(COLD).lerp(WARM, tc / 0.5);
        else col.copy(WARM).lerp(HOT, (tc - 0.5) / 0.5);
        m.setColorAt(i, col);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  const inten = intensidadFuente(tFuente);

  return (
    <group position={[0, -0.4, 0]}>
      {/* Átomos de la barra */}
      <instancedMesh ref={mesh} args={[undefined, undefined, C_N]} castShadow frustumCulled={false}>
        <sphereGeometry args={[C_AR, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.15} emissive="#1a0f00" emissiveIntensity={0.25} envMapIntensity={0.8} />
      </instancedMesh>

      {/* Contorno translúcido de la barra */}
      <mesh position={[(C_X0 + C_X1) / 2, C_Y, 0]}>
        <boxGeometry args={[C_X1 - C_X0 + 0.5, C_ROWS * 0.34 + 0.3, 0.7]} />
        <meshPhysicalMaterial transparent opacity={0.05} roughness={0.1} metalness={0} clearcoat={1} color="#dff1ff" depthWrite={false} />
        <Edges threshold={15} color="#7fa8d8" />
      </mesh>

      {/* Fuente de calor (foco caliente) en el extremo izquierdo */}
      <mesh position={[C_X0 - 0.55, C_Y, 0]}>
        <boxGeometry args={[0.5, C_ROWS * 0.34 + 0.5, 0.95]} />
        <meshStandardMaterial color="#ff3b14" emissive="#ff3b14" emissiveIntensity={0.6 + inten * 1.6} roughness={0.5} />
      </mesh>
      <pointLight position={[C_X0 - 0.7, C_Y, 0.6]} intensity={4 + inten * 22} color="#ff5a1f" distance={7} />

      <Html center position={[C_X0 - 0.55, C_Y + 1.15, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#ff8a5a" }}>Fuente de calor</div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>{fmtNum(tFuente, 0)} °C</div>
        </div>
      </Html>
      <Html center position={[C_X1 + 0.45, C_Y + 1.15, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: accent }}>Extremo lejano</div>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#bcd6f2" }}>¿llega el calor?</div>
        </div>
      </Html>

      <ContactShadows position={[0, -0.05 + 0.4 - 0.4, 0]} opacity={0.3} scale={9} blur={2.6} far={5} color="#020c1c" />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CONVECCIÓN — un fluido calentado por debajo: caliente sube, frío baja
   ════════════════════════════════════════════════════════════════════════ */
const V_N = 110; // partículas de fluido
const V_HX = 2.0;
const V_HY = 2.9; // alto (de 0 a V_HY)
const V_HZ = 0.85;
const V_AR = 0.10;

function Conveccion({ tFuente, accent, pausado }: {
  tFuente: number;
  accent: string;
  pausado: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const scratch = useRef(new THREE.Color());

  const buf = useRef<Float32Array | null>(null);
  if (buf.current === null) {
    const pos = new Float32Array(V_N * 3);
    for (let i = 0; i < V_N; i++) {
      const i3 = i * 3;
      pos[i3] = (rng(i + 1) * 2 - 1) * (V_HX - V_AR);
      pos[i3 + 1] = rng(i + 5) * (V_HY - 2 * V_AR) + V_AR;
      pos[i3 + 2] = (rng(i + 11) * 2 - 1) * (V_HZ - V_AR);
    }
    buf.current = pos;
  }

  useFrame((_state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);
    const pos = buf.current!;
    const d = dummy.current;
    const inten = intensidadFuente(tFuente);
    const speed = (0.6 + inten * 2.4);

    for (let i = 0; i < V_N; i++) {
      const i3 = i * 3;
      let x = pos[i3]!, y = pos[i3 + 1]!, z = pos[i3 + 2]!;

      // Campo de convección: una celda (rollo). El centro sube, los lados bajan.
      const nx = x / V_HX; // −1..1
      const ny = y / V_HY; //  0..1
      const vy = Math.cos(nx * Math.PI); // centro +1 (sube), bordes −1 (baja)
      const vx = Math.sin(nx * Math.PI) * (2 * ny - 1); // recircula: afuera arriba, adentro abajo

      if (!pausado) {
        x += vx * speed * delta;
        y += vy * speed * delta;
        // ligera deriva en z para dar volumen, determinista por índice
        z += Math.sin(_state.clock.elapsedTime * 0.7 + rng(i + 3) * 6.28) * 0.04 * speed * delta * 10;

        // Mantener dentro del recipiente
        if (x > V_HX - V_AR) x = V_HX - V_AR;
        else if (x < -(V_HX - V_AR)) x = -(V_HX - V_AR);
        if (y > V_HY - V_AR) y = V_HY - V_AR;
        else if (y < V_AR) y = V_AR;
        if (z > V_HZ - V_AR) z = V_HZ - V_AR;
        else if (z < -(V_HZ - V_AR)) z = -(V_HZ - V_AR);

        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      }

      d.position.set(x, y, z);
      d.scale.setScalar(1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);

      // Color por temperatura: caliente abajo/subiendo (rojo), frío arriba/bajando (azul).
      const calor = THREE.MathUtils.clamp((1 - ny) * 0.6 + (vy * 0.5 + 0.5) * 0.4, 0, 1);
      const col = scratch.current;
      if (calor < 0.5) col.copy(COLD).lerp(WARM, calor / 0.5);
      else col.copy(WARM).lerp(HOT, (calor - 0.5) / 0.5);
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  const inten = intensidadFuente(tFuente);
  const t = 0.05;

  return (
    <group position={[0, -1.2, 0]}>
      {/* Partículas de fluido */}
      <instancedMesh ref={mesh} args={[undefined, undefined, V_N]} castShadow frustumCulled={false}>
        <sphereGeometry args={[V_AR, 14, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.05} envMapIntensity={0.9} />
      </instancedMesh>

      {/* Recipiente de vidrio (paredes y fondo, sin tapa) */}
      <mesh position={[0, V_HY / 2, -V_HZ]}>
        <boxGeometry args={[V_HX * 2, V_HY, t]} />
        <meshPhysicalMaterial transparent opacity={0.06} roughness={0.05} clearcoat={1} color="#dff1ff" depthWrite={false} />
      </mesh>
      <mesh position={[0, V_HY / 2, V_HZ]}>
        <boxGeometry args={[V_HX * 2, V_HY, t]} />
        <meshPhysicalMaterial transparent opacity={0.06} roughness={0.05} clearcoat={1} color="#dff1ff" depthWrite={false} />
      </mesh>
      <mesh position={[-V_HX, V_HY / 2, 0]}>
        <boxGeometry args={[t, V_HY, V_HZ * 2]} />
        <meshPhysicalMaterial transparent opacity={0.06} roughness={0.05} clearcoat={1} color="#dff1ff" depthWrite={false} />
      </mesh>
      <mesh position={[V_HX, V_HY / 2, 0]}>
        <boxGeometry args={[t, V_HY, V_HZ * 2]} />
        <meshPhysicalMaterial transparent opacity={0.06} roughness={0.05} clearcoat={1} color="#dff1ff" depthWrite={false} />
      </mesh>
      <mesh position={[0, V_HY / 2, 0]}>
        <boxGeometry args={[V_HX * 2, V_HY, V_HZ * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges threshold={15} color="#7fa8d8" />
      </mesh>

      {/* Placa caliente (fuente) en el fondo */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[V_HX * 2 + 0.1, 0.12, V_HZ * 2 + 0.1]} />
        <meshStandardMaterial color="#ff3b14" emissive="#ff3b14" emissiveIntensity={0.5 + inten * 1.8} roughness={0.5} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} intensity={3 + inten * 16} color="#ff5a1f" distance={6} />

      <Html center position={[0, -0.55, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#ff8a5a" }}>Fuente de calor</div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>{fmtNum(tFuente, 0)} °C</div>
        </div>
      </Html>
      <Html center position={[V_HX + 0.5, V_HY * 0.75, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: "#9fc6ff", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>↓ frío baja</div>
      </Html>
      <Html center position={[0, V_HY + 0.35, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: accent, textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>↑ caliente sube</div>
      </Html>

      <ContactShadows position={[0, -0.12, 0]} opacity={0.3} scale={9} blur={2.6} far={5} color="#020c1c" />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   RADIACIÓN — el Sol calienta la Tierra a través del vacío
   ════════════════════════════════════════════════════════════════════════ */
const R_NPH = 54; // fotones (ondas) en vuelo
const R_SUN_X = -2.7;
const R_EARTH_X = 2.6;
const R_Y = 0.6;
const R_PR = 0.07;

function Radiacion({ tFuente, accent, pausado }: {
  tFuente: number;
  accent: string;
  pausado: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const earthRef = useRef<THREE.MeshStandardMaterial>(null);
  const sunRef = useRef<THREE.MeshStandardMaterial>(null);

  // progreso (0–1) de cada fotón a lo largo de su trayectoria
  const prog = useRef<Float32Array | null>(null);
  if (prog.current === null) {
    const p = new Float32Array(R_NPH);
    for (let i = 0; i < R_NPH; i++) p[i] = rng(i + 1);
    prog.current = p;
  }

  useFrame((_state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);
    const p = prog.current!;
    const d = dummy.current;
    const inten = intensidadFuente(tFuente);
    const speed = 0.25 + inten * 0.85;
    const span = R_EARTH_X - R_SUN_X;

    for (let i = 0; i < R_NPH; i++) {
      if (!pausado) {
        p[i]! += speed * delta * (0.7 + rng(i + 31) * 0.6);
        if (p[i]! > 1) p[i]! -= 1;
      }
      const tt = p[i]!;
      // Cada fotón viaja por una línea recta con una pequeña separación vertical/z.
      const oy = (rng(i + 7) * 2 - 1) * 0.85;
      const oz = (rng(i + 17) * 2 - 1) * 0.85;
      const x = R_SUN_X + 0.35 + (span - 0.7) * tt;
      const y = R_Y + oy * (0.15 + 0.85 * Math.min(tt, 1)); // se abren al salir del Sol
      const z = oz * (0.15 + 0.85 * Math.min(tt, 1));
      // se desvanecen al final (al ser absorbidos por la Tierra)
      const sc = tt > 0.9 ? (1 - tt) / 0.1 : 1;
      d.position.set(x, y, z);
      d.scale.setScalar(Math.max(sc, 0.001));
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // La Tierra se calienta (emite más) y el Sol brilla con la intensidad.
    if (earthRef.current) earthRef.current.emissiveIntensity = 0.05 + inten * 1.1;
    if (sunRef.current) sunRef.current.emissiveIntensity = 1.2 + inten * 1.8;
  });

  const inten = intensidadFuente(tFuente);

  return (
    <group position={[0, 0, 0]}>
      {/* Sol */}
      <mesh position={[R_SUN_X, R_Y, 0]}>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial ref={sunRef} color="#ffae3b" emissive="#ff7a18" emissiveIntensity={1.6} roughness={0.5} />
      </mesh>
      <pointLight position={[R_SUN_X, R_Y, 0]} intensity={6 + inten * 26} color="#ffb347" distance={14} />

      {/* Tierra */}
      <mesh position={[R_EARTH_X, R_Y, 0]} castShadow>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial ref={earthRef} color="#2f7fd0" emissive="#ff4a1f" emissiveIntensity={0.1} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Fotones / ondas que cruzan el vacío */}
      <instancedMesh ref={mesh} args={[undefined, undefined, R_NPH]} frustumCulled={false}>
        <sphereGeometry args={[R_PR, 10, 10]} />
        <meshBasicMaterial color="#ffd76a" toneMapped={false} />
      </instancedMesh>

      <Html center position={[R_SUN_X, R_Y + 1.4, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: "#ffc04a" }}>Sol</div>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#ffd9a0" }}>{fmtNum(tFuente, 0)} °C (fuente)</div>
        </div>
      </Html>
      <Html center position={[R_EARTH_X, R_Y + 1.1, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ fontWeight: 900, fontSize: 13, color: "#7fb8ff", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>Tierra</div>
      </Html>
      <Html center position={[(R_SUN_X + R_EARTH_X) / 2, R_Y - 1.25, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: accent }}>vacío del espacio</div>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#9fb6d6" }}>sin materia · ~150 millones de km</div>
        </div>
      </Html>
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function TransferenciaCalorScene(props: TransferenciaCalorSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.2, 1.6, 8.4], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: TransferenciaCalorSceneProps) {
  const { mecanismo, materialKey, tFuente, accent, pausado, autoRotate, resetNonce } = props;

  const inten = useMemo(() => intensidadFuente(tFuente), [tFuente]);
  const heat = useMemo(() => COLD.clone().lerp(WARM, inten), [inten]);

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 34]} />

      <ambientLight intensity={mecanismo === "radiacion" ? 0.18 : 0.5} />
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

      {/* Solo se monta el mecanismo activo; key con resetNonce reinicia su simulación. */}
      <group key={`${mecanismo}-${resetNonce}`}>
        {mecanismo === "conduccion" && (
          <Conduccion materialKey={materialKey} tFuente={tFuente} accent={accent} pausado={pausado} />
        )}
        {mecanismo === "conveccion" && (
          <Conveccion tFuente={tFuente} accent={accent} pausado={pausado} />
        )}
        {mecanismo === "radiacion" && (
          <Radiacion tFuente={tFuente} accent={accent} pausado={pausado} />
        )}
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
        target={[0, 0.5, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
