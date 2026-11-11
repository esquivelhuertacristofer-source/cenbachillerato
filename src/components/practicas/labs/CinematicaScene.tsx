"use client";

/**
 * Escena 3D — "Cinemática del MRUA: acelerar y frenar" (CNEYT-V-P02-A2).
 *
 * Una autopista recta por la que avanza un automóvil en el tiempo. La carretera
 * se AUTO-ESCALA a la distancia total del recorrido (SCENE_LEN unidades), así que
 * siempre se ve completa y los hitos quedan a su posición proporcional:
 *  · Salida (x = 0),
 *  · fin de la aceleración (x = x₁, donde el auto alcanza su velocidad máxima),
 *  · alto total (x = x_total, donde v = 0).
 *
 * Sobre el auto se dibujan dos flechas vectoriales:
 *  · velocidad (azul, siempre hacia adelante; su largo ∝ v),
 *  · aceleración (verde hacia adelante en la fase 1; roja hacia atrás al frenar;
 *    su largo ∝ |a|).
 * Una estela sobre el asfalto marca la distancia ya recorrida.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; la
 * geometría se memoiza o se deja como const (el compilador la memoiza). El auto
 * se mueve porque el shell actualiza la prop `t` (rAF dentro de useEffect).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { resolver, estadoEn, tiempoEnX, fmt1 } from "./cinematica-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";

export interface CinematicaSceneProps {
  a1: number;
  t1: number;
  a2: number;
  t: number;        // tiempo actual del recorrido (s)
  accent: string;
  resetNonce: number;
  /** Cuando true, el alumno puede arrastrar el auto sobre la autopista. */
  arrastrable?: boolean;
  /** Avisa el nuevo instante de tiempo al arrastrar el auto. */
  onScrub?: (t: number) => void;
  /** Se dispara al tomar el auto (para sonido/feedback). */
  onGrab?: () => void;
}

type Pt = [number, number, number];

/* ── Colores ──────────────────────────────────────────────────────────────── */
const C_VEL = "#7dd3fc";    // velocidad
const C_ACC = "#34D399";    // aceleración (fase 1, acelerando)
const C_BRK = "#f87171";    // aceleración negativa (fase 2, frenando)
const ASFALTO = "#1d2936";   // ver nota de LA CARRETERA INVISIBLE
const RAYA = "#dfe9f5";
/* LA CARRETERA ERA INVISIBLE.
 * El asfalto (#0c1f2e) y el desierto (#10202c) estaban a un pelo del fondo del
 * escenario (#050e1c): el terreno existía y no se veía NADA de él, así que la
 * escena quedaba en unas rayas blancas flotando en negro. Y un desierto, de
 * todos los sitios, tiene color. Suben lo justo para separarse del fondo sin
 * romper el tono oscuro del resto de la plataforma. */
const DESIERTO = "#3a3324";

const SCENE_LEN = 18;       // largo de la carretera en unidades de escena
const X0 = -SCENE_LEN / 2;  // x de la salida
const ROAD_W = 3.2;         // ancho de la carretera
const Y_ROAD = 0;           // altura del asfalto

/* Scratch a nivel de módulo (evita asignar por frame). El plano del asfalto es
 * horizontal (y = 0); arrastrar el auto = intersectar el rayo del puntero con él. */
const _planeRoad = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();
const _obj = new THREE.Object3D();
const PART_N = 14;           // motas de polvo levantadas por el auto

/* ── Etiqueta: tamaño fijo en píxeles (≥14), desplazada según el lado ────────── */
type Lado = "up" | "down" | "left" | "right";
const DESPLAZA: Record<Lado, string> = {
  up: "translate(0,-70%)",
  down: "translate(0,70%)",
  left: "translate(-62%,0)",
  right: "translate(62%,0)",
};

function Etiqueta({ pos, color, children, lado = "up" }: { pos: Pt; color: string; children: React.ReactNode; lado?: Lado }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: DESPLAZA[lado] }}>
        <div style={{
          whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)",
          border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15,
          fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {children}
        </div>
      </div>
    </Html>
  );
}

