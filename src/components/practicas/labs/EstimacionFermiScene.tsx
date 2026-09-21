"use client";

/**
 * Escena 3D del laboratorio "Estimación y órdenes de magnitud" (PM-I, P10).
 * Tres vistas:
 *
 *  - fermi: la cantidad se construye con los factores que estimó el alumno
 *    (el salón se llena de metros cúbicos y un litro ampliado muestra las
 *    canicas; el costal y la báscula de cocina con 100 granos; el cubo con el
 *    agua de un día junto a la Torre Latinoamericana) y, al frente, una regla
 *    logarítmica con la estimación, su rango y el dato real.
 *  - redondeo: una pista con valles en los múltiplos de la unidad elegida
 *    (redondear) o una rampa hacia el cero (truncar) por la que rueda una
 *    canica; o el modelo de área de un producto exacto frente al estimado.
 *  - razonable: dos pilas de objetos (tu estimación y el resultado dado) y un
 *    medidor logarítmico de cuántas veces difieren.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type VisualFermi,
  type Metodo,
  type ObjetoId,
  PROBLEMAS,
  NUMEROS,
  OPERACIONES,
  CASOS,
  vecinos,
  resultadoMetodo,
  decimalesDe,
  errorRelativo,
  exponente,
  sup,
  num,
  cantidad,
  canicasEnSalon,
  TORRE_LATINO_M,
} from "./estimacion-fermi-data";

export type VistaFermi = "fermi" | "redondeo" | "razonable";

export interface EstimacionSceneProps {
  vista: VistaFermi;
  modoColor: string;
  resetNonce: number;
  // Fermi
  problemaId: VisualFermi;
  valores: number[];
  estimacion: number;
  rango: [number, number];
  /** Dato real, solo cuando ya se reveló. */
  real: number | null;
  // Redondeo
  subRedondeo: "numero" | "operacion";
  numeroId: string;
  metodo: Metodo;
  soltado: boolean;
  prediccion: number | null;
  operacionId: string;
  elegidoA: number;
  elegidoB: number;
  // Razonable
  casoId: string;
  estimacionAlumno: number | null;
  dictaminado: boolean;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";
const ORO = "#fbbf24";

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

/* ── Geometrías constantes ────────────────────────────────────────────── */

const G_CUBO = new THREE.BoxGeometry(1, 1, 1);
const G_ESFERA = new THREE.SphereGeometry(1, 10, 8);
const G_ESFERA_FINA = new THREE.SphereGeometry(1, 22, 16);
const G_GRANO = new THREE.SphereGeometry(1, 9, 7);
const G_ARISTAS = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));

const PERFIL_COSTAL = new THREE.LatheGeometry(
  [
    [0.0, 0],
    [0.8, 0.02],
    [1.02, 0.25],
    [1.1, 0.9],
    [1.08, 1.7],
    [1.0, 2.3],
    [0.93, 2.55],
    [0.97, 2.62],
  ].map(([x, y]) => new THREE.Vector2(x!, y!)),
  36,
);

/** Pista de redondeo: valle en cada extremo y cima a la mitad. */
function pistaGeo(forma: "cima" | "bajaIzq" | "bajaDer"): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const N = 64;
  s.moveTo(-PISTA_W / 2 - 0.5, -0.5);
  s.lineTo(-PISTA_W / 2 - 0.5, alturaPista(forma, 0) + 0.35);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    s.lineTo(-PISTA_W / 2 + t * PISTA_W, alturaPista(forma, t));
  }
  s.lineTo(PISTA_W / 2 + 0.5, alturaPista(forma, 1) + 0.35);
  s.lineTo(PISTA_W / 2 + 0.5, -0.5);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: false });
  g.translate(0, 0, -0.7);
  return g;
}
const PISTA_W = 9;
const PISTA_H = 1.25;
function alturaPista(forma: "cima" | "bajaIzq" | "bajaDer", t: number): number {
  if (forma === "cima") return PISTA_H * Math.sin(Math.PI * t);
  if (forma === "bajaIzq") return PISTA_H * 0.9 * t;
  return PISTA_H * 0.9 * (1 - t);
}
const G_PISTA = { cima: pistaGeo("cima"), bajaIzq: pistaGeo("bajaIzq"), bajaDer: pistaGeo("bajaDer") };

