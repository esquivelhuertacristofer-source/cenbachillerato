"use client";

/**
 * Escena 3D — "El círculo unitario genera las ondas seno y coseno" (PM-IV-P04-A2).
 *
 * Un círculo de radio 1 vive en el plano XY (de frente a la cámara). El radio
 * gira hasta el ángulo θ y marca el punto P = (cos θ, sen θ). Dentro del círculo
 * se dibuja el triángulo rectángulo: el cateto HORIZONTAL es cos θ y el VERTICAL
 * es sen θ (la altura del punto). Hacia el fondo (eje −Z = "tiempo/ángulo") se
 * desenrollan dos ondas:
 *   · la onda SENO, en el muro vertical x = 0, con altura = sen φ
 *   · la onda COSENO, en el piso y = 0, con desplazamiento = cos φ
 * y, como opción, la HÉLICE (cos φ, sen φ, −φ) que el punto traza al girar
 * mientras avanza el tiempo: sus dos sombras SON justamente esas ondas. Eso hace
 * tangible por qué seno y coseno son periódicos y van desfasados 90°.
 *
 * Patrón R3F obligatorio: el default export solo monta <Canvas> y delega en
 * <Contenido> (descendiente del Canvas). React Compiler: nada de
 * Math.random()/Date.now()/setState en render; la animación del barrido vive en
 * el shell (θ es prop); aquí useFrame solo hace un latido cosmético en REFS.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { calcTrig, fmtNum2 } from "./circulo-unitario-data";

export interface CirculoUnitarioSceneProps {
  thetaDeg: number;
  accent: string;
  mostrarCos: boolean;
  mostrarHelice: boolean;
  mostrarTan: boolean;
  autoRotate: boolean;
  pausado: boolean;
  resetNonce: number;
  /* arrastre del punto P (pilar "manipular") */
  arrastrable?: boolean;
  onThetaChange?: (deg: number) => void;
  onGrab?: () => void;
}

type Pt = [number, number, number];

const R = 2;                       // radio del círculo (mundo)
const SZ = 8 / (2 * Math.PI);      // profundidad por radián (eje tiempo)
const SIN_COL = "#34D399";
const COS_COL = "#60a5fa";
const TAN_COL = "#f472b6";

/* raycast contra el plano del círculo (z = 0) para arrastrar P */
const _planeXY = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _hit = new THREE.Vector3();
const _obj = new THREE.Object3D();
const PART_N = 18;                  // motas que recorren la onda seno en tiempo real

/* anillo del círculo (no depende de θ) */
const RING: Pt[] = (() => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    pts.push([R * Math.cos(a), R * Math.sin(a), 0]);
  }
  return pts;
})();

interface Geo {
  rad: number;
  cos: number; sin: number; tan: number | null;
  P: Pt; foot: Pt; sineTip: Pt; cosTip: Pt; zEnd: Pt;
  sinePts: Pt[]; cosPts: Pt[]; helixPts: Pt[]; arcPts: Pt[];
  tanVis: { side: number; T: Pt } | null;
}

function construir(thetaDeg: number, mostrarTan: boolean): Geo {
  const t = calcTrig(thetaDeg);
  const rad = (((thetaDeg % 360) + 360) % 360) * (Math.PI / 180);
  const cos = Math.cos(rad), sin = Math.sin(rad);

  const n = Math.max(2, Math.round((rad / (Math.PI / 180)) / 2) + 1);
  const sinePts: Pt[] = [];
  const cosPts: Pt[] = [];
  const helixPts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const f = (rad * i) / (n - 1);
    sinePts.push([0, R * Math.sin(f), -f * SZ]);
    cosPts.push([R * Math.cos(f), 0, -f * SZ]);
    helixPts.push([R * Math.cos(f), R * Math.sin(f), -f * SZ]);
  }

  // arco del ángulo (radio pequeño)
  const ra = 0.55;
  const na = Math.max(2, Math.round(rad / 0.08) + 1);
  const arcPts: Pt[] = [];
  for (let i = 0; i < na; i++) {
    const f = (rad * i) / (na - 1);
    arcPts.push([ra * Math.cos(f), ra * Math.sin(f), 0]);
  }

  // tangente: la prolongación del radio corta la recta x = ±R
  let tanVis: { side: number; T: Pt } | null = null;
  if (mostrarTan && t.tan !== null && Math.abs(cos) > 0.14) {
    const side = cos > 0 ? R : -R;
    const ty = side * t.tan;
    if (Math.abs(ty) <= 6) tanVis = { side, T: [side, ty, 0] };
  }

  return {
    rad, cos, sin, tan: t.tan,
    P: [R * cos, R * sin, 0],
    foot: [R * cos, 0, 0],
    sineTip: [0, R * sin, -rad * SZ],
    cosTip: [R * cos, 0, -rad * SZ],
    zEnd: [0, 0, -rad * SZ],
    sinePts, cosPts, helixPts, arcPts, tanVis,
  };
}

