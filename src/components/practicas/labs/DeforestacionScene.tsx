"use client";

/**
 * Escena 3D — "Deforestación y sus efectos" (CNEYT-III-P06-A1).
 * Un predio forestal circular: los árboles se convierten en tocones a medida
 * que cae la cobertura, del área talada se eleva humo/CO₂, la fauna desaparece
 * y el suelo expuesto se erosiona. La restauración regresa árboles.
 *
 * Patrón R3F obligatorio: el default export sólo monta <Canvas> y delega en
 * <Contenido>, que es DESCENDIENTE del Canvas (ahí viven refs/useMemo/useFrame).
 * React Compiler: nada de Math.random()/Date.now()/setState en render; toda la
 * animación muta REFS dentro de useFrame; distribución por ángulo áureo (idx).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  coberturaEfectiva,
  causaDe,
  riesgoIncendio,
  type CausaKey,
} from "./deforestacion-data";

export interface DeforestacionSceneProps {
  cobertura: number;
  restauracion: number;
  causa: CausaKey;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

/* ── Geometría del predio ────────────────────────────────────────────────── */
const RADIO = 4.2;            // radio del disco de terreno
const N_SITIOS = 64;          // posiciones de árbol/tocón
const GA = Math.PI * (3 - Math.sqrt(5)); // ángulo áureo
const VERDE = new THREE.Color("#2f9e57");
const CAFE = new THREE.Color("#7c5a3a");
const HUMO_CAP = 70;

interface Sitio { x: number; z: number; r: number; rot: number; esc: number }

function sitios(): Sitio[] {
  const out: Sitio[] = [];
  for (let i = 0; i < N_SITIOS; i++) {
    const t = (i + 0.5) / N_SITIOS;
    const rad = Math.sqrt(t) * (RADIO - 0.5);
    const ang = GA * i;
    out.push({
      x: Math.cos(ang) * rad,
      z: Math.sin(ang) * rad,
      r: rad,
      rot: ang,
      esc: 0.78 + 0.5 * (1 - t),          // árboles del centro un poco más grandes
    });
  }
  return out;
}