const OBJ_GEO: Record<ObjetoId, { g: THREE.BufferGeometry; alto: number; color: string }> = {
  bus: { g: new THREE.BoxGeometry(0.32, 0.15, 0.15), alto: 0.16, color: "#facc15" },
  seccion: { g: new THREE.BoxGeometry(0.3, 0.16, 0.3), alto: 0.17, color: "#94a3b8" },
  fajo: { g: new THREE.BoxGeometry(0.32, 0.06, 0.16), alto: 0.065, color: "#22c55e" },
  billete: { g: new THREE.BoxGeometry(0.32, 0.02, 0.16), alto: 0.025, color: "#ec4899" },
  rollo: { g: new THREE.CylinderGeometry(0.07, 0.07, 0.3, 14).rotateZ(Math.PI / 2), alto: 0.15, color: "#c084fc" },
  capsula: { g: new THREE.CapsuleGeometry(0.055, 0.16, 4, 10).rotateZ(Math.PI / 2), alto: 0.12, color: "#f8fafc" },
  vaso: { g: new THREE.CylinderGeometry(0.08, 0.06, 0.2, 14), alto: 0.21, color: "#7dd3fc" },
  bolsa: { g: new THREE.BoxGeometry(0.22, 0.26, 0.15), alto: 0.27, color: "#fde68a" },
  moneda: { g: new THREE.CylinderGeometry(0.12, 0.12, 0.035, 20), alto: 0.04, color: "#eab308" },
  barra: { g: new THREE.BoxGeometry(0.3, 0.1, 0.3), alto: 0.105, color: "#fb7185" },
  loseta: { g: new THREE.BoxGeometry(0.32, 0.03, 0.32), alto: 0.035, color: "#a8a29e" },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. PROBLEMAS DE FERMI
 * ════════════════════════════════════════════════════════════════════════ */

const DEC_W = 1.02;
const Z_REGLA = 3.0;

/** Regla logarítmica: una década por tramo; estimación, rango y dato real. */
function ReglaLog({ centro, estimacion, rango, real, modoColor }: { centro: number; estimacion: number; rango: [number, number]; real: number | null; modoColor: string }) {
  const X = (v: number) => Math.max(-4.9, Math.min(4.9, (Math.log10(Math.max(v, 1e-30)) - centro) * DEC_W));
  const marca = useRef<THREE.Group>(null);
  const banda = useRef<THREE.Mesh>(null);
  const oro = useRef<THREE.Group>(null);
  const caida = useRef(0);
  useFrame(({ clock }, dt) => {
    if (marca.current) {
      marca.current.position.x += (X(estimacion) - marca.current.position.x) * suave(dt, 0.12);
      marca.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 2.2) * 0.04;
    }
    if (banda.current) {
      const a = X(rango[0]);
      const b = X(rango[1]);
      const ancho = Math.max(0.05, b - a);
      banda.current.scale.x += (ancho - banda.current.scale.x) * suave(dt, 0.12);
      banda.current.position.x += ((a + b) / 2 - banda.current.position.x) * suave(dt, 0.12);
    }
    if (oro.current) {
      caida.current = real !== null ? Math.min(1, caida.current + dt * 1.4) : 0;
      oro.current.visible = real !== null;
      if (real !== null) oro.current.position.x = X(real);
      const k = 1 - Math.pow(1 - caida.current, 3);
      oro.current.position.y = 2.4 - k * 1.85;
      oro.current.rotation.y = clock.elapsedTime * 1.4;
    }
  });
  const ticks: number[] = [];
  for (let n = centro - 4; n <= centro + 4; n++) ticks.push(n);
  return (
    <group position={[0, 0, Z_REGLA]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[10.4, 0.12, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
      {ticks.map((n) => (
        <group key={n} position={[(n - centro) * DEC_W, 0, 0]}>
          <mesh position={[0, 0.16, 0.18]}>
            <boxGeometry args={[0.03, 0.1, 0.12]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
          {[2, 3, 4, 5, 6, 7, 8, 9].map((k) =>
            n < centro + 4 ? (
              <mesh key={k} position={[Math.log10(k) * DEC_W, 0.14, 0.2]}>
                <boxGeometry args={[0.012, 0.05, 0.06]} />
                <meshBasicMaterial color="#64748b" />
              </mesh>
            ) : null,
          )}
          <Html position={[0, -0.08, 0.5]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ color: n === centro ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}>10{sup(n)}</div>
          </Html>
        </group>
      ))}
      <mesh ref={banda} position={[0, 0.15, -0.05]}>
        <boxGeometry args={[1, 0.08, 0.36]} />
        <meshStandardMaterial color={modoColor} transparent opacity={0.35} emissive={modoColor} emissiveIntensity={0.4} depthWrite={false} />
      </mesh>
      <group ref={marca} position={[0, 0.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 22, 16]} />
          <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
          <meshBasicMaterial color={modoColor} />
        </mesh>
        <Etiqueta pos={[0, 0.42, 0]} df={10} col={`${modoColor}aa`} fs={11}>
          Tu estimación · {cantidad(estimacion)}
        </Etiqueta>
      </group>
      <group ref={oro} position={[0, 2.4, -0.02]} visible={false}>
        <mesh castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.7} metalness={0.6} roughness={0.25} />
        </mesh>
        {real !== null && (
          <Etiqueta pos={[0, 1.12, -0.3]} df={10} col={`${ORO}aa`} fs={11}>
            <i className="fa-solid fa-flag-checkered" style={{ color: ORO }} />
            Dato real · {cantidad(real)}
          </Etiqueta>
        )}
      </group>
      <Etiqueta pos={[-5.6, 0.2, 0]} df={11} fs={10}>
        ×10 por tramo
      </Etiqueta>
    </group>
  );
}

/* ── Salón ─────────────────────────────────────────────────────────────── */

const MAX_CUBOS = 16 * 12 * 5;
const MAX_CANICAS = 16 * 16 * 16;
const LADO_LITRO = 1.5;

function EscenaSalon({ valores, modoColor }: { valores: number[]; modoColor: string }) {
  const [L = 8, A = 6, H = 3, d = 1.6, phi = 0.64] = valores;
  const s = Math.min(6.2 / L, 4.4 / A, 3.0 / H);
  const nx = Math.floor(L);
  const nz = Math.floor(A);
  const ny = Math.floor(H);
  const total = nx * ny * nz;
  const firma = `${L}-${A}-${H}`;
  const cubos = useRef<THREE.InstancedMesh>(null);
  const canicas = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const previa = useRef("");
  const lectura = useRef<HTMLSpanElement>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);

  // Canicas en un litro (cubo de 10 cm): N = 1000 cm³ · φ ÷ volumen de una canica.
  const porLitro = canicasEnSalon(0.1, 0.1, 0.1, d, phi);
  const nE = Math.max(2, Math.min(16, Math.round(Math.cbrt(porLitro))));
  const firmaCanicas = `${nE}-${phi}`;
  const previaCanicas = useRef("");

  useFrame((_, dt) => {
    if (previa.current !== firma) {
      previa.current = firma;
      t.current = 0;
    }
    t.current += dt;
    const mesh = cubos.current;
    if (mesh) {
      const visibles = Math.min(total, Math.floor((t.current / 2.4) * total));
      let i = 0;
      for (let y = 0; y < ny; y++)
        for (let z = 0; z < nz; z++)
          for (let x = 0; x < nx; x++) {
            obj.position.set((-L / 2 + x + 0.5) * s, (y + 0.5) * s, (-A / 2 + z + 0.5) * s);
            obj.scale.setScalar(i < visibles ? s * 0.9 : 0.0001);
            obj.updateMatrix();
            mesh.setMatrixAt(i, obj.matrix);
            i++;
          }
      for (; i < MAX_CUBOS; i++) {
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (lectura.current) lectura.current.textContent = `${Math.min(total, Math.floor((t.current / 2.4) * total))} m³ completos llenos`;
    const cm = canicas.current;
    if (cm && previaCanicas.current !== firmaCanicas) {
      previaCanicas.current = firmaCanicas;
      const a = LADO_LITRO / nE;
      const r = a * 0.5 * Math.cbrt((6 * phi) / Math.PI);
      let k = 0;
      for (let y = 0; y < nE; y++)
        for (let z = 0; z < nE; z++)
          for (let x = 0; x < nE; x++) {
            const desf = y % 2 ? a * 0.18 : 0;
            obj.position.set(-LADO_LITRO / 2 + (x + 0.5) * a + desf, (y + 0.5) * a, -LADO_LITRO / 2 + (z + 0.5) * a + desf);
            obj.scale.setScalar(Math.min(r, a * 0.5));
            obj.updateMatrix();
            cm.setMatrixAt(k, obj.matrix);
            k++;
          }
      for (; k < MAX_CANICAS; k++) {
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        cm.setMatrixAt(k, obj.matrix);
      }
      cm.instanceMatrix.needsUpdate = true;
    }
  });

  const W = L * s;
  const D = A * s;
  const Hs = H * s;
  return (
    <group>
      <group position={[-1.3, 0, -0.6]}>
        {/* Piso, paredes y detalles del salón */}
        <mesh position={[0, -0.03, 0]} receiveShadow>
          <boxGeometry args={[W + 0.1, 0.06, D + 0.1]} />
          <meshStandardMaterial color="#8b7355" roughness={0.85} />
        </mesh>
        <mesh position={[0, Hs / 2, -D / 2 - 0.04]} receiveShadow>
          <boxGeometry args={[W + 0.1, Hs, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
        <mesh position={[-W / 2 - 0.04, Hs / 2, 0]} receiveShadow>
          <boxGeometry args={[0.08, Hs, D + 0.1]} />
          <meshStandardMaterial color="#b6c2d1" roughness={0.9} />
        </mesh>
        <mesh position={[-W * 0.12, Hs * 0.55, -D / 2 + 0.01]}>
          <boxGeometry args={[Math.min(4 * s, W * 0.5), 1.2 * s, 0.03]} />
          <meshStandardMaterial color="#14532d" roughness={0.7} />
        </mesh>
        <mesh position={[W / 2 - 0.9 * s, 1.05 * s, -D / 2 + 0.01]}>
          <boxGeometry args={[0.95 * s, 2.1 * s, 0.03]} />
          <meshStandardMaterial color="#7c4a21" roughness={0.6} />
        </mesh>
        {[0.3, 0.62].map((f) => (
          <mesh key={f} position={[-W / 2 + 0.01, Hs * 0.58, -D / 2 + D * f]}>
            <boxGeometry args={[0.03, 1.1 * s, 1.5 * s]} />
            <meshStandardMaterial color="#bae6fd" emissive="#7dd3fc" emissiveIntensity={0.35} roughness={0.1} />
          </mesh>
        ))}
        {/* Metros cúbicos que se van llenando */}
        <instancedMesh ref={cubos} args={[G_CUBO, undefined, MAX_CUBOS]} frustumCulled={false}>
          <meshStandardMaterial color={modoColor} transparent opacity={0.42} emissive={modoColor} emissiveIntensity={0.25} roughness={0.3} depthWrite={false} />
        </instancedMesh>
        {/* Contorno del volumen total */}
        <lineSegments geometry={G_ARISTAS} position={[0, Hs / 2, 0]} scale={[W, Hs, D]}>
          <lineBasicMaterial color="#e2e8f0" transparent opacity={0.7} />
        </lineSegments>
        <Etiqueta pos={[0, Hs + 0.05, D / 2 + 0.05]} df={10} fs={11}>
          largo {num(L, 1)} m
        </Etiqueta>
        <Etiqueta pos={[W / 2 + 0.45, 0, 0]} df={10} fs={11}>
          ancho {num(A, 1)} m
        </Etiqueta>
        <Etiqueta pos={[-W / 2 - 0.55, Hs / 2, D / 2]} df={10} fs={11}>
          alto {num(H, 1)} m
        </Etiqueta>
        <Etiqueta pos={[0, Hs + 0.45, -D / 2]} df={10} col={`${modoColor}aa`} fs={11.5}>
          <i className="fa-solid fa-cube" style={{ color: modoColor }} />
          {num(L * A * H, 1)} m³ = {num(L * A * H * 1000, 0)} L · <span ref={lectura}>0 m³ completos llenos</span>
        </Etiqueta>
      </group>

      {/* Un litro ampliado */}
      <group position={[4.3, 0.02, 0.9]}>
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[LADO_LITRO + 0.3, 0.1, LADO_LITRO + 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <instancedMesh ref={canicas} args={[G_ESFERA, undefined, MAX_CANICAS]} frustumCulled={false}>
          <meshStandardMaterial color="#60a5fa" roughness={0.12} metalness={0.15} emissive="#1d4ed8" emissiveIntensity={0.15} />
        </instancedMesh>
        <lineSegments geometry={G_ARISTAS} position={[0, LADO_LITRO / 2, 0]} scale={[LADO_LITRO, LADO_LITRO, LADO_LITRO]}>
          <lineBasicMaterial color="#e2e8f0" />
        </lineSegments>
        <mesh position={[0, LADO_LITRO / 2, 0]}>
          <boxGeometry args={[LADO_LITRO, LADO_LITRO, LADO_LITRO]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.08} depthWrite={false} />
        </mesh>
        <Etiqueta pos={[0, LADO_LITRO + 0.45, 0]} df={10} col={`${modoColor}aa`} fs={11}>
          <i className="fa-solid fa-magnifying-glass-plus" style={{ color: modoColor }} />1 L (10 cm por lado) ≈ {num(porLitro, 0)} canicas
        </Etiqueta>
        <Etiqueta pos={[0, -0.35, LADO_LITRO / 2 + 0.3]} df={11} fs={10}>
          canica de {num(d, 1)} cm · ocupan {Math.round(phi * 100)} %
          {nE ** 3 < porLitro * 0.8 ? ` · dibujadas ${num(nE ** 3)}` : ""}
        </Etiqueta>
      </group>
    </group>
  );
}

/* ── Costal de maíz ───────────────────────────────────────────────────── */

const N_GRANOS_PLATO = 100;
const N_CHORRO = 26;

function EscenaCostal({ valores }: { valores: number[] }) {
  const [kg = 50, m = 0.33] = valores;
  const f = Math.cbrt(m / 0.33);
  const plato = useRef<THREE.InstancedMesh>(null);
  const chorro = useRef<THREE.InstancedMesh>(null);
  const grande = useRef<THREE.Group>(null);
  const tam = useRef(f);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semillas = useMemo(
    () =>
      Array.from({ length: N_GRANOS_PLATO }, (_, i) => {
        const a = i * 2.39996;
        const r = Math.sqrt(i / N_GRANOS_PLATO);
        return { a, r, capa: i, rot: (i * 0.7) % Math.PI, fase: (i * 0.618) % 1 };
      }),
    [],
  );
  useFrame(({ clock }, dt) => {
    tam.current += (f - tam.current) * suave(dt, 0.1);
    const g = tam.current;
    const mesh = plato.current;
    if (mesh) {
      // Montón de 100 granos: el radio del montón crece con el tamaño del grano.
      const radio = Math.min(0.72, 0.36 * g + 0.08);
      semillas.forEach((sd, i) => {
        const alto = (1 - sd.r) * 0.28 * g + 0.04 * g;
        obj.position.set(Math.cos(sd.a) * sd.r * radio, 0.42 + alto, Math.sin(sd.a) * sd.r * radio);
        obj.rotation.set(sd.rot, sd.a, 0.3);
        obj.scale.set(0.055 * g, 0.03 * g, 0.042 * g);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    const ch = chorro.current;
    if (ch) {
      semillas.slice(0, N_CHORRO).forEach((sd, i) => {
        const p = (clock.elapsedTime * 0.55 + sd.fase) % 1;
        obj.position.set(-2.4 + Math.sin(i * 3.1) * 0.12, 5.2 - p * 2.3, -0.6 + Math.cos(i * 1.7) * 0.12);
        obj.rotation.set(p * 6 + i, i, 0);
        obj.scale.set(0.07, 0.04, 0.055);
        obj.updateMatrix();
        ch.setMatrixAt(i, obj.matrix);
      });
      ch.instanceMatrix.needsUpdate = true;
    }
    if (grande.current) {
      grande.current.scale.setScalar(g);
      grande.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.5;
    }
  });
  const granos = (kg * 1000) / m;
  return (
    <group>
      {/* Báscula de plataforma y costal */}
      <group position={[-2.4, 0, -0.6]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.3, 2.6]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[1.25, 1.0, -1.15]}>
          <boxGeometry args={[0.12, 1.7, 0.12]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[1.25, 1.95, -1.15]}>
          <boxGeometry args={[0.9, 0.5, 0.18]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Html position={[1.25, 1.95, -1.04]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#4ade80", fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 900, textShadow: "0 0 8px #22c55e" }}>{num(kg)} kg</div>
        </Html>
        <mesh geometry={PERFIL_COSTAL} position={[0, 0.3, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#b08d57" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 2.88, 0]} castShadow>
          <coneGeometry args={[0.95, 0.5, 30]} />
          <meshStandardMaterial color="#f2c230" roughness={0.7} />
        </mesh>
        {[0.95, 1.75].map((y) => (
          <mesh key={y} position={[0, 0.3 + y, 0]}>
            <torusGeometry args={[1.1, 0.02, 6, 40]} />
            <meshStandardMaterial color="#8a6a3c" roughness={1} />
          </mesh>
        ))}
        <Etiqueta pos={[0, -0.25, 1.6]} df={10} fs={11}>
          <i className="fa-solid fa-sack-xmark" style={{ color: "#f2c230" }} />
          Costal de {num(kg)} kg = {num(kg * 1000)} g
        </Etiqueta>
      </group>
      <instancedMesh ref={chorro} args={[G_GRANO, undefined, N_CHORRO]} frustumCulled={false}>
        <meshStandardMaterial color="#f2c230" roughness={0.6} />
      </instancedMesh>

      {/* Báscula de cocina con 100 granos */}
      <group position={[2.3, 0, 0.5]}>
        <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.26, 1.7]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.33, 0]} castShadow>
          <cylinderGeometry args={[0.82, 0.78, 0.08, 40]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, 0.86]}>
          <boxGeometry args={[0.9, 0.16, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Html position={[0, 0.2, 0.9]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#4ade80", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>{num(m * 100, 1)} g</div>
        </Html>
        <instancedMesh ref={plato} args={[G_GRANO, undefined, N_GRANOS_PLATO]} castShadow frustumCulled={false}>
          <meshStandardMaterial color="#f2c230" roughness={0.55} />
        </instancedMesh>
        <Etiqueta pos={[0, 1.35, 0]} df={10} fs={11}>
          <i className="fa-solid fa-scale-balanced" style={{ color: "#f2c230" }} />
          100 granos = {num(m * 100, 1)} g
        </Etiqueta>
      </group>

      {/* Un grano ampliado junto a una regla (10 veces más grande) */}
      <group position={[4.35, 1.0, -1.9]}>
        <mesh position={[0, -0.5, 0.45]} receiveShadow castShadow>
          <boxGeometry args={[2.5, 1.0, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.03, 0.55]} receiveShadow>
          <boxGeometry args={[2.3, 0.05, 0.36]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
        {Array.from({ length: 21 }, (_, k) => (
          <mesh key={k} position={[-1 + k * 0.1, 0.06, 0.45 + (k % 10 === 0 ? 0.04 : 0)]}>
            <boxGeometry args={[0.012, 0.01, k % 10 === 0 ? 0.18 : k % 5 === 0 ? 0.12 : 0.08]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
        ))}
        {[0, 1, 2].map((k) => (
          <Html key={k} position={[-1 + k, 0.08, 0.82]} center distanceFactor={9} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ color: "#fde68a", fontSize: 10.5, fontWeight: 900 }}>{k} cm</div>
          </Html>
        ))}
        <group position={[-1 + 0.55, 0.32, 0.05]}>
          <group ref={grande}>
            <mesh geometry={G_ESFERA_FINA} scale={[0.55, 0.22, 0.4]} castShadow>
              <meshStandardMaterial color="#f5c542" roughness={0.45} />
            </mesh>
            <mesh geometry={G_ESFERA_FINA} position={[-0.38, 0.03, 0]} scale={[0.14, 0.12, 0.16]}>
              <meshStandardMaterial color="#fff7d6" roughness={0.6} />
            </mesh>
          </group>
        </group>
        <Etiqueta pos={[0, 1.0, 0.3]} df={10} fs={10.5}>
          1 grano de {num(m, 2)} g · ampliado ×10
        </Etiqueta>
      </group>

      <Etiqueta pos={[0.2, 4.1, -1.2]} df={10} col="#f2c230aa" fs={12}>
        {num(kg * 1000)} g ÷ {num(m, 2)} g = {cantidad(granos)} granos
      </Etiqueta>
    </group>
  );
}

/* ── Agua de la CDMX ──────────────────────────────────────────────────── */

/** Manzanas de edificios bajos detrás (en metros), para dar escala. */
const EDIFICIOS = Array.from({ length: 70 }, (_, i) => ({
  x: (((i * 37) % 41) - 20) * 24,
  z: -110 - ((i * 53) % 13) * 20,
  h: 12 + ((i * 29) % 31),
  w: 14 + ((i * 17) % 12),
}));

function EscenaAgua({ valores, modoColor }: { valores: number[]; modoColor: string }) {
  const [millones = 9.2, litros = 177, fugas = 1.59] = valores;
  const V = millones * 1e6 * litros * fugas;
  const lado = Math.cbrt(V / 1000);
  const k = 6.2 / Math.max(TORRE_LATINO_M, lado);
  const cubo = useRef<THREE.Mesh>(null);
  const contorno = useRef<THREE.LineSegments>(null);
  const edificios = useRef<THREE.InstancedMesh>(null);
  const escala = useRef(k);
  const ladoAct = useRef(lado);
  const llenado = useRef(0);
  const previa = useRef(-1);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    if (previa.current !== V) {
      previa.current = V;
      llenado.current = 0;
    }
    llenado.current = Math.min(1, llenado.current + dt * 0.6);
    escala.current += (k - escala.current) * suave(dt, 0.08);
    ladoAct.current += (lado - ladoAct.current) * suave(dt, 0.08);
    const ks = escala.current;
    const l = ladoAct.current * ks;
    const fill = 1 - Math.pow(1 - llenado.current, 2);
    if (cubo.current) {
      cubo.current.scale.set(l, Math.max(0.001, l * fill), l);
      cubo.current.position.set(0.4 + l / 2, (l * fill) / 2, 0);
    }
    if (contorno.current) {
      contorno.current.scale.set(l, l, l);
      contorno.current.position.set(0.4 + l / 2, l / 2, 0);
    }
    const mesh = edificios.current;
    if (mesh) {
      EDIFICIOS.forEach((b, i) => {
        obj.position.set(b.x * ks, (b.h * ks) / 2, b.z * ks);
        obj.scale.set(b.w * ks, b.h * ks, b.w * ks);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  });
  const hTorre = 138 * k;
  const hAntena = 44 * k;
  const anchoTorre = 30 * k;
  const personas = Math.min(30, Math.ceil(millones));
  return (
    <group>
      <mesh position={[0, -0.03, -6]} receiveShadow>
        <boxGeometry args={[40, 0.06, 20]} />
        <meshStandardMaterial color="#1f2937" roughness={0.95} />
      </mesh>
      <instancedMesh ref={edificios} args={[G_CUBO, undefined, EDIFICIOS.length]} frustumCulled={false} receiveShadow>
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </instancedMesh>

      {/* Torre Latinoamericana (182 m con antena) */}
      <group position={[-1.6, 0, -0.4]}>
        {[
          [1, 0.62],
          [0.86, 0.26],
          [0.7, 0.12],
        ].reduce<{ y: number; els: ReactNode[] }>(
          (acc, [ancho, frac], idx) => {
            const h = hTorre * frac!;
            acc.els.push(
              <mesh key={idx} position={[0, acc.y + h / 2, 0]} castShadow>
                <boxGeometry args={[anchoTorre * ancho!, h, anchoTorre * ancho!]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} emissive="#0ea5e9" emissiveIntensity={0.05} />
              </mesh>,
            );
            acc.y += h;
            return acc;
          },
          { y: 0, els: [] },
        ).els}
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[0, (hTorre * 0.62 * (i + 0.5)) / 14, (anchoTorre / 2) * 1.001]}>
            <boxGeometry args={[anchoTorre * 0.9, hTorre * 0.012, 0.005]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.55} />
          </mesh>
        ))}
        <mesh position={[0, hTorre + hAntena / 2, 0]}>
          <cylinderGeometry args={[anchoTorre * 0.04, anchoTorre * 0.1, hAntena, 10]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, hTorre + hAntena, 0]}>
          <sphereGeometry args={[Math.max(0.04, anchoTorre * 0.08), 12, 10]} />
          <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={1.5} />
        </mesh>
        <Etiqueta pos={[-anchoTorre / 2 - 1.3, hTorre + hAntena * 0.6, 0]} df={10} fs={10.5}>
          <i className="fa-solid fa-building" style={{ color: "#cbd5e1" }} />
          Torre Latinoamericana · 182 m
        </Etiqueta>
      </group>

      {/* Cubo con el agua de un día */}
      <mesh ref={cubo} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.62} emissive="#0284c7" emissiveIntensity={0.35} roughness={0.08} metalness={0.1} depthWrite={false} />
      </mesh>
      <lineSegments ref={contorno} geometry={G_ARISTAS}>
        <lineBasicMaterial color="#bae6fd" />
      </lineSegments>
      <Etiqueta pos={[0.4 + (lado * k) / 2, lado * k + 0.5, 0]} df={10} col={`${modoColor}aa`} fs={11.5}>
        <i className="fa-solid fa-droplet" style={{ color: "#38bdf8" }} />
        {cantidad(V)} L = cubo de {num(lado, 0)} m de lado
      </Etiqueta>

      {/* Habitantes: cada figura, un millón */}
      <group position={[-4.9, 0, 2.2]}>
        {Array.from({ length: personas }, (_, i) => {
          const frac = Math.min(1, millones - i);
          const fila = Math.floor(i / 10);
          return (
            <group key={i} position={[(i % 10) * 0.34, 0, -fila * 0.34]} scale={Math.max(0.15, frac)}>
              <mesh position={[0, 0.2, 0]} castShadow>
                <capsuleGeometry args={[0.08, 0.2, 4, 10]} />
                <meshStandardMaterial color={frac < 1 ? "#64748b" : modoColor} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.44, 0]}>
                <sphereGeometry args={[0.075, 12, 10]} />
                <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
              </mesh>
            </group>
          );
        })}
        <Etiqueta pos={[1.55, -0.2, 0.45]} df={11} fs={10}>
          cada figura = 1 millón de habitantes
        </Etiqueta>
      </group>
      <Etiqueta pos={[3.6, 0.2, 2.4]} df={10} fs={10.5}>
        {num(millones, 1)} M × {num(litros, 0)} L × {num(fugas, 2)}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. REDONDEAR Y TRUNCAR
 * ════════════════════════════════════════════════════════════════════════ */

const R_CANICA = 0.3;

function EscenaNumero({ numeroId, metodo, soltado, prediccion, modoColor }: { numeroId: string; metodo: Metodo; soltado: boolean; prediccion: number | null; modoColor: string }) {
  const e = NUMEROS.find((x) => x.id === numeroId) ?? NUMEROS[0]!;
  const [abajo, arriba] = vecinos(e.valor, e.paso);
  const res = resultadoMetodo(e, metodo);
  // Lado del cero: truncar siempre rueda hacia él.
  const ceroIzq = e.valor >= 0;
  const forma = metodo === "redondear" ? "cima" : ceroIzq ? "bajaIzq" : "bajaDer";
  const t0 = (e.valor - abajo) / (arriba - abajo);
  const tFin = res === abajo ? 0 : 1;
  const canica = useRef<THREE.Mesh>(null);
  const t = useRef(t0);
  const vel = useRef(0);
  const cifras = useRef<THREE.Group>(null);
  const caida = useRef(0);
  const d = decimalesDe(e.paso);

  useFrame(({ clock }, dt) => {
    const paso = Math.min(dt, 0.05);
    if (!soltado) {
      t.current = t0;
      vel.current = 0;
      caida.current = 0;
    } else {
      // «Gravedad» sobre la pendiente de la pista; se detiene en el valle del resultado.
      const eps = 0.002;
      let pend = (alturaPista(forma, Math.min(1, t.current + eps)) - alturaPista(forma, Math.max(0, t.current - eps))) / (2 * eps);
      if (forma === "cima" && Math.abs(t.current - 0.5) < 0.004 && tFin === 1) pend = -0.6; // regla del 5: se sube
      vel.current += -pend * 0.9 * paso;
      vel.current *= Math.pow(0.4, paso);
      t.current += vel.current * paso;
      if ((tFin === 0 && t.current <= 0) || (tFin === 1 && t.current >= 1)) {
        t.current = tFin;
        vel.current = 0;
      }
      caida.current = Math.min(1, caida.current + dt * 0.8);
    }
    if (canica.current) {
      const x = -PISTA_W / 2 + t.current * PISTA_W;
      const y = alturaPista(forma, t.current) + R_CANICA;
      canica.current.position.set(x, y + (soltado ? 0 : Math.sin(clock.elapsedTime * 3) * 0.03), 0);
      canica.current.rotation.z = -x / R_CANICA;
    }
    if (cifras.current) {
      cifras.current.children.forEach((c) => {
        const cae = c.userData.cae as boolean;
        const k = cae ? caida.current : 0;
        c.position.y = (c.userData.y0 as number) - k * k * 1.9;
      });
    }
  });

  // Cifras del número: cuáles se conservan y cuáles se descartan.
  const txt = e.valor < 0 ? `−${Math.abs(e.valor).toFixed(e.dec)}` : e.valor.toFixed(e.dec);
  const punto = txt.indexOf(".");
  const finEntero = punto === -1 ? txt.length : punto;
  const chars = txt.split("").map((ch, i) => {
    if (ch === "." || ch === "−") return { ch, cae: false, neutro: true };
    const lugar = i < finEntero ? Math.pow(10, finEntero - 1 - i) : Math.pow(10, -(i - finEntero));
    return { ch, cae: lugar < e.paso * 0.999, neutro: false };
  });
  const anchoCif = 0.62;
  const resTxt = num(res, d).replace(/ /g, "");

  const marcas = Array.from({ length: 11 }, (_, k) => k);
  const fmtLim = (x: number) => num(x, d);
  return (
    <group position={[0, -0.9, 0]}>
      <mesh geometry={G_PISTA[forma]} receiveShadow castShadow>
        <meshStandardMaterial color="#312e81" roughness={0.45} metalness={0.2} />
      </mesh>
      {/* Riel luminoso en el borde */}
      {marcas.map((k) => {
        const x = -PISTA_W / 2 + (k / 10) * PISTA_W;
        const y = alturaPista(forma, k / 10);
        return (
          <mesh key={k} position={[x, y / 2 - 0.25, 0.72]}>
            <boxGeometry args={[k % 5 === 0 ? 0.06 : 0.03, y + 0.5, 0.02]} />
            <meshBasicMaterial color={k === 5 ? "#f472b6" : "#a5b4fc"} transparent opacity={k % 5 === 0 ? 0.9 : 0.45} />
          </mesh>
        );
      })}
      <mesh position={[-PISTA_W / 2 + t0 * PISTA_W, -0.52, 0.75]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      {[abajo, arriba].map((v, k) => {
        const esPred = prediccion !== null && Math.abs(prediccion - v) < e.paso * 1e-6;
        const esRes = soltado && Math.abs(res - v) < e.paso * 1e-6;
        const col = esRes ? OK : esPred ? modoColor : "rgba(255,255,255,0.3)";
        const x = k === 0 ? -PISTA_W / 2 : PISTA_W / 2;
        return (
          <group key={k} position={[x, 0, 0]}>
            <mesh position={[0, -0.47, 0.72]}>
              <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
              <meshStandardMaterial color={esRes ? OK : esPred ? modoColor : "#475569"} emissive={esRes ? OK : esPred ? modoColor : "#000"} emissiveIntensity={esRes || esPred ? 0.8 : 0} />
            </mesh>
            <Etiqueta pos={[0, -1.05, 0.8]} df={9} col={col} fs={15}>
              {esRes && <i className="fa-solid fa-circle-check" style={{ color: OK }} />}
              {fmtLim(v)}
            </Etiqueta>
          </group>
        );
      })}
      <Etiqueta pos={[0, -1.05, 0.8]} df={10} col="#f472b6aa" fs={10.5}>
        mitad · {num((abajo + arriba) / 2, d + 1)}
      </Etiqueta>
      <mesh ref={canica} castShadow>
        <sphereGeometry args={[R_CANICA, 32, 24]} />
        <meshStandardMaterial color={modoColor} metalness={0.35} roughness={0.08} emissive={modoColor} emissiveIntensity={0.2} />
      </mesh>
      {!soltado && (
        <Etiqueta pos={[-PISTA_W / 2 + t0 * PISTA_W, alturaPista(forma, t0) + 1.0, 0]} df={9} col={`${modoColor}aa`} fs={13}>
          {num(e.valor, e.dec)}
        </Etiqueta>
      )}

      {/* Cifras: las que sobran caen */}
      <group position={[0, 3.3, -1.2]}>
        <group ref={cifras}>
          {chars.map((c, i) => (
            <group key={`${numeroId}-${i}`} position={[(i - (chars.length - 1) / 2) * anchoCif, 0, 0]} userData={{ cae: c.cae, y0: 0 }}>
              {!c.neutro && (
                <mesh castShadow scale={soltado && c.cae ? 0.6 : 1}>
                  <boxGeometry args={[0.54, 0.7, 0.2]} />
                  <meshStandardMaterial color={c.cae ? "#7f1d1d" : "#1e1b4b"} emissive={c.cae ? NO : modoColor} emissiveIntensity={0.25} roughness={0.4} />
                </mesh>
              )}
              <Html position={[0, 0, 0.12]} center distanceFactor={9} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
                <div style={{ color: c.cae ? "#fecaca" : "#fff", fontSize: 24, fontWeight: 900, fontFamily: "ui-monospace, monospace", opacity: soltado && c.cae ? 0.12 : 1, transition: "opacity 1.2s" }}>{c.ch}</div>
              </Html>
            </group>
          ))}
        </group>
        <Etiqueta pos={[0, 0.75, 0]} df={10} fs={11}>
          {metodo === "redondear" ? "Redondear" : "Truncar"} {e.lugar} · las cifras rojas sobran
        </Etiqueta>
        {soltado && (
          <Etiqueta pos={[(chars.length / 2) * anchoCif + 1.0, 0, 0]} df={9} col={`${OK}aa`} fs={16}>
            <i className="fa-solid fa-arrow-right" style={{ color: OK }} />
            {resTxt}
          </Etiqueta>
        )}
      </group>
    </group>
  );
}

function EscenaOperacion({ operacionId, elegidoA, elegidoB, modoColor }: { operacionId: string; elegidoA: number; elegidoB: number; modoColor: string }) {
  const o = OPERACIONES.find((x) => x.id === operacionId) ?? OPERACIONES[0]!;
  const maxB = Math.max(...o.opcionesB, o.b);
  const maxA = Math.max(...o.opcionesA, o.a);
  // Escalas independientes por eje: conservan la razón entre las áreas.
  const sx = 8 / maxB;
  const sz = 4.6 / maxA;
  const est = useRef<THREE.Mesh>(null);
  const bordes = useRef<THREE.LineSegments>(null);
  const dims = useRef<[number, number]>([elegidoB, elegidoA]);
  useFrame((_, dt) => {
    const [b, a] = dims.current;
    const nb = b + (elegidoB - b) * suave(dt, 0.1);
    const na = a + (elegidoA - a) * suave(dt, 0.1);
    dims.current = [nb, na];
    const W = nb * sx;
    const D = na * sz;
    if (est.current) {
      est.current.scale.set(W, 0.14, D);
      est.current.position.set(-4 + W / 2, 0.32, -2.3 + D / 2);
    }
    if (bordes.current) {
      bordes.current.scale.set(W, 0.14, D);
      bordes.current.position.set(-4 + W / 2, 0.32, -2.3 + D / 2);
    }
  });
  const W0 = o.b * sx;
  const D0 = o.a * sz;
  const exacto = o.a * o.b;
  const estimado = elegidoA * elegidoB;
  const err = errorRelativo(estimado, exacto);
  const lineas = 10;
  // Diferencia entre los rectángulos: lo que sobra (estimado sin exacto) y lo que falta (exacto sin estimado).
  const W = elegidoB * sx;
  const D = elegidoA * sz;
  const franjas: { tipo: "sobra" | "falta"; x0: number; x1: number; z0: number; z1: number }[] = [];
  if (W > W0) franjas.push({ tipo: "sobra", x0: W0, x1: W, z0: 0, z1: D });
  if (D > D0) franjas.push({ tipo: "sobra", x0: 0, x1: Math.min(W, W0), z0: D0, z1: D });
  if (W0 > W) franjas.push({ tipo: "falta", x0: W, x1: W0, z0: 0, z1: D0 });
  if (D0 > D) franjas.push({ tipo: "falta", x0: 0, x1: Math.min(W, W0), z0: D, z1: D0 });
  return (
    <group position={[0, -0.8, 0.4]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 6.6]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Área exacta */}
      <mesh position={[-4 + W0 / 2, 0.1, -2.3 + D0 / 2]} receiveShadow castShadow>
        <boxGeometry args={[W0, 0.2, D0]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      {Array.from({ length: lineas - 1 }, (_, k) => (
        <mesh key={`x${k}`} position={[-4 + ((k + 1) / lineas) * W0, 0.205, -2.3 + D0 / 2]}>
          <boxGeometry args={[0.012, 0.005, D0]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: lineas - 1 }, (_, k) => (
        <mesh key={`z${k}`} position={[-4 + W0 / 2, 0.205, -2.3 + ((k + 1) / lineas) * D0]}>
          <boxGeometry args={[W0, 0.005, 0.012]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Área estimada */}
      <mesh ref={est}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={modoColor} transparent opacity={0.16} emissive={modoColor} emissiveIntensity={0.3} depthWrite={false} />
      </mesh>
      {franjas.map((f, i) => (
        <mesh key={`${f.tipo}-${i}`} position={[-4 + (f.x0 + f.x1) / 2, 0.3, -2.3 + (f.z0 + f.z1) / 2]}>
          <boxGeometry args={[Math.max(0.01, f.x1 - f.x0), 0.12, Math.max(0.01, f.z1 - f.z0)]} />
          <meshStandardMaterial color={f.tipo === "sobra" ? "#fb923c" : "#22d3ee"} emissive={f.tipo === "sobra" ? "#fb923c" : "#22d3ee"} emissiveIntensity={0.7} />
        </mesh>
      ))}
      {franjas.some((f) => f.tipo === "sobra") && (
        <Etiqueta pos={[3.6, 0.3, 2.9]} df={10} col="#fb923caa" fs={10.5}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#fb923c", display: "inline-block" }} />
          sobra: la estimación cuenta de más
        </Etiqueta>
      )}
      {franjas.some((f) => f.tipo === "falta") && (
        <Etiqueta pos={[3.6, 0.3, franjas.some((f) => f.tipo === "sobra") ? 3.45 : 2.9]} df={10} col="#22d3eeaa" fs={10.5}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#22d3ee", display: "inline-block" }} />
          falta: la estimación deja fuera
        </Etiqueta>
      )}
      <lineSegments ref={bordes} geometry={G_ARISTAS}>
        <lineBasicMaterial color={modoColor} />
      </lineSegments>
      <Etiqueta pos={[-4 + W0 / 2, 0.1, -2.3 + Math.max(D0, elegidoA * sz) + 0.45]} df={10} fs={11.5}>
        {o.etqB}: {num(o.b, o.decB)} → <span style={{ color: modoColor }}>{num(elegidoB, o.decB)}</span>
      </Etiqueta>
      <Etiqueta pos={[-4 - 0.35, 0.1, -2.3 + D0 / 2]} df={10} fs={11.5}>
        {o.etqA}: {num(o.a, o.decA)} → <span style={{ color: modoColor }}>{num(elegidoA, o.decA)}</span>
      </Etiqueta>
      <Etiqueta pos={[1.6, 2.2, -1.2]} df={9} col={`${err < 0.05 ? OK : ORO}aa`} fs={13}>
        <span style={{ color: "#cbd5e1" }}>exacto {num(exacto, o.decB)}</span>
        <span style={{ color: modoColor }}>estimado {num(estimado, o.decB)}</span>
        <span style={{ color: err < 0.05 ? OK : ORO }}>error {num(err * 100, 1)} %</span>
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ¿ES RAZONABLE?
 * ════════════════════════════════════════════════════════════════════════ */

const CAP_OBJETOS = 1500;
const CELDA = 0.36;
const COLS = 10;

function Pila({ caso, valor, x, visible, etq, col }: { caso: string; valor: number | null; x: number; visible: boolean; etq: string; col: string }) {
  const c = CASOS.find((k) => k.id === caso) ?? CASOS[0]!;
  const geo = OBJ_GEO[c.objeto];
  const mesh = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const previa = useRef<number | null>(-1);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const n = valor === null ? 0 : valor / c.porObjeto;
  const dibujar = Math.min(CAP_OBJETOS, Math.ceil(n));
  const cols = Math.max(1, Math.min(COLS, Math.ceil(Math.sqrt(Math.min(n, CAP_OBJETOS) / 1.5))));
  const porCapa = cols * cols;
  const capas = Math.ceil(dibujar / porCapa);
  useFrame((_, dt) => {
    if (previa.current !== valor) {
      previa.current = valor;
      t.current = 0;
    }
    t.current += dt;
    const m = mesh.current;
    if (!m) return;
    const aparecen = visible ? Math.min(dibujar, Math.floor((t.current / 1.6) * dibujar) + 1) : 0;
    for (let i = 0; i < CAP_OBJETOS; i++) {
      if (i < aparecen) {
        const capa = Math.floor(i / porCapa);
        const r = i % porCapa;
        const ult = i === dibujar - 1 && n % 1 > 0 && n < CAP_OBJETOS;
        const fr = ult ? Math.max(0.08, n % 1) : 1;
        obj.position.set((((r % cols) - (cols - 1) / 2) * CELDA), 0.24 + capa * geo.alto + (geo.alto * fr) / 2, (Math.floor(r / cols) - (cols - 1) / 2) * CELDA);
        obj.scale.set(1, fr, 1);
        obj.rotation.set(0, (i * 0.13) % 0.2, 0);
      } else {
        obj.scale.setScalar(0.0001);
      }
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  const alto = 0.24 + capas * geo.alto;
  const ancho = cols * CELDA + 0.4;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[Math.max(1.6, ancho), 0.2, Math.max(1.6, ancho)]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.205, Math.max(0.8, ancho / 2) + 0.001]}>
        <boxGeometry args={[Math.max(1.6, ancho), 0.03, 0.01]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <instancedMesh key={`${caso}-${c.objeto}`} ref={mesh} args={[geo.g, undefined, CAP_OBJETOS]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={geo.color} roughness={0.45} metalness={c.objeto === "moneda" ? 0.8 : 0.05} transparent={c.objeto === "vaso"} opacity={c.objeto === "vaso" ? 0.7 : 1} />
      </instancedMesh>
      {visible && valor !== null && (
        <Etiqueta pos={[0, Math.min(alto, 5) + 0.55, 0]} df={10} col={`${col}aa`} fs={12}>
          {etq}
        </Etiqueta>
      )}
      {visible && n > CAP_OBJETOS && (
        <Etiqueta pos={[0, Math.min(alto, 5) + 1.05, 0]} df={10} col={`${NO}aa`} fs={10.5}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: NO }} />
          no caben: faltan {cantidad(n - CAP_OBJETOS)} objetos más
        </Etiqueta>
      )}
    </group>
  );
}

function Medidor({ razon, modoColor, dictaminado, error }: { razon: number | null; modoColor: string; dictaminado: boolean; error: string }) {
  const aguja = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const L = razon === null ? 0 : Math.max(-3.4, Math.min(3.4, Math.log10(razon)));
  useFrame(({ clock }, dt) => {
    const destino = razon === null ? Math.sin(clock.elapsedTime * 0.8) * 0.15 : -(L / 3.6) * (Math.PI / 2);
    ang.current += (destino - ang.current) * suave(dt, 0.08);
    if (aguja.current) aguja.current.rotation.z = ang.current;
  });
  const zonas: { a: number; b: number; col: string }[] = [
    { a: -3.6, b: -1, col: NO },
    { a: -1, b: -0.15, col: ORO },
    { a: -0.15, b: 0.15, col: OK },
    { a: 0.15, b: 1, col: ORO },
    { a: 1, b: 3.6, col: NO },
  ];
  const angDe = (l: number) => Math.PI / 2 - (l / 3.6) * (Math.PI / 2);
  return (
    <group position={[0, 2.4, -1.6]}>
      <mesh position={[0, 0, -0.04]}>
        <circleGeometry args={[1.95, 48, 0, Math.PI]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {zonas.map((z, i) => (
        <mesh key={i} rotation={[0, 0, 0]}>
          <ringGeometry args={[1.12, 1.4, 32, 1, angDe(z.b), angDe(z.a) - angDe(z.b)]} />
          <meshBasicMaterial color={z.col} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-3, -2, -1, 0, 1, 2, 3].map((l) => {
        const a = angDe(l);
        return (
          <Html key={l} position={[Math.cos(a) * 1.72, Math.sin(a) * 1.72, 0]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ color: l === 0 ? "#fff" : "#94a3b8", fontSize: 10.5, fontWeight: 900, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{l === 0 ? "=" : l < 0 ? `÷${10 ** -l}` : `×${10 ** l}`}</div>
          </Html>
        );
      })}
      <group ref={aguja} position={[0, 0, 0.05]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.06, 1.1, 0.03]} />
          <meshStandardMaterial color="#f8fafc" emissive={modoColor} emissiveIntensity={0.4} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={modoColor} metalness={0.6} roughness={0.3} />
      </mesh>
      <Etiqueta pos={[0, -0.55, 0.1]} df={10} col={`${dictaminado ? (error === "ninguno" ? OK : NO) : modoColor}aa`} fs={11.5}>
        {razon === null
          ? "Escribe tu estimación"
          : razon > 0.9 && razon < 1.1
            ? "El resultado dado es prácticamente igual a tu estimación"
            : `El resultado dado es ${razon >= 1 ? `${cantidad(razon)} veces` : `${cantidad(1 / razon)} veces menor que`} tu estimación`}
      </Etiqueta>
    </group>
  );
}

function EscenaRazonable({ casoId, estimacionAlumno, dictaminado, modoColor }: { casoId: string; estimacionAlumno: number | null; dictaminado: boolean; modoColor: string }) {
  const c = CASOS.find((k) => k.id === casoId) ?? CASOS[0]!;
  const razon = estimacionAlumno && estimacionAlumno > 0 ? c.dado / estimacionAlumno : null;
  const unidadCorta = c.unidad === "pesos" || c.unidad === "pesos por kg" ? "$" : "";
  const fmt = (v: number) => `${unidadCorta}${cantidad(v)}${unidadCorta ? "" : ` ${c.unidad}`}`;
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[6.6, 6.6, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <Pila caso={casoId} valor={estimacionAlumno} x={-3.3} visible={estimacionAlumno !== null} etq={`Tu estimación · ${estimacionAlumno !== null ? fmt(estimacionAlumno) : ""}`} col={modoColor} />
      <Pila caso={casoId} valor={c.dado} x={3.3} visible etq={`Resultado dado · ${c.dadoTexto}`} col={dictaminado ? (c.error === "ninguno" ? OK : NO) : "#e2e8f0"} />
      <Medidor razon={razon} modoColor={modoColor} dictaminado={dictaminado} error={c.error} />
      <Etiqueta pos={[0, 1.3, -1.6]} df={10} fs={10.5}>
        <i className={`fa-solid ${c.icono}`} style={{ color: modoColor }} />
        cada objeto = {c.etqObjeto}
      </Etiqueta>
      {dictaminado && (
        <Etiqueta pos={[0, 0.6, 2.6]} df={10} col={`${OK}aa`} fs={12}>
          <i className="fa-solid fa-calculator" style={{ color: OK }} />
          Cuenta exacta: {fmt(c.exacto)}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function EstimacionFermiScene(p: EstimacionSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const sub = vista === "fermi" ? p.problemaId : vista === "redondeo" ? p.subRedondeo : "casos";
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "fermi") {
      if (sub === "agua") return { pos: [1.0, 5.6, 13.6], target: [0, 0.5, 0.6] };
      if (sub === "costal") return { pos: [0.8, 6.2, 12.6], target: [0.4, -0.1, 0.6] };
      return { pos: [2.0, 6.8, 12.8], target: [0.4, -0.3, 0.6] };
    }
    if (vista === "redondeo") {
      if (sub === "operacion") return { pos: [0, 6.4, 9.8], target: [0, -0.4, 0.4] };
      return { pos: [0, 2.6, 11.2], target: [0, 0.7, 0] };
    }
    return { pos: [0, 4.6, 11.4], target: [0, 1.0, 0] };
  }, [vista, sub]);
  const problema = PROBLEMAS.find((x) => x.id === p.problemaId) ?? PROBLEMAS[0]!;

  return (
    <Canvas key={`${vista}-${sub}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 44]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 10, 7]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <pointLight position={[-6, 4, 5]} intensity={0.45} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "fermi" && (
        <group position={[0, -1.5, 0]}>
          {p.problemaId === "salon" && <EscenaSalon valores={p.valores} modoColor={modoColor} />}
          {p.problemaId === "costal" && <EscenaCostal valores={p.valores} />}
          {p.problemaId === "agua" && <EscenaAgua valores={p.valores} modoColor={modoColor} />}
          <ReglaLog centro={exponente(problema.real)} estimacion={p.estimacion} rango={p.rango} real={p.real} modoColor={modoColor} />
        </group>
      )}
      {vista === "redondeo" && p.subRedondeo === "numero" && <EscenaNumero numeroId={p.numeroId} metodo={p.metodo} soltado={p.soltado} prediccion={p.prediccion} modoColor={modoColor} />}
      {vista === "redondeo" && p.subRedondeo === "operacion" && <EscenaOperacion operacionId={p.operacionId} elegidoA={p.elegidoA} elegidoB={p.elegidoB} modoColor={modoColor} />}
      {vista === "razonable" && <EscenaRazonable casoId={p.casoId} estimacionAlumno={p.estimacionAlumno} dictaminado={p.dictaminado} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={22} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
