"use client";

/**
 * Escena 3D del laboratorio de Máquinas térmicas (R3F).
 * Se carga de forma diferida (ssr:false) desde LabMaquinaTermica.tsx.
 *
 * Hace visible la 1.ª y la 2.ª ley con dos máquinas que son una el reverso de la
 * otra. El foco caliente está SIEMPRE a la izquierda (rojo) y el frío a la
 * derecha (azul):
 *   · MOTOR DE CALOR — el calor fluye solo de caliente→frío (izq→der); en el
 *     camino la máquina arranca una parte como trabajo (sube en verde). Lo que no
 *     pudo aprovechar se tira al foco frío. Nunca es todo: η = 1 − T_f/T_c.
 *   · REFRIGERADOR — al revés: se gasta trabajo eléctrico (baja en amarillo) para
 *     bombear calor de frío→caliente (der→izq), en contra de su flujo natural.
 *     Rinde COP = Q_f/W.
 *
 * El número de partículas de cada chorro es proporcional a la energía, así que la
 * 2.ª ley se ve: en el motor el chorro de trabajo nunca iguala al de calor que
 * entró. Patrón R3F: useFrame solo dentro de <Canvas>; cada chorro y cada pieza
 * móvil vive en un hijo del Canvas y muta REFS (nada de setState ni Math.random).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type ModoKey,
  eficienciaCarnot,
  copRefrigerador,
  fmtNum,
} from "./maquina-termica-data";

export interface MaquinaTermicaSceneProps {
  modo: ModoKey;
  tCal: number; // K  foco caliente
  tFrio: number; // K foco frío
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const HOT = new THREE.Color("#ff4d3a");
const COLD = new THREE.Color("#3a86ff");
const WORK = new THREE.Color("#34d399");
const ELEC = new THREE.Color("#ffd24a");
const WASTE = new THREE.Color("#ff8a3a");

// Puntos clave de la escena
const HOT_C: [number, number, number] = [-3.3, 0.5, 0];
const COLD_C: [number, number, number] = [3.3, 0.5, 0];
const HOT_EDGE: [number, number, number] = [-2.7, 0.5, 0];
const COLD_EDGE: [number, number, number] = [2.7, 0.5, 0];
const M_INLEFT: [number, number, number] = [-0.95, 0.5, 0];
const M_INRIGHT: [number, number, number] = [0.95, 0.5, 0];
const M_TOP: [number, number, number] = [0, 1.4, 0];
const TOP_OUT: [number, number, number] = [0, 2.7, 0];

const norm = (k: number, lo = 250, hi = 900) =>
  THREE.MathUtils.clamp((k - lo) / (hi - lo), 0, 1);

/* ════════════════════════════════════════════════════════════════════════
   CHORRO DE ENERGÍA — partículas que viajan de un punto a otro
   El número visible (shown) es proporcional a la energía que representa.
   ════════════════════════════════════════════════════════════════════════ */
