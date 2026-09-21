"use client";

/**
 * Escena 3D del laboratorio "Innovaciones tecnológicas para el ambiente"
 * (CNEYT-III-P08). Tres vistas:
 *
 *  - lluvia: una vivienda con su azotea, canaleta, separador de primeras
 *    lluvias y cisterna; nubes y lluvia según el mes, la gráfica de lluvia
 *    mensual de la ciudad y un corte del suelo con el acuífero.
 *  - humedal: fosa séptica, lecho de grava plantado con tule y carrizo, el agua
 *    que avanza cambiando de color según su DBO₅ y, detrás, la gráfica del
 *    perfil de DBO₅ a lo largo del humedal contra el límite de la NOM-003.
 *  - manglar: perfil de costa con mar, las tres zonas de inundación, los
 *    árboles que sobreviven (y crecen con los años), el pueblo y la ola de
 *    tormenta que pierde altura al cruzar el bosque.
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
  type CiudadId,
  type TechoId,
  type Plantacion,
  type ZonaId,
  type EspecieId,
  CIUDADES,
  MESES,
  DBO_ENTRADA,
  NOM_DIRECTO,
  NOM_INDIRECTO,
  dboEn,
  dboSalida,
  tiempoResidencia,
  calidad,
  CALIDAD_DEF,
  ZONAS,
  ESPECIES,
  supervivencia,
  ANCHO_MAX,
  OLA_INICIAL,
  olaTrasZonas,
  madurez,
  co2Acumulado,
  num,
} from "./innovaciones-ambientales-data";

export type VistaInnovaciones = "lluvia" | "humedal" | "manglar";

export interface InnovacionesSceneProps {
  vista: VistaInnovaciones;
  modoColor: string;
  resetNonce: number;
  // Lluvia
  ciudadId: CiudadId;
  techoId: TechoId;
  area: number;
  capacidad: number;
  mesVista: number;
  /** Litros en la cisterna al terminar el mes mostrado. */
  nivel: number;
  desborda: boolean;
  // Humedal
  personas: number;
  areaHumedal: number;
  tempC: number;
  muestraNonce: number;
  // Manglar
  plantacion: Plantacion;
  ancho: number;
  anios: number;
  olaNonce: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
/** Pseudoaleatorio determinista a partir de un entero (sin Math.random en render). */
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
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
 * 1. COSECHA DE LLUVIA
 * ════════════════════════════════════════════════════════════════════════ */

const N_GOTAS = 320;
const ALTO_CASA = 2.3;
const GEO_GOTA = new THREE.BoxGeometry(0.018, 0.26, 0.018);
const GEO_NUBE = new THREE.SphereGeometry(1, 16, 12);

const TECHO_COLOR: Record<TechoId, string> = { concreto: "#9ca3af", teja: "#b45309", lamina: "#cbd5e1" };

function Lluvia({ intensidad, sx, sz }: { intensidad: number; sx: number; sz: number }) {
  const gotas = useRef<THREE.InstancedMesh>(null);
  const semillas = useMemo(() => Array.from({ length: N_GOTAS }, (_, i) => ({ x: (hash(i) - 0.5) * 11 - 1.2, z: (hash(i + 900) - 0.5) * 6, fase: hash(i + 1800) })), []);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const activo = useRef(0);
  useFrame(({ clock }, dt) => {
    activo.current += (intensidad - activo.current) * suave(dt, 0.05);
    const mesh = gotas.current;
    if (!mesh) return;
    const n = Math.round(activo.current * N_GOTAS);
    semillas.forEach((s, i) => {
      const p = (clock.elapsedTime * 1.3 + s.fase) % 1;
      const sobreCasa = Math.abs(s.x) < sx / 2 && Math.abs(s.z) < sz / 2;
      const suelo = sobreCasa ? ALTO_CASA + 0.1 : 0;
      obj.position.set(s.x, suelo + (1 - p) * (5.4 - suelo), s.z);
      obj.scale.setScalar(i < n ? 1 : 0.0001);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={gotas} args={[GEO_GOTA, undefined, N_GOTAS]} frustumCulled={false}>
      <meshBasicMaterial color="#bae6fd" transparent opacity={0.55} />
    </instancedMesh>
  );
}

function Nubes({ intensidad }: { intensidad: number }) {
  const grupo = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 1, transparent: true, opacity: 0.9 }), []);
  const oscuro = useMemo(() => new THREE.Color("#475569"), []);
  const claro = useMemo(() => new THREE.Color("#e2e8f0"), []);
  const f = useRef(0);
  useFrame(({ clock }, dt) => {
    f.current += (intensidad - f.current) * suave(dt, 0.04);
    mat.color.copy(claro).lerp(oscuro, Math.min(1, f.current * 1.2));
    mat.setValues({ opacity: 0.35 + 0.6 * Math.min(1, f.current * 2 + 0.1) });
    if (grupo.current) grupo.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.6;
  });
  const bolas: { p: Pt; r: number }[] = [
    { p: [-3.6, 5.6, -0.6], r: 0.9 },
    { p: [-2.6, 5.9, -0.4], r: 1.2 },
    { p: [-1.4, 5.7, -0.8], r: 1.0 },
    { p: [0.4, 6.0, -0.2], r: 1.3 },
    { p: [1.6, 5.7, -0.6], r: 1.0 },
    { p: [2.8, 5.9, -0.3], r: 0.85 },
    { p: [-0.6, 6.3, -1.2], r: 1.1 },
  ];
  return (
    <group ref={grupo}>
      {bolas.map((b, k) => (
        <mesh key={k} geometry={GEO_NUBE} material={mat} position={b.p} scale={[b.r * 1.4, b.r * 0.7, b.r]} />
      ))}
    </group>
  );
}

