"use client";

/**
 * Piezas comunes de la «sala de museo» de las cónicas: materiales, etiquetas,
 * cámara guiada, la pizarra de pizarra-pizarrón con su marco de latón y las
 * piezas que se mueven cada cuadro sin pasar por React (varillas orientadas,
 * fase suavizada).
 *
 * Patrón: nada de `new THREE.*` dentro de `useFrame`; los vectores de trabajo
 * se crean una vez con `useMemo`.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type Pt = [number, number, number];

/* ── Paleta de la sala ───────────────────────────────────────────────────── */
export const FONDO_SALA = "#060d19";
export const LATON = "#caa66a";
export const ACERO = "#c9d3de";
export const FOCO_COL = "#fbbf24";
export const D1_COL = "#34d399";
export const D2_COL = "#c4b5fd";
export const DIR_COL = "#fb7185";
export const RAYO_COL = "#7dd3fc";

/* ── Etiqueta (máx. 4 por vista, ≥ 14 px) ────────────────────────────────── */
export function Etiqueta({ pos, color, children, ancha = false, grande = false }: {
  pos: Pt; color: string; children: React.ReactNode; ancha?: boolean; grande?: boolean;
}) {
  const ancho = useThree((st) => st.size.width);
  if (ancha && ancho < 640) return null;
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: grande ? "6px 14px" : "3px 10px", borderRadius: 10,
        background: "rgba(4,10,22,0.86)", border: `1.5px solid ${color}`, color, fontWeight: 900,
        fontSize: grande ? 17 : 14, fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)", letterSpacing: grande ? 0.3 : 0,
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Cámara guiada ───────────────────────────────────────────────────────── */
export const FOV = 40;
const TAN_V = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/** Distancia y objetivo para que la caja [xmin,xmax]×[ymin,ymax] quede entre la barra y la misión. */
export function encuadrar(xmin: number, xmax: number, ymin: number, ymax: number, aspect: number, angosto = false, z = 0): { objetivo: Pt; distancia: number } {
  const mx = (xmax - xmin) / 2, my = (ymax - ymin) / 2;
  // En celular la leyenda tapa arriba y la misión abajo: el sujeto cabe en la franja del medio.
  const d = angosto
    ? Math.max(my / (TAN_V * 0.5), mx / (TAN_V * 0.96 * aspect))
    : Math.max(my / (TAN_V * 0.66), mx / (TAN_V * 0.92 * aspect));
  const corr = (angosto ? -0.04 : 0.08) * 2 * d * TAN_V;
  return { objetivo: [(xmin + xmax) / 2, (ymin + ymax) / 2 - corr, z], distancia: d };
}

/**
 * Viaja con suavidad al encuadre de cada vista; en cuanto el alumno arrastra,
 * le cede el control hasta el siguiente cambio de vista.
 */
export function Guia({ objetivo, distancia, dir, claveVista }: { objetivo: Pt; distancia: number; dir: Pt; claveVista: string }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const resta = useRef(0);
  const clave = useRef("");
  const vista = useRef("");
  const reorientar = useRef(false);
  const iniciada = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const meta = useMemo(() => new THREE.Vector3(), []);
  const haciaDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!controls) return undefined;
    const soltar = () => { resta.current = 0; reorientar.current = false; };
    controls.addEventListener("start", soltar);
    return () => controls.removeEventListener("start", soltar);
  }, [controls]);

  useFrame((_, dtRaw) => {
    if (!controls) return;
    const dt = Math.min(dtRaw, 0.05);
    if (!iniciada.current) {
      // Entrada: la cámara llega desde más lejos y más alto, como al entrar a la sala.
      iniciada.current = true;
      tmp.set(dir[0] * 1.8 + 0.6, dir[1] + 0.55, dir[2]).normalize().multiplyScalar(distancia * 1.8);
      controls.target.set(...objetivo);
      camera.position.copy(controls.target).add(tmp);
    }
    if (claveVista !== vista.current) { vista.current = claveVista; reorientar.current = true; resta.current = 2.6; }
    const k = `${objetivo.map((x) => x.toFixed(2)).join()}|${distancia.toFixed(2)}`;
    if (k !== clave.current) { clave.current = k; resta.current = Math.max(resta.current, 1.6); }
    if (resta.current <= 0) return;
    resta.current -= dt;
    meta.set(...objetivo);
    tmp.copy(camera.position).sub(controls.target);
    controls.target.lerp(meta, 1 - Math.exp(-dt * 3));
    const largo = THREE.MathUtils.damp(tmp.length(), distancia, 2.6, dt);
    if (reorientar.current) {
      haciaDir.set(...dir).normalize();
      tmp.normalize().lerp(haciaDir, 1 - Math.exp(-dt * 2.4)).normalize();
      if (resta.current <= 0.05) reorientar.current = false;
    }
    tmp.setLength(largo);
    camera.position.copy(controls.target).add(tmp);
    controls.update();
  });
  return null;
}

