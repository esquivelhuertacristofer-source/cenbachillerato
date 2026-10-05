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
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { RESERVORIOS, FLUJOS, EMIS_MAX, EMIS_MIN } from "./carbono-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";

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

/* Solo 3 reservorios rotulados a la vez: la fuente del experimento y sus dos sumideros. */
const ETIQUETADOS = ["atmosfera", "oceano", "vegetacion"];

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
      <CurvaTubo puntos={[[0, Y_BOT, 0], [0, Y_TOP, 0]]} color="#5b7286" grosor={0.054} />
      <mesh position={[0, Y_TOP, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#ff5a36" />
      </mesh>
      <mesh position={[0, Y_BOT, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#5ab0ff" />
      </mesh>
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
        <meshStandardMaterial color={knobCol} emissive={knobCol} emissiveIntensity={0.7} roughness={0.35} />
      </mesh>

      {/* valor: único rótulo de la palanca, a la izquierda para no tapar la Tierra */}
      <Html position={[0, y, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ transform: "translate(-62%,0)", display: "flex", alignItems: "center", gap: 7, padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${knobCol.getStyle()}`, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
          <i className="fa-solid fa-industry" style={{ color: knobCol.getStyle(), fontSize: 14 }} />
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 900, fontFamily: "system-ui, sans-serif" }}>{emisiones} Gt/año</span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Nodo reservorio: esfera + etiqueta ───────────────────────────────── */
function Nodo({ pos, color, icono, nombre, gtC, etiquetar, lado }: {
  pos: [number, number, number]; color: string; icono: string; nombre: string; gtC: number; etiquetar: boolean; lado: "up" | "down";
}) {
  const r = radioNodo(gtC);
  return (
    <group position={pos}>
      <mesh castShadow>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} metalness={0.15} />
      </mesh>
      {etiquetar && (
        <Html center pointerEvents="none" zIndexRange={[20, 0]}>
          <div style={{ transform: lado === "up" ? "translate(0,-150%)" : "translate(0,150%)", display: "flex", alignItems: "center", gap: 7, padding: "3px 10px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
            <i className={`fa-solid ${icono}`} style={{ color, fontSize: 14 }} />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}>{nombre}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Tierra ───────────────────────────────────────────────────────────── */
const CONTINENTES: { dir: [number, number, number]; esc: [number, number, number] }[] = [
  { dir: [0.5, 0.55, 0.67], esc: [0.8, 0.55, 0.12] },
  { dir: [-0.6, 0.2, 0.77], esc: [0.55, 0.7, 0.12] },
  { dir: [0.85, -0.2, -0.48], esc: [0.7, 0.5, 0.12] },
  { dir: [-0.3, -0.7, 0.65], esc: [0.6, 0.4, 0.12] },
  { dir: [-0.2, 0.8, -0.56], esc: [0.65, 0.45, 0.12] },
];

function Tierra({ tint, calor }: { tint: THREE.Color; calor: number }) {
  const giro = useRef<THREE.Group>(null);
  const cont = useMemo(
    () => CONTINENTES.map((c) => {
      const d = new THREE.Vector3(...c.dir).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
      return { pos: d.clone().multiplyScalar(1.68).toArray() as [number, number, number], q, esc: c.esc };
    }),
    [],
  );
  useFrame((_, delta) => {
    if (giro.current) giro.current.rotation.y += delta * 0.04;
  });
  return (
    <group>
      {/* océano/superficie */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.7, 48, 48]} />
        <meshStandardMaterial color="#0e5a8a" emissive="#06304a" emissiveIntensity={0.3} roughness={0.65} metalness={0.1} />
      </mesh>
      {/* continentes: manchas verdes sólidas sobre el océano */}
      <group ref={giro}>
        {cont.map((c, i) => (
          <mesh key={i} position={c.pos} quaternion={c.q} scale={c.esc}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial color="#2a8a57" roughness={0.85} />
          </mesh>
        ))}
      </group>
      {/* capa de atmósfera: se tiñe y se ensancha con las emisiones */}
      <mesh scale={1.16 + calor * 0.14}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} transparent opacity={0.12 + calor * 0.2} side={THREE.BackSide} depthWrite={false} />
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

      <Tierra tint={tint} calor={Math.min(1, combRapidez)} />

      {/* reservorios */}
      {RESERVORIOS.map((r) => (
        <Nodo key={r.key} pos={NODOS[r.key]!} color={r.color} icono={r.icono} nombre={r.nombre} gtC={r.gtC} etiquetar={ETIQUETADOS.includes(r.key)} lado={r.key === "oceano" ? "down" : "up"} />
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

      {/* el Sol: motor del ciclo (sin rótulo; la idea está en la Teoría) */}
      <mesh position={[-5.2, 4.4, 2.2]}>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffd24a" emissiveIntensity={1.6} />
      </mesh>
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
      camera={{ position: [8.5, 4.2, 12.5], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: CicloCarbonoSceneProps) {
  const { emisiones, accent, pausado, autoRotate, resetNonce, arrastrable, onEmisionesChange, onGrab } = props;
  const [dragging, setDragging] = useState(false);
  const { camera, size } = useThree();
  const angosto = size.width < 640;
  // Pantalla angosta: la cámara se aleja una sola vez para que quepan la palanca y la Tierra.
  useEffect(() => {
    if (angosto) camera.position.multiplyScalar(1.4);
  }, [angosto, camera]);
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* La altura sale de donde esta escena ya ponía su sombra de
          contacto: es donde su autor decidió que estaba el piso. */}
      <Escenario acento={accent} suelo={-4.2} />


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


      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={36}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.9}
        target={[-1, -0.7, 0]}
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
