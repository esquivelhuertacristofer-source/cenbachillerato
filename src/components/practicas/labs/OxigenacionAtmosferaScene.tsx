"use client";

/**
 * Escena 3D del laboratorio "La oxigenación de la atmósfera" (CNEYT-III-P11).
 * Tres vistas:
 *
 *  - mar: un mar primitivo en corte. Estromatolitos con cianobacterias liberan
 *    burbujas de O₂; mientras hay hierro disuelto (Fe²⁺) el O₂ lo oxida y el
 *    óxido cae al fondo formando bandas; el O₂ sobrante sube al aire y el cielo
 *    pasa de la neblina a azul.
 *  - historia: la Tierra a lo largo de 4,000 millones de años, con su
 *    atmósfera, su capa de ozono y los rayos UV del Sol que la atraviesan o no.
 *  - oxidos: un banco de laboratorio con mechero, cucharilla de combustión y un
 *    frasco con agua e indicador universal.
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
  type Modo,
  type ElementoId,
  type FaseOx,
  FE_INICIAL,
  P_MAX,
  FE_POR_BANDA,
  ELEMENTOS,
  rangoLog,
  rangoTexto,
  escudoOzono,
  cieloOxigeno,
  glaciacion,
  vidaEn,
  hitoEn,
  mezclaHex,
  colorPH,
  clamp01,
  num,
} from "./oxigenacion-atmosfera-data";

export interface OxigenacionSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Mar
  P: number;
  S: number;
  corriendo: boolean;
  fe: number;
  aire: number;
  producido: number;
  depositado: number;
  flujoFe: number;
  flujoAire: number;
  // Historia
  tMa: number;
  uv: boolean;
  // Óxidos
  elementoId: ElementoId;
  fase: FaseOx;
  coefTexto: string;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

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

/* ════════════════════════════════════════════════════════════════════════
 * 1. MAR PRIMITIVO
 * ════════════════════════════════════════════════════════════════════════ */

const H_AGUA = 3.2;
const X_PLAT = -1.2;
const Y_PLAT = 1.5;
const ESP_BANDA = 0.075;
const MAX_BANDAS = 15;
const Z_MEDIO = 1.8;
const DOMOS: { x: number; z: number; r: number }[] = [
  { x: -4.2, z: -0.7, r: 0.44 },
  { x: -3.1, z: 0.35, r: 0.52 },
  { x: -2.0, z: -0.55, r: 0.4 },
  { x: -4.25, z: 0.95, r: 0.33 },
  { x: -2.15, z: 1.1, r: 0.3 },
];
const VENTILA = { x: 3.7, z: -0.5 };
const N_O2 = 70;
const N_FE = 90;
const N_PLUMA = 26;
const N_OX = 44;

const GEO_ESFERA = new THREE.SphereGeometry(1, 10, 8);
const GEO_CAPA = new THREE.CylinderGeometry(1, 1, 1, 28);

function capasDe(producido: number) {
  return 4 + Math.min(8, Math.floor(producido / 60));
}

function Estromatolito({ x, z, r, capas, brillo }: { x: number; z: number; r: number; capas: number; brillo: number }) {
  const alto = capas * 0.075;
  return (
    <group position={[x, Y_PLAT, z]}>
      {Array.from({ length: capas }, (_, k) => {
        const f = k / capas;
        const rk = r * (1 - 0.32 * f * f) * (0.94 + 0.06 * Math.sin(k * 2.1));
        return (
          <mesh key={k} geometry={GEO_CAPA} position={[0, 0.0375 + k * 0.075, 0]} scale={[rk, 0.072, rk]} castShadow receiveShadow>
            <meshStandardMaterial color={k % 2 ? "#a8947a" : "#8a7862"} roughness={0.95} />
          </mesh>
        );
      })}
      <mesh position={[0, alto, 0]} scale={[r * 0.7, r * 0.3, r * 0.7]}>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#15803d" emissive="#22c55e" emissiveIntensity={0.12 + 0.9 * brillo} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Banda({ k }: { k: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt * 1.5);
    if (ref.current) ref.current.scale.y = Math.max(0.001, t.current) * ESP_BANDA;
  });
  return (
    <mesh ref={ref} position={[(X_PLAT + 5) / 2, ESP_BANDA / 2 + k * ESP_BANDA, 0]} scale={[5 - X_PLAT - 0.02, ESP_BANDA, Z_MEDIO * 2 - 0.02]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={k % 2 ? "#4b5563" : "#b4432a"} roughness={0.85} metalness={k % 2 ? 0.25 : 0.05} />
    </mesh>
  );
}

