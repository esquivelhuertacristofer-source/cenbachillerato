"use client";

/**
 * Escena 3D del laboratorio del Ciclo del carbono — R3F.
 * Se carga de forma diferida (ssr:false) desde LabCicloCarbono.tsx.
 *
 * Una Tierra en el centro y, a su alrededor, los reservorios de carbono
 * (atmósfera, vegetación, animales, suelo, océano y combustibles fósiles).
 * Entre ellos viajan átomos de carbono por curvas que representan los procesos
 * del ciclo: fotosíntesis, respiración, alimentación, descomposición, disolución
 * oceánica y la lentísima fosilización. La COMBUSTIÓN de fósiles (flujo rojo)
 * crece con el control de emisiones: a más emisiones, más átomos van a la
 * atmósfera y su capa se tiñe de naranja-rojo (más CO₂ = más calor).
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; cada flujo vive en un hijo del
 * Canvas y muta REFS (sin setState ni Math.random en el render).
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { RESERVORIOS, FLUJOS, EMIS_MAX, EMIS_MIN } from "./carbono-data";

export interface CicloCarbonoSceneProps {
  emisiones: number;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Si true, la palanca de emisiones se puede arrastrar en 3D. */
  arrastrable?: boolean;
  /** El alumno arrastró la palanca → nuevo nivel de emisiones (Gt/año). */
  onEmisionesChange?: (v: number) => void;
  /** Tomó la palanca (para sonido). */
  onGrab?: () => void;
}

/* ── Palanca de emisiones (arrastre vertical) ──────────────────────────── */
const LEVER_X = -6.4;
const LEVER_Z = 0;
const Y_BOT = -3.2;
const Y_TOP = 2.6;
const _plane = new THREE.Plane();
const _hit = new THREE.Vector3();
const _norm = new THREE.Vector3();
const _cop = new THREE.Vector3();
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const emisToY = (e: number) => Y_BOT + ((e - EMIS_MIN) / (EMIS_MAX - EMIS_MIN)) * (Y_TOP - Y_BOT);
const yToEmis = (y: number) =>
  Math.round(EMIS_MIN + ((clamp(y, Y_BOT, Y_TOP) - Y_BOT) / (Y_TOP - Y_BOT)) * (EMIS_MAX - EMIS_MIN));

/* Posiciones de cada reservorio alrededor de la Tierra. */
const NODOS: Record<string, [number, number, number]> = {
  atmosfera: [0, 3.3, 0],
  vegetacion: [3.5, 0.4, 1.9],
  animales: [3.4, -0.3, -1.9],
  suelo: [0.2, -1.7, 2.8],
  oceano: [-3.7, 0.3, 0.3],
  fosiles: [0, -3.3, -1.7],
};

const NPTS = 50; // puntos por curva
const radioNodo = (gtC: number): number => 0.2 + (0.34 * Math.log10(gtC)) / Math.log10(40000);

