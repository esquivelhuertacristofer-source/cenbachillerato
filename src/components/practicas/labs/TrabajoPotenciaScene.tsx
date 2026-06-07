"use client";

/**
 * Escena 3D del laboratorio de Trabajo y potencia mecánica (R3F).
 * Se carga de forma diferida (ssr:false) desde LabTrabajoPotencia.tsx.
 *
 * Dos modos hacen visibles las dos fórmulas de la lectura:
 *   · TRABAJO — una fuerza empuja una caja por una distancia. La flecha de la
 *     fuerza se descompone en su parte ÚTIL (horizontal, F·cos θ, verde) y su
 *     parte perpendicular (vertical, F·sen θ, gris, que no aporta trabajo). Una
 *     barra muestra W = F·d·cos θ en vivo; al llevar θ a 90° la barra se vacía.
 *   · POTENCIA — dos elevadores suben la MISMA carga a la misma altura (mismo
 *     trabajo), pero el de más potencia llega primero: t = W/P. Se ve que la
 *     potencia es la rapidez con que se hace el trabajo.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; cada pieza móvil vive en un hijo
 * del Canvas y muta REFS (nada de setState ni Math.random en render).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Edges, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type ModoKey,
  trabajo,
  fuerzaUtil,
  tiempo,
  fmtNum,
  F_MAX, D_MAX, W_POTENCIA, H_POTENCIA,
} from "./trabajo-potencia-data";

export interface TrabajoPotenciaSceneProps {
  modo: ModoKey;
  F: number;
  d: number;
  theta: number; // grados
  pA: number; // W
  pB: number; // W
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const UTIL = new THREE.Color("#34d399"); // componente útil (verde)
const PERP = new THREE.Color("#9fb2c8"); // componente perpendicular (gris)
const CAJA = new THREE.Color("#ff8a3a");
const ORO = new THREE.Color("#ffd24a");

const rad = (g: number) => (g * Math.PI) / 180;
const W_MAX = F_MAX * D_MAX; // trabajo máximo posible (normalización de la barra)
const F_ESCALA = 2.4 / F_MAX; // N → unidades de escena para la flecha

/* ── Flecha que apunta a lo largo de +X (base en el origen) ──────────── */
function Flecha({ length, color, thickness = 0.05, emissive = 0.55 }: {
  length: number; color: THREE.Color; thickness?: number; emissive?: number;
}) {
  const head = 0.26;
  const shaft = Math.max(0.001, length - head);
  const hex = `#${color.getHexString()}`;
  if (length < 0.05) return null;
  return (
    <group>
      <mesh position={[shaft / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[thickness, thickness, shaft, 12]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={emissive} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[shaft + head / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[thickness * 2.4, head, 14]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={emissive} roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Barra vertical de trabajo (lerp suave hacia el objetivo) ────────── */
function BarraTrabajo({ target, accent, valueText }: {
  target: number; accent: string; valueText: string;
}) {
  const fill = useRef<THREE.Mesh>(null);
  const cur = useRef(0);
  const H = 2.6;
  useFrame((_s, raw) => {
    const delta = Math.min(raw, 0.05);
    cur.current += (THREE.MathUtils.clamp(target, 0, 1) - cur.current) * Math.min(1, delta * 5);
    const f = fill.current;
    if (f) {
      const h = Math.max(0.001, cur.current * H);
      f.scale.y = h;
      f.position.y = h / 2;
    }
  });
  return (
    <group position={[3.5, -0.2, 0]}>
      {/* riel */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[0.34, H, 0.34]} />
        <meshStandardMaterial color="#0d1c30" roughness={0.6} metalness={0.2} transparent opacity={0.5} />
        <Edges threshold={15} color="#2a4566" />
      </mesh>
      <mesh ref={fill} position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <Html center position={[0, H + 0.45, 0]} distanceFactor={12} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: accent }}>{valueText}</div>
          <div style={{ fontWeight: 700, fontSize: 10, color: "#cfe0f5", letterSpacing: "0.08em" }}>TRABAJO</div>
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MODO TRABAJO — caja empujada por una fuerza en ángulo
   ════════════════════════════════════════════════════════════════════════ */
function Trabajo({ F, d, theta, accent, pausado }: {
  F: number; d: number; theta: number; accent: string; pausado: boolean;
}) {
  const grp = useRef<THREE.Group>(null);
  const phase = useRef(0);

  const dVis = THREE.MathUtils.clamp(d * 0.42, 0.42, 3.4);
  const x0 = -2.6;

  useFrame((_s, raw) => {
    const delta = Math.min(raw, 0.05);
    if (!pausado) phase.current = (phase.current + delta * 0.26) % 1.35; // 1.0 avanza + 0.35 pausa
    const p = Math.min(1, phase.current);
    if (grp.current) grp.current.position.x = x0 + p * dVis;
  });

  const W = trabajo(F, d, theta);
  const Fu = fuerzaUtil(F, theta);
  const Fp = F * Math.sin(rad(theta));
  const Lres = F * F_ESCALA;
  const Lutil = Fu * F_ESCALA;
  const Lperp = Fp * F_ESCALA;

  return (
    <group>
      {/* piso / riel de desplazamiento */}
      <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0a1a2e" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* marca de distancia recorrida */}
      <mesh position={[x0 + dVis / 2, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dVis, 0.16]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <Html center position={[x0 + dVis / 2, -0.66, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 11.5, color: "#cfe0f5", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
          d = {fmtNum(d, 1)} m
        </div>
      </Html>

      {/* caja + flechas, se mueven juntas */}
      <group ref={grp} position={[x0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={`#${CAJA.getHexString()}`} roughness={0.5} metalness={0.25} />
          <Edges threshold={15} color="#ffd9b0" />
        </mesh>

        {/* origen de las flechas: esquina superior de la caja */}
        <group position={[0.2, 0.55, 0]}>
          {/* resultante (fuerza aplicada) a ángulo θ */}
          <group rotation={[0, 0, rad(theta)]}>
            <Flecha length={Lres} color={new THREE.Color(accent)} thickness={0.055} />
          </group>
          {/* componente útil (horizontal) */}
          <group position={[0, -0.02, 0.02]}>
            <Flecha length={Lutil} color={UTIL} thickness={0.045} />
          </group>
          {/* componente perpendicular (vertical) */}
          <group rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.02]}>
            <Flecha length={Lperp} color={PERP} thickness={0.035} emissive={0.2} />
          </group>

          <Html center position={[Lres * Math.cos(rad(theta)) + 0.25, Lres * Math.sin(rad(theta)) + 0.2, 0]} distanceFactor={12} pointerEvents="none">
            <div style={{ whiteSpace: "nowrap", fontWeight: 900, fontSize: 12, color: accent, textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}>F = {fmtNum(F, 0)} N</div>
          </Html>
          <Html center position={[Lutil + 0.3, -0.28, 0]} distanceFactor={12} pointerEvents="none">
            <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 11, color: "#5ce0b0", textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}>F·cos θ = {fmtNum(Fu, 0)} N</div>
          </Html>
        </group>
      </group>

      <BarraTrabajo target={W / W_MAX} accent={accent} valueText={`${fmtNum(W, 0)} J`} />

      <ContactShadows position={[0, -0.34, 0]} opacity={0.35} scale={11} blur={2.4} far={5} color="#020c1c" />
    </group>
  );
}

/* ── Un elevador que sube una carga a velocidad ∝ potencia ───────────── */
function Elevador({ x, power, color, etiqueta, pausado }: {
  x: number; power: number; color: THREE.Color; etiqueta: string; pausado: boolean;
}) {
  const box = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const tTotal = tiempo(W_POTENCIA, power); // s en llegar arriba
  const hex = `#${color.getHexString()}`;

  useFrame((_s, raw) => {
    const delta = Math.min(raw, 0.05);
    if (!pausado && Number.isFinite(tTotal) && tTotal > 0) {
      phase.current = (phase.current + delta / (tTotal + tTotal * 0.2)) % 1; // sube + breve pausa arriba
    }
    const p = Math.min(1, phase.current / (1 / 1.2)); // normaliza la parte de subida
    const y = 0.4 + Math.min(1, p) * H_POTENCIA;
    if (box.current) box.current.position.y = y;
  });

  return (
    <group position={[x, 0, 0]}>
      {/* rieles */}
      {[-0.45, 0.45].map((dx) => (
        <mesh key={dx} position={[dx, H_POTENCIA / 2 + 0.4, 0]}>
          <boxGeometry args={[0.08, H_POTENCIA + 0.9, 0.08]} />
          <meshStandardMaterial color="#16314d" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* línea de meta */}
      <mesh position={[0, 0.4 + H_POTENCIA, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.06]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[1.2, 0.1, 1.0]} />
        <meshStandardMaterial color="#0d1c30" roughness={0.8} />
      </mesh>
      {/* carga que sube */}
      <mesh ref={box} position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.75, 0.6, 0.75]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={0.25} roughness={0.45} metalness={0.3} />
        <Edges threshold={15} color="#ffffff" />
      </mesh>
      <Html center position={[0, 0.4 + H_POTENCIA + 0.55, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12.5, color: hex }}>{etiqueta}</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>{fmtNum(power, 0)} W</div>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#cfe0f5" }}>t = {fmtNum(tTotal, 1)} s</div>
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MODO POTENCIA — dos elevadores, mismo trabajo, distinta potencia
   ════════════════════════════════════════════════════════════════════════ */
function Potencia({ pA, pB, accent, pausado }: {
  pA: number; pB: number; accent: string; pausado: boolean;
}) {
  return (
    <group>
      <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0a1a2e" roughness={0.9} metalness={0.05} />
      </mesh>
      <Elevador x={-2.1} power={pA} color={new THREE.Color(accent)} etiqueta="Máquina A" pausado={pausado} />
      <Elevador x={2.1} power={pB} color={ORO} etiqueta="Máquina B" pausado={pausado} />
      <Html center position={[0, 0.6 + H_POTENCIA, 0]} distanceFactor={13} pointerEvents="none">
        <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 11, color: "#cfe0f5", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
          mismo trabajo W = {fmtNum(W_POTENCIA, 0)} J
        </div>
      </Html>
      <ContactShadows position={[0, -0.34, 0]} opacity={0.35} scale={13} blur={2.4} far={6} color="#020c1c" />
    </group>
  );
}

/* ── Escena completa ─────────────────────────────────────────────────── */
export default function TrabajoPotenciaScene(props: TrabajoPotenciaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.2, 2.1, 9.6], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Contenido: DEBE vivir dentro de <Canvas> (useFrame solo funciona ahí). */
function Contenido(props: TrabajoPotenciaSceneProps) {
  const { modo, F, d, theta, pA, pB, accent, pausado, autoRotate, resetNonce } = props;
  const target = useMemo<[number, number, number]>(() => (modo === "potencia" ? [0, 2.0, 0] : [0.4, 0.6, 0]), [modo]);

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 18, 40]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 9, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 5, 4]} intensity={6} color="#ffffff" />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "trabajo" ? (
          <Trabajo F={F} d={d} theta={theta} accent={accent} pausado={pausado} />
        ) : (
          <Potencia pA={pA} pB={pB} accent={accent} pausado={pausado} />
        )}
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.7} position={[0, 6, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-7, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[7, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={15}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 1.95}
        target={target}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
