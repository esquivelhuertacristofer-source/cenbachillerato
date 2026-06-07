"use client";

/**
 * Escena 3D del laboratorio "Redes tróficas y flujo de energía" — R3F.
 * Se carga de forma diferida (ssr:false) desde LabTroficas.tsx.
 *
 * Una PIRÁMIDE DE ENERGÍA de cuatro niveles tróficos (productores → primarios →
 * secundarios → terciarios). La energía sube desde el Sol como PARTÍCULAS VERDES;
 * en cada nivel, la mayor parte se escapa como CALOR (partículas naranjas que
 * salen hacia afuera): es la eficiencia ecológica (~10%). Cuanto menor la
 * eficiencia, menos partículas llegan arriba y más se estrecha la pirámide. Los
 * tokens sobre cada plataforma evocan la biomasa: muchos abajo, pocos arriba.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las animaciones mutan REFS
 * (sin setState ni Math.random/Date.now en el render → apto React Compiler).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcularNiveles, NIVELES, DESCOMPONEDORES, fmtKcal, type NivelCalc } from "./troficas-data";

export interface TroficasSceneProps {
  energia: number;
  eficiencia: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

/* ── Geometría de la pirámide ────────────────────────────────────────────── */
const BASE_W = 3.2;     // ancho del nivel base
const TAPER = 0.66;     // factor de estrechamiento por nivel
const H = 0.55;         // alto de cada plataforma
const STEP = 0.6;       // separación vertical entre centros de nivel
const N = 4;            // niveles

const halfW = (i: number) => (BASE_W / 2) * Math.pow(TAPER, i);
const tierCenterY = (i: number) => i * STEP + H / 2;
const tierTopY = (i: number) => i * STEP + H;

// tokens (biomasa relativa) por nivel
const TOKENS = [9, 6, 4, 2];

const CAP = 110; // partículas de energía
const VERDE = new THREE.Color("#34D399");
const NARANJA = new THREE.Color("#f97316");