/* ─── Un flujo: curva + átomos de carbono viajando ─────────────────────── */
function Flujo({ de, a, color, rapidez, pausado }: {
  de: [number, number, number]; a: [number, number, number]; color: string; rapidez: number; pausado: boolean;
}) {
  const N = Math.max(0, Math.round(rapidez * 9));
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: 12 }, (_, i) => i / 12));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // curva: arco que se aleja del centro de la Tierra
  const pts = useMemo(() => {
    const v0 = new THREE.Vector3(...de);
    const v1 = new THREE.Vector3(...a);
    const mid = v0.clone().add(v1).multiplyScalar(0.5);
    const out = mid.clone().normalize().multiplyScalar(1.4);
    const ctrl = mid.clone().add(out).add(new THREE.Vector3(0, 0.4, 0));
    const curve = new THREE.QuadraticBezierCurve3(v0, ctrl, v1);
    return curve.getPoints(NPTS - 1);
  }, [de, a]);

  const linePts = useMemo(() => pts.map((p) => [p.x, p.y, p.z] as [number, number, number]), [pts]);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = pausado ? 0 : delta;
    const vel = 0.12 + rapidez * 0.55;
    for (let i = 0; i < N; i++) {
      fases.current[i] = ((fases.current[i] ?? i / N) + d * vel) % 1;
      const t = fases.current[i]!;
      const idx = Math.min(NPTS - 1, Math.floor(t * (NPTS - 1)));
      const p = pts[idx]!;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(0.12);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    // átomos sobrantes (si N bajó) los mandamos lejos
    for (let i = N; i < 12; i++) {
      dummy.position.set(0, -999, 0);
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Line points={linePts} color={color} lineWidth={1.4} transparent opacity={N > 0 ? 0.4 : 0.12} dashed dashSize={0.16} gapSize={0.12} />
      <instancedMesh ref={ref} args={[undefined, undefined, 12]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ─── Palanca de emisiones: knob que se arrastra a lo largo de un riel ──── */
function PalancaEmisiones({ emisiones, arrastrable, onEmisionesChange, onGrab, onDraggingChange }: {
  emisiones: number; arrastrable?: boolean;
  onEmisionesChange?: (v: number) => void; onGrab?: () => void; onDraggingChange?: (d: boolean) => void;
}) {
  const { camera } = useThree();
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);

  const y = emisToY(emisiones);
  const frac = (emisiones - EMIS_MIN) / (EMIS_MAX - EMIS_MIN);
  const knobCol = useMemo(
    () => new THREE.Color("#5ab0ff").lerp(new THREE.Color("#ff5a36"), Math.min(1, frac)),
    [frac],
  );

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    draggingRef.current = true;
    setDragging(true);
    onDraggingChange?.(true);
    onGrab?.();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    // plano vertical que contiene el riel y mira a la cámara (robusto al giro)
    _norm.set(camera.position.x - LEVER_X, 0, camera.position.z - LEVER_Z).normalize();
    _cop.set(LEVER_X, 0, LEVER_Z);
    _plane.setFromNormalAndCoplanarPoint(_norm, _cop);
    if (!e.ray.intersectPlane(_plane, _hit)) return;
    onEmisionesChange?.(yToEmis(_hit.y));
  };
  const up = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    draggingRef.current = false;
    setDragging(false);
    onDraggingChange?.(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <group position={[LEVER_X, 0, LEVER_Z]}>
      {/* riel */}
      <Line points={[[0, Y_BOT, 0], [0, Y_TOP, 0]]} color="#5b7286" lineWidth={3} />
      <mesh position={[0, Y_TOP, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#ff5a36" />
      </mesh>
      <mesh position={[0, Y_BOT, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#5ab0ff" />
      </mesh>
      <Html position={[0, Y_TOP + 0.35, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: "#ff8a6a", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>más emisiones</div>
      </Html>
      <Html position={[0, Y_BOT - 0.35, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: "#7fc4ff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>equilibrio (0)</div>
      </Html>

      {/* halo de agarre */}
      {arrastrable && (hover || dragging) && (
        <mesh position={[0, y, 0]}>
          <ringGeometry args={[0.34, 0.46, 32]} />
          <meshBasicMaterial color={knobCol} transparent opacity={0.7} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}

      {/* knob arrastrable */}
      <mesh
        position={[0, y, 0]}
        castShadow
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerOver={() => arrastrable && setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color={knobCol} emissive={knobCol} emissiveIntensity={0.7} roughness={0.35} toneMapped={false} />
      </mesh>

      {/* valor */}
      <Html position={[0, y, 0]} center distanceFactor={13} pointerEvents="none">
        <div style={{ transform: "translateX(46px)", display: "flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 999, background: "rgba(2,12,28,0.82)", border: `1px solid ${knobCol.getStyle()}aa`, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-industry" style={{ color: knobCol.getStyle(), fontSize: 10 }} />
          <span style={{ color: "#eaf2fb", fontSize: 11, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>{emisiones} Gt/año</span>
        </div>
      </Html>
      {arrastrable && (
        <Html position={[0, y, 0]} center distanceFactor={14} pointerEvents="none">
          <div style={{ transform: "translateY(34px)", color: dragging ? "#fff" : "#9fb2c8", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", textShadow: "0 2px 6px #000" }}>
            {dragging ? "moviendo las emisiones" : "arrastra ↑↓"}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Nodo reservorio: esfera + etiqueta ───────────────────────────────── */
function Nodo({ pos, color, icono, nombre, gtC }: {
  pos: [number, number, number]; color: string; icono: string; nombre: string; gtC: number;
}) {
  const r = radioNodo(gtC);
  return (
    <group position={pos}>
      <mesh castShadow>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} metalness={0.15} />
      </mesh>
      <Html center distanceFactor={14} pointerEvents="none">
        <div style={{ transform: `translateY(${-(r * 26 + 18)}px)`, display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 999, background: "rgba(2,12,28,0.82)", border: `1px solid ${color}77`, whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
          <i className={`fa-solid ${icono}`} style={{ color, fontSize: 12 }} />
          <span style={{ color: "#eaf2fb", fontSize: 11.5, fontWeight: 800 }}>{nombre}</span>
          <span style={{ color, fontSize: 11, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>~{gtC.toLocaleString("es-MX")} GtC</span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Tierra ───────────────────────────────────────────────────────────── */
function Tierra({ tint }: { tint: THREE.Color }) {
  const aire = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (aire.current) aire.current.rotation.y += delta * 0.04;
  });
  return (
    <group>
      {/* océano/superficie */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.7, 48, 48]} />
        <meshStandardMaterial color="#0e5a8a" emissive="#06304a" emissiveIntensity={0.3} roughness={0.65} metalness={0.1} />
      </mesh>
      {/* continentes (icosaedro verde como relieve) */}
      <mesh ref={aire} scale={1.005}>
        <icosahedronGeometry args={[1.7, 2]} />
        <meshStandardMaterial color="#1f7a4d" emissive="#0c3d26" emissiveIntensity={0.25} roughness={0.8} flatShading wireframe transparent opacity={0.45} />
      </mesh>
      {/* capa de atmósfera (se tiñe con las emisiones) */}
      <mesh scale={1.18}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─── Contenido de la escena ───────────────────────────────────────────── */
function Mundo({ emisiones, pausado, arrastrable, onEmisionesChange, onGrab, onDraggingChange }: {
  emisiones: number; pausado: boolean; arrastrable?: boolean;
  onEmisionesChange?: (v: number) => void; onGrab?: () => void; onDraggingChange?: (d: boolean) => void;
}) {
  const combRapidez = useMemo(() => emisiones / EMIS_MAX, [emisiones]);

  // tinte de la atmósfera: azul calmado → naranja-rojo según emisiones
  const tint = useMemo(() => {
    const calm = new THREE.Color("#5ab0ff");
    const hot = new THREE.Color("#ff5a36");
    return calm.clone().lerp(hot, Math.min(1, combRapidez));
  }, [combRapidez]);

  return (
    <group>
      {/* suelo de apoyo (sombra) */}
      <ContactShadows position={[0, -4.2, 0]} opacity={0.32} scale={20} blur={2.6} far={9} />

      <Tierra tint={tint} />

      {/* reservorios */}
      {RESERVORIOS.map((r) => (
        <Nodo key={r.key} pos={NODOS[r.key]!} color={r.color} icono={r.icono} nombre={r.nombre} gtC={r.gtC} />
      ))}

      {/* flujos */}
      {FLUJOS.map((f) => {
        const rapidez = f.id === "combustion" ? combRapidez : f.rapidez;
        return (
          <Flujo key={f.id} de={NODOS[f.de]!} a={NODOS[f.a]!} color={f.color} rapidez={rapidez} pausado={pausado} />
        );
      })}

      {/* palanca de emisiones (arrastre) */}
      <PalancaEmisiones
        emisiones={emisiones}
        arrastrable={arrastrable}
        onEmisionesChange={onEmisionesChange}
        onGrab={onGrab}
        onDraggingChange={onDraggingChange}
      />

      {/* etiqueta del Sol/energía como motor del ciclo */}
      <group position={[-5.2, 4.4, 2.2]}>
        <mesh>
          <sphereGeometry args={[0.55, 20, 20]} />
          <meshStandardMaterial color="#ffd24a" emissive="#ffd24a" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={16} pointerEvents="none">
          <div style={{ transform: "translateY(30px)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-sun" style={{ color: "#ffd24a", fontSize: 13 }} />
            <span style={{ color: "#ffe08a", fontSize: 11, fontWeight: 800 }}>energía solar (motor)</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ─── Canvas + contenido ───────────────────────────────────────────────── */
export default function CicloCarbonoScene(props: CicloCarbonoSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [8.5, 4.5, 11], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: CicloCarbonoSceneProps) {
  const { emisiones, accent, pausado, autoRotate, resetNonce, arrastrable, onEmisionesChange, onGrab } = props;
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 24, 60]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[-5.2, 4.4, 2.2]}
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
        <Mundo
          emisiones={emisiones}
          pausado={pausado}
          arrastrable={arrastrable}
          onEmisionesChange={onEmisionesChange}
          onGrab={onGrab}
          onDraggingChange={setDragging}
        />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.2} position={[0, 8, 4]} scale={[14, 4, 1]} color="#ffffff" />
        <Lightformer intensity={0.8} position={[-8, 2, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={0.8} position={[8, 1, 5]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={32}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
        enabled={!dragging}
        autoRotate={autoRotate && !dragging}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.44} />
      </EffectComposer>
    </>
  );
}