/* ── Etiqueta flotante reutilizable ──────────────────────────────────────── */
function Etiqueta({
  pos, color, children, size = 12, bg = "rgba(6,16,31,0.8)",
}: {
  pos: Pt; color: string; children: React.ReactNode; size?: number; bg?: string;
}) {
  return (
    <Html position={pos} center distanceFactor={12} pointerEvents="none">
      <div style={{
        whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: bg,
        border: `1px solid ${color}66`, color: "#fff", fontWeight: 700, fontSize: size,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Motas que viajan por la onda seno en tiempo real (pilar "partículas") ── */
function Particulas({ pausado }: { pausado: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const DEPTH = 7;                  // hasta dónde se desenrolla la onda
  useFrame((state) => {
    const m = mesh.current;
    if (!m || pausado) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < PART_N; i++) {
      const p = (t * 0.12 + i / PART_N) % 1;     // fase 0→1, determinista
      const z = -p * DEPTH;
      const y = R * Math.sin((p * DEPTH) / SZ);   // ¡yace sobre la onda seno!
      const s = Math.sin(p * Math.PI) * 0.09 + 0.02;
      _obj.position.set(0, y, z);
      _obj.scale.setScalar(s);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PART_N]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color={SIN_COL} emissive={SIN_COL} emissiveIntensity={1.6} toneMapped={false} transparent opacity={0.85} />
    </instancedMesh>
  );
}

/* ── La construcción completa ────────────────────────────────────────────── */
function Escena({
  thetaDeg, accent, mostrarCos, mostrarHelice, mostrarTan, pausado,
  arrastrable, onThetaChange, onGrab, onDraggingChange,
}: Omit<CirculoUnitarioSceneProps, "autoRotate" | "resetNonce"> & { onDraggingChange?: (d: boolean) => void }) {
  const g = useMemo(() => construir(thetaDeg, mostrarTan), [thetaDeg, mostrarTan]);
  const punto = useRef<THREE.Group>(null);
  const dragRef = useRef(false);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (punto.current && !pausado) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      punto.current.scale.setScalar(s);
    }
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = true;
    onDraggingChange?.(true);
    onGrab?.();
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    if (!e.ray.intersectPlane(_planeXY, _hit)) return;
    let deg = (Math.atan2(_hit.y, _hit.x) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    onThetaChange?.(deg);
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    dragRef.current = false;
    onDraggingChange?.(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const axL = R + 0.7;
  const sinPos = g.sin >= 0 ? 1 : -1;

  return (
    <group>
      {/* ── Plano del círculo: ejes y anillo (z = 0) ── */}
      <Line points={[[-axL, 0, 0], [axL, 0, 0]]} color="#7c89a8" lineWidth={1.2} />
      <Line points={[[0, -axL, 0], [0, axL, 0]]} color="#7c89a8" lineWidth={1.2} />
      <Line points={RING} color="#aebbd6" lineWidth={1.6} />
      {/* eje del tiempo (ángulo que avanza) */}
      <Line points={[[0, 0, 0], g.zEnd]} color="#5b6a86" lineWidth={1.2} dashed dashSize={0.18} gapSize={0.12} />

      {/* piso translúcido (donde se proyecta el coseno) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -g.rad * SZ * 0.5]} receiveShadow>
        <planeGeometry args={[2 * axL, g.rad * SZ + 0.6]} />
        <meshStandardMaterial color={accent} transparent opacity={0.04} roughness={1} depthWrite={false} />
      </mesh>

      {/* ── Triángulo rectángulo dentro del círculo ── */}
      {/* cateto coseno (horizontal) */}
      <Line points={[[0, 0, 0], g.foot]} color={COS_COL} lineWidth={4} />
      {/* cateto seno (vertical = altura) */}
      <Line points={[g.foot, g.P]} color={SIN_COL} lineWidth={4} />
      {/* radio = hipotenusa */}
      <Line points={[[0, 0, 0], g.P]} color="#eaf1ff" lineWidth={2.6} />
      {/* arco del ángulo θ */}
      <Line points={g.arcPts} color="#fbbf24" lineWidth={2.4} />

      {/* ── Onda SENO (muro vertical x = 0) ── */}
      <Line points={g.sinePts} color={SIN_COL} lineWidth={3.4} />
      <Line points={[g.P, g.sineTip]} color={SIN_COL} lineWidth={1.2} dashed dashSize={0.16} gapSize={0.12} />
      <mesh position={g.sineTip}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={SIN_COL} emissive={SIN_COL} emissiveIntensity={1.3} toneMapped={false} />
      </mesh>

      {/* ── Onda COSENO (piso y = 0) ── */}
      {mostrarCos && (
        <>
          <Line points={g.cosPts} color={COS_COL} lineWidth={3.4} />
          <Line points={[g.foot, g.cosTip]} color={COS_COL} lineWidth={1.2} dashed dashSize={0.16} gapSize={0.12} />
          <mesh position={g.cosTip}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={COS_COL} emissive={COS_COL} emissiveIntensity={1.3} toneMapped={false} />
          </mesh>
        </>
      )}

      {/* ── Hélice: el punto girando mientras avanza el tiempo ── */}
      {mostrarHelice && (
        <Line points={g.helixPts} color="#f5d36b" lineWidth={2} dashed dashSize={0.001} gapSize={0} />
      )}

      {/* ── Tangente (prolongación del radio) ── */}
      {g.tanVis && (
        <>
          <Line points={[[0, 0, 0], g.tanVis.T]} color={TAN_COL} lineWidth={1.4} dashed dashSize={0.16} gapSize={0.12} />
          <Line points={[[g.tanVis.side, 0, 0], g.tanVis.T]} color={TAN_COL} lineWidth={3.4} />
          <Etiqueta pos={[g.tanVis.side + (g.tanVis.side > 0 ? 0.55 : -0.55), g.tanVis.T[1] * 0.5, 0]} color={TAN_COL} size={11}>
            tan θ
          </Etiqueta>
        </>
      )}

      {/* ── Motas viajando por la onda seno ── */}
      <Particulas pausado={pausado} />

      {/* ── Punto P (arrastrable: fija θ girándolo por el círculo) ── */}
      <group ref={punto} position={g.P}>
        {/* halo cuando se puede arrastrar / al pasar el cursor */}
        {arrastrable && (
          <mesh>
            <sphereGeometry args={[hover ? 0.34 : 0.26, 20, 20]} />
            <meshBasicMaterial color={accent} transparent opacity={hover ? 0.3 : 0.16} toneMapped={false} />
          </mesh>
        )}
        <mesh castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#fff7e6" emissive={accent} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        {/* esfera invisible amplia para agarrar con facilidad */}
        {arrastrable && (
          <mesh
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={() => setHover(false)}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* ── Etiquetas ── */}
      <Etiqueta pos={[g.P[0] + (g.cos >= 0 ? 0.55 : -0.55), g.P[1] + sinPos * 0.5, 0]} color={accent} size={12.5} bg="rgba(6,16,31,0.86)">
        P = ({fmtNum2(g.cos)}, {fmtNum2(g.sin)})
      </Etiqueta>
      <Etiqueta pos={[0.85, 0.28, 0]} color="#fbbf24" size={11.5}>
        θ = {Math.round(((thetaDeg % 360) + 360) % 360)}°
      </Etiqueta>
      {/* altura = seno */}
      <Etiqueta pos={[g.foot[0] + (g.cos >= 0 ? 0.45 : -0.45), g.P[1] * 0.5, 0]} color={SIN_COL} size={11}>
        sen θ = {fmtNum2(g.sin)}
      </Etiqueta>
      {/* base = coseno */}
      <Etiqueta pos={[g.foot[0] * 0.5, -0.4, 0]} color={COS_COL} size={11}>
        cos θ = {fmtNum2(g.cos)}
      </Etiqueta>
      {/* nombres de las ondas al fondo */}
      <Etiqueta pos={[0, R + 0.35, -g.rad * SZ]} color={SIN_COL} size={11.5}>
        onda seno
      </Etiqueta>
      {mostrarCos && (
        <Etiqueta pos={[R + 0.35, 0, -g.rad * SZ]} color={COS_COL} size={11.5}>
          onda coseno
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ thetaDeg, accent, mostrarCos, mostrarHelice, mostrarTan, autoRotate, pausado, resetNonce, arrastrable, onThetaChange, onGrab }: CirculoUnitarioSceneProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <color attach="background" args={["#06101f"]} />
      <fog attach="fog" args={["#06101f", 16, 36]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 6]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={30} />
      <pointLight position={[-6, 4, -4]} intensity={0.5} color={accent} />

      <group key={`${resetNonce}`}>
        <Escena
          thetaDeg={thetaDeg} accent={accent} mostrarCos={mostrarCos} mostrarHelice={mostrarHelice}
          mostrarTan={mostrarTan} pausado={pausado}
          arrastrable={arrastrable} onThetaChange={onThetaChange} onGrab={onGrab}
          onDraggingChange={setDragging}
        />
      </group>

      <ContactShadows position={[0, -2.9, 0]} opacity={0.32} scale={20} blur={2.6} far={6} />

      <Environment resolution={128}>
        <group>
          <Lightformer intensity={1.5} position={[0, 6, 2]} scale={9} color="#eaf1ff" />
          <Lightformer intensity={0.8} position={[5, 2, 1]} scale={5} color="#cfe0ff" />
          <Lightformer intensity={0.6} position={[-5, 1, -2]} scale={5} color="#bfa9ff" />
        </group>
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={28}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, 0.2, -3]}
        enabled={!dragging}
        autoRotate={autoRotate && !pausado && !dragging}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function CirculoUnitarioScene(props: CirculoUnitarioSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [8, 5, 9], fov: 45 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
