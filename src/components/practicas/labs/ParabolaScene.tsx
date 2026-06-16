"use client";

/**
 * Escena 3D del laboratorio de Parábolas (tiro parabólico) — R3F.
 * Se carga de forma diferida (ssr:false) desde LabParabola.tsx.
 *
 * Sobre un campo, un balón describe la parábola h(x) = a·x² + b·x + c. La curva
 * se dibuja en vivo y se marcan sus partes geométricas: el VÉRTICE (punto más
 * alto, con guías punteadas a los ejes), los CEROS (donde toca el suelo), el EJE
 * DE SIMETRÍA (recta vertical x = x_v) y —opcional— la PORTERÍA del problema de
 * la actividad (travesaño a 2.44 m, balón a h(25)).
 *
 * Robustecido (máxima interactividad): el alumno ARRASTRA el vértice (el apex del
 * tiro) en 3D y la parábola se reconstruye en tiempo real — con a fija, mover el
 * vértice (x_v, h_v) fija b = −2a·x_v y c = a·x_v² + h_v. Durante el arrastre la
 * escala de la escena se CONGELA para que el vértice siga al puntero sin saltos.
 * Un rastro de PARTÍCULAS sigue al balón en tiempo real (estela del tiro).
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; toda pieza animada vive en un
 * hijo del Canvas y muta REFS (nada de setState ni Math.random en el render).
 * Los ejes se reescalan dinámicamente para que el arco completo siempre quepa.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  evalH, vertice, raices, aterrizaje, GOL, fmtNum,
  B_MIN, B_MAX, B_STEP, C_MIN, C_MAX, C_STEP,
} from "./parabola-data";

export interface ParabolaSceneProps {
  a: number;
  b: number;
  c: number;
  showGol: boolean;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
  /** Habilita el arrastre del vértice (tras equiparse). */
  arrastrable?: boolean;
  /** El vértice arrastrado fija nuevos b y c (a se mantiene). */
  onVerticeChange?: (b: number, c: number) => void;
  /** Se dispara al tomar el vértice (para sonido). */
  onGrab?: () => void;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const ROJO = "#ff6b6b";
const EJE_COL = "#7fd4ff";
const SCENE_W = 15;
const SCENE_H = 5.6;
const N = 90; // muestras de la curva
const TRAIL = 30; // partículas de la estela del balón

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const snapClamp = (v: number, min: number, max: number, step: number) => {
  const s = Math.round(v / step) * step;
  return Math.round(clamp(s, min, max) * 100) / 100;
};

// Plano de la parábola (z = 0) y punto de impacto del rayo (reutilizables).
const _zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _hit = new THREE.Vector3();