/* ── Fase suavizada: el punto móvil se mueve a 60 fps aunque la fase llegue a 25 ── */
export function useFaseSuave(fase: number): React.MutableRefObject<number> {
  const ref = useRef(fase);
  useFrame((_, dt) => {
    let d = fase - ref.current;
    if (d > 0.5) d -= 1; else if (d < -0.5) d += 1;
    ref.current = (((ref.current + d * (1 - Math.exp(-Math.min(dt, 0.05) * 12))) % 1) + 1) % 1;
  });
  return ref;
}

/* ── Varilla entre dos puntos, orientada por ref (cilindro unitario) ──────── */
const ARRIBA = new THREE.Vector3(0, 1, 0);
/** Coloca un cilindro unitario (radio 1, altura 1) entre a y b, con radio `g`. `aux` es un vector de trabajo. */
export function orientar(m: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, aux: THREE.Vector3, g = 1) {
  aux.subVectors(b, a);
  const l = aux.length();
  m.position.addVectors(a, b).multiplyScalar(0.5);
  if (l > 1e-6) m.quaternion.setFromUnitVectors(ARRIBA, aux.multiplyScalar(1 / l));
  m.scale.set(g, Math.max(l, 1e-4), g);
}

/** Cilindro unitario para `orientar` (se comparte entre varillas). */
export function useCilindroUnitario(radio: number, radiales = 10): THREE.CylinderGeometry {
  return useMemo(() => new THREE.CylinderGeometry(radio, radio, 1, radiales, 1), [radio, radiales]);
}