/* ── Polvo / estela de las ruedas (partículas en tiempo real) ─────────────── */
function Polvo({ v, frenando }: { v: number; frenando: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const intensidad = Math.min(1, v / 22);     // 0 detenido … 1 a tope
    for (let i = 0; i < PART_N; i++) {
      const p = (t * 0.7 + i / PART_N) % 1;      // 0→1 vida de la mota
      const back = -0.62 - p * 1.7;              // se aleja hacia atrás del auto
      const up = 0.1 + p * 0.55;                 // se eleva
      const spread = (i % 2 === 0 ? 1 : -1) * 0.34 * p;
      const s = Math.max(0.001, (1 - p) * 0.2 * (0.25 + intensidad));
      _obj.position.set(back, up, spread);
      _obj.scale.setScalar(s);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PART_N]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={frenando ? "#f8c4c4" : "#d8c8a8"}
        transparent
        opacity={0.45}
        depthWrite={false}
       
      />
    </instancedMesh>
  );
}

/* ── Flecha horizontal (asta + punta) a lo largo de ±x ────────────────────── */
function Flecha({
  base, hacia, len, color, label, grosor = 0.06, lado = "up",
}: {
  base: Pt; hacia: 1 | -1; len: number; color: string; label?: React.ReactNode; grosor?: number; lado?: Lado;
}) {
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(hacia, 0, 0),
    ),
    [hacia],
  );
  if (len < 0.06) return null;
  const headLen = Math.min(0.34, len * 0.4);
  const shaftLen = Math.max(0.001, len - headLen);
  return (
    <group position={base} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[grosor, grosor, shaftLen, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]}>
        <coneGeometry args={[grosor * 2.4, headLen, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {label != null && (
        <Etiqueta pos={[0, len, 0]} color={color} lado={lado}>{label}</Etiqueta>
      )}
    </group>
  );
}

/* ── Automóvil estilizado (mira hacia +x) ─────────────────────────────────── */
const ESC_AUTO = 1.7;   // el auto se dibuja ~1.7 veces más grande para que se lea a la escala de la autopista

function Auto({ color, frenando }: { color: string; frenando: boolean }) {
  const rueda = (x: number, z: number) => (
    <group position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.14, 20]} />
        <meshStandardMaterial color="#0b0f14" metalness={0.2} roughness={0.75} />
      </mesh>
      <mesh position={[0, z > 0 ? 0.075 : -0.075, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 14]} />
        <meshStandardMaterial color="#c3ccd6" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
  return (
    <group scale={ESC_AUTO}>
      {/* carrocería */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.7]} />
        <meshPhysicalMaterial color={color} metalness={0.45} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      {/* cofre y cajuela */}
      <mesh position={[0.5, 0.52, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.66]} />
        <meshPhysicalMaterial color={color} metalness={0.45} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[-0.6, 0.52, 0]} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.66]} />
        <meshPhysicalMaterial color={color} metalness={0.45} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      {/* cabina: casco del color del auto + banda de cristales */}
      <mesh position={[-0.1, 0.66, 0]} castShadow>
        <boxGeometry args={[0.76, 0.26, 0.6]} />
        <meshPhysicalMaterial color={color} metalness={0.45} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[-0.1, 0.64, 0]}>
        <boxGeometry args={[0.8, 0.14, 0.64]} />
        <meshPhysicalMaterial color="#1b2a3a" metalness={0.3} roughness={0.1} clearcoat={1} />
      </mesh>
      {/* defensas */}
      <mesh position={[0.77, 0.26, 0]} castShadow>
        <boxGeometry args={[0.07, 0.12, 0.72]} />
        <meshStandardMaterial color="#2a3139" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.77, 0.26, 0]} castShadow>
        <boxGeometry args={[0.07, 0.12, 0.72]} />
        <meshStandardMaterial color="#2a3139" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* faros delanteros */}
      <mesh position={[0.76, 0.38, 0.24]}>
        <boxGeometry args={[0.04, 0.1, 0.14]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.76, 0.38, -0.24]}>
        <boxGeometry args={[0.04, 0.1, 0.14]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={0.9} />
      </mesh>
      {/* stop trasero (se enciende al frenar) */}
      <mesh position={[-0.76, 0.38, 0.24]}>
        <boxGeometry args={[0.04, 0.1, 0.16]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={frenando ? 1.4 : 0.2} />
      </mesh>
      <mesh position={[-0.76, 0.38, -0.24]}>
        <boxGeometry args={[0.04, 0.1, 0.16]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={frenando ? 1.4 : 0.2} />
      </mesh>
      {rueda(0.5, 0.37)}
      {rueda(0.5, -0.37)}
      {rueda(-0.5, 0.37)}
      {rueda(-0.5, -0.37)}
    </group>
  );
}

/* ── Hito / poste de referencia ───────────────────────────────────────────── */
function Hito({ x, color, titulo, ver }: { x: number; color: string; titulo: string; ver: boolean }) {
  return (
    <group position={[x, Y_ROAD, -ROAD_W / 2 - 1.25]} scale={1.35}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.3, 12]} />
        <meshStandardMaterial color="#6b7d92" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {ver && <Etiqueta pos={[0, 1.45, 0]} color={color} lado="up">{titulo}</Etiqueta>}
    </group>
  );
}

