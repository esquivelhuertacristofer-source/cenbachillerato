"use client";

/**
 * Escena 3D del laboratorio "Tipos de energía: de los fenómenos naturales a la
 * tecnología" (CNEYT-II-P08). Tres vistas:
 *
 *  - fenomenos: cuatro dioramas (tormenta, brisa marina, volcán en corte y
 *    una planta al sol). Cada eslabón acertado de la cadena de energía
 *    enciende su etapa en la escena.
 *  - tecnologia: la tecnología que aprovecha esa energía (aerogenerador,
 *    planta geotérmica, panel solar junto a una planta) y, al lado, un
 *    diagrama de flujo de energía (Sankey) en 3D cuyas franjas miden la
 *    energía útil y las pérdidas.
 *  - investigacion: el banco de pruebas de la simulación A2 (barra con
 *    sensor, panel con simulador solar, aparato con medidor de energía).
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type FenomenoId,
  type FormaId,
  type Magma,
  type TecId,
  type SitioId,
  type InvId,
  type FlujoSankey,
  eficiencia,
  FENOMENOS,
  FORMA_DEF,
  retrasoTrueno,
  tasaFotosintesis,
  aerogenerador,
  densidadAire,
  SITIOS_VIENTO,
  geotermica,
  panelSolar,
  hoja,
  ROTOR_D,
  INVESTIGACIONES,
  MATERIALES,
  APARATOS,
  tempBarra,
  T_SENSOR,
  X_FIJA_CM,
  num,
  potencia,
} from "./tipos-energia-data";

export interface TiposEnergiaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Fenómenos
  fenomenoId: FenomenoId;
  /** Eslabones acertados (pasos.length = cadena completa; +1 = final resuelto). */
  etapa: number;
  distanciaKm: number;
  rayoNonce: number;
  noche: boolean;
  magma: Magma;
  luzPct: number;
  // Tecnología
  tecId: TecId;
  viento: number;
  sitio: SitioId;
  tempGeo: number;
  flujoGeo: number;
  irradiancia: number;
  angulo: number;
  // Investigación
  invId: InvId;
  viIdx: number;
  nivelIdx: number;
  midiendo: boolean;
  medido: boolean;
  ensayoNonce: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const UP = new THREE.Vector3(0, 1, 0);
const GEO_ESFERA = new THREE.SphereGeometry(1, 10, 8);
const GEO_CAJA = new THREE.BoxGeometry(1, 1, 1);
const GEO_CONO = new THREE.ConeGeometry(0.5, 1, 8);
const GEO_HEX = new THREE.CylinderGeometry(1, 1, 0.5, 6);

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Chip de una etapa de la cadena de energía. */
function EtapaChip({ pos, k, forma, activa }: { pos: Pt; k: number; forma: FormaId; activa: boolean }) {
  if (!activa) return null;
  const d = FORMA_DEF[forma];
  return (
    <Etiqueta pos={pos} df={10} col={`${d.color}cc`} fs={11.5}>
      <span style={{ width: 18, height: 18, borderRadius: 6, background: d.color, color: "#04121f", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 900 }}>{k}</span>
      <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
      {d.etq}
    </Etiqueta>
  );
}

/**
 * Nube de partículas instanciadas. `camino(p, i, out)` coloca la partícula
 * `i` en la fracción `p` (0–1) de su recorrido; `nivel` (0–1) controla cuántas
 * se ven.
 */
function Particulas({
  n,
  color,
  tam,
  nivel,
  vel,
  camino,
  opacidad = 1,
  emisivo = 0.6,
  geo = GEO_ESFERA,
  escalaFn,
}: {
  n: number;
  color: string;
  tam: number;
  nivel: number;
  vel: number;
  camino: (p: number, i: number, out: THREE.Vector3) => void;
  opacidad?: number;
  emisivo?: number;
  geo?: THREE.BufferGeometry;
  escalaFn?: (p: number) => number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const vis = useRef(0);
  useFrame(({ clock }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    vis.current += (nivel - vis.current) * suave(dt, 0.06);
    const t = clock.elapsedTime * vel;
    for (let i = 0; i < n; i++) {
      const fase = (i * 0.61803) % 1;
      const p = (t + fase) % 1;
      camino(p, i, v);
      obj.position.copy(v);
      const on = (i + 0.5) / n <= vis.current;
      const s = on ? tam * (escalaFn ? escalaFn(p) : 1) : 0.0001;
      obj.scale.setScalar(Math.max(0.0001, s));
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]} frustumCulled={false}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emisivo} transparent={opacidad < 1} opacity={opacidad} depthWrite={opacidad >= 1} />
    </instancedMesh>
  );
}

function Sol({ pos, intensidad = 1 }: { pos: Pt; intensidad?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.04);
  });
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={0.6 + intensidad * 2.2} />
      </mesh>
      <pointLight intensity={intensidad * 6} distance={16} color="#fde68a" />
    </group>
  );
}

