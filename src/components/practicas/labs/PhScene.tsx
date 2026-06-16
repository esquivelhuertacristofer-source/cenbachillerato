"use client";

/**
 * Escena 3D — "Laboratorio de pH" (CNEYT-IV-P03).
 *
 * Un vaso de precipitados con una disolución cuyo color lo fija el indicador de
 * col morada según el pH (rojo/rosa en ácido, morado en neutro, azul/verde en
 * básico). Al lado, una torre-escala de 0 a 14 con un marcador que sube o baja
 * con el pH. En modo "neutralizar", una BURETA de NaOH con una perilla
 * ARRASTRABLE: el alumno la mueve a lo largo de su riel y gotea base sobre el
 * vaso en tiempo real (gotas que caen + burbujas de mezcla), y el pH responde.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; las
 * animaciones viven en refs dentro de useFrame; el arrastre usa raycasting sobre
 * un plano que mira a la cámara (robusto al orbitar). OrbitControls se desactiva
 * mientras se arrastra.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { colorCol } from "./ph-data";

export interface PhSceneProps {
  ph: number;
  colorLiquido: string;
  accent: string;
  modo: "medir" | "neutralizar";
  goteando: boolean;
  gotas: number;
  gotasMax: number;
  resetNonce: number;
  /** Habilita arrastrar la perilla de la bureta (tras equiparse). */
  arrastrable?: boolean;
  /** El alumno arrastró la perilla → nuevo número de gotas. */
  onGotasChange?: (gotas: number) => void;
  /** Tomó la perilla (para sonido). */
  onGrab?: () => void;
}

const R_VASO = 1.35; // radio del vaso
const H_VASO = 2.9; // alto del vaso
const NIVEL = 0.66; // fracción de llenado del líquido

const NAOH = "#bfeaff"; // color de la gota de NaOH (incolora → azulada)

// Riel de la bureta (coordenadas de mundo, a la izquierda del vaso).
const TRACK_X = -3.0;
const TRACK_Z = 0;
const Y_BOT = -1.25;
const Y_TOP = 2.65;
const gotasToY = (g: number, max: number) => Y_BOT + (Math.max(0, Math.min(max, g)) / max) * (Y_TOP - Y_BOT);
const yToGotas = (y: number, max: number) =>
  Math.round(((Math.max(Y_BOT, Math.min(Y_TOP, y)) - Y_BOT) / (Y_TOP - Y_BOT)) * max);

// Scratch de módulo (evita asignaciones por frame).
const _plane = new THREE.Plane();
const _norm = new THREE.Vector3();
const _cop = new THREE.Vector3();
const _hit = new THREE.Vector3();
const _obj = new THREE.Object3D();