/* ── Elementos repetidos con una sola malla instanciada ──────────────────── */
interface Inst { p: Pt; s?: number; sy?: number }

function Instancias({ items, children }: { items: Inst[]; children: React.ReactNode }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((it, i) => {
      _obj.position.set(it.p[0], it.p[1], it.p[2]);
      _obj.rotation.set(0, 0, 0);
      _obj.scale.set(it.s ?? 1, it.sy ?? it.s ?? 1, it.s ?? 1);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false} castShadow>
      {children}
    </instancedMesh>
  );
}

/** Pseudoaleatorio determinista (sin Math.random): mismo paisaje en cada carga. */
const hash = (i: number) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };

const LAMP_X = Array.from({ length: 6 }, (_, i) => X0 + 1 + 3.6 * i);
const Z_LAMP = -(ROAD_W / 2 + 3);

/* Arbustos de pocas caras a los dos lados (terreno árido: verde apagado). */
const ARBOLES: Inst[] = Array.from({ length: 18 }, (_, i) => {
  const lejos = i % 2 === 0;
  const x = X0 - 1 + hash(i + 1) * (SCENE_LEN + 2);
  const z = (lejos ? -1 : 1) * (4.6 + hash(i + 40) * 2.6);
  return { p: [x, 0, z] as Pt, s: 0.8 + hash(i + 80) * 0.7 };
});