function Palmera({ pos, escala = 1, inclina }: { pos: Pt; escala?: number; inclina: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = inclina * (0.12 + Math.sin(clock.elapsedTime * 2.2 + pos[0]) * 0.05);
  });
  return (
    <group position={pos} scale={escala}>
      <group ref={ref}>
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.05, 0.09, 1.6, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {Array.from({ length: 6 }, (_, k) => {
          const a = (k / 6) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.32, 1.58, Math.sin(a) * 0.32]} rotation={[Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1]} scale={[0.12, 0.62, 0.05]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#15803d" roughness={0.6} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Casa({ pos, rot = 0, color = "#e2e8f0" }: { pos: Pt; rot?: number; color?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.5, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.66, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.56, 0.36, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Persona({ pos, color }: { pos: Pt; color: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.34, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. FENÓMENOS
 * ════════════════════════════════════════════════════════════════════════ */

/* ── Tormenta ─────────────────────────────────────────────────────────── */

const RAYO_TOP: Pt = [0.6, 2.75, -0.6];
const RAYO_SUELO: Pt = [0.1, 0, -0.2];
const OBSERVADOR: Pt = [3.4, 0, 2.3];

/** Segmentos del rayo (constante: zigzag determinista). */
const RAYO_SEG = (() => {
  const pts: THREE.Vector3[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = RAYO_TOP[0] + (RAYO_SUELO[0] - RAYO_TOP[0]) * f + (i > 0 && i < n ? Math.sin(i * 12.9898) * 0.28 : 0);
    const z = RAYO_TOP[2] + (RAYO_SUELO[2] - RAYO_TOP[2]) * f + (i > 0 && i < n ? Math.cos(i * 7.233) * 0.16 : 0);
    pts.push(new THREE.Vector3(x, RAYO_TOP[1] * (1 - f), z));
  }
  const ramas: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < n; i++) ramas.push([pts[i]!, pts[i + 1]!]);
  ramas.push([pts[3]!, new THREE.Vector3(pts[3]!.x - 0.55, pts[3]!.y - 0.5, pts[3]!.z + 0.1)]);
  ramas.push([pts[5]!, new THREE.Vector3(pts[5]!.x + 0.45, pts[5]!.y - 0.45, pts[5]!.z - 0.1)]);
  return ramas.map(([a, b]) => {
    const dir = b.clone().sub(a);
    const largo = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
    const mid = a.clone().add(b).multiplyScalar(0.5);
    return { pos: [mid.x, mid.y, mid.z] as Pt, q: [q.x, q.y, q.z, q.w] as [number, number, number, number], largo };
  });
})();

const NUBE: { p: Pt; r: number }[] = [
  { p: [0, 0, 0], r: 0.95 },
  { p: [0.9, 0.15, 0.1], r: 0.8 },
  { p: [-0.85, 0.1, -0.1], r: 0.78 },
  { p: [0.3, 0.75, 0], r: 0.85 },
  { p: [-0.35, 0.6, 0.25], r: 0.7 },
  { p: [0.1, 1.3, -0.1], r: 0.7 },
  { p: [1.2, 1.35, 0], r: 0.55 },
  { p: [-0.9, 1.3, 0], r: 0.5 },
  { p: [0.15, 1.75, 0], r: 0.45 },
];

function EscenaTormenta({ etapa, distanciaKm, rayoNonce }: { etapa: number; distanciaKm: number; rayoNonce: number }) {
  const nube = useRef<THREE.Group>(null);
  const rayo = useRef<THREE.Group>(null);
  const flash = useRef<THREE.PointLight>(null);
  const onda = useRef<THREE.Mesh>(null);
  const oyente = useRef<HTMLSpanElement>(null);
  const escalaNube = useRef(0);
  const tRayo = useRef(99);
  const ultimo = useRef(rayoNonce);
  const delay = retrasoTrueno(distanciaKm);
  const radioOyente = Math.hypot(OBSERVADOR[0] - RAYO_SUELO[0], OBSERVADOR[2] - RAYO_SUELO[2]);
  const f = FENOMENOS[0]!;

  useFrame((_, dt) => {
    escalaNube.current += ((etapa >= 3 ? 1 : 0.001) - escalaNube.current) * suave(dt, 0.04);
    if (nube.current) nube.current.scale.setScalar(Math.max(0.001, escalaNube.current));
    if (ultimo.current !== rayoNonce) {
      ultimo.current = rayoNonce;
      tRayo.current = 0;
    } else tRayo.current += Math.min(dt, 0.25);
    const t = tRayo.current;
    const visible = t < 0.7 && Math.floor(t * 14) % 4 !== 3;
    if (rayo.current) rayo.current.visible = visible;
    if (flash.current) flash.current.intensity = visible ? 60 : 0;
    if (onda.current) {
      const fr = t / delay;
      onda.current.visible = t < delay && t < 90;
      const r = Math.max(0.01, fr * radioOyente);
      onda.current.scale.set(r, r, 1);
      (onda.current.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - fr * 0.6);
    }
    if (oyente.current) {
      if (t >= 90) oyente.current.textContent = `Tú, a ${num(distanciaKm)} km`;
      else if (t < delay) oyente.current.textContent = `Relámpago visto · ${num(t, 1)} s…`;
      else if (t < delay + 3) oyente.current.textContent = `¡Trueno! a los ${num(delay, 1)} s → ${num(distanciaKm)} km`;
      else oyente.current.textContent = `Tú, a ${num(distanciaKm)} km`;
    }
  });

  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5.2, 0.24, 64]} />
        <meshStandardMaterial color="#3f6212" roughness={0.95} />
      </mesh>
      {[-2.6, -1.7, 2.2].map((x, k) => (
        <Casa key={k} pos={[x, 0, -1.8 + k * 0.5]} rot={k * 0.4} />
      ))}
      {/* Edificio con pararrayos */}
      <group position={[-2.2, 0, 1.2]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 1.6, 0.8]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2 + 0.3;
        return (
          <mesh key={k} position={[Math.cos(a) * 4.2, 0.35, Math.sin(a) * 4.2]}>
            <coneGeometry args={[0.28, 0.9, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.8} flatShading />
          </mesh>
        );
      })}
      <Persona pos={OBSERVADOR} color="#fbbf24" />
      <Etiqueta pos={[OBSERVADOR[0], 1.35, OBSERVADOR[2]]} df={10} fs={11} col="#fbbf24aa">
        <i className="fa-solid fa-ear-listen" style={{ color: "#fbbf24" }} />
        <span ref={oyente}>Tú, a {num(distanciaKm)} km</span>
      </Etiqueta>

      {etapa >= 1 && <Sol pos={[-4, 4.6, -2.2]} intensidad={etapa >= 3 ? 0.35 : 1} />}
      <Particulas
        n={18}
        color="#fde047"
        tam={0.05}
        nivel={etapa >= 1 ? 1 : 0}
        vel={0.35}
        camino={(p, i, o) => {
          const x = -2 + ((i * 0.37) % 1) * 4;
          const z = -1.5 + ((i * 0.53) % 1) * 3;
          o.set(-4 + (x + 4) * p, 4.6 - 4.6 * p, -2.2 + (z + 2.2) * p);
        }}
      />
      <EtapaChip pos={[-3.2, 3.7, -2]} k={1} forma="luminosa" activa={etapa >= 1} />
      <Particulas
        n={40}
        color="#fb923c"
        tam={0.07}
        nivel={etapa >= 2 ? 1 : 0}
        vel={0.28}
        opacidad={0.8}
        camino={(p, i, o) => {
          const x = -1.4 + ((i * 0.37) % 1) * 2.8;
          const z = -1.6 + ((i * 0.71) % 1) * 2;
          o.set(x * (1 - p * 0.5) + 0.3 * p, 0.1 + p * 2.3, z * (1 - p * 0.4));
        }}
        escalaFn={(p) => 1 - p * 0.6}
      />
      <EtapaChip pos={[-1.6, 0.7, 0.4]} k={2} forma="termica" activa={etapa >= 2} />
      <group ref={nube} position={[0.6, 2.85, -0.6]} scale={0.001}>
        {NUBE.map((b, k) => (
          <mesh key={k} position={b.p} castShadow>
            <sphereGeometry args={[b.r, 18, 14]} />
            <meshStandardMaterial color={k < 3 ? "#475569" : "#94a3b8"} roughness={0.95} />
          </mesh>
        ))}
        {/* Yunque del cumulonimbo */}
        <mesh position={[0.2, 2.1, 0]} scale={[1.45, 0.34, 0.85]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
        </mesh>
      </group>
      <Particulas
        n={16}
        color="#e0f2fe"
        tam={0.08}
        nivel={etapa >= 3 ? 1 : 0}
        vel={0.5}
        emisivo={0.3}
        geo={GEO_CONO}
        camino={(p, i, o) => {
          const x = 0.6 + (((i * 0.37) % 1) - 0.5) * 1.4;
          o.set(x, 2.3 + p * 1.9, -0.1 + (((i * 0.59) % 1) - 0.5) * 0.3);
        }}
      />
      <EtapaChip pos={[2.6, 3.9, -0.6]} k={3} forma="cinetica" activa={etapa >= 3} />
      {etapa >= 4 && (
        <group>
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={`p${k}`} position={[0.6 + (k - 3.5) * 0.35, 4.55 + Math.sin(k) * 0.08, 0.25]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.4} />
            </mesh>
          ))}
          {Array.from({ length: 10 }, (_, k) => (
            <mesh key={`n${k}`} position={[0.6 + (k - 4.5) * 0.3, 2.05 + Math.cos(k) * 0.06, 0.35]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.4} />
            </mesh>
          ))}
          <Etiqueta pos={[-0.9, 4.6, 0.3]} df={11} fs={10.5} col="#ef4444aa">
            + cima de la nube
          </Etiqueta>
          <Etiqueta pos={[-1.1, 2.0, 0.3]} df={11} fs={10.5} col="#3b82f6aa">
            − base de la nube
          </Etiqueta>
        </group>
      )}
      <EtapaChip pos={[2.7, 2.1, 0.3]} k={4} forma="electrica" activa={etapa >= 4} />
      <group ref={rayo} visible={false}>
        {RAYO_SEG.map((s, k) => (
          <mesh key={k} position={s.pos} quaternion={s.q}>
            <cylinderGeometry args={[k > 8 ? 0.02 : 0.045, k > 8 ? 0.02 : 0.045, s.largo, 6]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>
        ))}
        <pointLight ref={flash} position={[0.4, 1.4, 0]} intensity={0} distance={14} color="#dbeafe" />
      </group>
      <mesh ref={onda} position={[RAYO_SUELO[0], 0.08, RAYO_SUELO[2]]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.94, 1, 64]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {etapa > f.pasos.length && (
        <Etiqueta pos={[-0.3, 0.3, 2.1]} df={10} fs={11} col="#f472b6aa">
          <i className="fa-solid fa-sun" style={{ color: FORMA_DEF.luminosa.color }} /> luz · <i className="fa-solid fa-temperature-high" style={{ color: FORMA_DEF.termica.color }} /> calor ·{" "}
          <i className="fa-solid fa-volume-high" style={{ color: FORMA_DEF.sonora.color }} /> trueno
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Brisa marina ─────────────────────────────────────────────────────── */

/** Recorrido de la celda de circulación (día: mar → tierra abajo). */
function celdaBrisa(p: number, out: THREE.Vector3) {
  const tramos = [
    [3.4, 0.55, -3.0, 0.55],
    [-3.0, 0.55, -3.0, 3.1],
    [-3.0, 3.1, 3.4, 3.1],
    [3.4, 3.1, 3.4, 0.55],
  ] as const;
  const largos = tramos.map((t) => Math.hypot(t[2] - t[0], t[3] - t[1]));
  const total = largos.reduce((a, b) => a + b, 0);
  let d = p * total;
  for (let k = 0; k < 4; k++) {
    const t = tramos[k]!;
    const L = largos[k]!;
    if (d <= L || k === 3) {
      const f = Math.min(1, d / L);
      out.set(t[0] + (t[2] - t[0]) * f, t[1] + (t[3] - t[1]) * f, 0.6);
      return;
    }
    d -= L;
  }
}

function FlechasBrisa({ noche, activo }: { noche: boolean; activo: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const vis = useRef(0);
  const N = 22;
  useFrame(({ clock }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    vis.current += ((activo ? 1 : 0) - vis.current) * suave(dt, 0.05);
    for (let i = 0; i < N; i++) {
      let p = (clock.elapsedTime * 0.07 + i / N) % 1;
      if (noche) p = 1 - p;
      celdaBrisa(p, a);
      celdaBrisa(noche ? Math.max(0, p - 0.004) : Math.min(1, p + 0.004), b);
      const dir = b.sub(a);
      obj.position.copy(a);
      if (dir.lengthSq() > 1e-8) obj.quaternion.setFromUnitVectors(UP, dir.normalize());
      obj.scale.set(0.22 * vis.current + 0.0001, 0.4 * vis.current + 0.0001, 0.22 * vis.current + 0.0001);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[GEO_CONO, undefined, N]} frustumCulled={false}>
      <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.9} />
    </instancedMesh>
  );
}

function Olas({ fuerza }: { fuerza: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const f = useRef(0.3);
  const N = 36;
  useFrame(({ clock }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    f.current += (fuerza - f.current) * suave(dt, 0.04);
    for (let i = 0; i < N; i++) {
      const x = 0.4 + (i % 6) * 0.72;
      const z = -2.1 + Math.floor(i / 6) * 0.8;
      obj.position.set(x, 0.02 + Math.sin(clock.elapsedTime * 2.2 + x * 1.7 + z) * 0.05 * f.current, z);
      obj.scale.set(0.5, 0.03 + 0.05 * f.current, 0.12);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[GEO_CAJA, undefined, N]} frustumCulled={false}>
      <meshStandardMaterial color="#bae6fd" roughness={0.3} transparent opacity={0.7} />
    </instancedMesh>
  );
}

function EscenaBrisa({ etapa, noche }: { etapa: number; noche: boolean }) {
  const f = FENOMENOS[1]!;
  const tArena = noche ? 18 : 38;
  const tMar = noche ? 24 : 26;
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[-2.25, -0.1, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.4, 5]} />
        <meshStandardMaterial color="#e7c98f" roughness={1} />
      </mesh>
      <mesh position={[2.25, -0.2, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.36, 5]} />
        <meshStandardMaterial color="#0e7490" roughness={0.2} metalness={0.2} />
      </mesh>
      <Olas fuerza={etapa >= 3 ? 1 : 0.2} />
      {[
        [-3.4, 0.1, -1.6],
        [-2.2, 0.1, 1.5],
        [-1.2, 0.1, -1.9],
        [-3.8, 0.1, 1.0],
      ].map((p, k) => (
        <Palmera key={k} pos={p as Pt} escala={0.9 + (k % 2) * 0.2} inclina={etapa >= 3 ? (noche ? -1 : 1) : 0} />
      ))}
      <Casa pos={[-3.6, 0.1, -0.2]} rot={0.3} color="#fde68a" />
      {!noche && etapa >= 1 && <Sol pos={[-0.5, 5, -2.4]} />}
      {noche && (
        <mesh position={[-0.5, 5, -2.4]}>
          <sphereGeometry args={[0.38, 20, 14]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#cbd5e1" emissiveIntensity={0.8} />
        </mesh>
      )}
      <Particulas
        n={20}
        color="#fde047"
        tam={0.05}
        nivel={etapa >= 1 && !noche ? 1 : 0}
        vel={0.35}
        camino={(p, i, o) => {
          const x = -4 + ((i * 0.37) % 1) * 8;
          const z = -2 + ((i * 0.53) % 1) * 4;
          o.set(-0.5 + (x + 0.5) * p, 5 - 4.9 * p, -2.4 + (z + 2.4) * p);
        }}
      />
      <EtapaChip pos={[0.9, 4.6, -2.2]} k={1} forma="luminosa" activa={etapa >= 1} />
      <Particulas
        n={24}
        color="#fb923c"
        tam={0.06}
        nivel={etapa >= 2 ? 1 : 0}
        vel={0.3}
        opacidad={0.75}
        camino={(p, i, o) => {
          const x = noche ? 0.6 + ((i * 0.37) % 1) * 3.2 : -3.8 + ((i * 0.37) % 1) * 3.2;
          o.set(x, 0.15 + p * 2.2, -1.5 + ((i * 0.71) % 1) * 3);
        }}
        escalaFn={(p) => 1 - p * 0.7}
      />
      {etapa >= 2 && (
        <>
          <Etiqueta pos={[-2.4, 0.6, 2.2]} df={10} fs={11} col="#fb923caa">
            <i className="fa-solid fa-temperature-half" style={{ color: "#fb923c" }} />
            Arena {tArena} °C
          </Etiqueta>
          <Etiqueta pos={[2.4, 0.5, 2.2]} df={10} fs={11} col="#38bdf8aa">
            <i className="fa-solid fa-temperature-half" style={{ color: "#38bdf8" }} />
            Mar {tMar} °C
          </Etiqueta>
        </>
      )}
      <EtapaChip pos={[noche ? 2.2 : -2.2, 2.7, 0.6]} k={2} forma="termica" activa={etapa >= 2} />
      <FlechasBrisa noche={noche} activo={etapa >= 3} />
      {etapa >= 3 && (
        <Etiqueta pos={[0.2, 1.05, 0.6]} df={10} fs={11.5} col="#60a5faaa">
          <i className="fa-solid fa-wind" style={{ color: "#60a5fa" }} />
          {noche ? "Brisa terrestre: de la tierra al mar" : "Brisa marina: del mar a la tierra"}
        </Etiqueta>
      )}
      <EtapaChip pos={[0.2, 3.55, 0.6]} k={3} forma="cinetica" activa={etapa >= 3} />
      {etapa > f.pasos.length && (
        <Etiqueta pos={[noche ? -1.5 : 1.5, 2.15, -1.0]} df={10} fs={11} col="#f472b6aa">
          olas y hojas en movimiento · fricción → calor
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Volcán en corte ──────────────────────────────────────────────────── */

const V_ALTO = 2.6;
const V_BASE = 3;
const V_CRATER = 0.45;

const CORTE_VOLCAN = (() => {
  const s = new THREE.Shape();
  s.moveTo(-V_BASE, 0);
  s.lineTo(V_BASE, 0);
  s.lineTo(V_CRATER, V_ALTO);
  s.lineTo(-V_CRATER, V_ALTO);
  s.lineTo(-V_BASE, 0);
  return new THREE.ShapeGeometry(s);
})();

function lavaLadera(p: number, i: number, out: THREE.Vector3) {
  const lado = i % 2 === 0 ? 1 : -1;
  const z = -0.25 - ((i * 0.37) % 1) * 0.9;
  const y = V_ALTO * (1 - p);
  const r = V_CRATER + ((V_BASE - V_CRATER) * (V_ALTO - y)) / V_ALTO;
  const x = Math.sqrt(Math.max(0, r * r - z * z));
  out.set(lado * x, y + 0.04, z);
}

function EscenaVolcan({ etapa, magma }: { etapa: number; magma: Magma }) {
  const f = FENOMENOS[2]!;
  const camara = useRef<THREE.MeshStandardMaterial>(null);
  const conducto = useRef<THREE.Mesh>(null);
  const brillo = useRef(0);
  const sube = useRef(0);
  useFrame(({ clock }, dt) => {
    brillo.current += ((etapa >= 2 ? 1 : 0.1) - brillo.current) * suave(dt, 0.04);
    sube.current += ((etapa >= 3 ? 1 : etapa >= 2 ? 0.35 : 0) - sube.current) * suave(dt, 0.03);
    if (camara.current) camara.current.emissiveIntensity = 0.2 + brillo.current * (1.4 + Math.sin(clock.elapsedTime * 3) * 0.15);
    if (conducto.current) {
      const h = Math.max(0.001, sube.current * (V_ALTO + 0.75));
      conducto.current.scale.y = h;
      conducto.current.position.y = -0.75 + h / 2;
    }
  });
  const erupcion = etapa >= 3;
  const fluido = magma === "fluido";
  return (
    <group position={[0, 0, 0.6]}>
      {/* Bloque de terreno en corte */}
      <mesh position={[0, -1.1, -1.8]} receiveShadow>
        <boxGeometry args={[9, 2.2, 3.6]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.02, -1.8]}>
        <boxGeometry args={[9.02, 0.06, 3.62]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.95} />
      </mesh>
      {/* Capas de roca en la cara del corte */}
      {[-0.5, -1.2, -1.8].map((y, k) => (
        <mesh key={k} position={[0, y, 0.005]}>
          <planeGeometry args={[9, 0.05]} />
          <meshBasicMaterial color={["#78716c", "#44403c", "#292524"][k]!} />
        </mesh>
      ))}
      {/* Media montaña (detrás del corte) */}
      <mesh position={[0, V_ALTO / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[V_CRATER, V_BASE, V_ALTO, 48, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={CORTE_VOLCAN} position={[0, 0, 0.003]}>
        <meshStandardMaterial color="#44403c" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Cámara magmática y conducto */}
      <mesh position={[0, -1.35, 0.01]} scale={[1.25, 0.62, 1]}>
        <circleGeometry args={[0.8, 40]} />
        <meshStandardMaterial ref={camara} color="#dc2626" emissive="#f97316" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <mesh ref={conducto} position={[0, -0.75, 0.012]} scale={[1, 0.001, 1]}>
        <planeGeometry args={[0.26, 1]} />
        <meshStandardMaterial color="#ea580c" emissive="#f97316" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* Desintegración radiactiva en el manto */}
      <Particulas
        n={26}
        color="#f87171"
        tam={0.045}
        nivel={etapa >= 1 ? 1 : 0}
        vel={0.8}
        emisivo={2}
        camino={(p, i, o) => o.set(-4 + ((i * 0.37) % 1) * 8, -2.1 + ((i * 0.53) % 1) * 0.55, 0.03)}
        escalaFn={(p) => (p < 0.18 ? 1 + p * 4 : 0.001)}
      />
      <EtapaChip pos={[-3.3, -1.45, 0.4]} k={1} forma="nuclear" activa={etapa >= 1} />
      <EtapaChip pos={[1.9, -1.2, 0.4]} k={2} forma="termica" activa={etapa >= 2} />
      {etapa >= 2 && (
        <Etiqueta pos={[1.9, -0.75, 0.4]} df={11} fs={10.5} col="#f97316aa">
          magma {fluido ? "≈ 1 150 °C" : "≈ 850 °C"}
        </Etiqueta>
      )}
      {/* Erupción */}
      <Particulas
        n={fluido ? 34 : 60}
        color={fluido ? "#fb923c" : "#6b7280"}
        tam={fluido ? 0.1 : 0.2}
        nivel={erupcion ? 1 : 0}
        vel={fluido ? 0.55 : 0.18}
        emisivo={fluido ? 1.6 : 0.05}
        opacidad={fluido ? 1 : 0.85}
        camino={(p, i, o) => {
          const a = (i * 7.31 + Math.sin(i * 12.9898) * 3) % (Math.PI * 2);
          if (fluido) {
            const r = p * (0.5 + ((i * 0.37) % 1) * 0.7);
            o.set(Math.cos(a) * r, V_ALTO + Math.sin(p * Math.PI) * (0.6 + ((i * 0.53) % 1) * 0.9), Math.sin(a) * r * 0.5 - 0.2);
          } else {
            const r = 0.2 + p * 1.6 * ((i % 5) / 5 + 0.4);
            o.set(Math.cos(a) * r + p * 0.8, V_ALTO + p * 4.2, Math.sin(a) * r * 0.5 - 0.3);
          }
        }}
        escalaFn={(p) => (fluido ? 1 : 0.5 + p * 1.6)}
      />
      <Particulas n={24} color="#f97316" tam={0.09} nivel={erupcion && fluido ? 1 : 0} vel={0.12} emisivo={1.8} camino={lavaLadera} />
      {erupcion && <pointLight position={[0, V_ALTO + 0.4, 0.5]} intensity={fluido ? 8 : 3} distance={7} color="#fb923c" />}
      <EtapaChip pos={[-2.2, V_ALTO + 1.2, 0.3]} k={3} forma="cinetica" activa={etapa >= 3} />
      {etapa > f.pasos.length && (
        <Etiqueta pos={[2.6, V_ALTO + 1.6, 0.3]} df={10} fs={11} col="#f472b6aa">
          {fluido ? "lava incandescente · calor" : "ceniza a km de altura · luz · calor"}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Fotosíntesis ─────────────────────────────────────────────────────── */

const HOJAS: { p: Pt; r: number; s: number }[] = [
  { p: [0.55, 1.1, 0.1], r: -0.6, s: 0.55 },
  { p: [-0.55, 1.45, -0.05], r: 0.6, s: 0.5 },
  { p: [0.5, 1.85, -0.1], r: -0.5, s: 0.48 },
  { p: [-0.45, 2.15, 0.1], r: 0.55, s: 0.42 },
  { p: [0.1, 2.5, 0], r: 0, s: 0.36 },
];

function Venado({ pos }: { pos: Pt }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = Math.sin(clock.elapsedTime * 1.6) * 0.03;
  });
  const c = "#a16207";
  return (
    <group position={pos} rotation={[0, -Math.PI / 2 - 0.35, 0]} ref={ref}>
      <mesh position={[0, 0.85, 0]} scale={[0.55, 0.3, 0.26]} castShadow>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {[
        [0.35, 0.12],
        [0.35, -0.12],
        [-0.35, 0.12],
        [-0.35, -0.12],
      ].map(([x, z], k) => (
        <mesh key={k} position={[x!, 0.35, z!]}>
          <cylinderGeometry args={[0.04, 0.035, 0.7, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
      <mesh position={[0.62, 1.2, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.08, 0.11, 0.5, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0.82, 1.42, 0]} scale={[0.22, 0.13, 0.13]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[-0.55, 0.95, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {[0.07, -0.07].map((z) => (
        <mesh key={z} position={[0.75, 1.65, z * 1.6]} rotation={[z * 4, 0, 0.3]}>
          <cylinderGeometry args={[0.012, 0.018, 0.34, 6]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>
      ))}
    </group>
  );
}

function EscenaFotosintesis({ etapa, luzPct }: { etapa: number; luzPct: number }) {
  const f = FENOMENOS[3]!;
  const tasa = tasaFotosintesis(luzPct) / 100;
  const hojasMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (hojasMat.current) hojasMat.current.emissiveIntensity = etapa >= 2 ? 0.1 + tasa * 0.35 : 0.05;
  });
  return (
    <group position={[0, -1.4, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[4.6, 4.8, 0.24, 64]} />
        <meshStandardMaterial color="#713f12" roughness={1} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 4.55, 64]} />
        <meshStandardMaterial color="#65a30d" roughness={1} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 2.6, 10]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.6} />
      </mesh>
      {HOJAS.map((h, k) => (
        <mesh key={k} position={h.p} rotation={[0.3, 0, h.r]} scale={[h.s, 0.05, h.s * 0.45]} castShadow>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial ref={k === 0 ? hojasMat : undefined} color="#16a34a" emissive="#22c55e" emissiveIntensity={0.05} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={k} position={[Math.cos(k * 1.3) * 0.25, -0.02, Math.sin(k * 1.3) * 0.25]} rotation={[Math.sin(k) * 0.4, 0, Math.cos(k) * 0.9]}>
          <cylinderGeometry args={[0.015, 0.03, 0.5, 6]} />
          <meshStandardMaterial color="#d6d3d1" />
        </mesh>
      ))}
      {etapa >= 1 && <Sol pos={[-3.6, 4.6, -1.2]} intensidad={luzPct / 100} />}
      <Particulas
        n={30}
        color="#fde047"
        tam={0.05}
        nivel={etapa >= 1 ? luzPct / 100 : 0}
        vel={0.45}
        camino={(p, i, o) => {
          const h = HOJAS[i % HOJAS.length]!;
          o.set(-3.6 + (h.p[0] + 3.6) * p, 4.6 + (h.p[1] - 4.6) * p, -1.2 + (h.p[2] + 1.2) * p + (((i * 0.37) % 1) - 0.5) * 0.3 * p);
        }}
      />
      <EtapaChip pos={[-2.4, 3.9, -1]} k={1} forma="luminosa" activa={etapa >= 1} />
      {/* CO₂ entra, O₂ sale, glucosa baja por el tallo */}
      <Particulas n={12} color="#475569" tam={0.07} nivel={etapa >= 2 ? tasa : 0} vel={0.25} emisivo={0.1} camino={(p, i, o) => o.set(3 - p * 2.4, 1.9 + Math.sin(i + p * 6) * 0.25, 0.8 - p * 0.7)} />
      <Particulas n={12} color="#bae6fd" tam={0.07} nivel={etapa >= 2 ? tasa : 0} vel={0.25} emisivo={0.6} camino={(p, i, o) => o.set(-0.6 - p * 2.3, 1.7 + p * 1.6, 0.4 + Math.sin(i * 2 + p * 5) * 0.3)} />
      <Particulas
        n={10}
        color="#4ade80"
        tam={0.075}
        nivel={etapa >= 2 ? tasa : 0}
        vel={0.2}
        emisivo={1.2}
        geo={GEO_HEX}
        camino={(p, i, o) => {
          const h = HOJAS[i % HOJAS.length]!;
          const f2 = Math.min(1, p * 2);
          o.set(h.p[0] * (1 - f2) + 0.12, h.p[1] - (h.p[1] - 0.1) * Math.max(0, p * 1.5 - 0.3), h.p[2] * (1 - f2) + 0.1);
        }}
      />
      {etapa >= 2 && (
        <>
          <Etiqueta pos={[3.3, 1.4, 0.9]} df={10} fs={10.5} col="#94a3b8aa">
            CO₂ entra
          </Etiqueta>
          <Etiqueta pos={[-2.9, 3.5, 0.5]} df={10} fs={10.5} col="#bae6fdaa">
            O₂ sale
          </Etiqueta>
          <Etiqueta pos={[0.9, 0.45, 0.4]} df={10} fs={10.5} col="#4ade80aa">
            ⬡ glucosa
          </Etiqueta>
        </>
      )}
      <EtapaChip pos={[-1.5, 1.05, 0.6]} k={2} forma="quimica" activa={etapa >= 2} />
      {etapa >= f.pasos.length && <Venado pos={[2.5, 0, 1.2]} />}
      <Particulas
        n={16}
        color="#fb923c"
        tam={0.06}
        nivel={etapa > f.pasos.length ? 1 : 0}
        vel={0.4}
        opacidad={0.7}
        camino={(p, i, o) => o.set(2.5 + (((i * 0.37) % 1) - 0.5) * 0.8, 1.1 + p * 1.3, 1.2 + (((i * 0.61) % 1) - 0.5) * 0.8)}
        escalaFn={(p) => 1 - p * 0.8}
      />
      {etapa > f.pasos.length && (
        <Etiqueta pos={[2.8, 2.85, 1.3]} df={10} fs={11} col="#f472b6aa">
          respiración → movimiento y calor corporal
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TECNOLOGÍA + SANKEY
 * ════════════════════════════════════════════════════════════════════════ */

interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  color: string;
  banda: boolean;
}

const COLOR_PERDIDA = ["#dc2626", "#be185d", "#64748b", "#9f1239"];

function layoutSankey(fl: FlujoSankey, x0: number, x1: number, top: number, alto: number, piso: number): { rects: Rect[]; anclas: { x: number; w: number; forma: FormaId; etq: string }[] } {
  const ref = fl.tramos[0]!.w;
  const h = (w: number) => (ref > 0 && w > 0 ? Math.max(0.018, (w / ref) * alto) : 0.0001);
  const anchoPerd = fl.perdidas.reduce((s, ps) => s + ps.reduce((a, p) => a + (ref > 0 ? (p.w / ref) * alto : 0), 0), 0);
  const n = fl.tramos.length;
  const lt = Math.max(0.5, (x1 - x0 - anchoPerd) / n);
  const rects: Rect[] = [];
  const anclas: { x: number; w: number; forma: FormaId; etq: string }[] = [];
  let x = x0;
  fl.tramos.forEach((t, i) => {
    const col = FORMA_DEF[t.forma].color;
    rects.push({ x0: x, x1: x + lt, y0: top - h(t.w), y1: top, color: col, banda: true });
    anclas.push({ x: x + lt / 2, w: t.w, forma: t.forma, etq: t.etq });
    x += lt;
    if (i < n - 1) {
      let restante = t.w;
      fl.perdidas[i]!.forEach((p, j) => {
        const ancho = ref > 0 ? Math.max(0.0001, (p.w / ref) * alto) : 0.0001;
        restante -= p.w;
        const yBanda = top - h(Math.max(0, restante));
        rects.push({ x0: x, x1: x + ancho, y0: yBanda, y1: top, color: col, banda: true });
        rects.push({ x0: x, x1: x + ancho, y0: piso, y1: yBanda, color: COLOR_PERDIDA[(i + j) % COLOR_PERDIDA.length]!, banda: false });
        x += ancho;
      });
    }
  });
  return { rects, anclas };
}

function Sankey({ flujo, x0, x1, top, alto, titulo, leyendaX }: { flujo: FlujoSankey; x0: number; x1: number; top: number; alto: number; titulo: string; leyendaX: number }) {
  const piso = top - alto - 0.55;
  const { rects, anclas } = layoutSankey(flujo, x0, x1, top, alto, piso);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const puntos = useRef<THREE.InstancedMesh>(null);
  const actual = useRef<number[]>([]);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const N_PUNTOS = 46;
  const PROF = 0.5;
  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const cur = actual.current;
    const k = suave(dt, 0.08);
    rects.forEach((r, i) => {
      const b = i * 4;
      const objetivo = [r.x0, r.x1, r.y0, r.y1];
      for (let c = 0; c < 4; c++) {
        const prev = cur[b + c];
        cur[b + c] = prev === undefined ? objetivo[c]! : prev + (objetivo[c]! - prev) * k;
      }
      const w = Math.max(0.0001, cur[b + 1]! - cur[b]!);
      const hh = Math.max(0.0001, cur[b + 3]! - cur[b + 2]!);
      obj.position.set((cur[b]! + cur[b + 1]!) / 2, (cur[b + 2]! + cur[b + 3]!) / 2, 0);
      obj.scale.set(w, hh, r.banda ? PROF : PROF * 0.8);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
      m.setColorAt(i, tmp.set(r.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    const pm = puntos.current;
    if (!pm) return;
    const bandas = rects.map((r, i) => ({ r, i })).filter((x) => x.r.banda);
    const xFin = bandas.length ? cur[bandas[bandas.length - 1]!.i * 4 + 1] ?? x1 : x1;
    for (let i = 0; i < N_PUNTOS; i++) {
      const fase = (i * 0.61803) % 1;
      const p = (clock.elapsedTime * 0.16 + fase) % 1;
      const xx = x0 + (xFin - x0) * p;
      let y = -99;
      for (const bd of bandas) {
        const b = bd.i * 4;
        if (xx >= cur[b]! && xx <= cur[b + 1]!) {
          const y0 = cur[b + 2]!;
          const y1 = cur[b + 3]!;
          if (y1 - y0 > 0.03) y = y0 + (y1 - y0) * ((i * 0.37) % 1 * 0.8 + 0.1);
          break;
        }
      }
      obj.position.set(xx, y, PROF / 2 + 0.03);
      obj.scale.setScalar(y > -90 ? 0.035 : 0.0001);
      obj.updateMatrix();
      pm.setMatrixAt(i, obj.matrix);
    }
    pm.instanceMatrix.needsUpdate = true;
  });
  const entrada = flujo.tramos[0]!.w;
  const perdidas = flujo.perdidas.flat();
  return (
    <group>
      <instancedMesh key={rects.length} ref={mesh} args={[GEO_CAJA, undefined, rects.length]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0.1} emissive="#ffffff" emissiveIntensity={0.08} />
      </instancedMesh>
      <instancedMesh ref={puntos} args={[GEO_ESFERA, undefined, N_PUNTOS]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </instancedMesh>
      <mesh position={[(x0 + x1) / 2, piso - 0.03, 0]}>
        <boxGeometry args={[x1 - x0 + 0.4, 0.04, PROF + 0.4]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {anclas.map((a, i) => (
        <Etiqueta key={i} pos={[a.x, top + 0.3 + (i % 2) * 0.42, 0]} df={10} fs={10.5} col={`${FORMA_DEF[a.forma].color}aa`}>
          <i className={`fa-solid ${FORMA_DEF[a.forma].icono}`} style={{ color: FORMA_DEF[a.forma].color }} />
          {a.etq} · {entrada > 0 ? `${num((a.w / entrada) * 100, a.w / entrada < 0.1 && a.w > 0 ? 1 : 0)} %` : "—"}
        </Etiqueta>
      ))}
      <Html position={[leyendaX, top - alto / 2, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 210, padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.88)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 10.5, lineHeight: 1.35 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#94a3b8", fontWeight: 900, marginBottom: 4 }}>{titulo.toUpperCase()}</div>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>Entra: {potencia(entrada)}</div>
          {perdidas.map((p, i) => {
            const idx = flujo.perdidas.findIndex((ps) => ps.includes(p));
            const j = flujo.perdidas[idx]!.indexOf(p);
            return (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 2 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, marginTop: 3, flexShrink: 0, background: COLOR_PERDIDA[(idx + j) % COLOR_PERDIDA.length] }} />
                <span style={{ color: "#cbd5e1" }}>
                  {p.etq}: <b style={{ color: "#fff" }}>{entrada > 0 ? `${num((p.w / entrada) * 100, 1)} %` : "—"}</b>
                </span>
              </div>
            );
          })}
        </div>
      </Html>
    </group>
  );
}

function Aerogenerador({ pos, escala = 1, omega }: { pos: Pt; escala?: number; omega: number }) {
  const rotor = useRef<THREE.Group>(null);
  const w = useRef(0);
  useFrame((_, dt) => {
    w.current += (omega - w.current) * suave(dt, 0.02);
    if (rotor.current) rotor.current.rotation.z -= w.current * Math.min(dt, 0.1);
  });
  const H = 4.4;
  const R = 2.3;
  return (
    <group position={pos} scale={escala}>
      <mesh position={[0, H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.16, H, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      <mesh position={[0, H + 0.05, -0.2]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.75]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
      </mesh>
      <group ref={rotor} position={[0, H + 0.05, 0.22]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.14, 0.3, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <group key={k} rotation={[0, 0, (k * Math.PI * 2) / 3]}>
            <mesh position={[0, R / 2 + 0.08, 0]} rotation={[0, 0.25, 0]} castShadow>
              <boxGeometry args={[0.2, R, 0.04]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function EscenaViento({ viento, sitio }: { viento: number; sitio: SitioId }) {
  const s = SITIOS_VIENTO.find((x) => x.id === sitio) ?? SITIOS_VIENTO[0]!;
  const r = aerogenerador(viento, densidadAire(s.altitud));
  // Rotor real: punta de aspa a ~7 veces la velocidad del viento, hasta ~16 rpm.
  const omegaReal = r.estado === "operando" || r.estado === "nominal" ? Math.min(1.7, (7 * viento) / (ROTOR_D / 2)) : 0;
  return (
    <group position={[0, -2.2, 0]}>
      <mesh position={[-4.2, -0.08, -0.4]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.16, 48]} />
        <meshStandardMaterial color={sitio === "istmo" ? "#4d7c0f" : "#a16207"} roughness={0.95} />
      </mesh>
      <Aerogenerador pos={[-4.1, 0, 0]} omega={omegaReal} />
      <Aerogenerador pos={[-6.0, 0, -2]} escala={0.55} omega={omegaReal} />
      <Aerogenerador pos={[-2.5, 0, -2.3]} escala={0.5} omega={omegaReal} />
      <Particulas
        n={40}
        color="#bfdbfe"
        tam={0.035}
        nivel={Math.min(1, viento / 12)}
        vel={0.05 + viento * 0.018}
        opacidad={0.7}
        camino={(p, i, o) => o.set(-7.2 + p * 6, 1.4 + ((i * 0.37) % 1) * 5, 0.8 + (((i * 0.61) % 1) - 0.5) * 1.6)}
        geo={GEO_CAJA}
        escalaFn={() => 1}
      />
      <Etiqueta pos={[-4.1, 7.3, 0]} df={10} fs={12} col="#60a5faaa">
        <i className="fa-solid fa-wind" style={{ color: "#60a5fa" }} />
        {num(viento, 1)} m/s · {r.estado === "calma" ? "sin arrancar" : r.estado === "corte" ? "frenado por seguridad" : r.estado === "nominal" ? "a potencia nominal" : "girando"} · <i className="fa-solid fa-bolt" style={{ color: "#22d3ee" }} /> {potencia(r.pElec)}
      </Etiqueta>
      <group position={[0, 2.2, 0]}>
        <Sankey flujo={r.flujo} x0={-1.1} x1={4.5} top={2.8} alto={2.6} titulo="Aerogenerador" leyendaX={6.4} />
      </group>
    </group>
  );
}

function TorreEnfriamiento({ pos, flujo }: { pos: Pt; flujo: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const y = (i / 12) * 1.8;
      pts.push(new THREE.Vector2(0.55 - Math.sin((i / 12) * Math.PI) * 0.18 + (i / 12) * 0.02, y));
    }
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  return (
    <group position={pos}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <Particulas
        n={26}
        color="#f8fafc"
        tam={0.16}
        nivel={Math.min(1, flujo / 120)}
        vel={0.22}
        opacidad={0.3}
        emisivo={0.1}
        camino={(p, i, o) => o.set((((i * 0.37) % 1) - 0.5) * 0.6 * (1 + p), 1.8 + p * 2.2, (((i * 0.61) % 1) - 0.5) * 0.6 * (1 + p))}
        escalaFn={(p) => 0.6 + p * 2}
      />
    </group>
  );
}

function EscenaGeotermica({ tempGeo, flujoGeo }: { tempGeo: number; flujoGeo: number }) {
  const g = geotermica(tempGeo, flujoGeo);
  const turbina = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (turbina.current) turbina.current.rotation.x += Math.min(dt, 0.1) * (2 + flujoGeo * 0.05);
  });
  const calor = (tempGeo - 150) / 170;
  const colYac = new THREE.Color("#9a3412").lerp(new THREE.Color("#fde047"), calor * 0.6).getStyle();
  return (
    <group position={[0, -0.25, 0]}>
      {/* Terreno en corte */}
      <mesh position={[-3.2, -1.2, -0.6]} receiveShadow>
        <boxGeometry args={[5.6, 2.4, 2.8]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      <mesh position={[-3.2, -0.01, -0.6]}>
        <boxGeometry args={[5.62, 0.04, 2.82]} />
        <meshStandardMaterial color="#65a30d" roughness={0.95} />
      </mesh>
      <mesh position={[-3.2, -2.05, 0.81]}>
        <planeGeometry args={[5.6, 0.55]} />
        <meshStandardMaterial color={colYac} emissive={colYac} emissiveIntensity={0.5 + calor} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[-4.9, -2.05, 1.1]} df={10} fs={10.5} col="#f97316aa">
        yacimiento · {tempGeo} °C
      </Etiqueta>
      {/* Pozo */}
      <mesh position={[-4.3, -0.95, 0.4]}>
        <cylinderGeometry args={[0.07, 0.07, 2.0, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>
      <Particulas n={14} color="#fecaca" tam={0.06} nivel={Math.min(1, flujoGeo / 100)} vel={0.6} emisivo={0.8} camino={(p, _i, o) => o.set(-4.3, -1.95 + p * 2.3, 0.52)} />
      {/* Tubería al edificio de turbina */}
      <mesh position={[-3.7, 0.45, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-4.3, 0.2, 0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Casa de máquinas abierta: turbina y generador */}
      <mesh position={[-2.6, 0.02, 0.2]} receiveShadow>
        <boxGeometry args={[1.5, 0.04, 1.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <group position={[-2.85, 0.45, 0.4]}>
        <group ref={turbina}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.45, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} rotation={[(k / 8) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[0.46, 0.66, 0.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh position={[-2.2, 0.45, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.6, 20]} />
        <meshStandardMaterial color="#0e7490" metalness={0.5} roughness={0.35} />
      </mesh>
      <Etiqueta pos={[-2.55, 1.15, 0.4]} df={10} fs={10.5} col="#22d3eeaa">
        turbina + generador
      </Etiqueta>
      <TorreEnfriamiento pos={[-1.1, 0, -0.9]} flujo={flujoGeo} />
            <Etiqueta pos={[-3.2, 2.6, 0]} df={10} fs={12} col="#22d3eeaa">
        <i className="fa-solid fa-bolt" style={{ color: "#22d3ee" }} />
        {potencia(g.pElec)} · η = {num(eficiencia(g.flujo) * 100, 1)} %
      </Etiqueta>
      <group position={[0, 0.55, 0]}>
        <Sankey flujo={g.flujo} x0={0.0} x1={4.6} top={1.6} alto={2.4} titulo="Planta geotérmica" leyendaX={6.4} />
      </group>
    </group>
  );
}

function EscenaSolar({ irradiancia, angulo }: { irradiancia: number; angulo: number }) {
  const panel = useRef<THREE.Group>(null);
  const planta = useRef<THREE.Group>(null);
  const ang = useRef(angulo);
  useFrame((_, dt) => {
    ang.current += (angulo - ang.current) * suave(dt, 0.08);
    const a = (ang.current * Math.PI) / 180;
    // El Sol está en la dirección de 50° de elevación; 0° = panel de frente a los rayos.
    if (panel.current) panel.current.rotation.x = -(Math.PI / 2 - (50 * Math.PI) / 180) - a;
    if (planta.current) planta.current.rotation.x = -a * 0.9;
  });
  const luz = irradiancia / 1000;
  const fp = panelSolar(irradiancia, angulo);
  const fh = hoja(irradiancia, angulo);
  return (
    <group position={[0, -1.8, 0]}>
      <mesh position={[-3.2, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 2.9, 0.16, 48]} />
        <meshStandardMaterial color="#65a30d" roughness={0.95} />
      </mesh>
      <Sol pos={[-3.2, 4.2, 3.4]} intensidad={luz} />
      <Particulas
        n={30}
        color="#fde047"
        tam={0.045}
        nivel={luz}
        vel={0.5}
        camino={(p, i, o) => {
          const destinoX = i % 2 === 0 ? -4.1 : -2.0;
          const destinoY = i % 2 === 0 ? 1.2 : 1.1;
          o.set(-3.2 + (destinoX - -3.2) * p + (((i * 0.37) % 1) - 0.5) * 0.8 * p, 4.2 + (destinoY - 4.2) * p, 3.4 - 3.4 * p);
        }}
      />
      {/* Panel en su soporte */}
      <mesh position={[-4.1, 0.55, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.1, 10]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={panel} position={[-4.1, 1.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.25, 1.25, 0.05]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.2} />
        </mesh>
        {Array.from({ length: 5 }, (_, k) => (
          <mesh key={`h${k}`} position={[0, -0.5 + k * 0.25, 0.028]}>
            <boxGeometry args={[1.25, 0.012, 0.005]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
        ))}
        {Array.from({ length: 5 }, (_, k) => (
          <mesh key={`v${k}`} position={[-0.5 + k * 0.25, 0, 0.028]}>
            <boxGeometry args={[0.012, 1.25, 0.005]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
        ))}
      </group>
      {/* Planta con hoja grande orientable */}
      <mesh position={[-2.0, 0.35, 0]}>
        <cylinderGeometry args={[0.28, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#9a3412" roughness={0.8} />
      </mesh>
      <mesh position={[-2.0, 0.75, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#4d7c0f" />
      </mesh>
      <group ref={planta} position={[-2.0, 1.1, 0]}>
        <mesh scale={[0.62, 0.62, 0.04]} castShadow>
          <sphereGeometry args={[1, 22, 14]} />
          <meshStandardMaterial color="#16a34a" roughness={0.5} emissive="#22c55e" emissiveIntensity={0.08 + luz * 0.15} />
        </mesh>
      </group>
      <Etiqueta pos={[-4.1, 2.3, 0]} df={10} fs={11} col="#22d3eeaa">
        <i className="fa-solid fa-bolt" style={{ color: "#22d3ee" }} />
        panel · {potencia(fp.tramos[1]!.w)}
      </Etiqueta>
      <Etiqueta pos={[-2.0, 2.0, 0]} df={10} fs={11} col="#4ade80aa">
        <i className="fa-solid fa-leaf" style={{ color: "#4ade80" }} />
        hoja · {potencia(fh.tramos[2]!.w)}
      </Etiqueta>
      <Sankey flujo={fp} x0={-0.3} x1={4.0} top={4.75} alto={1.3} titulo="Panel solar · 1 m²" leyendaX={6.3} />
      <Sankey flujo={fh} x0={-0.3} x1={4.0} top={1.55} alto={1.3} titulo="Hoja · 1 m²" leyendaX={6.3} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BANCO DE INVESTIGACIÓN (A2)
 * ════════════════════════════════════════════════════════════════════════ */

const T_ANIM = 1.25;
const N_SEG = 36;
const L_BARRA = 4.8;
const CM_A_U = L_BARRA / 30;
const COL_FRIO = new THREE.Color("#475569");
const COL_TIBIO = new THREE.Color("#f97316");
const COL_CALIENTE = new THREE.Color("#fde047");

function Mesa({ children }: { children: ReactNode }) {
  return (
    <group position={[0, -1.4, 0]}>
      <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.2, 3.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {[
        [-4.2, -1.6],
        [4.2, -1.6],
        [-4.2, 1.6],
        [4.2, 1.6],
      ].map(([x, z], k) => (
        <mesh key={k} position={[x!, -1.1, z!]}>
          <boxGeometry args={[0.15, 1.8, 0.15]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
      {children}
    </group>
  );
}

function Pantalla({ pos, refSpan, inicial, col }: { pos: Pt; refSpan: RefObject<HTMLSpanElement | null>; inicial: string; col: string }) {
  return (
    <Html position={pos} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ padding: "7px 12px", borderRadius: 9, background: "#020617", border: `2px solid ${col}`, color: col, fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", boxShadow: `0 0 18px -6px ${col}` }}>
        <span ref={refSpan}>{inicial}</span>
      </div>
    </Html>
  );
}

function BancoConduccion({ viIdx, nivelIdx, midiendo, medido, clave }: { viIdx: number; nivelIdx: number; midiendo: boolean; medido: boolean; clave: string }) {
  const inv = INVESTIGACIONES[0]!;
  const op = inv.vis[viIdx]!;
  const nivel = op.niveles[Math.max(0, nivelIdx)]!;
  const porDistancia = op.id === "distancia";
  const distCm = porDistancia ? nivel.v : X_FIJA_CM;
  const mat = porDistancia ? MATERIALES[3] : (MATERIALES.find((m) => m.k === nivel.v) ?? MATERIALES[3]);
  const alfa = mat.alfa;
  const tFinal = op.modelo(nivel);
  const barra = useRef<THREE.InstancedMesh>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const t = useRef(0);
  const ultima = useRef("");
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const base = useMemo(() => new THREE.Color(mat.color), [mat.color]);
  useFrame((_, dt) => {
    if (ultima.current !== clave) {
      ultima.current = clave;
      t.current = 0;
    }
    if (midiendo) t.current += Math.min(dt, 0.25);
    const frac = medido ? 1 : midiendo ? Math.min(1, t.current / T_ANIM) : 0;
    const s = tFinal * frac;
    const mesh = barra.current;
    if (mesh) {
      for (let i = 0; i < N_SEG; i++) {
        const xm = ((i + 0.5) / N_SEG) * 0.3;
        const T = tempBarra(alfa, xm, s);
        obj.position.set(-2.2 + ((i + 0.5) / N_SEG) * L_BARRA, 1.0, 0);
        obj.scale.set(L_BARRA / N_SEG + 0.002, 0.14, 0.14);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
        const f = (T - 20) / 80;
        if (f < 0.5) tmp.copy(base).lerp(COL_TIBIO, Math.min(1, f * 2) * 0.9);
        else tmp.copy(COL_TIBIO).lerp(COL_CALIENTE, (f - 0.5) * 2);
        if (f < 0.02) tmp.copy(base).lerp(COL_FRIO, 0.15);
        mesh.setColorAt(i, tmp);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    if (lectura.current) {
      const T = tempBarra(alfa, distCm / 100, s);
      lectura.current.textContent = `${num(frac >= 1 ? T_SENSOR : T, 1)} °C · t = ${num(s, s < 100 ? 1 : 0)} s${frac >= 1 ? " ✓" : ""}`;
    }
  });
  const xSensor = -2.2 + distCm * CM_A_U;
  return (
    <Mesa>
      {/* Parrilla, vaso con agua hirviendo */}
      <mesh position={[-3.2, 0.12, 0]} castShadow>
        <boxGeometry args={[1.2, 0.24, 1.2]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
      </mesh>
      <mesh position={[-3.2, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.42, 32]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      <mesh position={[-3.2, 0.95, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 32, 1, true]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[-3.2, 0.8, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 1.05, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.45} roughness={0.1} depthWrite={false} />
      </mesh>
      <Particulas n={18} color="#f0f9ff" tam={0.04} nivel={1} vel={0.9} emisivo={0.3} camino={(p, i, o) => o.set(-3.2 + (((i * 0.37) % 1) - 0.5) * 0.7, 0.35 + p * 0.95, (((i * 0.61) % 1) - 0.5) * 0.7)} />
      <Etiqueta pos={[-3.2, 1.95, 0]} df={10} fs={10.5} col="#38bdf8aa">
        agua a 100 °C
      </Etiqueta>
      {/* Barra por segmentos (color = temperatura) */}
      <instancedMesh key={mat.id} ref={barra} args={[GEO_CAJA, undefined, N_SEG]} castShadow frustumCulled={false}>
        <meshStandardMaterial metalness={0.6} roughness={0.3} emissive="#000000" />
      </instancedMesh>
      <mesh position={[-2.75, 1.0, 0]}>
        <boxGeometry args={[1.1, 0.14, 0.14]} />
        <meshStandardMaterial color={mat.color} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0.3, 1.8].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.08, 1.0, 0.3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      {/* Regla */}
      <mesh position={[0.2, 0.62, 0.3]}>
        <boxGeometry args={[L_BARRA, 0.02, 0.18]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} position={[-2.2 + k * 5 * CM_A_U, 0.64, 0.25]}>
          <boxGeometry args={[0.02, 0.01, 0.1]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
      {/* Sensor */}
      <group position={[xSensor, 1.0, 0]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.12, 0.2, 0.22]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.9, 6]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
      </group>
      <Pantalla pos={[xSensor, 1.55, 0]} refSpan={lectura} inicial="20.0 °C · t = 0.0 s" col="#a78bfa" />
      <Etiqueta pos={[0.4, 0.3, 1.25]} df={10} fs={10.5}>
        {mat.etq} · sensor a {distCm} cm · el tiempo real se muestra acelerado
      </Etiqueta>
    </Mesa>
  );
}

function BancoPanel({ viIdx, nivelIdx, midiendo, medido, clave }: { viIdx: number; nivelIdx: number; midiendo: boolean; medido: boolean; clave: string }) {
  const op = INVESTIGACIONES[1]!.vis[viIdx]!;
  const nivel = op.niveles[Math.max(0, nivelIdx)]!;
  const porAngulo = op.id === "angulo";
  const anguloObj = porAngulo ? nivel.v : 0;
  const tempObj = porAngulo ? 25 : nivel.v;
  const valor = op.modelo(nivel);
  const panel = useRef<THREE.Group>(null);
  const matPanel = useRef<THREE.MeshStandardMaterial>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const ang = useRef(anguloObj);
  const t = useRef(0);
  const ultima = useRef("");
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    if (ultima.current !== clave) {
      ultima.current = clave;
      t.current = 0;
    }
    if (midiendo) t.current += Math.min(dt, 0.25);
    ang.current += (anguloObj - ang.current) * suave(dt, 0.1);
    if (panel.current) panel.current.rotation.z = (ang.current * Math.PI) / 180;
    const frac = medido ? 1 : midiendo ? Math.min(1, t.current / T_ANIM) : 0;
    if (matPanel.current) matPanel.current.emissive = tmp.set("#ef4444").multiplyScalar(((tempObj - 25) / 45) * 0.45);
    if (lectura.current) lectura.current.textContent = frac <= 0 ? `${porAngulo ? "P = — W" : "η = — %"}` : porAngulo ? `P = ${num(valor * frac, 1)} W${frac >= 1 ? " ✓" : ""}` : `η = ${num(valor * (0.7 + 0.3 * frac), 2)} %${frac >= 1 ? " ✓" : ""}`;
  });
  return (
    <Mesa>
      {/* Simulador solar: los rayos bajan verticales */}
      <mesh position={[0.4, 3.3, 0]}>
        <boxGeometry args={[2.6, 0.18, 1.6]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={2} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Particulas n={34} color="#fde047" tam={0.035} nivel={1} vel={0.7} camino={(p, i, o) => o.set(-0.7 + ((i * 0.37) % 1) * 2.2, 3.1 - p * 1.95, (((i * 0.61) % 1) - 0.5) * 1.2)} />
      <Etiqueta pos={[-1.6, 3.3, 0]} df={10} fs={10.5} col="#fde047aa">
        simulador solar · 1 000 W/m²
      </Etiqueta>
      {/* Panel en bisagra */}
      <mesh position={[0.4, 0.55, 0]}>
        <boxGeometry args={[0.12, 1.1, 0.12]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
      <group ref={panel} position={[0.4, 1.12, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.05, 1.1]} />
          <meshStandardMaterial ref={matPanel} color="#1e3a8a" metalness={0.6} roughness={0.2} />
        </mesh>
        {Array.from({ length: 5 }, (_, k) => (
          <mesh key={k} position={[-0.72 + k * 0.36, 0.028, 0]}>
            <boxGeometry args={[0.01, 0.005, 1.1]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
        ))}
      </group>
      <Etiqueta pos={[2.3, 1.6, 0.6]} df={10} fs={10.5} col="#a78bfaaa">
        {porAngulo ? `ángulo con los rayos: ${anguloObj}°` : `panel a ${tempObj} °C`}
      </Etiqueta>
      <mesh position={[-1.1, 0.02, 0.4]}>
        <boxGeometry args={[3.0, 0.03, 0.03]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.4, 0.3, 0.4]}>
        <boxGeometry args={[0.03, 0.55, 0.03]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* Multímetro */}
      <mesh position={[-2.6, 0.35, 0.4]} castShadow>
        <boxGeometry args={[0.8, 0.7, 0.2]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>
      <Pantalla pos={[-2.6, 1.15, 0.4]} refSpan={lectura} inicial={porAngulo ? "P = — W" : "η = — %"} col="#22d3ee" />
      {!porAngulo && (
        <mesh position={[2.6, 0.5, -0.6]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 10]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3 + ((tempObj - 25) / 45) * 1.2} />
        </mesh>
      )}
    </Mesa>
  );
}

function Aparato({ id }: { id: string }) {
  if (id === "led")
    return (
      <group position={[0, 0.5, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.3, 20, 16]} />
          <meshStandardMaterial color="#fefce8" emissive="#fde047" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.3, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
    );
  if (id === "laptop")
    return (
      <group position={[0, 0.06, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.05, 0.8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, -0.42]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[1.2, 0.8, 0.04]} />
          <meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  if (id === "licuadora")
    return (
      <group>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.32, 0.22, 0.9, 20]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.5} roughness={0.05} />
        </mesh>
      </group>
    );
  if (id === "plancha")
    return (
      <group position={[0, 0.1, 0]}>
        <mesh scale={[1, 0.35, 0.55]}>
          <sphereGeometry args={[0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <torusGeometry args={[0.22, 0.05, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  return (
    <group position={[0, 0.1, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.6, 0.95, 0.06]} />
        <meshStandardMaterial color="#0f172a" emissive="#1d4ed8" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function BancoConsumo({ viIdx, nivelIdx, midiendo, medido, clave }: { viIdx: number; nivelIdx: number; midiendo: boolean; medido: boolean; clave: string }) {
  const op = INVESTIGACIONES[2]!.vis[viIdx]!;
  const nivel = op.niveles[Math.max(0, nivelIdx)]!;
  const porTiempo = op.id === "tiempo";
  const aparato = porTiempo ? APARATOS[2] : (APARATOS.find((a) => a.w === nivel.v) ?? APARATOS[2]);
  const horas = porTiempo ? nivel.v : 1;
  const energia = op.modelo(nivel);
  const manecilla = useRef<THREE.Group>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const t = useRef(0);
  const ultima = useRef("");
  useFrame((_, dt) => {
    if (ultima.current !== clave) {
      ultima.current = clave;
      t.current = 0;
    }
    if (midiendo) t.current += Math.min(dt, 0.25);
    const frac = medido ? 1 : midiendo ? Math.min(1, t.current / T_ANIM) : 0;
    if (manecilla.current) manecilla.current.rotation.z = -(horas * frac) * ((Math.PI * 2) / 12) * 12;
    if (lectura.current) lectura.current.textContent = `${num(energia * frac, 3)} kWh · ${num(horas * frac, 2)} h${frac >= 1 ? " ✓" : ""}`;
  });
  return (
    <Mesa>
      <mesh position={[0, 1.6, -1.95]} receiveShadow>
        <boxGeometry args={[9, 3.4, 0.1]} />
        <meshStandardMaterial color="#1c2a40" roughness={0.9} />
      </mesh>
      <group position={[-1.0, 0, 0]}>
        <Aparato id={aparato.id} />
      </group>
      <Etiqueta pos={[-1.0, 2.0, 0]} df={10} fs={11} col="#a78bfaaa">
        {aparato.etq} · {num(aparato.w)} W
      </Etiqueta>
      {/* Cable, medidor y contacto */}
      <mesh position={[0.6, 0.03, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.6, 6]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[1.7, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.35]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <Pantalla pos={[1.7, 1.05, 0.2]} refSpan={lectura} inicial="0.000 kWh" col="#22d3ee" />
      <mesh position={[2.6, 0.7, -1.87]}>
        <boxGeometry args={[0.4, 0.55, 0.06]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Etiqueta pos={[2.6, 1.25, -1.7]} df={10} fs={10.5}>
        contacto 127 V
      </Etiqueta>
      {/* Reloj */}
      <group position={[-3.2, 2.2, -1.84]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {Array.from({ length: 12 }, (_, k) => (
          <mesh key={k} position={[Math.sin((k / 12) * Math.PI * 2) * 0.45, Math.cos((k / 12) * Math.PI * 2) * 0.45, 0.05]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        ))}
        <group ref={manecilla} position={[0, 0, 0.06]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.03, 0.38, 0.01]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>
      </group>
    </Mesa>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function TiposEnergiaScene(p: TiposEnergiaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const sub = vista === "fenomenos" ? p.fenomenoId : vista === "tecnologia" ? p.tecId : p.invId;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (sub === "tormenta") return { pos: [1.2, 3.8, 10.2], target: [0, 1.0, 0] };
    if (sub === "brisa") return { pos: [0, 3.6, 10.4], target: [0, 0.9, 0] };
    if (sub === "volcan") return { pos: [0.6, 3.0, 12.6], target: [0, 1.5, 0] };
    if (sub === "fotosintesis") return { pos: [0.6, 3.2, 9.4], target: [0, 0.8, 0] };
    if (sub === "aerogenerador") return { pos: [0.6, 2.2, 13.4], target: [0.4, 1.4, 0] };
    if (sub === "geotermica") return { pos: [0.6, 2.4, 12.8], target: [0.5, 0.7, 0] };
    if (sub === "solar") return { pos: [0.6, 1.8, 12.6], target: [0.4, 0.9, 0] };
    return { pos: [0.4, 2.7, 7.6], target: [0, -0.1, 0] };
  }, [sub]);
  const clave = `${p.nivelIdx}-${p.ensayoNonce}`;
  const fondo = vista === "fenomenos" && p.fenomenoId === "brisa" && p.noche ? "#020617" : vista === "fenomenos" && p.fenomenoId === "tormenta" && p.etapa >= 3 ? "#050a14" : "#040a16";

  return (
    <Canvas key={`${vista}-${sub}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[fondo]} />
      <fog attach="fog" args={[fondo, 20, 44]} />
      <ambientLight intensity={vista === "fenomenos" && p.fenomenoId === "brisa" && p.noche ? 0.3 : 0.55} />
      <directionalLight position={[4, 9, 6]} intensity={vista === "fenomenos" && p.fenomenoId === "brisa" && p.noche ? 0.35 : 1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "fenomenos" && p.fenomenoId === "tormenta" && <EscenaTormenta etapa={p.etapa} distanciaKm={p.distanciaKm} rayoNonce={p.rayoNonce} />}
      {vista === "fenomenos" && p.fenomenoId === "brisa" && <EscenaBrisa etapa={p.etapa} noche={p.noche} />}
      {vista === "fenomenos" && p.fenomenoId === "volcan" && <EscenaVolcan etapa={p.etapa} magma={p.magma} />}
      {vista === "fenomenos" && p.fenomenoId === "fotosintesis" && <EscenaFotosintesis etapa={p.etapa} luzPct={p.luzPct} />}

      {vista === "tecnologia" && p.tecId === "aerogenerador" && <EscenaViento viento={p.viento} sitio={p.sitio} />}
      {vista === "tecnologia" && p.tecId === "geotermica" && <EscenaGeotermica tempGeo={p.tempGeo} flujoGeo={p.flujoGeo} />}
      {vista === "tecnologia" && p.tecId === "solar" && <EscenaSolar irradiancia={p.irradiancia} angulo={p.angulo} />}

      {vista === "investigacion" && p.invId === "conduccion" && <BancoConduccion viIdx={p.viIdx} nivelIdx={p.nivelIdx} midiendo={p.midiendo} medido={p.medido} clave={clave} />}
      {vista === "investigacion" && p.invId === "panel" && <BancoPanel viIdx={p.viIdx} nivelIdx={p.nivelIdx} midiendo={p.midiendo} medido={p.medido} clave={clave} />}
      {vista === "investigacion" && p.invId === "consumo" && <BancoConsumo viIdx={p.viIdx} nivelIdx={p.nivelIdx} midiendo={p.midiendo} medido={p.medido} clave={clave} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={22} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