/* ════════════════════ CONTENIDO DE LA PARÁBOLA ═══════════════════════ */
function Trayectoria({ a, b, c, showGol, accent, pausado, arrastrable, onVerticeChange, onGrab, onDraggingChange }: {
  a: number; b: number; c: number; showGol: boolean; accent: string; pausado: boolean;
  arrastrable?: boolean; onVerticeChange?: (b: number, c: number) => void; onGrab?: () => void;
  onDraggingChange?: (d: boolean) => void;
}) {
  // Magnitudes matemáticas (deterministas).
  const vert = useMemo(() => vertice(a, b, c), [a, b, c]);
  const rs = useMemo(() => raices(a, b, c), [a, b, c]);
  const xLand = useMemo(() => aterrizaje(a, b, c), [a, b, c]);

  // Ventana de dibujo y escalas dinámicas (todo cabe siempre).
  const xMax = useMemo(
    () => clamp(Math.max(xLand, showGol ? GOL.porteriaX + 4 : 0, 8), 8, 36),
    [xLand, showGol]
  );
  const hMaxView = useMemo(() => {
    const cands = [vert.h > 0 ? vert.h : 0, GOL.travesano, 2.5];
    if (showGol) cands.push(evalH(a, b, c, GOL.porteriaX));
    return Math.max(...cands) * 1.14;
  }, [vert.h, showGol, a, b, c]);

  // Arrastre del vértice: durante la gesta congelamos la escala para que el
  // vértice siga al puntero sin que el reescalado dinámico lo "persiga".
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [frozen, setFrozen] = useState<{ xMax: number; hMax: number } | null>(null);
  const draggingRef = useRef(false);
  const frozenRef = useRef<{ xMax: number; hMax: number } | null>(null);

  const xMaxEff = dragging && frozen ? frozen.xMax : xMax;
  const hMaxEff = dragging && frozen ? frozen.hMax : hMaxView;

  const sx = (x: number) => (x / xMaxEff) * SCENE_W - SCENE_W / 2;
  const sy = (h: number) => (Math.max(0, h) / hMaxEff) * SCENE_H;

  const drawEnd = useMemo(() => Math.min(xLand > 0 ? xLand : xMaxEff, xMaxEff), [xLand, xMaxEff]);

  // Puntos de la curva.
  const curva = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = (drawEnd * i) / N;
      pts.push([sx(x), sy(evalH(a, b, c, x)), 0]);
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, c, drawEnd, xMaxEff, hMaxEff]);

  // Estela de partículas (buffer de posiciones + colores que se desvanecen).
  // La geometría se crea una vez (useMemo); las mutaciones por frame se hacen
  // a través del ref del <points> para no tocar un valor de render (React Compiler).
  const accentCol = useMemo(() => new THREE.Color(accent), [accent]);
  const trailGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    return g;
  }, []);
  const pointsRef = useRef<THREE.Points>(null);
  const seeded = useRef(false);

  // Balón animado.
  const balon = useRef<THREE.Mesh>(null);
  const fase = useRef(0);
  useFrame((_, delta) => {
    const d = pausado ? 0 : Math.min(delta, 0.05);
    fase.current = (fase.current + d * 0.16) % 1;
    const x = drawEnd * fase.current;
    const bx = sx(x);
    const by = sy(evalH(a, b, c, x)) + 0.12;
    const m = balon.current;
    if (m) {
      m.position.set(bx, by, 0);
      m.rotation.z -= d * 2.2;
    }
    // estela: empuja el historial y escribe la cabeza (vía ref, no useMemo)
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.attributes.position as THREE.BufferAttribute | undefined;
    const colAttr = geom.attributes.color as THREE.BufferAttribute | undefined;
    if (!posAttr || !colAttr) return;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;
    if (!seeded.current) {
      for (let i = 0; i < TRAIL; i++) { pos[i * 3] = bx; pos[i * 3 + 1] = by; pos[i * 3 + 2] = 0; }
      seeded.current = true;
    } else {
      for (let i = TRAIL - 1; i > 0; i--) {
        pos[i * 3] = pos[(i - 1) * 3]!;
        pos[i * 3 + 1] = pos[(i - 1) * 3 + 1]!;
        pos[i * 3 + 2] = pos[(i - 1) * 3 + 2]!;
      }
      pos[0] = bx; pos[1] = by; pos[2] = 0;
    }
    for (let i = 0; i < TRAIL; i++) {
      const f = 1 - i / TRAIL;
      col[i * 3] = accentCol.r * f;
      col[i * 3 + 1] = accentCol.g * f;
      col[i * 3 + 2] = accentCol.b * f;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  const vertVisible = vert.x >= 0 && vert.x <= xMaxEff && vert.h > 0;
  const hPorteria = evalH(a, b, c, GOL.porteriaX);
  const ejeX = sx(vert.x);

  /* ── Arrastre del vértice ─────────────────────────────────────────── */
  const onVertDown = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    draggingRef.current = true;
    frozenRef.current = { xMax, hMax: hMaxView };
    setFrozen({ xMax, hMax: hMaxView });
    setDragging(true);
    onDraggingChange?.(true);
    onGrab?.();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onVertMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    const fr = frozenRef.current;
    if (!fr) return;
    if (!e.ray.intersectPlane(_zPlane, _hit)) return;
    // mundo → coordenadas matemáticas con la escala CONGELADA
    const xv = clamp(((_hit.x + SCENE_W / 2) / SCENE_W) * fr.xMax, 0.5, fr.xMax);
    const hv = Math.max(0.1, (_hit.y / SCENE_H) * fr.hMax);
    // con a fija: b = −2a·x_v, c = a·x_v² + h_v
    const nb = snapClamp(-2 * a * xv, B_MIN, B_MAX, B_STEP);
    const nc = snapClamp(a * xv * xv + hv, C_MIN, C_MAX, C_STEP);
    onVerticeChange?.(nb, nc);
  };
  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    draggingRef.current = false;
    frozenRef.current = null;
    setFrozen(null);
    setDragging(false);
    onDraggingChange?.(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* campo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SCENE_W + 3, 6]} />
        <meshStandardMaterial color="#0e3a26" metalness={0.05} roughness={0.95} />
      </mesh>
      <gridHelper args={[SCENE_W + 3, 18, "#2f6b4e", "#1c4733"]} position={[0, 0.01, 0]} />

      {/* eje Y (altura) */}
      <Line points={[[-SCENE_W / 2, 0, 0], [-SCENE_W / 2, SCENE_H + 0.4, 0]]} color="#9fb2c8" lineWidth={1.5} />
      {/* eje X (distancia) */}
      <Line points={[[-SCENE_W / 2, 0, 0], [SCENE_W / 2 + 0.3, 0, 0]]} color="#9fb2c8" lineWidth={1.5} />
      <Html position={[SCENE_W / 2 + 0.5, 0.05, 0]} center distanceFactor={13} pointerEvents="none">
        <div style={{ color: "#9fb2c8", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>distancia x (m)</div>
      </Html>
      <Html position={[-SCENE_W / 2, SCENE_H + 0.7, 0]} center distanceFactor={13} pointerEvents="none">
        <div style={{ color: "#9fb2c8", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>altura h (m)</div>
      </Html>

      {/* eje de simetría */}
      {vertVisible && (
        <>
          <Line points={[[ejeX, 0, 0], [ejeX, sy(vert.h) + 0.5, 0]]} color={EJE_COL} lineWidth={1.5} dashed dashSize={0.16} gapSize={0.12} />
          <Html position={[ejeX, sy(vert.h) + 0.85, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ color: EJE_COL, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>
              eje x = {fmtNum(vert.x, 1)}
            </div>
          </Html>
        </>
      )}

      {/* estela de partículas del balón */}
      <points ref={pointsRef} geometry={trailGeom}>
        <pointsMaterial vertexColors size={0.16} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>

      {/* curva (parábola) */}
      <Line points={curva} color={accent} lineWidth={4} />

      {/* vértice + guías */}
      {vertVisible && (
        <>
          {/* guía horizontal hacia el eje Y */}
          <Line points={[[-SCENE_W / 2, sy(vert.h), 0], [ejeX, sy(vert.h), 0]]} color={ORO} lineWidth={1.2} dashed dashSize={0.14} gapSize={0.1} />
          <mesh position={[ejeX, sy(vert.h), 0]} castShadow>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>

          {/* halo + zona de agarre del vértice (arrastrable) */}
          {arrastrable && (hover || dragging) && (
            <mesh position={[ejeX, sy(vert.h), 0]}>
              <ringGeometry args={[0.26, 0.36, 32]} />
              <meshBasicMaterial color={accent} transparent opacity={0.7} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
          )}
          {arrastrable && (
            <mesh
              position={[ejeX, sy(vert.h), 0]}
              onPointerDown={onVertDown}
              onPointerMove={onVertMove}
              onPointerUp={endDrag}
              onPointerOver={() => setHover(true)}
              onPointerOut={() => setHover(false)}
            >
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}

          <Html position={[ejeX, sy(vert.h) + 0.45, 0]} center distanceFactor={12} pointerEvents="none">
            <div style={{ background: "rgba(2,12,28,0.82)", border: `1px solid ${ORO}66`, borderRadius: 8, padding: "4px 8px", whiteSpace: "nowrap" }}>
              <span style={{ color: ORO, fontSize: 11.5, fontWeight: 900 }}>Vértice ({fmtNum(vert.x, 1)}, {fmtNum(vert.h, 1)})</span>
            </div>
          </Html>
          {arrastrable && (hover || dragging) && (
            <Html position={[ejeX, sy(vert.h) - 0.55, 0]} center distanceFactor={13} pointerEvents="none">
              <div style={{ background: `${accent}`, color: "#04121f", fontSize: 10.5, fontWeight: 900, borderRadius: 7, padding: "3px 8px", whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }}>
                <i className="fa-solid fa-hand-pointer" style={{ marginRight: 5 }} />
                {dragging ? "moviendo el vértice" : "arrastra el vértice"}
              </div>
            </Html>
          )}
          {/* altura máxima sobre el eje Y */}
          <Html position={[-SCENE_W / 2 - 0.15, sy(vert.h), 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ color: ORO, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>{fmtNum(vert.h, 1)}</div>
          </Html>
        </>
      )}

      {/* ceros (raíces dentro del campo) */}
      {rs.filter((r) => r >= -0.01 && r <= xMaxEff).map((r, i) => (
        <group key={i} position={[sx(r), 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.12, 0.2, 24]} />
            <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, -0.05, 0]} center distanceFactor={13} pointerEvents="none">
            <div style={{ color: VERDE, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", textShadow: "0 2px 8px #000" }}>x = {fmtNum(r, 1)}</div>
          </Html>
        </group>
      ))}

      {/* portería (escenario del gol) */}
      {showGol && (() => {
        const gx = sx(GOL.porteriaX);
        const gy = sy(GOL.travesano);
        const byBall = sy(hPorteria);
        const pasaPorEncima = hPorteria > GOL.travesano;
        return (
          <group>
            {/* postes y travesaño */}
            <mesh position={[gx, gy / 2, -0.6]}>
              <cylinderGeometry args={[0.05, 0.05, gy, 12]} />
              <meshStandardMaterial color="#e8eef6" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[gx, gy / 2, 0.6]}>
              <cylinderGeometry args={[0.05, 0.05, gy, 12]} />
              <meshStandardMaterial color="#e8eef6" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[gx, gy, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
              <meshStandardMaterial color="#e8eef6" metalness={0.3} roughness={0.5} />
            </mesh>
            {/* marca de la altura del balón al pasar por x=25 */}
            <mesh position={[gx, byBall, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={pasaPorEncima ? ROJO : VERDE} emissive={pasaPorEncima ? ROJO : VERDE} emissiveIntensity={0.8} toneMapped={false} />
            </mesh>
            <Html position={[gx, Math.max(byBall, gy) + 0.5, 0]} center distanceFactor={12} pointerEvents="none">
              <div style={{ background: "rgba(2,12,28,0.85)", border: `1px solid ${(pasaPorEncima ? ROJO : VERDE)}66`, borderRadius: 8, padding: "5px 9px", whiteSpace: "nowrap", textAlign: "center" }}>
                <div style={{ color: "#cfe0f2", fontSize: 10.5, fontWeight: 700 }}>Portería · x = {GOL.porteriaX} m</div>
                <div style={{ color: pasaPorEncima ? ROJO : VERDE, fontSize: 11.5, fontWeight: 900 }}>
                  balón a {fmtNum(hPorteria, 1)} m vs travesaño {GOL.travesano} m
                </div>
              </div>
            </Html>
          </group>
        );
      })()}

      {/* balón */}
      <mesh ref={balon} castShadow>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} metalness={0.1} roughness={0.4} />
      </mesh>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.32} scale={SCENE_W + 6} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════ */
export default function ParabolaScene(props: ParabolaSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.4, 3.6, 11.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: ParabolaSceneProps) {
  const { a, b, c, showGol, accent, pausado, autoRotate, resetNonce, arrastrable, onVerticeChange, onGrab } = props;
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 24, 50]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 11, 7]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={34}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 6, 5]} intensity={3.5} color="#ffffff" />

      <group key={`${resetNonce}`}>
        <Trayectoria
          a={a} b={b} c={c} showGol={showGol} accent={accent} pausado={pausado}
          arrastrable={arrastrable} onVerticeChange={onVerticeChange} onGrab={onGrab}
          onDraggingChange={setDragging}
        />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={1.5} position={[0, 7, 3]} scale={[15, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 3, -2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 2, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enabled={!dragging}
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.6, 0]}
        autoRotate={autoRotate && !dragging}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