/* ── Un árbol (copa cónica doble + tronco) ───────────────────────────────── */
function Arbol({ s, regen }: { s: Sitio; regen: boolean }) {
  const copa = regen ? "#86d99c" : "#2f9e57";
  const copa2 = regen ? "#a7e6b6" : "#3fb56b";
  const h = 0.9 * s.esc;
  return (
    <group position={[s.x, 0, s.z]} rotation={[0, s.rot, 0]}>
      <mesh position={[0, h * 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.06 * s.esc, 0.09 * s.esc, h * 0.6, 6]} />
        <meshStandardMaterial color="#6b4a2e" roughness={0.9} />
      </mesh>
      <mesh position={[0, h * 0.78, 0]} castShadow>
        <coneGeometry args={[0.42 * s.esc, h * 0.9, 8]} />
        <meshStandardMaterial color={copa} roughness={0.7} />
      </mesh>
      <mesh position={[0, h * 1.18, 0]} castShadow>
        <coneGeometry args={[0.30 * s.esc, h * 0.7, 8]} />
        <meshStandardMaterial color={copa2} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ── Un tocón (bosque talado) ────────────────────────────────────────────── */
function Tocon({ s }: { s: Sitio }) {
  return (
    <group position={[s.x, 0, s.z]}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.12 * s.esc, 0.14 * s.esc, 0.14, 7]} />
        <meshStandardMaterial color="#7c5a3a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.145, 0]}>
        <cylinderGeometry args={[0.12 * s.esc, 0.12 * s.esc, 0.02, 7]} />
        <meshStandardMaterial color="#caa57a" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ── Ganado (sólo en escenario de ganadería, sobre el área talada) ───────── */
function Vaca({ s }: { s: Sitio }) {
  return (
    <group position={[s.x, 0.16, s.z]} rotation={[0, s.rot, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.2, 0.18]} />
        <meshStandardMaterial color="#e7e3da" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.02, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.13]} />
        <meshStandardMaterial color="#4a3b2e" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Humo / CO₂ que se eleva del área talada ─────────────────────────────── */
function Humo({
  cobEf,
  causaKey,
  pausado,
}: {
  cobEf: number;
  causaKey: CausaKey;
  pausado: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<Float32Array | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colA = useMemo(() => new THREE.Color(causaDe(causaKey).humoColor), [causaKey]);
  const colB = useMemo(() => new THREE.Color("#cfd4da"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const datos = useMemo(() => {
    const arr: { ang: number; rFac: number; vel: number; fase: number }[] = [];
    for (let i = 0; i < HUMO_CAP; i++) {
      arr.push({
        ang: GA * i,
        rFac: 0.35 + ((i * 37) % 100) / 160, // 0.35–0.97 del radio
        vel: 0.5 + ((i * 53) % 100) / 130,
        fase: ((i * 29) % 100) / 100,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    if (!fases.current) fases.current = new Float32Array(datos.map((d) => d.fase));
    const f = fases.current;
    const perdido = Math.max(0, 1 - cobEf / 100);
    const activos = Math.round(perdido * HUMO_CAP);
    const step = pausado ? 0 : delta;

    for (let i = 0; i < HUMO_CAP; i++) {
      const d = datos[i]!;
      if (i >= activos) {
        dummy.position.set(0, -50, 0);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        continue;
      }
      f[i] = (f[i]! + step * d.vel * 0.22) % 1;
      const y = f[i]!;                     // 0 abajo → 1 arriba
      const rad = (RADIO - 0.6) * d.rFac;
      const sway = Math.sin((y + d.fase) * Math.PI * 2) * 0.18;
      dummy.position.set(
        Math.cos(d.ang) * rad + sway,
        0.3 + y * 3.0,
        Math.sin(d.ang) * rad + sway,
      );
      const sc = 0.18 + y * 0.42;
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      tmp.copy(colA).lerp(colB, y);
      m.setColorAt(i, tmp);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, HUMO_CAP]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial
        transparent
        opacity={0.5}
        depthWrite={false}
        roughness={1}
        emissive="#000000"
      />
    </instancedMesh>
  );
}

/* ── Suelo: verde con bosque, café/erosionado al deforestar ──────────────── */
function Suelo({ cobEf }: { cobEf: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const mat = ref.current;
    if (!mat) return;
    const t = cobEf / 100;
    tmp.copy(CAFE).lerp(VERDE, t * 0.9 + 0.05);
    mat.color.copy(tmp);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <cylinderGeometry args={[RADIO, RADIO + 0.15, 0.4, 64]} />
      <meshStandardMaterial ref={ref} color="#2f9e57" roughness={0.96} />
    </mesh>
  );
}

/* ── Fauna: tokens que desaparecen al caer la biodiversidad ──────────────── */
const FAUNA_COLORES = ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#c084fc", "#f97316", "#a3e635"];
function Fauna({ cobEf, pausado }: { cobEf: number; pausado: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const biod = Math.pow(cobEf / 100, 1.3);
  const visibles = Math.round(biod * FAUNA_COLORES.length);
  const pos = useMemo(
    () =>
      FAUNA_COLORES.map((_, i) => {
        const ang = GA * (i + 1);
        const rad = 0.8 + (i / FAUNA_COLORES.length) * (RADIO - 1.8);
        return { x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, fase: (i * 17) % 10 };
      }),
    [],
  );
  useFrame((state) => {
    const g = ref.current;
    if (!g || pausado) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      c.position.y = 1.1 + Math.sin(t * 1.6 + pos[i]!.fase) * 0.12;
    });
  });
  return (
    <group ref={ref}>
      {pos.map((p, i) =>
        i < visibles ? (
          <mesh key={i} position={[p.x, 1.1, p.z]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial
              color={FAUNA_COLORES[i]!}
              emissive={FAUNA_COLORES[i]!}
              emissiveIntensity={0.35}
              roughness={0.5}
            />
          </mesh>
        ) : null,
      )}
    </group>
  );
}

/* ── El predio completo ──────────────────────────────────────────────────── */
function Predio({
  cobertura,
  restauracion,
  causa,
  accent,
  pausado,
}: {
  cobertura: number;
  restauracion: number;
  causa: CausaKey;
  accent: string;
  pausado: boolean;
}) {
  const grupo = useRef<THREE.Group>(null);
  const SITIOS = useMemo(() => sitios(), []);
  const cobEf = coberturaEfectiva(cobertura, restauracion);
  const enPie = Math.round((cobEf / 100) * N_SITIOS);
  // de los árboles en pie, los últimos en "volver" son los regenerados por restauración
  const baseEnPie = Math.round((cobertura / 100) * N_SITIOS);
  const causaInfo = causaDe(causa);
  const riesgo = riesgoIncendio(cobEf);

  useFrame((_, delta) => {
    if (grupo.current && !pausado) grupo.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={grupo}>
      <Suelo cobEf={cobEf} />

      {SITIOS.map((s, i) =>
        i < enPie ? (
          <Arbol key={`a${i}`} s={s} regen={i >= baseEnPie} />
        ) : (
          <Tocon key={`t${i}`} s={s} />
        ),
      )}

      {/* Ganado sobre el área talada cuando la causa es ganadería */}
      {causa === "ganaderia" &&
        SITIOS.slice(enPie).filter((_, i) => i % 6 === 0).map((s, i) => (
          <Vaca key={`v${i}`} s={s} />
        ))}

      <Humo cobEf={cobEf} causaKey={causa} pausado={pausado} />
      <Fauna cobEf={cobEf} pausado={pausado} />

      {/* Etiqueta de cobertura */}
      <Html position={[0, 4.4, 0]} center distanceFactor={11} pointerEvents="none">
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "7px 13px",
            borderRadius: 12,
            background: "rgba(6,20,15,0.72)",
            border: `1px solid ${accent}66`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            fontFamily: "system-ui, sans-serif",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}
        >
          <i className="fa-solid fa-tree" style={{ color: accent, marginRight: 7 }} />
          Cobertura forestal: {Math.round(cobEf)}%
        </div>
      </Html>

      {/* Aviso de riesgo de incendio (sinergia) cuando la pérdida es alta */}
      {riesgo > 55 && (
        <Html position={[0, 3.6, 0]} center distanceFactor={12} pointerEvents="none">
          <div
            style={{
              whiteSpace: "nowrap",
              padding: "5px 11px",
              borderRadius: 10,
              background: "rgba(40,8,0,0.7)",
              border: "1px solid rgba(249,115,22,0.55)",
              color: "#ffd9be",
              fontWeight: 700,
              fontSize: 12.5,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <i className="fa-solid fa-fire" style={{ color: "#f97316", marginRight: 6 }} />
            Alto riesgo de incendio · {causaInfo.reemplazo}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({
  cobertura,
  restauracion,
  causa,
  accent,
  pausado,
  autoRotate,
  resetNonce,
}: DeforestacionSceneProps) {
  return (
    <>
      <color attach="background" args={["#06140f"]} />
      <fog attach="fog" args={["#06140f", 14, 30]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={30}
      />
      <pointLight position={[-5, 4, -4]} intensity={0.5} color={accent} />

      <group key={`${resetNonce}`}>
        <Predio
          cobertura={cobertura}
          restauracion={restauracion}
          causa={causa}
          accent={accent}
          pausado={pausado}
        />
      </group>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={16} blur={2.4} far={6} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.6} position={[0, 6, 2]} scale={8} color="#eaf7ef" />
          <Lightformer intensity={0.8} position={[5, 2, 1]} scale={5} color="#bfe6cf" />
          <Lightformer intensity={0.6} position={[-5, 1, -2]} scale={5} color="#9fd9ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={24}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 1.2, 0]}
        autoRotate={autoRotate && !pausado}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function DeforestacionScene(props: DeforestacionSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [7.5, 5, 8], fov: 45 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}
