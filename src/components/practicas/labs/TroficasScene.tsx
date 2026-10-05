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
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcularNiveles, cascada, NIVELES, DESCOMPONEDORES, fmtKcal, type NivelCalc, type EstadoNivel } from "./troficas-data";
import { Escenario } from "./_escenario";

export interface TroficasSceneProps {
  energia: number;
  eficiencia: number;
  /** Nivel quitado (0–3) en el experimento «quita una especie», o null. */
  quitado: number | null;
  /** Un organismo representativo por nivel (rótulos). */
  organismos: string[];
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

/* ── Plataforma de un nivel + tokens de biomasa ──────────────────────────────
 * `mult` es la población relativa (1 = normal). Un nivel quitado o sin alimento
 * se ve como un fantasma gris sin biomasa. */
function Plataforma({ nv, calc, mult, estado, organismo, ancho }: {
  nv: typeof NIVELES[number]; calc: NivelCalc; mult: number; estado: EstadoNivel; organismo: string; ancho: boolean;
}) {
  const hw = halfW(nv.orden);
  const cy = tierCenterY(nv.orden);
  const ty = tierTopY(nv.orden);
  const nTok = Math.round((TOKENS[nv.orden] ?? 2) * mult);
  const fantasma = estado !== "normal";
  const col = useMemo(() => new THREE.Color(fantasma ? "#5b6b7c" : nv.color), [nv.color, fantasma]);

  const tokens = useMemo(() => {
    const out: [number, number][] = [];
    const rad = hw * 0.6;
    for (let k = 0; k < nTok; k++) {
      const a = (k / Math.max(1, nTok)) * Math.PI * 2 + nv.orden * 0.7;
      out.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    return out;
  }, [hw, nTok, nv.orden]);

  const pct = Math.round((mult - 1) * 100);
  const linea2 = estado === "quitado" ? "quitado" : estado === "hambre" ? "sin alimento"
    : pct !== 0 ? `${pct > 0 ? "+" : "−"}${Math.abs(pct)} % población` : `${fmtKcal(calc.energia)} kcal`;

  return (
    <group>
      {/* plataforma */}
      <mesh position={[0, cy, 0]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2, H, hw * 2]} />
        <meshStandardMaterial color={col} roughness={0.7} metalness={0.1} emissive={col} emissiveIntensity={fantasma ? 0.02 : 0.12} flatShading transparent opacity={fantasma ? 0.35 : 1} />
      </mesh>
      {/* tokens de biomasa */}
      {tokens.map((p, k) => (
        <mesh key={k} position={[p[0], ty + 0.14, p[1]]} castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* rótulo del nivel, a la derecha de su plataforma */}
      <Html position={[hw + 0.4, cy, 0]} center={false} pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ transform: "translate(0,-50%)", display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 10, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${fantasma ? "#7b8794" : nv.color}`, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", fontFamily: "system-ui, sans-serif" }}>
          <i className={`fa-solid ${nv.icono}`} style={{ color: fantasma ? "#9aa7b4" : nv.color, fontSize: 14 }} />
          <span style={{ color: "#eaf2fb", fontSize: 14, fontWeight: 900 }}>{organismo}</span>
          {ancho && <span style={{ color: fantasma ? "#9aa7b4" : nv.color, fontSize: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>· {linea2}</span>}
        </div>
      </Html>
    </group>
  );
}

/* ── Flujo de energía (verde sube · calor naranja se escapa) ─────────────── */
function FlujoEnergia({ eficiencia, pausado, quitado }: { eficiencia: number; pausado: boolean; quitado: number | null }) {
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
    lvl <= 0 ? tierTopY(0) + 0.3 : lvl === 1 ? tierCenterY(1) : lvl === 2 ? tierCenterY(2) : lvl === 3 ? tierCenterY(3) : tierTopY(3) + 0.45;

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
      const lvlBruto = r < c0 ? 1 : r < c1 ? 2 : r < c2 ? 3 : 4;
      // la energía no sube más allá del último nivel vivo
      const lvl = quitado === null ? lvlBruto : Math.min(lvlBruto, quitado - 1);
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
  const { energia, eficiencia, pausado, quitado, organismos } = props;
  const niveles = useMemo(() => calcularNiveles(energia, eficiencia), [energia, eficiencia]);
  const casc = useMemo(() => cascada(quitado), [quitado]);
  const ancho = useThree((st) => st.size.width) >= 640;

  return (
    <group>

      <group>
        {/* suelo */}
        <mesh position={[0, -0.18, 0]} receiveShadow>
          <cylinderGeometry args={[BASE_W / 2 + 1.4, BASE_W / 2 + 1.4, 0.3, 48]} />
          <meshStandardMaterial color="#0c2438" roughness={1} />
        </mesh>

        {NIVELES.map((nv) => (
          <Plataforma key={nv.key} nv={nv} calc={niveles[nv.orden]!} mult={casc.mult[nv.orden]!} estado={casc.estado[nv.orden]!} organismo={organismos[nv.orden] ?? nv.nombre} ancho={ancho} />
        ))}

        <FlujoEnergia eficiencia={eficiencia} pausado={pausado} quitado={quitado} />
        <Descomponedores pausado={pausado} />

      </group>

      {/* Sol: fuente de toda la energía */}
      <group position={[0, tierTopY(3) + 1.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color="#ffd874" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
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
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: TroficasSceneProps) {
  const { accent, autoRotate, resetNonce } = props;
  const angosto = useThree((st) => st.size.width) < 640;
  // contenido ~60 % del alto, entre la barra de arriba y la misión de abajo
  const cam: [number, number, number] = angosto ? [7.2, 4.6, 8.0] : [5.2, 3.3, 5.6];
  return (
    <>
      <PerspectiveCamera makeDefault position={cam} fov={45} />
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-0.02} />


      <group key={`${resetNonce}`}>
        <Piramide {...props} />
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={22}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.0, 0]}
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