function EscenaMar(p: OxigenacionSceneProps) {
  const { P, S, corriendo, fe, aire, producido, depositado, flujoFe, flujoAire, modoColor } = p;
  const completas = Math.min(MAX_BANDAS, Math.floor(depositado / FE_POR_BANDA));
  const fraccion = completas >= MAX_BANDAS ? 0 : (depositado % FE_POR_BANDA) / FE_POR_BANDA;
  const topeDestino = (completas + fraccion) * ESP_BANDA;
  const capas = capasDe(producido);

  const o2 = useRef<THREE.InstancedMesh>(null);
  const ferro = useRef<THREE.InstancedMesh>(null);
  const pluma = useRef<THREE.InstancedMesh>(null);
  const oxido = useRef<THREE.InstancedMesh>(null);
  const creciendo = useRef<THREE.Mesh>(null);
  const ventila = useRef<THREE.Group>(null);
  const cielo = useRef<THREE.MeshBasicMaterial>(null);
  const agua = useRef<THREE.MeshStandardMaterial>(null);
  const horizonte = useRef<THREE.MeshStandardMaterial>(null);
  const tope = useRef(topeDestino);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const colTmp = useMemo(() => new THREE.Color(), []);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    tope.current += (topeDestino - tope.current) * suave(dt, 0.08);
    const top = tope.current;
    if (creciendo.current) {
      creciendo.current.visible = fraccion > 0.01;
      creciendo.current.scale.y = Math.max(0.001, fraccion * ESP_BANDA);
      creciendo.current.position.y = completas * ESP_BANDA + (fraccion * ESP_BANDA) / 2;
    }
    if (ventila.current) ventila.current.position.y = top;

    // Cielo: de neblina sin O₂ a azul, según el O₂ del aire.
    const k = clamp01(aire / 40);
    if (cielo.current) {
      colA.set("#5b3417");
      colB.set("#1e4fb8");
      colTmp.copy(colA).lerp(colB, k);
      cielo.current.color.lerp(colTmp, suave(dt, 0.05));
    }
    const oxigenado = fe < 0.5 && flujoAire > 0;
    colA.set(oxigenado ? "#0b5f8f" : "#0f6b5a");
    if (agua.current) agua.current.color.lerp(colA, suave(dt, 0.04));
    if (horizonte.current) horizonte.current.color.lerp(colA, suave(dt, 0.04));

    // Burbujas de O₂: al aire o hacia el hierro, según el balance del ciclo.
    const alturaDomo = Y_PLAT + capas * 0.075 + 0.12;
    const nO2 = corriendo ? Math.round((N_O2 * P) / P_MAX) : 0;
    const fracAire = P > 0 ? flujoAire / P : 0;
    const m1 = o2.current;
    if (m1) {
      for (let i = 0; i < N_O2; i++) {
        if (i >= nO2) {
          obj.scale.setScalar(0.0001);
        } else {
          const d = DOMOS[i % DOMOS.length]!;
          const f = (t * 0.32 + hash(i, 1)) % 1;
          if (hash(i, 2) < fracAire) {
            const y = alturaDomo + f * (6.2 - alturaDomo);
            obj.position.set(d.x + Math.sin(f * 7 + i) * 0.1, y, d.z + Math.cos(f * 5 + i) * 0.08);
            obj.scale.setScalar(y > H_AGUA ? 0.07 * (1 - (y - H_AGUA) / (6.2 - H_AGUA)) + 0.005 : 0.065);
          } else {
            const tx = -0.2 + hash(i, 3) * 4.6;
            const ty = top + 0.5 + hash(i, 4) * (H_AGUA - top - 1.0);
            const tz = -1.4 + hash(i, 5) * 2.8;
            const e = f * f * (3 - 2 * f);
            const y = Math.min(H_AGUA - 0.08, alturaDomo + (ty - alturaDomo) * f + Math.sin(f * Math.PI) * 0.9);
            obj.position.set(d.x + (tx - d.x) * e, y, d.z + (tz - d.z) * e);
            obj.scale.setScalar(0.06 * (1 - Math.max(0, (f - 0.82) / 0.18)) + 0.0001);
          }
        }
        obj.updateMatrix();
        m1.setMatrixAt(i, obj.matrix);
      }
      m1.instanceMatrix.needsUpdate = true;
    }

    // Hierro ferroso disuelto (Fe²⁺): nube verde en el agua profunda.
    const nFe = Math.round(N_FE * clamp01(fe / FE_INICIAL));
    const m2 = ferro.current;
    if (m2) {
      for (let i = 0; i < N_FE; i++) {
        if (i >= nFe) obj.scale.setScalar(0.0001);
        else {
          obj.position.set(-0.7 + hash(i, 6) * 5.4 + Math.sin(t * 0.3 + i) * 0.12, top + 0.25 + hash(i, 7) * (H_AGUA - 0.45 - top) + Math.sin(t * 0.45 + i * 1.3) * 0.08, -1.55 + hash(i, 8) * 3.1);
          obj.scale.setScalar(0.042);
        }
        obj.updateMatrix();
        m2.setMatrixAt(i, obj.matrix);
      }
      m2.instanceMatrix.needsUpdate = true;
    }
    const m3 = pluma.current;
    if (m3) {
      for (let i = 0; i < N_PLUMA; i++) {
        const f = (t * 0.4 + hash(i, 9)) % 1;
        const ver = corriendo && S > 0 && i < Math.round((N_PLUMA * S) / 40) + 4;
        obj.position.set(VENTILA.x + Math.sin(f * 5 + i) * 0.3 * f, top + 0.95 + f * 1.9, VENTILA.z + Math.cos(f * 4 + i) * 0.25 * f);
        obj.scale.setScalar(ver ? 0.05 * (1 - f * 0.5) : 0.0001);
        obj.updateMatrix();
        m3.setMatrixAt(i, obj.matrix);
      }
      m3.instanceMatrix.needsUpdate = true;
    }
    // Hierro oxidado que precipita al fondo.
    const nOx = corriendo ? Math.round((N_OX * flujoFe) / P_MAX) : 0;
    const m4 = oxido.current;
    if (m4) {
      for (let i = 0; i < N_OX; i++) {
        const f = (t * 0.28 + hash(i, 10)) % 1;
        const y0 = top + 0.6 + hash(i, 11) * 1.6;
        obj.position.set(-0.6 + hash(i, 12) * 5.2, y0 - f * (y0 - top), -1.5 + hash(i, 13) * 3);
        obj.scale.setScalar(i < nOx ? 0.048 : 0.0001);
        obj.updateMatrix();
        m4.setMatrixAt(i, obj.matrix);
      }
      m4.instanceMatrix.needsUpdate = true;
    }
  });

  const brillo = P / P_MAX;
  const oxigenado = fe < 0.5 && flujoAire > 0;
  return (
    <group position={[0, -1.6, 0]}>
      {/* Cielo y sol */}
      <mesh position={[0, H_AGUA + 5.5, -7]}>
        <planeGeometry args={[40, 11]} />
        <meshBasicMaterial ref={cielo} color="#5b3417" />
      </mesh>
      <mesh position={[6.2, 5.6, -6.8]}>
        <sphereGeometry args={[0.6, 24, 16]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>
      {/* Mar abierto hacia el horizonte */}
      <mesh position={[0, H_AGUA - 0.01, -4.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 5.2]} />
        <meshStandardMaterial ref={horizonte} color="#0f6b5a" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Lecho rocoso */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[10.2, 0.5, Z_MEDIO * 2 + 0.2]} />
        <meshStandardMaterial color="#2b2622" roughness={1} />
      </mesh>
      {/* Plataforma somera donde crecen los estromatolitos */}
      <mesh position={[(-5 + X_PLAT) / 2, Y_PLAT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[X_PLAT + 5, Y_PLAT, Z_MEDIO * 2]} />
        <meshStandardMaterial color="#4a4038" roughness={1} />
      </mesh>
      <mesh position={[(-5 + X_PLAT) / 2, Y_PLAT + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[X_PLAT + 5, Z_MEDIO * 2]} />
        <meshStandardMaterial color="#556b2f" roughness={1} />
      </mesh>
      {DOMOS.map((d, i) => (
        <Estromatolito key={i} x={d.x} z={d.z} r={d.r} capas={capas} brillo={brillo} />
      ))}

      {/* Formaciones de hierro bandeado */}
      {Array.from({ length: completas }, (_, k) => (
        <Banda key={k} k={k} />
      ))}
      <mesh ref={creciendo} position={[(X_PLAT + 5) / 2, 0, 0]} scale={[5 - X_PLAT - 0.02, 0.001, Z_MEDIO * 2 - 0.02]} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={completas % 2 ? "#4b5563" : "#b4432a"} roughness={0.85} transparent opacity={0.8} />
      </mesh>

      {/* Fuente hidrotermal */}
      <group ref={ventila} position={[0, 0, 0]}>
        <mesh position={[VENTILA.x, 0.45, VENTILA.z]} castShadow>
          <coneGeometry args={[0.42, 0.9, 9]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[VENTILA.x + 0.55, 0.25, VENTILA.z + 0.3]} castShadow>
          <coneGeometry args={[0.25, 0.5, 8]} />
          <meshStandardMaterial color="#292524" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[VENTILA.x, 0.92, VENTILA.z]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={S > 0 ? 1.4 : 0.2} />
        </mesh>
      </group>

      <instancedMesh ref={o2} args={[GEO_ESFERA, undefined, N_O2]} frustumCulled={false}>
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.55} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={ferro} args={[GEO_ESFERA, undefined, N_FE]} frustumCulled={false}>
        <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={pluma} args={[GEO_ESFERA, undefined, N_PLUMA]} frustumCulled={false}>
        <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={0.35} />
      </instancedMesh>
      <instancedMesh ref={oxido} args={[GEO_ESFERA, undefined, N_OX]} frustumCulled={false}>
        <meshStandardMaterial color="#c2410c" emissive="#9a3412" emissiveIntensity={0.35} />
      </instancedMesh>

      {/* Agua (corte) */}
      <mesh position={[0, H_AGUA / 2, 0]}>
        <boxGeometry args={[10, H_AGUA, Z_MEDIO * 2]} />
        <meshStandardMaterial ref={agua} color="#0f6b5a" transparent opacity={0.2} roughness={0.1} depthWrite={false} />
      </mesh>
      {[-5, 5].flatMap((x) =>
        [-Z_MEDIO, Z_MEDIO].map((z) => (
          <mesh key={`${x}${z}`} position={[x, H_AGUA / 2 - 0.25, z]}>
            <boxGeometry args={[0.04, H_AGUA + 0.5, 0.04]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh position={[0, H_AGUA, Z_MEDIO]}>
        <boxGeometry args={[10, 0.03, 0.03]} />
        <meshBasicMaterial color="#99f6e4" transparent opacity={0.7} />
      </mesh>

      <Etiqueta pos={[-3.1, Y_PLAT + capas * 0.075 + 0.75, 1.6]} col="#4ade80aa" fs={11}>
        <i className="fa-solid fa-bacteria" style={{ color: "#4ade80" }} />
        Estromatolitos · cianobacterias
      </Etiqueta>
      <Etiqueta pos={[VENTILA.x + 0.2, 2.9, 1.4]} col="#86efacaa" fs={11}>
        <i className="fa-solid fa-volcano" style={{ color: "#fb923c" }} />
        Fuente hidrotermal · Fe²⁺
      </Etiqueta>
      <Etiqueta pos={[2.6, 0.55, Z_MEDIO + 0.2]} col="#f97316aa" fs={11}>
        <i className="fa-solid fa-bars-staggered" style={{ color: "#fb923c" }} />
        Hierro bandeado · {Math.floor(depositado / FE_POR_BANDA)} {Math.floor(depositado / FE_POR_BANDA) === 1 ? "banda" : "bandas"}
      </Etiqueta>
      <Etiqueta pos={[1.6, H_AGUA + 0.45, 1.6]} col={`${oxigenado ? "#38bdf8" : "#4ade80"}aa`} fs={11}>
        <i className="fa-solid fa-droplet" style={{ color: oxigenado ? "#38bdf8" : "#4ade80" }} />
        {fe >= 0.5 ? `Océano con Fe²⁺ disuelto · ${num(fe)} u` : oxigenado ? "Océano sin hierro: el O₂ escapa" : "Océano sin hierro disuelto"}
      </Etiqueta>
      <Etiqueta pos={[-2.2, H_AGUA + 1.55, 0]} col={`${modoColor}aa`} fs={13}>
        <i className="fa-solid fa-wind" style={{ color: aire > 0 ? "#7dd3fc" : "#a8a29e" }} />
        Aire · O₂ acumulado: {num(aire)} u
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. HISTORIA DEL O₂
 * ════════════════════════════════════════════════════════════════════════ */

const R_TIERRA = 2;
const R_ATM = 2.16;
const R_OZONO = 2.42;
const CENTRO: Pt = [1.0, 0, 0];
const X_RAYO0 = -4.6;
const N_RAYOS = 40;

const GEO_PLANETA = (() => {
  const g = new THREE.IcosahedronGeometry(R_TIERRA, 18);
  const pos = g.attributes.position!;
  const n = pos.count;
  const tierra = new Float32Array(n);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const ruido = Math.sin(3.1 * v.x + 1.7) * Math.sin(2.3 * v.y + 0.4) * Math.sin(2.9 * v.z + 2.2) + 0.45 * Math.sin(5.3 * v.x + 2.1 * v.y) * Math.sin(4.1 * v.z - 1.3 * v.y);
    const esTierra = ruido > 0.16 ? 1 : 0;
    tierra[i] = esTierra;
    v.multiplyScalar(R_TIERRA * (1 + esTierra * 0.018));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.computeVertexNormals();
  g.userData.tierra = tierra;
  return g;
})();

function EscenaHistoria({ tMa, uv, modoColor }: { tMa: number; uv: boolean; modoColor: string }) {
  const r = rangoLog(tMa);
  const ozono = escudoOzono(r.medio);
  const cieloK = cieloOxigeno(r.medio);
  const glac = glaciacion(tMa) ? (tMa < 1000 ? "global" : "extensa") : "no";
  const clave = `${Math.round(cieloK * 20)}-${tMa <= 470 ? "verde" : "roca"}-${glac}`;
  const planeta = useRef<THREE.Mesh>(null);
  const atm = useRef<THREE.MeshBasicMaterial>(null);
  const oz = useRef<THREE.MeshBasicMaterial>(null);
  const rayos = useRef<THREE.InstancedMesh>(null);
  const impactos = useRef<THREE.InstancedMesh>(null);
  const pintada = useRef("");
  const ozonoVis = useRef(ozono);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cA = useMemo(() => new THREE.Color(), []);
  const cB = useMemo(() => new THREE.Color(), []);
  const cC = useMemo(() => new THREE.Color(), []);
  const violeta = useMemo(() => new THREE.Color("#c084fc"), []);
  const rojo = useMemo(() => new THREE.Color("#ef4444"), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const mesh = planeta.current;
    if (mesh) {
      mesh.rotation.y += dt * 0.08;
      if (pintada.current !== clave) {
        pintada.current = clave;
        const geo = mesh.geometry;
        const col = geo.attributes.color!;
        const pos = geo.attributes.position!;
        const tierra = geo.userData.tierra as Float32Array;
        cA.set(mezclaHex("#1f5a47", "#1d4ed8", cieloK));
        cB.set(tMa <= 470 ? "#3f7d3a" : "#7a5a3f");
        cC.set("#e8f1fb");
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i) / R_TIERRA;
          const hielo = glac === "global" ? Math.abs(y) > 0.12 : glac === "extensa" ? Math.abs(y) > 0.42 : Math.abs(y) > 0.9;
          const c = hielo ? cC : tierra[i] ? cB : cA;
          const jitter = 0.94 + 0.06 * hash(i, 20);
          col.setXYZ(i, c.r * jitter, c.g * jitter, c.b * jitter);
        }
        col.needsUpdate = true;
      }
    }
    ozonoVis.current += (ozono - ozonoVis.current) * suave(dt, 0.08);
    const oz0 = ozonoVis.current;
    if (atm.current) {
      cA.set(mezclaHex("#d9822b", "#60a5fa", cieloK));
      atm.current.color.lerp(cA, suave(dt, 0.1));
    }
    if (oz.current) oz.current.opacity = 0.03 + 0.38 * oz0;

    const m = rayos.current;
    const imp = impactos.current;
    if (m && imp) {
      for (let i = 0; i < N_RAYOS; i++) {
        const d = 1.75 * Math.sqrt(hash(i, 21));
        const a = Math.PI * 2 * hash(i, 22);
        const dy = d * Math.cos(a);
        const dz = d * Math.sin(a);
        const bloqueado = hash(i, 23) < ozono;
        const rStop = bloqueado ? R_OZONO : R_TIERRA;
        const xStop = CENTRO[0] - Math.sqrt(Math.max(0, rStop * rStop - d * d));
        const f = (t * 0.55 + hash(i, 24)) % 1;
        const x = X_RAYO0 + f * (xStop - X_RAYO0);
        obj.position.set(x - 0.22, dy, dz);
        obj.scale.set(1, 1, 1);
        if (!uv) obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
        const flash = f > 0.8 ? (f - 0.8) / 0.2 : 0;
        obj.position.set(xStop, dy, dz);
        obj.scale.setScalar(uv && flash > 0 ? 0.03 + flash * 0.1 : 0.0001);
        obj.updateMatrix();
        imp.setMatrixAt(i, obj.matrix);
        imp.setColorAt(i, bloqueado ? violeta : rojo);
      }
      m.instanceMatrix.needsUpdate = true;
      imp.instanceMatrix.needsUpdate = true;
      if (imp.instanceColor) imp.instanceColor.needsUpdate = true;
    }
  });

  const hito = hitoEn(tMa);
  const llega = Math.round((1 - ozono) * 100);
  return (
    <group>
      {/* Sol */}
      <mesh position={[-6.4, 0, -1.2]}>
        <sphereGeometry args={[0.95, 32, 20]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>
      <mesh position={[-6.4, 0, -1.2]}>
        <sphereGeometry args={[1.35, 32, 20]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <pointLight position={[-5.5, 0.4, 0.5]} intensity={40} distance={20} color="#fff3d6" />

      <group position={CENTRO}>
        <mesh ref={planeta} geometry={GEO_PLANETA} castShadow>
          <meshStandardMaterial vertexColors roughness={0.75} metalness={0.05} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R_ATM, 48, 32]} />
          <meshBasicMaterial ref={atm} color="#d9822b" transparent opacity={0.5} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R_OZONO, 48, 32]} />
          <meshBasicMaterial ref={oz} color="#a78bfa" transparent opacity={0.02} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <instancedMesh ref={rayos} args={[undefined, undefined, N_RAYOS]} frustumCulled={false}>
        <boxGeometry args={[0.45, 0.022, 0.022]} />
        <meshBasicMaterial color="#d8b4fe" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={impactos} args={[GEO_ESFERA, undefined, N_RAYOS]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      <Etiqueta pos={[CENTRO[0], -2.95, 0]} fs={11}>
        <i className={`fa-solid ${hito.icono}`} style={{ color: modoColor }} />
        {vidaEn(tMa)}
      </Etiqueta>
      <Etiqueta pos={[CENTRO[0], 2.8, 0]} col="#a78bfaaa" fs={11}>
        <i className="fa-solid fa-shield-halved" style={{ color: "#c4b5fd" }} />
        O₂ {rangoTexto(tMa)} · capa de ozono: {ozono < 0.05 ? "no existe" : ozono < 0.5 ? "delgada" : ozono < 0.9 ? "en formación" : "completa"}
      </Etiqueta>
      {uv && (
        <Etiqueta pos={[-3.4, -1.6, 0.5]} col={llega > 50 ? "#ef4444aa" : "#a78bfaaa"} fs={11}>
          <i className="fa-solid fa-sun" style={{ color: "#fbbf24" }} />
          UV que llega al suelo: {llega} %
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. QUÍMICA DEL OXÍGENO
 * ════════════════════════════════════════════════════════════════════════ */

const X_MECHERO = -1.6;
const X_FRASCO = 1.5;
const Y_CUCHARA_MECHERO = 1.78;
const N_CHISPAS = 36;
const N_HUMO = 22;

function Muestra({ id, material }: { id: ElementoId; material: THREE.Material }) {
  if (id === "mg")
    return (
      <mesh material={material} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[0.08, 0.018, 6, 20]} />
      </mesh>
    );
  if (id === "fe")
    return (
      <group position={[0, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={material}>
          <cylinderGeometry args={[0.022, 0.022, 0.34, 10]} />
        </mesh>
        <mesh material={material} position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 14]} />
        </mesh>
        <mesh material={material} position={[0, -0.19, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.022, 0.05, 10]} />
        </mesh>
      </group>
    );
  if (id === "ca")
    return (
      <group position={[0, 0.06, 0]}>
        {[-0.05, 0.04, 0, 0.06].map((x, k) => (
          <mesh key={k} material={material} position={[x, 0.01 * k, (k - 1.5) * 0.035]}>
            <dodecahedronGeometry args={[0.035, 0]} />
          </mesh>
        ))}
      </group>
    );
  if (id === "s")
    return (
      <mesh material={material} position={[0, 0.07, 0]}>
        <coneGeometry args={[0.1, 0.08, 16]} />
      </mesh>
    );
  return (
    <mesh material={material} position={[0, 0.08, 0]}>
      <dodecahedronGeometry args={[0.08, 0]} />
    </mesh>
  );
}

function EscenaOxidos({ elementoId, fase, coefTexto, modoColor }: { elementoId: ElementoId; fase: FaseOx; coefTexto: string; modoColor: string }) {
  const el = ELEMENTOS.find((e) => e.id === elementoId) ?? ELEMENTOS[0]!;
  const combustion = el.proceso === "combustion";
  const reaccionando = fase === "reaccionando";
  const enFrasco = fase === "disolviendo" || fase === "disuelto";
  const hecho = fase !== "listo";
  const cuchara = useRef<THREE.Group>(null);
  const muestra = useRef<THREE.Group>(null);
  const llama = useRef<THREE.Mesh>(null);
  const llamaMechero = useRef<THREE.Mesh>(null);
  const luz = useRef<THREE.PointLight>(null);
  const chispas = useRef<THREE.InstancedMesh>(null);
  const humo = useRef<THREE.InstancedMesh>(null);
  const liquido = useRef<THREE.MeshStandardMaterial>(null);
  const progreso = useRef(0);
  const matMuestra = useMemo(() => new THREE.MeshStandardMaterial({ color: el.colorMuestra, roughness: 0.55, metalness: el.tipo === "metal" ? 0.45 : 0 }), [el.colorMuestra, el.tipo]);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cA = useMemo(() => new THREE.Color(), []);
  const cB = useMemo(() => new THREE.Color(), []);
  const yFrasco = el.gas ? 1.3 : 0.42;

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (fase === "listo") progreso.current = 0;
    else if (reaccionando) progreso.current = Math.min(1, progreso.current + dt / 3.2);
    else progreso.current = 1;
    const pr = progreso.current;

    cA.set(el.colorMuestra);
    cB.set(el.colorProducto);
    matMuestra.color.copy(cA).lerp(cB, pr);
    if (muestra.current) muestra.current.scale.setScalar(el.gas ? 1 - 0.7 * pr : 1);

    if (cuchara.current) {
      const tx = enFrasco ? X_FRASCO : X_MECHERO;
      const ty = enFrasco ? yFrasco : Y_CUCHARA_MECHERO;
      const g = cuchara.current.position;
      const k = suave(dt, 0.045);
      g.x += (tx - g.x) * k;
      // Sube por encima de la boca del frasco antes de bajar.
      const lejos = Math.abs(tx - g.x);
      const yObjetivo = lejos > 0.25 ? 2.6 : ty;
      g.y += (yObjetivo - g.y) * suave(dt, 0.08);
    }
    const ardiendo = reaccionando && combustion;
    if (llama.current) {
      llama.current.visible = ardiendo;
      const s = 1 + 0.18 * Math.sin(t * 17) + 0.1 * Math.sin(t * 29);
      const base = el.id === "mg" ? 0.13 : 0.18;
      llama.current.scale.set(base * s, base * 1.6 * s, base * s);
    }
    if (llamaMechero.current) {
      llamaMechero.current.visible = ardiendo;
      llamaMechero.current.scale.y = 1 + 0.08 * Math.sin(t * 21);
    }
    if (luz.current) luz.current.intensity = ardiendo ? (el.id === "mg" ? 9 : 4) * (1 + 0.2 * Math.sin(t * 23)) : 0;

    const pos = cuchara.current?.position;
    const ch = chispas.current;
    if (ch && pos) {
      const hay = ardiendo && el.id !== "s";
      for (let i = 0; i < N_CHISPAS; i++) {
        const f = (t * (el.id === "c" ? 0.7 : 1.5) + hash(i, 30)) % 1;
        const a = Math.PI * 2 * hash(i, 31);
        const v = 0.5 + hash(i, 32) * 0.6;
        obj.position.set(pos.x + Math.cos(a) * v * f, pos.y + 0.1 + (0.9 * v * f - 1.2 * f * f) * (el.id === "c" ? 0.4 : 1), pos.z + Math.sin(a) * v * f);
        obj.scale.setScalar(hay ? 0.022 * (1 - f) + 0.004 : 0.0001);
        obj.updateMatrix();
        ch.setMatrixAt(i, obj.matrix);
      }
      ch.instanceMatrix.needsUpdate = true;
    }
    const hu = humo.current;
    if (hu && pos) {
      for (let i = 0; i < N_HUMO; i++) {
        const f = (t * 0.35 + hash(i, 33)) % 1;
        let ver = false;
        if (el.gas && reaccionando) {
          obj.position.set(pos.x + Math.sin(f * 5 + i) * 0.15 * f, pos.y + 0.25 + f * 1.3, pos.z + Math.cos(f * 4 + i) * 0.12 * f);
          obj.scale.setScalar(0.06 + f * 0.16);
          ver = true;
        } else if (el.gas && enFrasco) {
          const a = t * 0.6 + hash(i, 34) * Math.PI * 2;
          const rr = 0.2 + hash(i, 35) * 0.35;
          obj.position.set(X_FRASCO + Math.cos(a) * rr, 0.8 + hash(i, 36) * 1.0 + Math.sin(t + i) * 0.05, Math.sin(a) * rr);
          obj.scale.setScalar((0.12 + 0.06 * Math.sin(t * 0.8 + i)) * (fase === "disuelto" ? 0.5 : 1));
          ver = true;
        }
        if (!ver) obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        hu.setMatrixAt(i, obj.matrix);
      }
      hu.instanceMatrix.needsUpdate = true;
    }
    if (liquido.current) {
      cA.set(enFrasco ? colorPH(el.pH) : colorPH(7));
      liquido.current.color.lerp(cA, suave(dt, fase === "disolviendo" ? 0.025 : 0.2));
    }
  });

  const pHVisto = fase === "disuelto" ? el.pH : 7;
  return (
    <group>
      {/* Mesa */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.24, 3.4]} />
        <meshStandardMaterial color="#2a3442" roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.2, -1.2]}>
        <boxGeometry args={[7, 2, 0.9]} />
        <meshStandardMaterial color="#1c2530" roughness={0.9} />
      </mesh>

      {/* Soporte universal */}
      <mesh position={[-2.6, 0.02, -0.2]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-2.75, 1.6, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 3.2, 10]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[(-2.75 + X_MECHERO) / 2, Y_CUCHARA_MECHERO + 1.2, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, Math.abs(X_MECHERO + 2.75), 8]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Mechero */}
      <group position={[X_MECHERO, 0, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.36, 0.1, 24]} />
          <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 1.05, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh ref={llamaMechero} position={[0, 1.38, 0]} visible={false}>
          <coneGeometry args={[0.09, 0.55, 16, 1, true]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* Cucharilla de combustión */}
      <group ref={cuchara} position={[X_MECHERO, Y_CUCHARA_MECHERO, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.14, 0.11, 0.06, 20, 1, true]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0.13, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.2, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.13, 1.24, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.14, 10]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        <group ref={muestra}>
          <Muestra id={el.id} material={matMuestra} />
        </group>
        <mesh ref={llama} position={[0, 0.2, 0]} visible={false}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color={el.colorLlama} transparent opacity={el.id === "mg" ? 0.95 : 0.7} depthWrite={false} toneMapped={false} />
        </mesh>
        <pointLight ref={luz} position={[0, 0.3, 0.3]} intensity={0} distance={5} color={el.colorLlama} />
      </group>

      <instancedMesh ref={chispas} args={[GEO_ESFERA, undefined, N_CHISPAS]} frustumCulled={false}>
        <meshBasicMaterial color={el.id === "mg" ? "#ffffff" : "#fdba74"} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={humo} args={[GEO_ESFERA, undefined, N_HUMO]} frustumCulled={false}>
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>

      {/* Frasco con agua e indicador universal */}
      <group position={[X_FRASCO, 0, 0]}>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.66, 0.66, 0.6, 40]} />
          <meshStandardMaterial ref={liquido} color={colorPH(7)} transparent opacity={0.82} roughness={0.15} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 2.0, 40, 1, true]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.16} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.04, 40]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.05} />
        </mesh>
        <mesh position={[0, 2.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.025, 8, 40]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} />
        </mesh>
      </group>

      <Etiqueta pos={[-0.1, 3.05, 0]} col={`${modoColor}aa`} fs={13} df={6}>
        <i className="fa-solid fa-atom" style={{ color: modoColor }} />
        {coefTexto}
      </Etiqueta>
      {enFrasco && (
        <Etiqueta pos={[X_FRASCO, 2.55, 0]} col={`${colorPH(el.pH)}aa`} fs={12} df={6}>
          <i className="fa-solid fa-droplet" style={{ color: colorPH(el.pH) }} />
          {el.conAgua}
        </Etiqueta>
      )}
      <Etiqueta pos={[X_MECHERO + 0.2, 0.2, 1.2]} fs={11} df={6}>
        <i className="fa-solid fa-vial" style={{ color: el.tipo === "metal" ? "#cbd5e1" : "#facc15" }} />
        {hecho ? el.nombreProducto : el.muestra} · {el.tipo}
      </Etiqueta>
      <Html position={[X_FRASCO + 0.05, 0.15, 1.25]} center distanceFactor={6} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "6px 9px 7px", borderRadius: 10, background: "rgba(4,10,22,0.86)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>
          <div style={{ marginBottom: 4 }}>
            Indicador universal · pH {fase === "disuelto" ? el.pHTexto : "≈ 7"}
          </div>
          <div style={{ position: "relative", display: "flex", width: 168, height: 9, borderRadius: 4, overflow: "hidden" }}>
            {Array.from({ length: 14 }, (_, k) => (
              <span key={k} style={{ flex: 1, background: colorPH(k + 0.5) }} />
            ))}
          </div>
          <div style={{ position: "relative", width: 168, height: 8 }}>
            <span style={{ position: "absolute", left: `${((pHVisto - 0.5) / 14) * 100}%`, top: 0, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid #fff", transform: "translateX(-50%)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: 168, fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
            <span>1 ácido</span>
            <span>7</span>
            <span>básico 14</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function OxigenacionAtmosferaScene(p: OxigenacionSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "mar") return { pos: [0.4, 3.2, 11.6], target: [0, 0.7, 0] };
    if (vista === "historia") return { pos: [-1.0, 1.4, 9.6], target: [-1.0, 0.1, 0] };
    return { pos: [0, 2.7, 6.9], target: [0, 1.05, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 44]} />
      <ambientLight intensity={vista === "historia" ? 0.25 : 0.55} />
      <directionalLight position={[4, 9, 6]} intensity={vista === "historia" ? 0.25 : 1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "mar" && <EscenaMar {...p} />}
      {vista === "historia" && <EscenaHistoria tMa={p.tMa} uv={p.uv} modoColor={modoColor} />}
      {vista === "oxidos" && <EscenaOxidos elementoId={p.elementoId} fase={p.fase} coefTexto={p.coefTexto} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3.5} maxDistance={20} maxPolarAngle={Math.PI * 0.52} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