function Cisterna({ x, capacidad, nivel, desborda }: { x: number; capacidad: number; nivel: number; desborda: boolean }) {
  const r = 0.5 * Math.cbrt(capacidad / 1100);
  const h = 1.5 * r;
  const agua = useRef<THREE.Mesh>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const derrame = useRef<THREE.InstancedMesh>(null);
  const charco = useRef<THREE.Mesh>(null);
  const actual = useRef(nivel);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    actual.current += (nivel - actual.current) * suave(dt, 0.06);
    const f = Math.min(1, Math.max(0, actual.current / capacidad));
    if (agua.current) {
      agua.current.scale.y = Math.max(0.002, f * h * 0.96);
      agua.current.position.y = 0.05 + (f * h * 0.96) / 2;
    }
    if (lectura.current) lectura.current.textContent = `${num(Math.round(actual.current / 10) * 10)} / ${num(capacidad)} L`;
    const mesh = derrame.current;
    if (mesh) {
      for (let i = 0; i < 24; i++) {
        const p = (clock.elapsedTime * 0.9 + i / 24) % 1;
        const a = (i / 24) * Math.PI * 2;
        obj.position.set(Math.cos(a) * (r + p * 0.25), h - p * h, Math.sin(a) * (r + p * 0.25));
        obj.scale.setScalar(desborda ? 0.045 : 0.0001);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (charco.current) {
      const objetivo = desborda ? 1 : 0.001;
      const s = charco.current.scale.x + (objetivo - charco.current.scale.x) * suave(dt, 0.03);
      charco.current.scale.set(s, s, 1);
    }
  });
  return (
    <group position={[x, 0, 0.6]}>
      <mesh position={[0, h / 2 + 0.05, 0]}>
        <cylinderGeometry args={[r, r, h, 40, 1, true]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.22} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, h + 0.07, 0]}>
        <cylinderGeometry args={[r * 1.02, r * 1.02, 0.06, 40]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.5} />
      </mesh>
      <mesh ref={agua} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[r * 0.96, r * 0.96, 1, 40]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} roughness={0.15} emissive="#0369a1" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[r * 1.05, r * 1.05, 0.05, 40]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <instancedMesh ref={derrame} args={[undefined, undefined, 24]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#7dd3fc" />
      </instancedMesh>
      <mesh ref={charco} position={[0.2, 0.012, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.001, 0.001, 1]}>
        <circleGeometry args={[r * 1.35, 32]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.45} roughness={0.05} />
      </mesh>
      <Etiqueta pos={[0, h + 0.55, 0]} df={10} col={desborda ? "#f87171aa" : "#38bdf8aa"} fs={12}>
        <i className="fa-solid fa-droplet" style={{ color: desborda ? "#f87171" : "#38bdf8" }} />
        <span ref={lectura}>0 L</span>
        {desborda ? " · se desborda" : ""}
      </Etiqueta>
    </group>
  );
}