/* ── Entorno de la autopista: calzada con bordillos, arcén, postes y arbustos ── */
function EntornoCarretera({ marcas, ver }: { marcas: { x: number; m: number }[]; ver: boolean }) {
  const L = SCENE_LEN + 2;
  return (
    <group>
      {/* calzada con espesor */}
      <mesh position={[0, Y_ROAD - 0.04, 0]} receiveShadow>
        <boxGeometry args={[L, 0.08, ROAD_W]} />
        <meshStandardMaterial color={ASFALTO} metalness={0.1} roughness={0.85} />
      </mesh>
      {[1, -1].map((sg) => (
        <group key={sg}>
          {/* bordillo */}
          <mesh position={[0, 0.07, sg * (ROAD_W / 2 + 0.09)]} castShadow receiveShadow>
            <boxGeometry args={[L, 0.14, 0.18]} />
            <meshStandardMaterial color="#8d97a3" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* arcén de grava */}
          <mesh position={[0, -0.02, sg * (ROAD_W / 2 + 0.18 + 0.3)]} receiveShadow>
            <boxGeometry args={[L, 0.04, 0.6]} />
            <meshStandardMaterial color="#6a6150" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* farolas */}
      <Instancias items={LAMP_X.map((x) => ({ p: [x, 1.4, Z_LAMP] as Pt }))}>
        <cylinderGeometry args={[0.05, 0.07, 2.8, 10]} />
        <meshStandardMaterial color="#7d8b9b" metalness={0.6} roughness={0.45} />
      </Instancias>
      <Instancias items={LAMP_X.map((x) => ({ p: [x, 2.75, Z_LAMP + 0.4] as Pt }))}>
        <boxGeometry args={[0.06, 0.06, 0.9]} />
        <meshStandardMaterial color="#7d8b9b" metalness={0.6} roughness={0.45} />
      </Instancias>
      <Instancias items={LAMP_X.map((x) => ({ p: [x, 2.7, Z_LAMP + 0.85] as Pt }))}>
        <boxGeometry args={[0.28, 0.07, 0.16]} />
        <meshStandardMaterial color="#e9eef5" emissive="#fff3c4" emissiveIntensity={0.35} roughness={0.4} />
      </Instancias>

      {/* arbustos: tronco + dos conos */}
      <Instancias items={ARBOLES.map((t) => ({ p: [t.p[0], 0.2 * (t.s ?? 1), t.p[2]] as Pt, s: t.s }))}>
        <cylinderGeometry args={[0.05, 0.07, 0.4, 6]} />
        <meshStandardMaterial color="#5b4630" roughness={0.9} />
      </Instancias>
      <Instancias items={ARBOLES.map((t) => ({ p: [t.p[0], 0.65 * (t.s ?? 1), t.p[2]] as Pt, s: t.s }))}>
        <coneGeometry args={[0.38, 0.8, 7]} />
        <meshStandardMaterial color="#4a6a3b" roughness={0.9} />
      </Instancias>
      <Instancias items={ARBOLES.map((t) => ({ p: [t.p[0], 1.0 * (t.s ?? 1), t.p[2]] as Pt, s: t.s }))}>
        <coneGeometry args={[0.28, 0.6, 7]} />
        <meshStandardMaterial color="#58794a" roughness={0.9} />
      </Instancias>

      {/* marcas de distancia en metros reales, sobre el arcén cercano */}
      {marcas.map(({ x, m }) => (
        <group key={m} position={[x, 0, ROAD_W / 2 + 0.5]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color="#e8eef7" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
          {ver && <Etiqueta pos={[0, 0.7, 0]} color="#9fb4cc" lado="up">{m} m</Etiqueta>}
        </group>
      ))}
    </group>
  );
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ a1, t1, a2, t, accent, resetNonce, arrastrable, onScrub, onGrab }: CinematicaSceneProps) {
  const ancho = useThree((st) => st.size.width) >= 640;
  const mov = resolver(a1, t1, a2);
  const est = estadoEn(mov, t);

  const SCALE = SCENE_LEN / Math.max(mov.xTotal, 1);   // unidades de escena por metro
  const xToWorld = (xm: number) => X0 + xm * SCALE;
  const carX = xToWorld(est.x);

  // ── Arrastre del auto sobre la autopista (mapea posición → tiempo) ──────────
  const dragRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = true;
    setDragging(true);
    onGrab?.();
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    if (!e.ray.intersectPlane(_planeRoad, _hit)) return;
    const xm = (_hit.x - X0) / SCALE;                 // mundo → metros
    onScrub?.(tiempoEnX(mov, xm));
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragRef.current = false;
    setDragging(false);
  };

  // escalas de las flechas (independientes; el número va en la etiqueta)
  const vScale = 2.6 / Math.max(mov.v1, 1);   // m/s → unidades
  const aScale = 0.9;                          // m/s² → unidades
  const vLen = est.v * vScale;
  const aLen = Math.abs(est.a) * aScale;
  const frenando = est.fase === 2;

  // marcas de distancia cada "paso" (1, 2 o 5 × 10^k m), a lo sumo 6, en metros reales
  const marcas = (() => {
    const tot = Math.max(mov.xTotal, 1);
    let paso = 1;
    for (const k of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]) {
      paso = k;
      if (tot / k <= 6) break;
    }
    const arr: { x: number; m: number }[] = [];
    for (let m = paso; m <= tot * 0.999; m += paso) arr.push({ x: xToWorld(m), m });
    return arr;
  })();

  // rayas discontinuas del centro de la carretera
  const rayas: Pt[][] = useMemo(() => {
    const segs: Pt[][] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const xa = X0 + (SCENE_LEN * i) / n + 0.25;
      const xb = X0 + (SCENE_LEN * i) / n + 0.75;
      segs.push([[xa, Y_ROAD + 0.02, 0], [xb, Y_ROAD + 0.02, 0]]);
    }
    return segs;
  }, []);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. La altura sale
          de donde esta escena ya ponía su sombra de contacto, que es donde
          su autor decidió que estaba el piso. */}
      {/* Sin mesa: esta escena ya trae su terreno (desierto + asfalto) y la del
          escenario se colaba entre los dos planos. Se queda con la luz de tres
          puntos y el entorno, que es lo que le faltaba. */}
      <Escenario acento={accent} mesa={false} />


      <group key={resetNonce}>
        {/* desierto / terreno */}
        <mesh position={[0, Y_ROAD - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[SCENE_LEN + 10, 18]} />
          <meshStandardMaterial color={DESIERTO} metalness={0.05} roughness={0.95} />
        </mesh>

        {/* calzada, bordillos, arcén, farolas, arbustos y marcas de distancia */}
        <EntornoCarretera marcas={marcas} ver={ancho} />
        {/* líneas de borde (pintura) */}
        <Line points={[[X0 - 1, Y_ROAD + 0.02, ROAD_W / 2 - 0.12], [X0 + SCENE_LEN + 1, Y_ROAD + 0.02, ROAD_W / 2 - 0.12]]} color={RAYA} lineWidth={2} transparent opacity={0.75} />
        <Line points={[[X0 - 1, Y_ROAD + 0.02, -ROAD_W / 2 + 0.12], [X0 + SCENE_LEN + 1, Y_ROAD + 0.02, -ROAD_W / 2 + 0.12]]} color={RAYA} lineWidth={2} transparent opacity={0.75} />
        {/* rayas centrales */}
        {rayas.map((seg, i) => (
          <Line key={i} points={seg} color={RAYA} lineWidth={2.6} transparent opacity={0.55} />
        ))}

        {/* estela: distancia ya recorrida */}
        {est.x > 0.01 && (
          <CurvaTubo puntos={[[X0, Y_ROAD + 0.04, 0], [carX, Y_ROAD + 0.04, 0]]} color={frenando ? C_BRK : C_ACC} grosor={0.09} />
        )}

        {/* hitos */}
        <Hito x={xToWorld(0)} color="#9fb4cc" titulo="Salida" ver={false} />
        <Hito x={xToWorld(mov.x1)} color={C_ACC} titulo="Rapidez máxima" ver={ancho} />
        <Hito x={xToWorld(mov.xTotal)} color={C_BRK} titulo="Alto total" ver={ancho} />

        {/* auto + flechas */}
        <group position={[carX, Y_ROAD, 0]}>
          {/* halo de agarre cuando es arrastrable */}
          {arrastrable && (
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.75, 48]} />
              <meshBasicMaterial
                color={dragging ? accent : hover ? "#ffffff" : accent}
                transparent
                opacity={dragging ? 0.85 : hover ? 0.6 : 0.3}
               
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          <Auto color={accent} frenando={frenando} />
          <group scale={ESC_AUTO}><Polvo v={est.v} frenando={frenando} /></group>
          {/* caja invisible de agarre (solo si es arrastrable) */}
          {arrastrable && (
            <mesh
              position={[0, 0.7, 0]}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
              onPointerOut={() => setHover(false)}
            >
              <boxGeometry args={[2.9, 1.7, 1.6]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
          <Flecha base={[0, 1.55, 0]} hacia={1} len={vLen} color={C_VEL} label={`v = ${fmt1(est.v)} m/s`} lado="up" />
          {aLen > 0.06 && (
            <Flecha
              lado="down"
              base={[0, 0.65, 0.75]}
              hacia={est.a >= 0 ? 1 : -1}
              len={aLen}
              color={est.a >= 0 ? C_ACC : C_BRK}
              grosor={0.05}
              label={ancho ? `a = ${fmt1(est.a)} m/s²` : undefined}
            />
          )}
        </group>
      </group>



      <Encuadre />

      <OrbitControls
        makeDefault
        enabled={!dragging}
        enablePan={false}
        minDistance={8}
        maxDistance={36}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.1, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

/** Encuadre: la autopista completa entre la barra y la misión; en pantallas
 *  angostas la cámara se aleja para que quepa a lo largo. */
function Encuadre() {
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const z = Math.min(34, Math.max(15, (SCENE_LEN / 2 + 2) / (Math.tan((42 / 2) * (Math.PI / 180)) * Math.min(1.6, aspect))));
  useEffect(() => {
    camera.position.set(0, z * 0.4, z);
    camera.updateProjectionMatrix();
  }, [camera, z]);
  return null;
}

export default function CinematicaScene(props: CinematicaSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 7, 17], fov: 42 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