function Flujo({ from, to, color, cap, shown, speed, pausado, radius = 0.085 }: {
  from: [number, number, number];
  to: [number, number, number];
  color: THREE.Color;
  cap: number;
  shown: number;
  speed: number;
  pausado: boolean;
  radius?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const phases = useRef<Float32Array | null>(null);
  if (phases.current === null) {
    const p = new Float32Array(cap);
    for (let i = 0; i < cap; i++) p[i] = i / cap;
    phases.current = p;
  }

  // dirección y normal para dar grosor de "chorro"
  const a = useMemo(() => new THREE.Vector3(...from), [from]);
  const b = useMemo(() => new THREE.Vector3(...to), [to]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(b, a), [a, b]);
  const perp = useMemo(() => {
    const up = new THREE.Vector3(0, 0, 1);
    const p = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (p.lengthSq() < 1e-4) p.set(1, 0, 0);
    return p;
  }, [dir]);

  useFrame((_s, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 0.05);
    const ph = phases.current!;
    const d = dummy.current;
    const vis = Math.max(0, Math.min(cap, Math.round(shown)));
    for (let i = 0; i < cap; i++) {
      if (!pausado) {
        ph[i] = (ph[i]! + speed * delta) % 1;
      }
      if (i < vis) {
        const t = ph[i]!;
        const jitter = ((i % 5) - 2) * 0.07;
        d.position.set(
          a.x + dir.x * t + perp.x * jitter,
          a.y + dir.y * t + perp.y * jitter,
          a.z + dir.z * t + perp.z * jitter,
        );
        d.scale.setScalar(1);
      } else {
        d.scale.setScalar(0);
      }
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cap]} frustumCulled={false}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Depósito térmico (foco) ─────────────────────────────────────────── */
function Foco({ center, color, intensidad, titulo, tempLabel, accent: _accent }: {
  center: [number, number, number];
  color: THREE.Color;
  intensidad: number; // 0..1
  titulo: string;
  tempLabel: string;
  accent: string;
}) {
  const hex = `#${color.getHexString()}`;
  return (
    <group position={center}>
      <mesh castShadow>
        <boxGeometry args={[1.15, 1.65, 1.15]} />
        <meshStandardMaterial
          color={hex}
          emissive={hex}
          emissiveIntensity={0.25 + intensidad * 1.1}
          roughness={0.5}
          metalness={0.2}
        />
        <Edges threshold={15} color="#ffffff" />
      </mesh>
      <pointLight position={[0, 0, 0.9]} intensity={2 + intensidad * 8} color={hex} distance={6} />
      <Etq at={[0, 1.35, 0]} color={hex}>
        {titulo} · {tempLabel}
      </Etq>
    </group>
  );
}

/* ── Cuerpo de la máquina con volante / compresor ────────────────────── */
function Maquina({ spin, accent, esMotor }: { spin: number; accent: string; esMotor: boolean }) {
  const volante = useRef<THREE.Group>(null);
  const comp = useRef<THREE.Mesh>(null);

  useFrame((s, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (volante.current) volante.current.rotation.z += spin * delta;
    if (comp.current) {
      const pulse = 1 + Math.sin(s.clock.elapsedTime * (3 + spin)) * 0.07 * Math.min(1, spin);
      comp.current.scale.set(1, pulse, 1);
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      <mesh castShadow ref={comp}>
        <boxGeometry args={[1.5, 1.25, 1.2]} />
        <meshStandardMaterial color="#1b2a3d" roughness={0.45} metalness={0.55} />
        <Edges threshold={15} color={accent} />
      </mesh>
      {/* eje + volante arriba (motor) o ventilador (refri) */}
      <group ref={volante} position={[0, 0.95, 0.62]}>
        <mesh>
          <torusGeometry args={[0.42, 0.08, 12, 28]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 2]}>
            <boxGeometry args={[0.74, esMotor ? 0.07 : 0.18, 0.05]} />
            <meshStandardMaterial color={esMotor ? accent : "#cfe0f5"} emissive={accent} emissiveIntensity={0.25} roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.16, 16]} />
          <meshStandardMaterial color="#0d1722" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Etiqueta legible: tamaño fijo en píxeles (≥14 px), en la punta de lo que nombra ── */
function Etq({ at, text, color, children }: { at: [number, number, number]; text?: string; color: string; children?: ReactNode }) {
  return (
    <Html center position={at} pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", textAlign: "center" }}>
        {text}{children}
      </div>
    </Html>
  );
}

/* ── Medidor: la barra se llena con η (motor) o COP/6 (refrigerador) ── */
const MED_W = 3;
function Medidor({ valor, color, texto }: { valor: number; color: string; texto: string }) {
  const fill = useRef<THREE.Mesh>(null);
  const cur = useRef(0);
  useFrame((_s, raw) => {
    const delta = Math.min(raw, 0.05);
    cur.current += (THREE.MathUtils.clamp(valor, 0, 1) - cur.current) * Math.min(1, delta * 5);
    const f = fill.current;
    if (f) {
      const w = Math.max(0.001, cur.current * MED_W);
      f.scale.x = w;
      f.position.x = -MED_W / 2 + w / 2;
    }
  });
  return (
    <group position={[0, -0.2, 1.5]}>
      <mesh>
        <boxGeometry args={[MED_W + 0.08, 0.24, 0.24]} />
        <meshStandardMaterial color="#0d1c30" roughness={0.6} metalness={0.2} transparent opacity={0.55} />
      </mesh>
      <mesh ref={fill}>
        <boxGeometry args={[1, 0.18, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.35} />
      </mesh>
      <Etq at={[0, -0.5, 0]} color={color} text={texto} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MODO MOTOR — calor caliente→frío, una parte sale como trabajo (arriba)
   ════════════════════════════════════════════════════════════════════════ */
function Motor({ tCal, tFrio, accent, pausado }: {
  tCal: number; tFrio: number; accent: string; pausado: boolean;
}) {
  const eta = eficienciaCarnot(tCal, tFrio);
  const CAP = 14;
  const workShown = Math.round(eta * CAP);
  const wasteShown = CAP - workShown;
  const spin = 1.5 + eta * 9; // gira más rápido cuanto más eficiente

  return (
    <group>
      <Foco center={HOT_C} color={HOT} intensidad={norm(tCal)} titulo="Foco caliente" tempLabel={`${fmtNum(tCal, 0)} K`} accent={accent} />
      <Foco center={COLD_C} color={COLD} intensidad={1 - norm(tFrio)} titulo="Foco frío" tempLabel={`${fmtNum(tFrio, 0)} K`} accent={accent} />
      <Maquina spin={spin} accent={accent} esMotor />

      {/* Q_c entra del caliente */}
      <Flujo from={HOT_EDGE} to={M_INLEFT} color={HOT} cap={CAP} shown={CAP} speed={0.55} pausado={pausado} />

      {/* Trabajo útil sube */}
      <Flujo from={M_TOP} to={TOP_OUT} color={WORK} cap={CAP} shown={workShown} speed={0.8} pausado={pausado} />
      <Etq at={[0.9, 2.55, 0]} color="#5ce0b0" text="W (trabajo)" />

      {/* Q_f de desecho al frío */}
      <Flujo from={M_INRIGHT} to={COLD_EDGE} color={WASTE} cap={CAP} shown={wasteShown} speed={0.5} pausado={pausado} />

      <Medidor valor={eta} color={accent} texto={`η = ${fmtNum(eta * 100, 0)} %`} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MODO REFRIGERADOR — el reverso: trabajo eléctrico bombea calor frío→caliente
   ════════════════════════════════════════════════════════════════════════ */
function Refrigerador({ tCal, tFrio, accent, pausado }: {
  tCal: number; tFrio: number; accent: string; pausado: boolean;
}) {
  const cop = copRefrigerador(tCal, tFrio);
  const copVis = Math.min(Number.isFinite(cop) ? cop : 8, 6);
  const UNIT = 3;
  const wShown = UNIT; // trabajo eléctrico (referencia)
  const qfShown = Math.round(UNIT * copVis); // calor sacado del interior
  const qcShown = wShown + qfShown; // calor echado afuera
  const spin = 2 + copVis * 1.4;

  return (
    <group>
      <Foco center={HOT_C} color={WASTE} intensidad={norm(tCal)} titulo="Exterior (caliente)" tempLabel={`${fmtNum(tCal, 0)} K`} accent={accent} />
      <Foco center={COLD_C} color={COLD} intensidad={1 - norm(tFrio)} titulo="Interior (frío)" tempLabel={`${fmtNum(tFrio, 0)} K`} accent={accent} />
      <Maquina spin={spin} accent={accent} esMotor={false} />

      {/* Trabajo eléctrico entra por arriba */}
      <Flujo from={TOP_OUT} to={M_TOP} color={ELEC} cap={6} shown={wShown} speed={0.8} pausado={pausado} />
      <Etq at={[0.95, 2.55, 0]} color="#ffe07a" text="W eléctrico" />

      {/* Q_f se bombea desde el interior frío (der → máquina) */}
      <Flujo from={COLD_EDGE} to={M_INRIGHT} color={COLD} cap={22} shown={qfShown} speed={0.5} pausado={pausado} />

      {/* Q_c se expulsa al exterior caliente (máquina → izq) */}
      <Flujo from={M_INLEFT} to={HOT_EDGE} color={WASTE} cap={28} shown={qcShown} speed={0.5} pausado={pausado} />

      <Medidor valor={copVis / 6} color={accent} texto={`COP = ${fmtNum(cop, 1)}`} />
      <ContactShadows position={[0, -0.35, 0]} opacity={0.3} scale={12} blur={2.6} far={6} color="#020c1c" />
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function MaquinaTermicaScene(props: MaquinaTermicaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.2, 1.9, 9.6], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: MaquinaTermicaSceneProps) {
  const { modo, tCal, tFrio, accent, pausado, autoRotate, resetNonce } = props;

  // Encuadre: los dos focos (≈ 8.5 unidades de ancho) caben entre la barra de arriba y la misión de abajo.
  const { size, camera } = useThree();
  const aspecto = size.width / Math.max(1, size.height);
  const camZ = 9.6 * Math.max(1, 1.9 / aspecto);
  useEffect(() => {
    camera.position.set(0.2, 1.9, camZ);
  }, [camera, camZ]);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-0.35} />


      <group key={`${modo}-${resetNonce}`}>
        {modo === "motor" ? (
          <Motor tCal={tCal} tFrio={tFrio} accent={accent} pausado={pausado} />
        ) : (
          <Refrigerador tCal={tCal} tFrio={tFrio} accent={accent} pausado={pausado} />
        )}
      </group>


      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0.35, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