/* ── Vaso de precipitados (cristal) + líquido coloreado ──────────────────── */
function Vaso({ colorLiquido }: { colorLiquido: string }) {
  const hLiquido = H_VASO * NIVEL;
  const yLiquido = -H_VASO / 2 + hLiquido / 2;
  const ySup = -H_VASO / 2 + hLiquido; // superficie del líquido

  return (
    <group>
      {/* Pared de cristal (cilindro abierto) */}
      <mesh>
        <cylinderGeometry args={[R_VASO, R_VASO, H_VASO, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#dff1ff"
          roughness={0.08}
          metalness={0}
          transmission={0.92}
          thickness={0.4}
          ior={1.46}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Fondo del vaso */}
      <mesh position={[0, -H_VASO / 2 + 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[R_VASO, R_VASO, 0.06, 48]} />
        <meshPhysicalMaterial color="#cfe6f7" roughness={0.1} transmission={0.7} transparent opacity={0.45} />
      </mesh>
      {/* Borde superior */}
      <mesh position={[0, H_VASO / 2, 0]}>
        <torusGeometry args={[R_VASO, 0.04, 12, 48]} />
        <meshStandardMaterial color="#eaf6ff" roughness={0.2} metalness={0.1} transparent opacity={0.5} />
      </mesh>

      {/* Líquido — OPACO: un material con transmisión (la pared de cristal) solo
          deja ver los objetos opacos que tiene detrás; si el líquido fuera
          transparente, el cristal no lo "vería" y el vaso saldría vacío. */}
      <mesh position={[0, yLiquido, 0]} castShadow>
        <cylinderGeometry args={[R_VASO - 0.06, R_VASO - 0.06, hLiquido, 48]} />
        <meshStandardMaterial
          color={colorLiquido}
          emissive={colorLiquido}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {/* Superficie (menisco brillante) */}
      <mesh position={[0, ySup, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R_VASO - 0.06, 48]} />
        <meshStandardMaterial
          color={colorLiquido}
          emissive={colorLiquido}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Gotero fijo sobre el vaso (cuerpo del instrumento) ──────────────────── */
function Gotero() {
  const yTop = H_VASO / 2 + 1.6;
  return (
    <group position={[0, yTop + 0.2, 0]}>
      {/* cuerpo del gotero */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.0, 20]} />
        <meshStandardMaterial color="#e6f2ff" roughness={0.25} metalness={0.1} transparent opacity={0.55} />
      </mesh>
      {/* punta */}
      <mesh position={[0, -0.18, 0]}>
        <coneGeometry args={[0.1, 0.36, 20]} />
        <meshStandardMaterial color="#cfe6f7" roughness={0.2} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ── Lluvia de gotas de NaOH (partículas en tiempo real) ─────────────────── */
function GotasStream({ activo }: { activo: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 7;
  const yTop = H_VASO / 2 + 1.25; // punta del gotero
  const ySurf = -H_VASO / 2 + H_VASO * NIVEL; // superficie del líquido

  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const phase = (t * 1.15 + i / N) % 1;
      const y = yTop - phase * (yTop - ySurf);
      _obj.position.set(0, y, 0);
      const s = activo ? 0.085 * (1 - phase * 0.25) : 0.0001;
      _obj.scale.setScalar(s);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color={NAOH} emissive={NAOH} emissiveIntensity={0.55} roughness={0.15} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Burbujas de mezcla que suben desde la superficie (reacción en vivo) ──── */
function Burbujas({ activo }: { activo: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 12;
  const ySurf = -H_VASO / 2 + H_VASO * NIVEL;
  // posiciones x/z deterministas (ángulo áureo) — sin Math.random.
  const spots = useMemo(() => {
    const a: { x: number; z: number; sp: number; off: number }[] = [];
    for (let i = 0; i < N; i++) {
      const r = (R_VASO - 0.35) * Math.sqrt((i * 0.61803399) % 1);
      const th = i * 2.39996323;
      a.push({ x: Math.cos(th) * r, z: Math.sin(th) * r, sp: 0.6 + ((i * 0.37) % 1) * 0.5, off: (i * 0.137) % 1 });
    }
    return a;
  }, []);

  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const s0 = spots[i]!;
      const phase = (t * s0.sp + s0.off) % 1;
      const y = ySurf + phase * 0.6;
      _obj.position.set(s0.x, y, s0.z);
      const s = activo ? 0.05 * (1 - phase) : 0.0001;
      _obj.scale.setScalar(s);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial color="#eaffff" emissive="#cfeeff" emissiveIntensity={0.4} roughness={0.1} transparent opacity={0.8} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Bureta de NaOH con perilla arrastrable ──────────────────────────────── */
function BuretaArrastrable({
  gotas,
  gotasMax,
  accent,
  arrastrable,
  onGotasChange,
  onGrab,
  onDraggingChange,
}: {
  gotas: number;
  gotasMax: number;
  accent: string;
  arrastrable: boolean;
  onGotasChange?: (g: number) => void;
  onGrab?: () => void;
  onDraggingChange: (d: boolean) => void;
}) {
  const { camera } = useThree();
  const draggingRef = useRef(false);
  const [hover, setHover] = useState(false);
  const knob = useRef<THREE.Group>(null);

  const yKnob = gotasToY(gotas, gotasMax);
  const frac = Math.max(0, Math.min(1, gotas / gotasMax));
  // perilla azul (poca base) → acento (mucha base)
  const knobCol = useMemo(() => {
    const c = new THREE.Color(NAOH).lerp(new THREE.Color(accent), frac);
    return `#${c.getHexString()}`;
  }, [accent, frac]);

  // halo que late suave cuando se puede arrastrar.
  useFrame((st) => {
    if (knob.current) {
      const s = arrastrable && !draggingRef.current ? 1 + Math.sin(st.clock.elapsedTime * 3) * 0.05 : 1;
      knob.current.scale.setScalar(s);
    }
  });

  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    _norm.set(camera.position.x - TRACK_X, 0, camera.position.z - TRACK_Z).normalize();
    _cop.set(TRACK_X, 0, TRACK_Z);
    _plane.setFromNormalAndCoplanarPoint(_norm, _cop);
    if (!e.ray.intersectPlane(_plane, _hit)) return;
    onGotasChange?.(yToGotas(_hit.y, gotasMax));
  };

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    draggingRef.current = true;
    onDraggingChange(true);
    onGrab?.();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const up = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    draggingRef.current = false;
    onDraggingChange(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <group position={[TRACK_X, 0, TRACK_Z]}>
      {/* soporte / riel */}
      <mesh position={[0, (Y_TOP + Y_BOT) / 2, -0.04]}>
        <boxGeometry args={[0.12, Y_TOP - Y_BOT + 0.5, 0.08]} />
        <meshStandardMaterial color="#0a1a2c" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* cuerpo de la bureta (cristal) */}
      <mesh position={[0, (Y_TOP + Y_BOT) / 2, 0.02]}>
        <cylinderGeometry args={[0.14, 0.14, Y_TOP - Y_BOT + 0.4, 24, 1, true]} />
        <meshPhysicalMaterial color="#dff1ff" roughness={0.1} transmission={0.9} thickness={0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* perilla arrastrable */}
      <group
        ref={knob}
        position={[0, yKnob, 0.12]}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerOver={() => arrastrable && setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        {/* halo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.34, 28]} />
          <meshBasicMaterial color={accent} transparent opacity={arrastrable ? (hover ? 0.85 : 0.4) : 0.12} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={knobCol} emissive={knobCol} emissiveIntensity={hover ? 0.7 : 0.4} roughness={0.25} metalness={0.2} toneMapped={false} />
        </mesh>
        <Html center distanceFactor={11} position={[0, 0.42, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 13, color: "#fff", background: "rgba(3,12,28,0.82)", border: `1px solid ${accent}88`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
            {gotas} gotas
          </div>
        </Html>
        {arrastrable && (
          <Html center distanceFactor={13} position={[0, -0.42, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#cfe8ff", whiteSpace: "nowrap", opacity: hover ? 0 : 0.85 }}>
              <i className="fa-solid fa-arrows-up-down" style={{ marginRight: 5 }} />
              arrastra para titular
            </div>
          </Html>
        )}
      </group>
      {/* etiqueta del riel */}
      <Html center distanceFactor={13} position={[0, Y_TOP + 0.5, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", color: accent, whiteSpace: "nowrap" }}>BURETA · NaOH</div>
      </Html>
    </group>
  );
}

/* ── Torre-escala de pH (0 a 14) con marcador deslizante ─────────────────── */
function EscalaPh({ ph }: { ph: number }) {
  const x = R_VASO + 2.0; // a la derecha del vaso
  const alto = H_VASO + 0.6;
  const y0 = -alto / 2;

  // 14 bandas de color del indicador de col morada (de pH 14 arriba a 0 abajo).
  const bandas = useMemo(() => {
    const arr: { y: number; h: number; color: string }[] = [];
    const n = 14;
    const hb = alto / n;
    for (let i = 0; i < n; i++) {
      const phMed = i + 0.5; // 0.5,1.5,…,13.5
      arr.push({ y: y0 + i * hb + hb / 2, h: hb - 0.015, color: colorCol(phMed) });
    }
    return arr;
  }, [alto, y0]);

  const yMarca = y0 + (Math.max(0, Math.min(14, ph)) / 14) * alto;

  // Latido suave del marcador (ref en useFrame).
  const marca = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (marca.current) {
      const s = 1 + Math.sin(st.clock.elapsedTime * 3) * 0.06;
      marca.current.scale.setX(s);
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* marco */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.62, alto + 0.12, 0.04]} />
        <meshStandardMaterial color="#0a1626" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* bandas */}
      {bandas.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]}>
          <boxGeometry args={[0.5, b.h, 0.06]} />
          <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.25} roughness={0.4} toneMapped={false} />
        </mesh>
      ))}
      {/* marcador (flecha) a la altura del pH actual */}
      <group ref={marca} position={[0, yMarca, 0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.52, 0, 0]}>
          <coneGeometry args={[0.13, 0.26, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.56, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ ph, colorLiquido, accent, modo, goteando, gotas, gotasMax, resetNonce, arrastrable = false, onGotasChange, onGrab }: PhSceneProps) {
  const sig = `${modo}-${resetNonce}`;
  const [dragging, setDragging] = useState(false);
  const vertiendo = modo === "neutralizar" && (goteando || dragging);

  return (
    <>
      <color attach="background" args={["#04111c"]} />
      <fog attach="fog" args={["#04111c", 16, 44]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 9, 7]} intensity={1.9} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, 4]} intensity={8} color={accent} />
      <pointLight position={[4, 2, 5]} intensity={6} color="#ffffff" />

      <group key={sig} position={[-0.6, 0.2, 0]}>
        <Vaso colorLiquido={colorLiquido} />
        {modo === "neutralizar" && (
          <>
            <Gotero />
            <GotasStream activo={vertiendo} />
            <Burbujas activo={vertiendo} />
          </>
        )}
        <EscalaPh ph={ph} />
        <ContactShadows position={[0, -H_VASO / 2 - 0.05, 0]} opacity={0.34} scale={12} blur={2.6} far={6} color="#10283e" />
      </group>

      {modo === "neutralizar" && (
        <BuretaArrastrable
          gotas={gotas}
          gotasMax={gotasMax}
          accent={accent}
          arrastrable={arrastrable}
          onGotasChange={onGotasChange}
          onGrab={onGrab}
          onDraggingChange={setDragging}
        />
      )}

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 4]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[5, 5, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[4, 4, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        makeDefault
        enabled={!dragging}
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
        target={[-0.3, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function PhScene(props: PhSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.4, 10], fov: 44 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