/* ── Plataforma de un nivel + tokens de biomasa ──────────────────────────── */
function Plataforma({ nv, calc }: { nv: typeof NIVELES[number]; calc: NivelCalc }) {
  const hw = halfW(nv.orden);
  const cy = tierCenterY(nv.orden);
  const ty = tierTopY(nv.orden);
  const nTok = TOKENS[nv.orden] ?? 2;
  const col = useMemo(() => new THREE.Color(nv.color), [nv.color]);

  const tokens = useMemo(() => {
    const out: [number, number][] = [];
    const rad = hw * 0.6;
    for (let k = 0; k < nTok; k++) {
      const a = (k / nTok) * Math.PI * 2 + nv.orden * 0.7;
      out.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    return out;
  }, [hw, nTok, nv.orden]);

  return (
    <group>
      {/* plataforma */}
      <mesh position={[0, cy, 0]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2, H, hw * 2]} />
        <meshStandardMaterial color={col} roughness={0.7} metalness={0.1} emissive={col} emissiveIntensity={0.12} flatShading />
      </mesh>
      {/* borde luminoso superior */}
      <mesh position={[0, ty + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[hw * 0.97, hw * 1.0, 4]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* tokens de biomasa */}
      {tokens.map((p, k) => (
        <mesh key={k} position={[p[0], ty + 0.14, p[1]]} castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* etiqueta del nivel con energía en vivo */}
      <Html position={[hw + 0.35, cy, 0]} center={false} distanceFactor={10} pointerEvents="none">
        <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "5px 10px", borderRadius: 10, background: "rgba(2,12,28,0.82)", border: `1px solid ${nv.color}aa`, whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`fa-solid ${nv.icono}`} style={{ color: nv.color, fontSize: 11 }} />
            <span style={{ color: "#eaf2fb", fontSize: 11.5, fontWeight: 900 }}>{nv.nombre}</span>
          </span>
          <span style={{ color: nv.color, fontSize: 11, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
            {fmtKcal(calc.energia)} kcal · {fmtKcal(calc.porcentaje)}%
          </span>
        </div>
      </Html>
    </group>
  );
}

/* ── Flujo de energía (verde sube · calor naranja se escapa) ─────────────── */
function FlujoEnergia({ eficiencia, pausado }: { eficiencia: number; pausado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpCol = useMemo(() => new THREE.Color(), []);

  // datos deterministas por partícula
  const datos = useMemo(() => {
    const ga = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: CAP }, (_, i) => ({
      ang: ga * i,
      rFac: 0.25 + ((i * 7) % 11) / 11 * 0.6, // factor de radio dentro de la silueta
      vel: 0.45 + ((i * 3) % 5) / 5 * 0.4,
      fase: (i * 0.123) % (1 + 0.6),
    }));
  }, []);
  const fases = useRef<number[]>(datos.map((d) => d.fase));

  const ef = eficiencia / 100;
  // umbrales acumulados: hasta qué nivel sube cada partícula
  const c0 = 1 - ef, c1 = c0 + ef * (1 - ef), c2 = c1 + ef * ef * (1 - ef);

  const peelY = (lvl: number) =>
    lvl === 1 ? tierCenterY(1) : lvl === 2 ? tierCenterY(2) : lvl === 3 ? tierCenterY(3) : tierTopY(3) + 0.45;

  const radioEn = (y: number, rFac: number) => {
    const ti = Math.min(N - 1, Math.max(0, Math.floor(y / STEP)));
    return Math.max(0.1, halfW(ti) * 0.72 * rFac);
  };

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    const RISE = 1, HEAT = 0.6, TOTAL = RISE + HEAT;
    const startY = tierTopY(0);
    for (let i = 0; i < CAP; i++) {
      const dt = datos[i]!;
      const f = ((fases.current[i] ?? 0) + d * dt.vel) % TOTAL;
      fases.current[i] = f;

      // nivel al que llega esta partícula (rank determinista por índice)
      const r = (i + 0.5) / CAP;
      const lvl = r < c0 ? 1 : r < c1 ? 2 : r < c2 ? 3 : 4;
      const yPeel = peelY(lvl);

      let y: number, rad: number, heat: number;
      if (f <= RISE) {
        const t = f / RISE;
        y = startY + (yPeel - startY) * t;
        rad = radioEn(y, dt.rFac);
        heat = 0;
      } else {
        const th = (f - RISE) / HEAT;
        y = yPeel + th * 0.7;
        rad = radioEn(yPeel, dt.rFac) + th * 1.5; // se aleja hacia afuera
        heat = th;
      }

      dummy.position.set(Math.cos(dt.ang) * rad, y, Math.sin(dt.ang) * rad);
      const s = heat > 0 ? 0.09 * (1 - heat) + 0.02 : 0.085;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      tmpCol.copy(VERDE).lerp(NARANJA, heat);
      m.setColorAt(i, tmpCol);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CAP]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.1} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Descomponedores (cierran el ciclo, en la base) ──────────────────────── */
function Descomponedores({ pausado }: { pausado: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (g.current && !pausado) g.current.rotation.y -= delta * 0.25; });
  const col = useMemo(() => new THREE.Color(DESCOMPONEDORES.color), []);
  const pts = useMemo(() => Array.from({ length: 7 }, (_, k) => {
    const a = (k / 7) * Math.PI * 2;
    return [Math.cos(a) * (BASE_W / 2 + 0.7), Math.sin(a) * (BASE_W / 2 + 0.7)] as [number, number];
  }), []);
  return (
    <group ref={g} position={[0, 0.12, 0]}>
      {pts.map((p, k) => (
        <mesh key={k} position={[p[0], 0, p[1]]} castShadow>
          <dodecahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} roughness={0.6} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── La pirámide completa ────────────────────────────────────────────────── */
function Piramide(props: TroficasSceneProps) {
  const { energia, eficiencia, pausado } = props;
  const niveles = useMemo(() => calcularNiveles(energia, eficiencia), [energia, eficiencia]);

  const grupo = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (grupo.current && !pausado) grupo.current.rotation.y += delta * 0.07; });

  return (
    <group>
      <ContactShadows position={[0, -0.02, 0]} opacity={0.45} scale={11} blur={2.4} far={6} />

      <group ref={grupo}>
        {/* suelo */}
        <mesh position={[0, -0.18, 0]} receiveShadow>
          <cylinderGeometry args={[BASE_W / 2 + 1.4, BASE_W / 2 + 1.4, 0.3, 48]} />
          <meshStandardMaterial color="#0c2438" roughness={1} />
        </mesh>

        {NIVELES.map((nv) => (
          <Plataforma key={nv.key} nv={nv} calc={niveles[nv.orden]!} />
        ))}

        <FlujoEnergia eficiencia={eficiencia} pausado={pausado} />
        <Descomponedores pausado={pausado} />

        {/* etiqueta descomponedores */}
        <Html position={[BASE_W / 2 + 0.7, 0.45, BASE_W / 2 + 0.7]} center distanceFactor={11} pointerEvents="none">
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 9, background: "rgba(2,12,28,0.82)", border: `1px solid ${DESCOMPONEDORES.color}aa`, whiteSpace: "nowrap" }}>
            <i className={`fa-solid ${DESCOMPONEDORES.icono}`} style={{ color: DESCOMPONEDORES.color, fontSize: 10 }} />
            <span style={{ color: "#eaf2fb", fontSize: 10.5, fontWeight: 800 }}>{DESCOMPONEDORES.nombre}</span>
          </div>
        </Html>
      </group>

      {/* Sol: fuente de toda la energía */}
      <group position={[0, tierTopY(3) + 1.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color="#ffd874" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <Html position={[0, 0.85, 0]} center distanceFactor={12} pointerEvents="none">
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 9, background: "rgba(2,12,28,0.78)", border: "1px solid #ffb34788", whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-sun" style={{ color: "#ffd874", fontSize: 11 }} />
            <span style={{ color: "#fff4d6", fontSize: 11, fontWeight: 800 }}>Energía solar</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ── Canvas + contenido ──────────────────────────────────────────────────── */
export default function TroficasScene(props: TroficasSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [6.8, 4.2, 7.2], fov: 45 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: TroficasSceneProps) {
  const { accent, autoRotate, resetNonce } = props;
  return (
    <>
      <color attach="background" args={["#06182c"]} />
      <fog attach="fog" args={["#06182c", 16, 44]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2, 8, 4]}
        intensity={1.5}
        color="#fff2cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 3, 5]} intensity={0.45} color={accent} />

      <group key={`${resetNonce}`}>
        <Piramide {...props} />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.1} position={[0, 8, 4]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-8, 2, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.7} position={[8, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={22}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.1, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.75} />
        <Vignette eskil={false} offset={0.3} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