/* ── Textura de pizarra: pizarra de esquisto con cuadrícula grabada ──────── */
function crearTexturaPizarra(lado: number): THREE.CanvasTexture {
  const T = 2048;
  const cv = document.createElement("canvas");
  cv.width = cv.height = T;
  const g = cv.getContext("2d")!;
  const grad = g.createRadialGradient(T * 0.45, T * 0.4, T * 0.1, T / 2, T / 2, T * 0.75);
  grad.addColorStop(0, "#15283d");
  grad.addColorStop(1, "#0a1524");
  g.fillStyle = grad;
  g.fillRect(0, 0, T, T);
  // grano de la piedra (determinista: sin Math.random)
  let sem = 1234567;
  const azar = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  for (let i = 0; i < 26000; i++) {
    const x = azar() * T, y = azar() * T, a = azar() * 0.05;
    g.fillStyle = `rgba(${azar() > 0.5 ? "255,255,255" : "0,0,0"},${a})`;
    g.fillRect(x, y, 2 + azar() * 3, 2 + azar() * 3);
  }
  // cuadrícula: una línea por unidad, más marcada cada 2
  const n = lado * 2;
  const paso = T / n;
  for (let i = 0; i <= n; i++) {
    const fuerte = (i - lado) % 2 === 0;
    g.strokeStyle = fuerte ? "rgba(150,200,240,0.24)" : "rgba(150,200,240,0.11)";
    g.lineWidth = fuerte ? 3 : 2;
    g.beginPath(); g.moveTo(i * paso, 0); g.lineTo(i * paso, T); g.stroke();
    g.beginPath(); g.moveTo(0, i * paso); g.lineTo(T, i * paso); g.stroke();
  }
  // números de los ejes (pintados en la piedra, como gis)
  g.fillStyle = "rgba(200,225,250,0.62)";
  g.font = "600 46px system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "top";
  for (let v = -lado + 2; v <= lado - 2; v += 2) {
    if (v === 0) continue;
    g.fillText(String(v).replace("-", "−"), (v + lado) * paso, T / 2 + 14);
  }
  g.textAlign = "right";
  g.textBaseline = "middle";
  for (let v = -lado + 2; v <= lado - 2; v += 2) {
    if (v === 0) continue;
    g.fillText(String(v).replace("-", "−"), T / 2 - 16, (lado - v) * paso);
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  return tx;
}

/**
 * La pizarra: losa de esquisto con grosor, marco de latón y dos patas que la
 * apoyan en el piso. Se dibuja sobre su cara frontal, en z = 0.
 * `lado` = medio lado en unidades del plano; `U` = unidades de escena por unidad.
 */
export function Pizarra({ lado, U, suelo, ejes = true }: { lado: number; U: number; suelo: number; ejes?: boolean }) {
  const tex = useMemo(() => crearTexturaPizarra(lado), [lado]);
  useEffect(() => () => tex.dispose(), [tex]);
  const L = lado * U * 2;
  const M = 0.16; // grosor del marco
  const G = 0.14; // grosor de la losa
  const abajo = -L / 2 - M;
  return (
    <group>
      <mesh position={[0, 0, -G / 2 - 0.012]} receiveShadow castShadow>
        <boxGeometry args={[L, L, G]} />
        <meshStandardMaterial attach="material-0" color="#0d1a2a" roughness={0.8} />
        <meshStandardMaterial attach="material-1" color="#0d1a2a" roughness={0.8} />
        <meshStandardMaterial attach="material-2" color="#0d1a2a" roughness={0.8} />
        <meshStandardMaterial attach="material-3" color="#0d1a2a" roughness={0.8} />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.78} metalness={0.05} envMapIntensity={0.55} />
        <meshStandardMaterial attach="material-5" color="#0d1a2a" roughness={0.8} />
      </mesh>
      {(
        [
          [0, L / 2 + M / 2, L + M * 2, M],
          [0, -L / 2 - M / 2, L + M * 2, M],
          [-L / 2 - M / 2, 0, M, L],
          [L / 2 + M / 2, 0, M, L],
        ] as [number, number, number, number][]
      ).map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.22]} />
          <meshStandardMaterial color={LATON} roughness={0.3} metalness={0.9} envMapIntensity={1.3} />
        </mesh>
      ))}
      {/* patas: la pizarra se apoya en el piso */}
      {[-1, 1].map((sg) => (
        <group key={sg} position={[sg * L * 0.36, 0, -0.08]}>
          <mesh position={[0, (abajo + suelo) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, Math.max(0.05, abajo - suelo), 16]} />
            <meshStandardMaterial color={LATON} roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, suelo + 0.04, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.48, 0.08, 32]} />
            <meshStandardMaterial color="#1b2633" roughness={0.45} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {ejes && <EjesPizarra lado={lado} U={U} />}
    </group>
  );
}

/** Ejes X e Y como varillas de acero con punta, sobre la pizarra. */
function EjesPizarra({ lado, U }: { lado: number; U: number }) {
  const L = lado * U;
  const z = 0.03;
  return (
    <group>
      {[[[-L, 0, z], [L, 0, z]], [[0, -L, z], [0, L, z]]].map(([a, b], i) => {
        const largo = Math.hypot(b![0]! - a![0]!, b![1]! - a![1]!);
        const vertical = i === 1;
        return (
          <group key={i}>
            <mesh position={[0, 0, z]} rotation={[0, 0, vertical ? 0 : Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, largo, 10]} />
              <meshStandardMaterial color="#9fc2de" roughness={0.3} metalness={0.75} />
            </mesh>
            <mesh position={vertical ? [0, L + 0.08, z] : [L + 0.08, 0, z]} rotation={[0, 0, vertical ? 0 : -Math.PI / 2]}>
              <coneGeometry args={[0.07, 0.2, 14]} />
              <meshStandardMaterial color="#9fc2de" roughness={0.3} metalness={0.75} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Canica: un punto con cuerpo (vidrio coloreado que brilla un poco) ───── */
export function Canica({ p, color, radio = 0.13, brillo = 0.9 }: { p?: Pt; color: string; radio?: number; brillo?: number }) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[radio, 32, 32]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} roughness={0.15} clearcoat={1} clearcoatRoughness={0.08} />
    </mesh>
  );
}

/** Clavo de latón clavado en la pizarra (un foco). */
export function Clavo({ p, color = FOCO_COL }: { p: Pt; color?: string }) {
  return (
    <group position={p}>
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.32, 12]} />
        <meshStandardMaterial color={ACERO} roughness={0.25} metalness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
        <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
      </mesh>
      {/* halo del foco sobre la piedra */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}