function EscenaLluvia({ ciudadId, techoId, area, capacidad, mesVista, nivel, desborda, modoColor }: { ciudadId: CiudadId; techoId: TechoId; area: number; capacidad: number; mesVista: number; nivel: number; desborda: boolean; modoColor: string }) {
  const ciudad = CIUDADES.find((c) => c.id === ciudadId) ?? CIUDADES[0]!;
  const mm = ciudad.mm[mesVista] ?? 0;
  const intensidad = Math.min(1, mm / 170);
  const s = Math.sqrt(area / 70);
  const sx = 2.3 * s;
  const sz = 1.9 * s;
  const rCis = 0.5 * Math.cbrt(capacidad / 1100);
  const hCis = 1.5 * rCis;
  const xCis = sx / 2 + 0.55 + rCis;
  const xBajante = sx / 2 + 0.12;
  const nCanales = Math.max(3, Math.round(sx / 0.28));
  const flujo = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const maxMm = 190;
  const chartX0 = -7.9;
  useFrame(({ clock }) => {
    const mesh = flujo.current;
    if (!mesh) return;
    for (let i = 0; i < 16; i++) {
      const p = (clock.elapsedTime * 0.8 + i / 16) % 1;
      // Baja por el tubo y cruza a la cisterna.
      const yTop = ALTO_CASA + 0.05;
      const yCodo = hCis + 0.35;
      const tramo = yTop - yCodo;
      const largo = tramo + (xCis - xBajante);
      const d = p * largo;
      if (d < tramo) obj.position.set(xBajante, yTop - d, sz / 2 - 0.1);
      else obj.position.set(xBajante + (d - tramo), yCodo, sz / 2 - 0.1 + ((d - tramo) / (xCis - xBajante)) * (0.7 - sz / 2));
      obj.scale.setScalar(mm >= 10 ? 0.05 : 0.0001);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0.6, -1.6, 0]}>
      {/* Suelo con corte: tierra, roca y acuífero */}
      <mesh position={[-1.2, -0.03, 0]} receiveShadow>
        <boxGeometry args={[16, 0.06, 7.5]} />
        <meshStandardMaterial color="#4d5b47" roughness={1} />
      </mesh>
      <mesh position={[-1.2, -0.45, 0]}>
        <boxGeometry args={[16, 0.8, 7.5]} />
        <meshStandardMaterial color="#6b4f2a" roughness={1} />
      </mesh>
      <mesh position={[-1.2, -1.35, 0]}>
        <boxGeometry args={[16, 1.0, 7.5]} />
        <meshStandardMaterial color="#57534e" roughness={1} />
      </mesh>
      <mesh position={[-0.5, -1.35, 3.76]}>
        <boxGeometry args={[11, 0.45, 0.02]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <Etiqueta pos={[3.6, -1.35, 3.9]} df={11} fs={10.5} col="#38bdf8aa">
        <i className="fa-solid fa-water" style={{ color: "#38bdf8" }} />
        Acuífero: cada litro cosechado es uno menos que se bombea
      </Etiqueta>

      {/* Vivienda */}
      <mesh position={[0, ALTO_CASA / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx, ALTO_CASA, sz]} />
        <meshStandardMaterial color="#e7d8c3" roughness={0.85} />
      </mesh>
      <mesh position={[0, ALTO_CASA + 0.05, 0]} castShadow>
        <boxGeometry args={[sx + 0.14, 0.1, sz + 0.14]} />
        <meshStandardMaterial color={TECHO_COLOR[techoId]} roughness={techoId === "lamina" ? 0.35 : 0.8} metalness={techoId === "lamina" ? 0.6 : 0} />
      </mesh>
      {techoId !== "concreto" &&
        Array.from({ length: nCanales }, (_, k) => (
          <mesh key={k} position={[-sx / 2 + (k + 0.5) * (sx / nCanales), ALTO_CASA + 0.13, 0]}>
            <boxGeometry args={[techoId === "teja" ? 0.16 : 0.04, 0.06, sz + 0.1]} />
            <meshStandardMaterial color={techoId === "teja" ? "#92400e" : "#94a3b8"} roughness={0.5} metalness={techoId === "lamina" ? 0.6 : 0} />
          </mesh>
        ))}
      {/* Puerta y ventanas */}
      <mesh position={[-sx * 0.22, 0.55, sz / 2 + 0.01]}>
        <boxGeometry args={[0.5, 1.1, 0.02]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.6} />
      </mesh>
      {[-0.05, 0.25].map((f) => (
        <mesh key={f} position={[sx * f + sx * 0.12, 1.45, sz / 2 + 0.01]}>
          <boxGeometry args={[0.5, 0.45, 0.02]} />
          <meshStandardMaterial color="#1e3a5f" emissive="#fbbf24" emissiveIntensity={0.15} roughness={0.2} />
        </mesh>
      ))}
      {/* Canaleta, bajante y separador de primeras lluvias */}
      <mesh position={[0, ALTO_CASA - 0.02, sz / 2 + 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, sx + 0.2, 12, 1, true]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[xBajante, (ALTO_CASA + hCis + 0.35) / 2, sz / 2 - 0.1]}>
        <cylinderGeometry args={[0.05, 0.05, ALTO_CASA - hCis - 0.35, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <mesh position={[xBajante, hCis + 0.35 - 0.45, sz / 2 - 0.1]}>
        <cylinderGeometry args={[0.09, 0.09, 0.9, 14]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
      </mesh>
      <mesh position={[(xBajante + xCis) / 2, hCis + 0.35, (sz / 2 - 0.1 + 0.7) / 2]} rotation={[0, Math.atan2(xCis - xBajante, 0.7 - (sz / 2 - 0.1)) + Math.PI / 2, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, Math.hypot(xCis - xBajante, 0.7 - (sz / 2 - 0.1)), 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <instancedMesh ref={flujo} args={[undefined, undefined, 16]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#7dd3fc" />
      </instancedMesh>
      <Etiqueta pos={[0, ALTO_CASA + 0.55, -sz / 2 + 0.2]} df={10} fs={11} col={`${modoColor}aa`}>
        <i className="fa-solid fa-house-chimney" style={{ color: modoColor }} />
        Azotea de {area} m²
      </Etiqueta>

      <Cisterna x={xCis} capacidad={capacidad} nivel={nivel} desborda={desborda} />

      {/* Gráfica de lluvia mensual */}
      <mesh position={[chartX0 + 2.2, 1.35, -0.6]} receiveShadow>
        <boxGeometry args={[5.0, 3.1, 0.08]} />
        <meshStandardMaterial color="#13233b" roughness={0.9} />
      </mesh>
      {ciudad.mm.map((v, i) => {
        const hBar = Math.max(0.02, (v / maxMm) * 2.2);
        const on = i === mesVista;
        return (
          <group key={i} position={[chartX0 + 0.2 + i * 0.365, 0, -0.45]}>
            <mesh position={[0, 0.2 + hBar / 2, 0]}>
              <boxGeometry args={[0.22, hBar, 0.16]} />
              <meshStandardMaterial color={on ? modoColor : "#1d4ed8"} emissive={on ? modoColor : "#000"} emissiveIntensity={on ? 0.6 : 0} roughness={0.4} />
            </mesh>
            {on && (
              <Etiqueta pos={[0, 0.2 + hBar + 0.3, 0.1]} df={10} fs={10.5} col={`${modoColor}aa`}>
                {MESES[i]} · {v} mm
              </Etiqueta>
            )}
          </group>
        );
      })}
      <Etiqueta pos={[chartX0 + 2.2, 3.15, -0.45]} df={10} fs={11} col={`${modoColor}aa`}>
        <i className="fa-solid fa-cloud-rain" style={{ color: modoColor }} />
        {ciudad.etq}: {num(ciudad.mm.reduce((a, b) => a + b, 0))} mm al año
      </Etiqueta>

      <Nubes intensidad={intensidad} />
      <Lluvia intensidad={intensidad} sx={sx} sz={sz} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. HUMEDAL ARTIFICIAL
 * ════════════════════════════════════════════════════════════════════════ */

const L_HUM = 7.4;
const N_GRAVA = 260;
const N_JUNCOS = 110;
const N_AGUA = 90;
const GEO_GRAVA = new THREE.DodecahedronGeometry(1, 0);
const GEO_JUNCO = new THREE.CylinderGeometry(0.012, 0.03, 1, 5);
const GEO_ESPIGA = new THREE.CapsuleGeometry(0.035, 0.14, 3, 6);
const COL_SUCIA = new THREE.Color("#7c5a2a");
const COL_LIMPIA = new THREE.Color("#38bdf8");

function colorDbo(dbo: number, out: THREE.Color) {
  const f = Math.min(1, Math.max(0, Math.sqrt(dbo / DBO_ENTRADA)));
  return out.copy(COL_LIMPIA).lerp(COL_SUCIA, f);
}

function EscenaHumedal({ personas, areaHumedal, tempC, muestraNonce, modoColor }: { personas: number; areaHumedal: number; tempC: number; muestraNonce: number; modoColor: string }) {
  const ancho = 1.3 + (areaHumedal / 300) * 2.6;
  const t = tiempoResidencia(areaHumedal, personas);
  const salida = dboSalida(areaHumedal, personas, tempC);
  const cal = calidad(salida);
  const agua = useRef<THREE.InstancedMesh>(null);
  const grava = useRef<THREE.InstancedMesh>(null);
  const juncos = useRef<THREE.InstancedMesh>(null);
  const espigas = useRef<THREE.InstancedMesh>(null);
  const salidaMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#38bdf8", transparent: true, opacity: 0.75, roughness: 0.1 }), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semAgua = useMemo(() => Array.from({ length: N_AGUA }, (_, i) => ({ z: hash(i + 40) - 0.5, y: hash(i + 80), fase: hash(i + 120) })), []);
  const semGrava = useMemo(() => Array.from({ length: N_GRAVA }, (_, i) => ({ x: hash(i + 300) - 0.5, z: hash(i + 600) - 0.5, y: hash(i + 900), s: 0.07 + hash(i + 1200) * 0.07 })), []);
  const semJuncos = useMemo(() => Array.from({ length: N_JUNCOS }, (_, i) => ({ x: hash(i + 1500) - 0.5, z: hash(i + 1800) - 0.5, h: 0.8 + hash(i + 2100) * 0.9, inc: (hash(i + 2400) - 0.5) * 0.25 })), []);
  const duracion = Math.min(14, Math.max(3, 1.6 + t * 2.2));
  const escalaAncho = useRef(ancho);

  useFrame(({ clock }, dt) => {
    escalaAncho.current += (ancho - escalaAncho.current) * suave(dt, 0.08);
    const w = escalaAncho.current;
    const g = grava.current;
    if (g) {
      semGrava.forEach((s, i) => {
        obj.position.set(s.x * (L_HUM - 0.2), 0.12 + s.y * 0.55, s.z * (w - 0.2));
        obj.rotation.set(s.x * 9, s.z * 7, 0);
        obj.scale.setScalar(s.s);
        obj.updateMatrix();
        g.setMatrixAt(i, obj.matrix);
      });
      g.instanceMatrix.needsUpdate = true;
    }
    const j = juncos.current;
    const e = espigas.current;
    if (j && e) {
      semJuncos.forEach((s, i) => {
        const vaiven = Math.sin(clock.elapsedTime * 1.2 + i) * 0.04;
        obj.position.set(s.x * (L_HUM - 0.4), 0.72 + s.h / 2, s.z * (w - 0.3));
        obj.rotation.set(s.inc + vaiven, 0, s.inc * 0.6);
        obj.scale.set(1, s.h, 1);
        obj.updateMatrix();
        j.setMatrixAt(i, obj.matrix);
        obj.position.set(s.x * (L_HUM - 0.4) + Math.sin(s.inc * 0.6) * -s.h * 0.45, 0.72 + s.h * 0.92, s.z * (w - 0.3) + Math.sin(s.inc + vaiven) * s.h * 0.45);
        obj.scale.setScalar(i % 3 === 0 ? 1 : 0.0001);
        obj.updateMatrix();
        e.setMatrixAt(i, obj.matrix);
      });
      j.instanceMatrix.needsUpdate = true;
      e.instanceMatrix.needsUpdate = true;
    }
    const a = agua.current;
    if (a) {
      semAgua.forEach((s, i) => {
        const p = (clock.elapsedTime / duracion + s.fase) % 1;
        obj.position.set(-L_HUM / 2 + p * L_HUM, 0.18 + s.y * 0.45, s.z * (w - 0.3));
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(0.1);
        obj.updateMatrix();
        a.setMatrixAt(i, obj.matrix);
        a.setColorAt(i, colorDbo(dboEn(p, areaHumedal, personas, tempC), tmp));
      });
      a.instanceMatrix.needsUpdate = true;
      if (a.instanceColor) a.instanceColor.needsUpdate = true;
    }
    colorDbo(salida, salidaMat.color);
  });

  const perfil = Array.from({ length: 14 }, (_, k) => {
    const x = (k + 0.5) / 14;
    return { x, dbo: dboEn(x, areaHumedal, personas, tempC) };
  });
  const H_GRAF = 2.2;
  const yGraf = (d: number) => (Math.min(d, DBO_ENTRADA) / DBO_ENTRADA) * H_GRAF;
  const zGraf = -ancho / 2 - 1.5;
  const frio = tempC <= 12;
  const calido = tempC >= 24;

  return (
    <group position={[0.3, -1.3, 0.4]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[14, 0.1, 9]} />
        <meshStandardMaterial color="#3f4a3c" roughness={1} />
      </mesh>
      {/* Muros del humedal (corte frontal abierto) */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[L_HUM + 0.2, 0.1, ancho + 0.2]} />
        <meshStandardMaterial color="#44403c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, -ancho / 2 - 0.05]}>
        <boxGeometry args={[L_HUM + 0.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#78716c" roughness={0.8} />
      </mesh>
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * (L_HUM / 2 + 0.05), 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, ancho + 0.2]} />
          <meshStandardMaterial color="#78716c" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, ancho / 2 + 0.05]}>
        <boxGeometry args={[L_HUM + 0.2, 0.8, 0.02]} />
        <meshStandardMaterial color="#a8a29e" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Grava, agua y plantas */}
      <instancedMesh ref={grava} args={[GEO_GRAVA, undefined, N_GRAVA]} frustumCulled={false}>
        <meshStandardMaterial color="#a8a29e" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={agua} args={[undefined, undefined, N_AGUA]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial roughness={0.3} />
      </instancedMesh>
      {perfil.map((p, k) => (
        <mesh key={k} position={[-L_HUM / 2 + p.x * L_HUM, 0.36, 0]}>
          <boxGeometry args={[L_HUM / 14, 0.56, ancho - 0.04]} />
          <meshStandardMaterial color={colorDbo(p.dbo, new THREE.Color())} transparent opacity={0.62} roughness={0.1} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[L_HUM, 0.04, ancho]} />
        <meshStandardMaterial color="#57534e" roughness={1} />
      </mesh>
      <instancedMesh ref={juncos} args={[GEO_JUNCO, undefined, N_JUNCOS]} frustumCulled={false}>
        <meshStandardMaterial color={frio ? "#65a30d" : "#4d7c0f"} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={espigas} args={[GEO_ESPIGA, undefined, N_JUNCOS]} frustumCulled={false}>
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </instancedMesh>

      {/* Fosa séptica y tubo de entrada */}
      <mesh position={[-L_HUM / 2 - 1.3, 0.45, 0]} castShadow>
        <boxGeometry args={[1.3, 0.9, 1.2]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} />
      </mesh>
      <mesh position={[-L_HUM / 2 - 0.3, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      <Etiqueta pos={[-L_HUM / 2 - 1.3, 1.35, 0]} df={10} fs={11} col="#a16207aa">
        <i className="fa-solid fa-toilet" style={{ color: "#fbbf24" }} />
        Entra: {DBO_ENTRADA} mg/L · {num(personas)} personas
      </Etiqueta>
      {/* Salida hacia el riego */}
      <mesh position={[L_HUM / 2 + 0.4, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      <mesh position={[L_HUM / 2 + 1.5, 0.04, 0]} material={salidaMat}>
        <boxGeometry args={[1.5, 0.08, 1.4]} />
      </mesh>
      {Array.from({ length: 9 }, (_, k) => (
        <mesh key={k} position={[L_HUM / 2 + 1.0 + (k % 3) * 0.5, 0.22, -0.9 + Math.floor(k / 3) * 0.9 + (k % 2) * 0.1]}>
          <coneGeometry args={[0.16, 0.36, 7]} />
          <meshStandardMaterial color={cal === "no" ? "#854d0e" : "#16a34a"} roughness={0.8} />
        </mesh>
      ))}
      <Muestra key={muestraNonce} activa={muestraNonce > 0} x={L_HUM / 2 + 1.1} dbo={salida} />

      {/* Gráfica del perfil de DBO₅ a lo largo del humedal */}
      <group position={[0, 1.55, zGraf]}>
        <mesh position={[0, H_GRAF / 2 + 0.05, -0.08]}>
          <boxGeometry args={[L_HUM + 0.6, H_GRAF + 0.5, 0.06]} />
          <meshStandardMaterial color="#0b1628" roughness={0.9} />
        </mesh>
        {perfil.map((p, k) => {
          const h = Math.max(0.02, yGraf(p.dbo));
          const c = CALIDAD_DEF[calidad(p.dbo)].color;
          return (
            <mesh key={k} position={[-L_HUM / 2 + p.x * L_HUM, h / 2, 0]}>
              <boxGeometry args={[L_HUM / 14 - 0.08, h, 0.1]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} roughness={0.4} />
            </mesh>
          );
        })}
        {[NOM_INDIRECTO, NOM_DIRECTO].map((lim) => (
          <mesh key={lim} position={[0, yGraf(lim), 0.07]}>
            <boxGeometry args={[L_HUM + 0.4, 0.025, 0.02]} />
            <meshBasicMaterial color={lim === NOM_DIRECTO ? "#34d399" : "#fbbf24"} />
          </mesh>
        ))}
        <Etiqueta pos={[L_HUM / 2 + 1.25, yGraf(NOM_INDIRECTO) + 0.14, 0]} df={11} fs={10} col="#fbbf24aa">
          NOM-003: 30 / 20 mg/L
        </Etiqueta>
        <Etiqueta pos={[0, H_GRAF + 0.2, 0]} df={10} fs={11} col={`${modoColor}aa`}>
          <i className="fa-solid fa-chart-line" style={{ color: modoColor }} />
          DBO₅ a lo largo del humedal · {num(t, 1)} días dentro
        </Etiqueta>
      </group>

      {/* Termómetro del clima */}
      <group position={[-L_HUM / 2 - 1.3, 0.25, 1.35]}>
        <Etiqueta pos={[0, 0, 0]} df={10} fs={11} col={frio ? "#93c5fdaa" : calido ? "#fb923caa" : "#e2e8f0aa"}>
          <i className={`fa-solid ${frio ? "fa-snowflake" : calido ? "fa-sun" : "fa-temperature-half"}`} style={{ color: frio ? "#93c5fd" : calido ? "#fb923c" : "#e2e8f0" }} />
          Agua a {tempC} °C
        </Etiqueta>
      </group>
      <Etiqueta pos={[L_HUM / 2 + 1.5, 1.05, 0.9]} df={10} fs={11} col={`${CALIDAD_DEF[cal].color}aa`}>
        <i className="fa-solid fa-faucet-drip" style={{ color: CALIDAD_DEF[cal].color }} />
        Sale: {num(salida, 1)} mg/L
      </Etiqueta>
    </group>
  );
}

function Muestra({ activa, x, dbo }: { activa: boolean; x: number; dbo: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current = activa ? t.current + dt : 0;
    const f = Math.min(1, t.current / 1.2);
    ref.current.visible = activa;
    ref.current.position.y = 0.25 + Math.sin(f * Math.PI) * 0.4 + f * 0.6;
  });
  const c = CALIDAD_DEF[calidad(dbo)].color;
  return (
    <group ref={ref} position={[x, 0.3, -0.5]} visible={false}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.42, 16]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. RESTAURAR EL MANGLAR
 * ════════════════════════════════════════════════════════════════════════ */

const X0_COSTA = -3.2;
const LARGO_VISUAL = 7.2;
const FILAS = [-2.3, -1.15, 0, 1.15, 2.3];
const MAX_ARBOLES = 90;
const GEO_TRONCO = new THREE.CylinderGeometry(0.05, 0.08, 1, 7);
const GEO_COPA = new THREE.IcosahedronGeometry(1, 1);
const GEO_CONO = new THREE.ConeGeometry(1, 1, 7);
const GEO_RAIZ = new THREE.CylinderGeometry(0.018, 0.024, 1, 5);
const GEO_NEUMA = new THREE.ConeGeometry(0.025, 1, 5);
const ALTO_ZONA: Record<ZonaId, number> = { borde: -0.12, media: 0.08, interna: 0.26 };
const COPA_COLOR: Record<EspecieId, string> = { rojo: "#166534", negro: "#3f6212", blanco: "#65a30d", casuarina: "#4d7c0f" };

interface Arbol {
  x: number;
  z: number;
  y: number;
  especie: EspecieId;
  vivo: boolean;
  tam: number;
}

function Bosque({ plantacion, ancho, anios }: { plantacion: Plantacion; ancho: number; anios: number }) {
  const largo = (ancho / ANCHO_MAX) * LARGO_VISUAL;
  const arboles = useMemo(() => {
    const lista: Arbol[] = [];
    ZONAS.forEach((z, zi) => {
      const e = plantacion[z.id];
      if (!e || largo <= 0) return;
      const inicio = X0_COSTA + (largo / 3) * zi;
      const cols = Math.max(1, Math.floor(largo / 3 / 0.6));
      const paso = largo / 3 / cols;
      const sup = supervivencia(e, z.id);
      for (let c = 0; c < cols; c++)
        FILAS.forEach((fz, fi) => {
          const id = zi * 1000 + c * 10 + fi;
          lista.push({ x: inicio + (c + 0.5) * paso + (hash(id) - 0.5) * 0.18, z: fz + (hash(id + 7) - 0.5) * 0.4, y: ALTO_ZONA[z.id], especie: e, vivo: hash(id + 13) < sup, tam: 0.85 + hash(id + 21) * 0.3 });
        });
    });
    return lista.slice(0, MAX_ARBOLES);
  }, [plantacion, largo]);

  const troncos = useRef<THREE.InstancedMesh>(null);
  const copas = useRef<THREE.InstancedMesh>(null);
  const conos = useRef<THREE.InstancedMesh>(null);
  const raices = useRef<THREE.InstancedMesh>(null);
  const neumas = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const seco = useMemo(() => new THREE.Color("#78350f"), []);
  const crec = useRef(0.2 + 0.8 * madurez(anios));

  useFrame((_, dt) => {
    crec.current += (0.2 + 0.8 * madurez(anios) - crec.current) * suave(dt, 0.05);
    const g = crec.current;
    const tr = troncos.current;
    const co = copas.current;
    const cn = conos.current;
    const ra = raices.current;
    const ne = neumas.current;
    if (!tr || !co || !cn || !ra || !ne) return;
    for (let i = 0; i < MAX_ARBOLES; i++) {
      const a = arboles[i];
      const cero = () => {
        obj.position.set(0, -50, 0);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
      };
      if (!a) {
        cero();
        tr.setMatrixAt(i, obj.matrix);
        co.setMatrixAt(i, obj.matrix);
        cn.setMatrixAt(i, obj.matrix);
        for (let k = 0; k < 4; k++) ra.setMatrixAt(i * 4 + k, obj.matrix);
        for (let k = 0; k < 6; k++) ne.setMatrixAt(i * 6 + k, obj.matrix);
        continue;
      }
      const s = a.tam * (a.vivo ? g : 0.35);
      const altoTronco = a.especie === "casuarina" ? 2.2 * s : 1.5 * s;
      const baseTronco = a.especie === "rojo" ? 0.45 * s : 0;
      obj.rotation.set(a.vivo ? 0 : 0.5, 0, a.vivo ? 0 : 0.3);
      obj.position.set(a.x, a.y + baseTronco + altoTronco / 2, a.z);
      obj.scale.set(a.vivo ? s * 1.4 : 0.8, altoTronco, a.vivo ? s * 1.4 : 0.8);
      obj.updateMatrix();
      tr.setMatrixAt(i, obj.matrix);
      tr.setColorAt(i, tmp.set(a.vivo ? "#57412c" : "#78350f"));
      obj.rotation.set(0, i, 0);
      const copa = a.vivo && a.especie !== "casuarina";
      obj.position.set(a.x, a.y + baseTronco + altoTronco + 0.25 * s, a.z);
      obj.scale.set(copa ? 0.55 * s : 0.0001, copa ? 0.38 * s : 0.0001, copa ? 0.5 * s : 0.0001);
      obj.updateMatrix();
      co.setMatrixAt(i, obj.matrix);
      co.setColorAt(i, a.vivo ? tmp.set(COPA_COLOR[a.especie]) : seco);
      const cono = a.vivo && a.especie === "casuarina";
      obj.position.set(a.x, a.y + altoTronco * 0.95, a.z);
      obj.scale.set(cono ? 0.32 * s : 0.0001, cono ? 1.9 * s : 0.0001, cono ? 0.32 * s : 0.0001);
      obj.updateMatrix();
      cn.setMatrixAt(i, obj.matrix);
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * Math.PI * 2 + i;
        const on = a.vivo && a.especie === "rojo";
        const r = 0.28 * s;
        obj.position.set(a.x + Math.cos(ang) * r * 0.5, a.y + 0.25 * s, a.z + Math.sin(ang) * r * 0.5);
        obj.rotation.set(Math.sin(ang) * 0.75, 0, -Math.cos(ang) * 0.75);
        obj.scale.set(1, on ? 0.62 * s : 0.0001, 1);
        obj.updateMatrix();
        ra.setMatrixAt(i * 4 + k, obj.matrix);
      }
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2 + i * 0.7;
        const on = a.vivo && a.especie === "negro";
        const r = (0.3 + hash(i * 6 + k) * 0.35) * Math.max(0.6, s);
        obj.position.set(a.x + Math.cos(ang) * r, a.y + 0.08, a.z + Math.sin(ang) * r);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(1, on ? 0.18 : 0.0001, 1);
        obj.updateMatrix();
        ne.setMatrixAt(i * 6 + k, obj.matrix);
      }
    }
    tr.instanceMatrix.needsUpdate = true;
    co.instanceMatrix.needsUpdate = true;
    cn.instanceMatrix.needsUpdate = true;
    ra.instanceMatrix.needsUpdate = true;
    ne.instanceMatrix.needsUpdate = true;
    if (tr.instanceColor) tr.instanceColor.needsUpdate = true;
    if (co.instanceColor) co.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={troncos} args={[GEO_TRONCO, undefined, MAX_ARBOLES]} frustumCulled={false} castShadow>
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={copas} args={[GEO_COPA, undefined, MAX_ARBOLES]} frustumCulled={false} castShadow>
        <meshStandardMaterial roughness={0.75} flatShading />
      </instancedMesh>
      <instancedMesh ref={conos} args={[GEO_CONO, undefined, MAX_ARBOLES]} frustumCulled={false} castShadow>
        <meshStandardMaterial color="#4d7c0f" roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={raices} args={[GEO_RAIZ, undefined, MAX_ARBOLES * 4]} frustumCulled={false}>
        <meshStandardMaterial color="#5b3a1f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={neumas} args={[GEO_NEUMA, undefined, MAX_ARBOLES * 6]} frustumCulled={false}>
        <meshStandardMaterial color="#6b5a45" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

const GEO_OLA = new THREE.CylinderGeometry(0.5, 0.5, 6.4, 28, 1, false, 0, Math.PI);

function OlaTormenta({ plantacion, ancho, anios, xPueblo }: { plantacion: Plantacion; ancho: number; anios: number; xPueblo: number }) {
  const grupo = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Mesh>(null);
  const espuma = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const lectura = useRef<HTMLSpanElement>(null);
  const alturas = olaTrasZonas(plantacion, ancho, anios);
  const largo = (ancho / ANCHO_MAX) * LARGO_VISUAL;
  const X_INICIO = -11;
  useFrame((_, dt) => {
    t.current += dt;
    const x = Math.min(xPueblo, X_INICIO + t.current * 3.4);
    let h = OLA_INICIAL;
    if (largo > 0 && x > X0_COSTA) {
      const f = Math.min(3, ((x - X0_COSTA) / largo) * 3);
      const zi = Math.min(2, Math.floor(f));
      const prev = zi === 0 ? OLA_INICIAL : alturas[zi - 1]!;
      const sig = alturas[zi]!;
      h = prev * Math.pow(sig / prev, Math.min(1, f - zi));
    }
    const llego = x >= xPueblo;
    const desvanece = llego ? Math.max(0, 1 - (t.current - (xPueblo - X_INICIO) / 3.4) / 2.2) : 1;
    const alto = Math.max(0.02, h * desvanece);
    if (grupo.current) grupo.current.position.x = x;
    if (cuerpo.current) cuerpo.current.scale.set(alto * 2, 1, 1.4);
    if (espuma.current) {
      espuma.current.position.y = alto - 0.2;
      espuma.current.scale.set(1, 1, Math.max(0.02, desvanece));
    }
    if (lectura.current) lectura.current.textContent = `Ola: ${num(h, 2)} m`;
  });
  return (
    <group ref={grupo} position={[X_INICIO, 0, 0]}>
      {/* Media caña: el eje va a lo largo de la costa y la cara plana queda abajo */}
      <mesh ref={cuerpo} geometry={GEO_OLA} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2, "ZYX"]}>
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.82} roughness={0.12} emissive="#0369a1" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={espuma} position={[0.1, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 6.5, 10]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.6} />
      </mesh>
      <Html position={[0, 2.4, 0]} center distanceFactor={10} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "5px 11px", borderRadius: 999, background: "rgba(3,105,161,0.9)", border: "1px solid #7dd3fc", color: "#fff", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-house-flood-water" style={{ marginRight: 6 }} />
          <span ref={lectura}>Ola: 1.50 m</span>
        </div>
      </Html>
    </group>
  );
}

function CarbonoSuelo({ total, largo }: { total: number; largo: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b4f2a", roughness: 1 }), []);
  const claro = useMemo(() => new THREE.Color("#7c5a2e"), []);
  const oscuro = useMemo(() => new THREE.Color("#1c130a"), []);
  const f = useRef(0);
  useFrame((_, dt) => {
    f.current += (Math.min(1, total / 6000) - f.current) * suave(dt, 0.04);
    mat.color.copy(claro).lerp(oscuro, f.current);
  });
  if (largo <= 0) return null;
  return (
    <mesh position={[X0_COSTA + largo / 2, -0.62, 0]} material={mat}>
      <boxGeometry args={[largo, 0.7, 6.6]} />
    </mesh>
  );
}

function Casa({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.6]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.58, 0.36, 4]} />
        <meshStandardMaterial color="#c2410c" roughness={0.7} />
      </mesh>
    </group>
  );
}

function EscenaManglar({ plantacion, ancho, anios, olaNonce, modoColor }: { plantacion: Plantacion; ancho: number; anios: number; olaNonce: number; modoColor: string }) {
  const largo = (ancho / ANCHO_MAX) * LARGO_VISUAL;
  const xPueblo = X0_COSTA + largo + 1.1;
  const total = co2Acumulado(plantacion, ancho, anios);
  const mar = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!mar.current) return;
    mar.current.children.forEach((c, k) => {
      c.position.x = -11.5 + ((clock.elapsedTime * 0.5 + k * 1.1) % 8);
    });
  });
  return (
    <group position={[0.6, -1.2, 0]}>
      {/* Mar */}
      <mesh position={[-8.2, -0.2, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 6.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.15} metalness={0.2} transparent opacity={0.92} />
      </mesh>
      <group ref={mar}>
        {Array.from({ length: 7 }, (_, k) => (
          <mesh key={k} position={[-11 + k, -0.13, 0]}>
            <boxGeometry args={[0.05, 0.03, 6.4]} />
            <meshBasicMaterial color="#a5f3fc" transparent opacity={0.35} />
          </mesh>
        ))}
      </group>
      <mesh position={[-8.2, -1.0, 0]}>
        <boxGeometry args={[10, 1.5, 6.6]} />
        <meshStandardMaterial color="#155e75" roughness={0.6} />
      </mesh>
      {/* Zonas de la costa */}
      {ZONAS.map((z, zi) => {
        const x = X0_COSTA + (largo / 3) * zi;
        const w = Math.max(0.001, largo / 3);
        const y = ALTO_ZONA[z.id];
        const e = ESPECIES.find((s) => s.id === plantacion[z.id]);
        return (
          <group key={z.id}>
            <mesh position={[x + w / 2, y - 0.15, 0]} receiveShadow>
              <boxGeometry args={[w, 0.3, 6.6]} />
              <meshStandardMaterial color={zi === 0 ? "#4a3b2a" : zi === 1 ? "#6b5a3e" : "#8a7651"} roughness={1} />
            </mesh>
            {zi === 0 && (
              <mesh position={[x + w / 2, -0.16, 0]}>
                <boxGeometry args={[w, 0.06, 6.6]} />
                <meshStandardMaterial color="#0e7490" transparent opacity={0.55} roughness={0.1} />
              </mesh>
            )}
            {largo > 0 && (
              <Etiqueta pos={[x + w / 2, y + 0.05, zi === 1 ? 2.5 : 3.55]} df={11} fs={10} col={e ? `${e.nativa ? modoColor : "#f87171"}aa` : undefined}>
                {z.id === "borde" ? "Borde" : z.id === "media" ? "Media" : "Interna"}: {e ? e.etq.replace("Mangle ", "").toLowerCase() : "—"}
              </Etiqueta>
            )}
          </group>
        );
      })}
      <CarbonoSuelo total={total} largo={largo} />
      {/* Tierra firme y pueblo */}
      <mesh position={[(X0_COSTA + largo + 7.5) / 2, 0.2, 0]} receiveShadow>
        <boxGeometry args={[7.5 - X0_COSTA - largo, 0.4, 6.6]} />
        <meshStandardMaterial color="#a3a36b" roughness={1} />
      </mesh>
      <mesh position={[(X0_COSTA + largo + 7.5) / 2, -0.62, 0]}>
        <boxGeometry args={[7.5 - X0_COSTA - largo, 0.7, 6.6]} />
        <meshStandardMaterial color="#7c5a2e" roughness={1} />
      </mesh>
      {[-1.9, -0.4, 1.1].map((z, k) => (
        <Casa key={k} pos={[xPueblo + 0.4 + (k % 2) * 0.7, 0.4, z]} />
      ))}
      <Bosque plantacion={plantacion} ancho={ancho} anios={anios} />
      {olaNonce > 0 && <OlaTormenta key={olaNonce} plantacion={plantacion} ancho={ancho} anios={anios} xPueblo={xPueblo} />}
      <Etiqueta pos={[-8.5, 1.6, 0]} df={11} fs={11} col="#38bdf8aa">
        <i className="fa-solid fa-water" style={{ color: "#38bdf8" }} />
        Mar · ola de tormenta de {num(OLA_INICIAL, 1)} m
      </Etiqueta>
      <Etiqueta pos={[X0_COSTA + Math.max(largo, 1) / 2, 3.6, 0]} df={10} fs={11.5} col={`${modoColor}aa`}>
        <i className="fa-solid fa-tree" style={{ color: modoColor }} />
        {ancho} m de manglar · {anios} {anios === 1 ? "año" : "años"} · {num(total)} t CO₂e capturadas
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function InnovacionesAmbientalesScene(p: InnovacionesSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "lluvia") return { pos: [2.6, 4.2, 13.6], target: [-1.4, 1.1, 0] };
    if (vista === "humedal") return { pos: [2.4, 5.6, 10.4], target: [0.4, 0.2, 0] };
    return { pos: [0.6, 6.4, 12.8], target: [-1.2, 0.2, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 44]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 10, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "lluvia" && <EscenaLluvia ciudadId={p.ciudadId} techoId={p.techoId} area={p.area} capacidad={p.capacidad} mesVista={p.mesVista} nivel={p.nivel} desborda={p.desborda} modoColor={modoColor} />}
      {vista === "humedal" && <EscenaHumedal personas={p.personas} areaHumedal={p.areaHumedal} tempC={p.tempC} muestraNonce={p.muestraNonce} modoColor={modoColor} />}
      {vista === "manglar" && <EscenaManglar plantacion={p.plantacion} ancho={p.ancho} anios={p.anios} olaNonce={p.olaNonce} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={24} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.06} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.28} luminanceThreshold={0.65} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
