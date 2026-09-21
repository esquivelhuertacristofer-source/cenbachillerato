"use client";

/**
 * Escena 3D del laboratorio "Telling a story" (IN-III-P07).
 *
 *  - teatrino (modos «Put the story in order» y «Tell your version»): repisas
 *    de viñetas-diorama frente a un telón. Cada viñeta es un escenario pequeño
 *    (recámara, parada del camión, salón, casa de la abuela, calle, jardín)
 *    con personajes que actúan cuando la reproducción llega a esa escena. Las
 *    viñetas se deslizan a su nueva posición cuando el alumno las intercambia.
 *  - linea (modo «Connect the events»): la línea del tiempo del día en el
 *    tianguis. Cada evento es una ficha; la relación que expresa el conector
 *    se ve: flecha (secuencia), caída con destello (suddenly), dominó (so),
 *    causa previa (because), barra en progreso atravesada (while) o cortada
 *    (when).
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { createContext, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type EscenaId, type Modo, type ItemConectar, ITEMS, RELACION_DEF, EVENTO_INICIAL } from "./relato-secuencia-ingles-data";

export type EstadoVineta = "normal" | "sel" | "activo" | "ok" | "error" | "pendiente" | "hecho";

export interface RelatoSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  /** Cambia cuando cambia la historia (reinicia la cámara). */
  clave: string;
  // Teatrino
  escenas: EscenaId[];
  estados: EstadoVineta[];
  rotulos: string[];
  /** Viñeta que actúa (índice de posición) o null. */
  activa: number | null;
  /** Viñeta a la que mira la cámara (activa o enfocada). */
  foco: number | null;
  burbuja: string | null;
  onVineta?: (slot: number) => void;
  // Línea del tiempo
  hechos: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

/* ── Geometrías compartidas (unitarias, se escalan) ───────────────────── */
const G_CAJA = new THREE.BoxGeometry(1, 1, 1);
const G_CIL = new THREE.CylinderGeometry(1, 1, 1, 24);
const G_ESF = new THREE.SphereGeometry(1, 20, 14);
const G_CONO = new THREE.ConeGeometry(1, 1, 20);
const G_PIERNA = new THREE.CapsuleGeometry(0.055, 0.3, 4, 10);
const G_TORSO = new THREE.CapsuleGeometry(0.13, 0.26, 6, 14);
const G_BRAZO = new THREE.CapsuleGeometry(0.045, 0.28, 4, 10);
const G_CABEZA = new THREE.SphereGeometry(0.13, 20, 16);
const G_PELO = new THREE.SphereGeometry(0.138, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
const G_OJO = new THREE.SphereGeometry(0.018, 8, 6);
const G_ARO = new THREE.TorusGeometry(1, 0.05, 8, 40);

/* ── Primitivas ───────────────────────────────────────────────────────── */

function Caja({ p, s, c, rot, rough = 0.7, metal = 0, emis, op }: { p: Pt; s: Pt; c: string; rot?: Pt; rough?: number; metal?: number; emis?: string; op?: number }) {
  return (
    <mesh geometry={G_CAJA} position={p} scale={s} rotation={rot} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={emis ?? "#000000"} emissiveIntensity={emis ? 0.9 : 0} transparent={op !== undefined} opacity={op ?? 1} />
    </mesh>
  );
}

function Cil({ p, r, h, c, rot, emis, rough = 0.6 }: { p: Pt; r: number; h: number; c: string; rot?: Pt; emis?: string; rough?: number }) {
  return (
    <mesh geometry={G_CIL} position={p} scale={[r, h, r]} rotation={rot} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} emissive={emis ?? "#000000"} emissiveIntensity={emis ? 0.9 : 0} />
    </mesh>
  );
}

function Esf({ p, s, c, emis, rough = 0.6 }: { p: Pt; s: number | Pt; c: string; emis?: string; rough?: number }) {
  return (
    <mesh geometry={G_ESF} position={p} scale={s} castShadow>
      <meshStandardMaterial color={c} roughness={rough} emissive={emis ?? "#000000"} emissiveIntensity={emis ? 1 : 0} />
    </mesh>
  );
}

/** Si una viñeta queda fuera de foco, sus etiquetas se ocultan para no tapar la escena enfocada. */
const EtiquetasCtx = createContext(true);

function Chip({ p, children, col, fs = 11, df = 8 }: { p: Pt; children: ReactNode; col?: string; fs?: number; df?: number }) {
  const visible = useContext(EtiquetasCtx);
  if (!visible) return null;
  return (
    <Html position={p} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 9px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.25)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 16px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/* ── Personajes ───────────────────────────────────────────────────────── */

type Pose = "parado" | "camina" | "corre" | "sentado" | "despierta" | "sorpresa" | "festeja" | "promesa" | "senala" | "habla" | "cuenta" | "toca" | "come" | "aplaude";

interface PersonaProps {
  pos: Pt;
  rot?: number;
  ropa: string;
  pantalon?: string;
  pelo?: string;
  piel?: string;
  pose: Pose;
  poseFinal?: Pose;
  activo?: boolean;
  desde?: Pt;
  hasta?: Pt;
  dur?: number;
  /** Posición del trayecto cuando no actúa (0 = inicio, 1 = final). */
  reposo?: number;
  mochila?: boolean;
  canas?: boolean;
  gorra?: string;
  fase?: number;
  velRef?: RefObject<number>;
  children?: ReactNode;
}

const SENTADAS: Pose[] = ["sentado", "cuenta", "toca", "come", "aplaude"];

function Persona({ pos, rot = 0, ropa, pantalon = "#1e3a8a", pelo = "#2b1a10", piel = "#c98e62", pose, poseFinal, activo = false, desde, hasta, dur = 2.4, reposo = 0, mochila, canas, gorra, fase = 0, velRef, children }: PersonaProps) {
  const raiz = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Group>(null);
  const pP = useRef<THREE.Group>(null);
  const pN = useRef<THREE.Group>(null);
  const bP = useRef<THREE.Group>(null);
  const bN = useRef<THREE.Group>(null);
  const t = useRef(0);
  const inicial: Pt = desde && hasta ? [desde[0] + (hasta[0] - desde[0]) * reposo, desde[1] + (hasta[1] - desde[1]) * reposo, desde[2] + (hasta[2] - desde[2]) * reposo] : pos;

  useFrame(({ clock }, dt) => {
    t.current = activo ? t.current + Math.min(dt, 0.1) : 0;
    const e = clock.elapsedTime + fase;
    const conTrayecto = !!(desde && hasta);
    const u = conTrayecto ? (activo ? Math.min(1, t.current / dur) : reposo) : 0;
    if (raiz.current && desde && hasta) raiz.current.position.set(desde[0] + (hasta[0] - desde[0]) * u, desde[1] + (hasta[1] - desde[1]) * u, desde[2] + (hasta[2] - desde[2]) * u);
    let p: Pose = pose;
    if (conTrayecto && activo && t.current >= dur && poseFinal) p = poseFinal;
    if (conTrayecto && !activo && poseFinal && reposo >= 1) p = poseFinal;
    if (velRef) p = (velRef.current ?? 0) > 0.12 ? "camina" : "parado";
    const andando = !conTrayecto || (activo && t.current < dur) || velRef !== undefined;
    let lP = 0;
    let lN = 0;
    let axP = 0;
    let axN = 0;
    let azP = 0.12;
    let azN = -0.12;
    let incl = 0;
    let alto = Math.sin(e * 2) * 0.006;
    if (SENTADAS.includes(p)) {
      lP = -Math.PI / 2;
      lN = -Math.PI / 2;
      axP = -0.5;
      axN = -0.5;
    }
    switch (p) {
      case "camina": {
        const s = andando ? Math.sin(e * 7) * 0.55 : 0.2;
        lP = s;
        lN = -s;
        axP = -s * 0.8;
        axN = s * 0.8;
        break;
      }
      case "corre": {
        const s = andando ? Math.sin(e * 13) * 0.95 : 0.5;
        lP = s;
        lN = -s;
        axP = -s;
        axN = s;
        incl = 0.26;
        alto = andando ? Math.abs(Math.sin(e * 13)) * 0.05 : 0;
        break;
      }
      case "despierta": {
        const k = activo ? THREE.MathUtils.smoothstep(t.current, 0.6, 1.1) : 0;
        incl = (1 - k) * (-Math.PI / 2);
        if (k > 0.9) {
          azP = 2.5;
          azN = -2.5;
          alto = Math.abs(Math.sin(e * 7)) * 0.05;
        }
        break;
      }
      case "sorpresa":
        azP = 2.5;
        azN = -2.5;
        alto = Math.abs(Math.sin(e * 6)) * 0.05;
        break;
      case "festeja":
        azP = 2.3 + Math.sin(e * 8) * 0.35;
        azN = -(2.3 + Math.sin(e * 8 + 1) * 0.35);
        break;
      case "promesa":
        azP = 2.95;
        axN = -0.3;
        break;
      case "senala":
        axP = -1.45;
        azP = 0.05;
        break;
      case "habla":
      case "cuenta":
        axP = -0.6 + Math.sin(e * 3) * 0.35;
        axN = -0.4 + Math.sin(e * 3 + 1.3) * 0.3;
        break;
      case "toca":
        axP = -1.0;
        axN = -1.15 + Math.sin(e * 14) * 0.18;
        break;
      case "come":
        axP = -2.0 + Math.sin(e * 2.6) * 0.45;
        axN = -0.6;
        break;
      case "aplaude": {
        const s = Math.sin(e * 10);
        axP = -1.25;
        axN = -1.25;
        azP = 0.35 + s * 0.25;
        azN = -(0.35 + s * 0.25);
        break;
      }
      default:
        break;
    }
    if (cuerpo.current) {
      cuerpo.current.rotation.x = incl;
      cuerpo.current.position.y = alto;
    }
    if (pP.current) pP.current.rotation.x = lP;
    if (pN.current) pN.current.rotation.x = lN;
    if (bP.current) {
      bP.current.rotation.x = axP;
      bP.current.rotation.z = azP;
    }
    if (bN.current) {
      bN.current.rotation.x = axN;
      bN.current.rotation.z = azN;
    }
  });

  const rotY = desde && hasta && rot === 0 ? Math.atan2(hasta[0] - desde[0], hasta[2] - desde[2]) : rot;
  return (
    <group ref={raiz} position={inicial} rotation={[0, rotY, 0]}>
      <group ref={cuerpo}>
        <group ref={pP} position={[0.075, 0.46, 0]}>
          <mesh geometry={G_PIERNA} position={[0, -0.2, 0]} castShadow>
            <meshStandardMaterial color={pantalon} roughness={0.7} />
          </mesh>
        </group>
        <group ref={pN} position={[-0.075, 0.46, 0]}>
          <mesh geometry={G_PIERNA} position={[0, -0.2, 0]} castShadow>
            <meshStandardMaterial color={pantalon} roughness={0.7} />
          </mesh>
        </group>
        <mesh geometry={G_TORSO} position={[0, 0.72, 0]} castShadow>
          <meshStandardMaterial color={ropa} roughness={0.6} />
        </mesh>
        <group ref={bP} position={[0.19, 0.93, 0]}>
          <mesh geometry={G_BRAZO} position={[0, -0.18, 0]} castShadow>
            <meshStandardMaterial color={ropa} roughness={0.6} />
          </mesh>
          <mesh geometry={G_ESF} position={[0, -0.36, 0]} scale={0.045}>
            <meshStandardMaterial color={piel} roughness={0.6} />
          </mesh>
        </group>
        <group ref={bN} position={[-0.19, 0.93, 0]}>
          <mesh geometry={G_BRAZO} position={[0, -0.18, 0]} castShadow>
            <meshStandardMaterial color={ropa} roughness={0.6} />
          </mesh>
          <mesh geometry={G_ESF} position={[0, -0.36, 0]} scale={0.045}>
            <meshStandardMaterial color={piel} roughness={0.6} />
          </mesh>
        </group>
        <mesh geometry={G_CABEZA} position={[0, 1.13, 0]} castShadow>
          <meshStandardMaterial color={piel} roughness={0.6} />
        </mesh>
        <mesh geometry={G_PELO} position={[0, 1.15, -0.012]}>
          <meshStandardMaterial color={canas ? "#e5e7eb" : pelo} roughness={0.8} />
        </mesh>
        {canas && <Esf p={[0, 1.2, -0.13]} s={0.06} c="#e5e7eb" />}
        {gorra && <Cil p={[0, 1.24, 0.02]} r={0.14} h={0.07} c={gorra} />}
        {gorra && <Caja p={[0, 1.215, 0.15]} s={[0.16, 0.02, 0.1]} c={gorra} />}
        <mesh geometry={G_OJO} position={[0.045, 1.14, 0.118]}>
          <meshBasicMaterial color="#111827" />
        </mesh>
        <mesh geometry={G_OJO} position={[-0.045, 1.14, 0.118]}>
          <meshBasicMaterial color="#111827" />
        </mesh>
        {mochila && <Caja p={[0, 0.76, -0.16]} s={[0.22, 0.28, 0.1]} c="#0f766e" />}
        {children}
      </group>
    </group>
  );
}

function Perro({ pos, rot = 0, activo = false, desde, hasta, dur = 2, reposo = 0, sentado = false, color = "#a16207", escala = 1 }: { pos: Pt; rot?: number; activo?: boolean; desde?: Pt; hasta?: Pt; dur?: number; reposo?: number; sentado?: boolean; color?: string; escala?: number }) {
  const raiz = useRef<THREE.Group>(null);
  const patas = useRef<THREE.Group>(null);
  const cola = useRef<THREE.Group>(null);
  const t = useRef(0);
  const inicial: Pt = desde && hasta ? [desde[0] + (hasta[0] - desde[0]) * reposo, 0, desde[2] + (hasta[2] - desde[2]) * reposo] : pos;
  useFrame(({ clock }, dt) => {
    t.current = activo ? t.current + Math.min(dt, 0.1) : 0;
    const e = clock.elapsedTime;
    let corre = false;
    if (raiz.current && desde && hasta) {
      const u = activo ? Math.min(1, t.current / dur) : reposo;
      corre = activo && u < 1;
      raiz.current.position.set(desde[0] + (hasta[0] - desde[0]) * u, Math.abs(Math.sin(e * 16)) * (corre ? 0.03 : 0), desde[2] + (hasta[2] - desde[2]) * u);
    }
    if (patas.current)
      patas.current.children.forEach((c, k) => {
        c.rotation.z = corre ? Math.sin(e * 16 + (k % 2) * Math.PI) * 0.7 : 0;
      });
    if (cola.current) cola.current.rotation.x = Math.sin(e * (corre ? 18 : 9)) * 0.5;
  });
  const rotY = desde && hasta ? Math.atan2(-(hasta[2] - desde[2]), hasta[0] - desde[0]) : rot;
  return (
    <group ref={raiz} position={inicial} rotation={[0, rotY, 0]} scale={escala}>
      <group rotation={[0, 0, sentado ? 0.45 : 0]} position={[0, sentado ? 0.02 : 0, 0]}>
        <mesh geometry={G_ESF} position={[0, 0.3, 0]} scale={[0.22, 0.11, 0.1]} castShadow>
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <Esf p={[0.22, 0.42, 0]} s={0.095} c={color} rough={0.8} />
        <Caja p={[0.32, 0.4, 0]} s={[0.1, 0.06, 0.07]} c="#78350f" />
        <Esf p={[0.375, 0.41, 0]} s={0.02} c="#111827" />
        <Caja p={[0.2, 0.52, 0.06]} s={[0.05, 0.08, 0.03]} c="#78350f" />
        <Caja p={[0.2, 0.52, -0.06]} s={[0.05, 0.08, 0.03]} c="#78350f" />
        <group ref={cola} position={[-0.2, 0.36, 0]}>
          <Cil p={[-0.04, 0.06, 0]} r={0.015} h={0.16} c={color} rot={[0, 0, 0.9]} />
        </group>
      </group>
      <group ref={patas}>
        {[
          [0.13, 0.06],
          [0.13, -0.06],
          [-0.13, 0.06],
          [-0.13, -0.06],
        ].map(([x, z], k) => (
          <group key={k} position={[x!, 0.22, z!]}>
            <Cil p={[0, -0.11, 0]} r={0.025} h={0.22} c={color} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ── Utilería ─────────────────────────────────────────────────────────── */

function Ventana({ p, noche = false }: { p: Pt; noche?: boolean }) {
  return (
    <group position={p}>
      <Caja p={[0, 0, 0]} s={[0.72, 0.56, 0.04]} c="#f8fafc" />
      <Caja p={[0, 0, 0.025]} s={[0.62, 0.46, 0.02]} c={noche ? "#0b1a3a" : "#7dd3fc"} emis={noche ? undefined : "#38bdf8"} rough={0.2} />
      <Caja p={[0, 0, 0.04]} s={[0.02, 0.46, 0.01]} c="#f8fafc" />
      {noche && <Esf p={[0.16, 0.1, 0.05]} s={0.06} c="#fef9c3" emis="#fde68a" />}
    </group>
  );
}

function Reloj({ p, hora, apagado = false, brillo = false }: { p: Pt; hora?: string; apagado?: boolean; brillo?: boolean }) {
  return (
    <group position={p}>
      <Cil p={[0, 0.1, 0]} r={0.1} h={0.07} c="#ef4444" rot={[Math.PI / 2, 0, 0]} emis={brillo ? "#ef4444" : undefined} />
      <Cil p={[0, 0.1, 0.04]} r={0.08} h={0.01} c="#f8fafc" rot={[Math.PI / 2, 0, 0]} emis={brillo ? "#fef3c7" : undefined} />
      <Esf p={[0.07, 0.2, 0]} s={0.035} c="#fbbf24" />
      <Esf p={[-0.07, 0.2, 0]} s={0.035} c="#fbbf24" />
      {hora && (
        <Chip p={[0, 0.42, 0.05]} col={apagado ? `${NO}aa` : "#fbbf24aa"} fs={10}>
          <i className={`fa-solid ${apagado ? "fa-bell-slash" : "fa-bell"}`} style={{ color: apagado ? NO : "#fbbf24" }} />
          {hora}
        </Chip>
      )}
    </group>
  );
}

function Cama({ p, cobija = "#60a5fa" }: { p: Pt; cobija?: string }) {
  return (
    <group position={p}>
      <Caja p={[0, 0.14, 0]} s={[1.5, 0.28, 0.85]} c="#7c4a2d" />
      <Caja p={[0, 0.35, 0]} s={[1.46, 0.14, 0.8]} c="#f1f5f9" />
      <Caja p={[0.22, 0.45, 0]} s={[1.02, 0.07, 0.84]} c={cobija} />
      <Caja p={[-0.52, 0.47, 0]} s={[0.3, 0.1, 0.5]} c="#ffffff" />
      <Caja p={[-0.77, 0.4, 0]} s={[0.07, 0.8, 0.85]} c="#6b3a22" />
    </group>
  );
}

function Mesa({ p, w = 1.1, d = 0.6, h = 0.55, c = "#92400e" }: { p: Pt; w?: number; d?: number; h?: number; c?: string }) {
  return (
    <group position={p}>
      <Caja p={[0, h, 0]} s={[w, 0.05, d]} c={c} />
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([a, b], k) => (
        <Caja key={k} p={[(a! * (w - 0.08)) / 2, h / 2, (b! * (d - 0.08)) / 2]} s={[0.05, h, 0.05]} c={c} />
      ))}
    </group>
  );
}

function Silla({ p, rot = 0, c = "#b45309" }: { p: Pt; rot?: number; c?: string }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <Caja p={[0, 0.4, 0]} s={[0.36, 0.05, 0.36]} c={c} />
      <Caja p={[0, 0.66, -0.16]} s={[0.36, 0.48, 0.05]} c={c} />
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([a, b], k) => (
        <Caja key={k} p={[a! * 0.15, 0.2, b! * 0.15]} s={[0.04, 0.4, 0.04]} c={c} />
      ))}
    </group>
  );
}

function Puerta({ p, c = "#7c2d12", abierta = false, marco = "#f8fafc" }: { p: Pt; c?: string; abierta?: boolean; marco?: string }) {
  return (
    <group position={p}>
      <Caja p={[0, 0.62, -0.01]} s={[0.62, 1.24, 0.04]} c={abierta ? "#0f172a" : marco} />
      <group position={[-0.27, 0, 0.02]} rotation={[0, abierta ? -1.2 : 0, 0]}>
        <Caja p={[0.27, 0.6, 0]} s={[0.54, 1.18, 0.05]} c={c} />
        <Esf p={[0.47, 0.6, 0.04]} s={0.025} c="#fbbf24" />
      </group>
    </group>
  );
}

function Arbol({ p, s = 1 }: { p: Pt; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cil p={[0, 0.35, 0]} r={0.06} h={0.7} c="#78350f" />
      <Esf p={[0, 0.9, 0]} s={0.34} c="#15803d" rough={0.9} />
      <Esf p={[0.18, 0.78, 0.08]} s={0.22} c="#16a34a" rough={0.9} />
    </group>
  );
}

function Escuela({ p, s = 1 }: { p: Pt; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Caja p={[0, 0.5, 0]} s={[1.3, 1.0, 0.3]} c="#e5e7eb" />
      <Caja p={[0, 0.94, 0.16]} s={[1.3, 0.1, 0.02]} c="#15803d" />
      <Caja p={[0, 0.3, 0.16]} s={[0.3, 0.6, 0.02]} c="#78350f" />
      {[-0.45, 0.45].map((x) => (
        <Caja key={x} p={[x, 0.62, 0.16]} s={[0.26, 0.2, 0.02]} c="#7dd3fc" emis="#0ea5e9" />
      ))}
      <Cil p={[0.85, 0.75, 0.1]} r={0.015} h={1.5} c="#cbd5e1" />
      <Caja p={[0.99, 1.36, 0.1]} s={[0.09, 0.18, 0.01]} c="#006847" />
      <Caja p={[1.08, 1.36, 0.1]} s={[0.09, 0.18, 0.01]} c="#ffffff" />
      <Caja p={[1.17, 1.36, 0.1]} s={[0.09, 0.18, 0.01]} c="#ce1126" />
    </group>
  );
}

function PapelPicado({ y = 1.85 }: { y?: number }) {
  const cols = ["#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"];
  return (
    <group position={[0, y, -0.86]}>
      <Caja p={[0, 0.1, 0]} s={[2.7, 0.01, 0.01]} c="#e5e7eb" />
      {Array.from({ length: 9 }, (_, k) => (
        <Caja key={k} p={[-1.2 + k * 0.3, 0, 0.01]} s={[0.22, 0.2, 0.005]} c={cols[k % cols.length]!} />
      ))}
    </group>
  );
}

function Guitarra({ p, rot }: { p: Pt; rot?: Pt }) {
  return (
    <group position={p} rotation={rot}>
      <mesh geometry={G_ESF} position={[0, 0, 0]} scale={[0.14, 0.17, 0.05]} castShadow>
        <meshStandardMaterial color="#b45309" roughness={0.4} />
      </mesh>
      <mesh geometry={G_ESF} position={[0, 0.17, 0]} scale={[0.1, 0.11, 0.05]}>
        <meshStandardMaterial color="#b45309" roughness={0.4} />
      </mesh>
      <Cil p={[0, 0.03, 0.05]} r={0.035} h={0.01} c="#1c1917" rot={[Math.PI / 2, 0, 0]} />
      <Caja p={[0, 0.45, 0]} s={[0.04, 0.4, 0.03]} c="#451a03" />
    </group>
  );
}

function Notas() {
  const grupo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    grupo.current?.children.forEach((c, k) => {
      const u = (clock.elapsedTime * 0.35 + k / 6) % 1;
      c.position.set(-1 + (k % 3) * 1 + Math.sin(u * 6 + k) * 0.15, 0.9 + u * 1.0, -0.2 + (k % 2) * 0.3);
      c.scale.setScalar(Math.sin(u * Math.PI) * 1 + 0.001);
    });
  });
  return (
    <group ref={grupo}>
      {Array.from({ length: 6 }, (_, k) => (
        <group key={k}>
          <Esf p={[0, 0, 0]} s={[0.05, 0.04, 0.03]} c="#fde68a" emis="#fbbf24" />
          <Caja p={[0.04, 0.09, 0]} s={[0.012, 0.18, 0.012]} c="#fde68a" emis="#fbbf24" />
        </group>
      ))}
    </group>
  );
}

function Calle() {
  return (
    <group>
      <Caja p={[0, 0.006, 0.5]} s={[2.96, 0.012, 0.8]} c="#374151" rough={0.95} />
      {[-1, 0, 1].map((x) => (
        <Caja key={x} p={[x, 0.014, 0.5]} s={[0.4, 0.004, 0.05]} c="#f8fafc" />
      ))}
    </group>
  );
}

function Cielo({ tarde = false }: { tarde?: boolean }) {
  return (
    <group>
      <Caja p={[-0.95, 0.55, -0.8]} s={[0.7, 1.1, 0.12]} c={tarde ? "#cbd5e1" : "#e2e8f0"} />
      <Caja p={[-0.2, 0.4, -0.82]} s={[0.6, 0.8, 0.12]} c="#fecaca" />
      <Caja p={[0.55, 0.62, -0.8]} s={[0.7, 1.24, 0.12]} c="#fde68a" />
      {[-0.95, 0.55].map((x) =>
        [0.35, 0.75].map((y) => <Caja key={`${x}-${y}`} p={[x, y, -0.735]} s={[0.4, 0.14, 0.01]} c="#93c5fd" emis="#1d4ed8" />),
      )}
    </group>
  );
}

function CamionSaliendo({ activo }: { activo: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = activo ? t.current + Math.min(dt, 0.1) : 0;
    const g = ref.current;
    if (!g) return;
    const u = activo ? Math.min(1, t.current / 1.5) : 0;
    g.position.x = 0.75 + u * 0.55;
    g.scale.setScalar(Math.max(0.001, 0.8 * (1 - u)));
  });
  return (
    <group ref={ref} position={[0.75, 0, 0.5]} scale={0.8}>
      <Caja p={[0, 0.42, 0]} s={[1.2, 0.56, 0.52]} c="#f8fafc" rough={0.4} />
      <Caja p={[0, 0.3, 0.27]} s={[1.2, 0.08, 0.01]} c="#0d9488" />
      <Caja p={[0.05, 0.55, 0.265]} s={[1.0, 0.18, 0.01]} c="#0f172a" rough={0.2} />
      {[-0.38, 0.38].map((x) =>
        [0.27, -0.27].map((z) => <Cil key={`${x}${z}`} p={[x, 0.12, z]} r={0.11} h={0.06} c="#111827" rot={[Math.PI / 2, 0, 0]} />),
      )}
    </group>
  );
}

/* ── Dioramas ─────────────────────────────────────────────────────────── */

const W = 3.0;
const D = 1.9;
const H = 2.1;

const TEMA: Record<EscenaId, { piso: string; pared: string; noche?: boolean }> = {
  "b-despierta": { piso: "#a47148", pared: "#bfdbfe" },
  "b-corre": { piso: "#d6b38a", pared: "#fde68a" },
  "b-parada": { piso: "#9ca3af", pared: "#7dd3fc" },
  "b-camina": { piso: "#9ca3af", pared: "#93c5fd" },
  "b-clase": { piso: "#c08457", pared: "#fef3c7" },
  "b-promesa": { piso: "#5b4636", pared: "#1e2a4a", noche: true },
  "g-visita": { piso: "#b8a07e", pared: "#fbbf24" },
  "g-tamales": { piso: "#c2410c", pared: "#fed7aa" },
  "g-cuentos": { piso: "#a16207", pared: "#fcd9b6" },
  "g-vecinos": { piso: "#b45309", pared: "#fde68a" },
  "g-musica": { piso: "#7c2d12", pared: "#312e81", noche: true },
  "d-camino": { piso: "#9ca3af", pared: "#bae6fd" },
  "d-perro": { piso: "#9ca3af", pared: "#a5f3fc" },
  "d-gato": { piso: "#65a30d", pared: "#bae6fd" },
  "d-dueno": { piso: "#9ca3af", pared: "#99f6e4" },
  "d-escuela": { piso: "#a8a29e", pared: "#c7d2fe" },
};

const YO = { ropa: "#f59e0b", pantalon: "#1e3a8a", pelo: "#2b1a10" };
const ABUELA = { ropa: "#be185d", pantalon: "#6b21a8", canas: true, piel: "#b9825a" };

function Diorama({ escena, activo }: { escena: EscenaId; activo: boolean }) {
  switch (escena) {
    case "b-despierta":
      return (
        <>
          <Ventana p={[0.55, 1.35, -0.88]} />
          <Cama p={[-0.3, 0, -0.35]} />
          <Caja p={[0.95, 0.25, -0.55]} s={[0.45, 0.5, 0.4]} c="#8b5e3c" />
          <Reloj p={[0.95, 0.5, -0.5]} hora="7:50" apagado />
          <Persona {...YO} pos={[0.38, 0.5, -0.35]} rot={Math.PI / 2} pose="despierta" activo={activo} />
          {!activo && (
            <Chip p={[-0.85, 0.95, -0.35]} fs={10}>
              Zzz
            </Chip>
          )}
        </>
      );
    case "b-corre":
      return (
        <>
          <Mesa p={[-0.85, 0, -0.45]} w={0.8} d={0.55} c="#a16207" />
          <Cil p={[-0.9, 0.59, -0.45]} r={0.13} h={0.02} c="#f8fafc" />
          <Caja p={[-0.9, 0.62, -0.45]} s={[0.13, 0.04, 0.1]} c="#d97706" />
          <Cil p={[-0.62, 0.65, -0.38]} r={0.04} h={0.13} c="#fb923c" />
          <Chip p={[-0.85, 1.0, -0.45]} col={`${NO}aa`} fs={10}>
            <i className="fa-solid fa-ban" style={{ color: NO }} />
            no breakfast
          </Chip>
          <group position={[0.1, 1.55, -0.88]}>
            <Cil p={[0, 0, 0]} r={0.16} h={0.04} c="#f8fafc" rot={[Math.PI / 2, 0, 0]} />
            <Chip p={[0, 0.3, 0.05]} fs={10}>
              7:55
            </Chip>
          </group>
          <Puerta p={[1.05, 0, -0.86]} abierta />
          <Persona {...YO} mochila pos={[0, 0, 0.25]} desde={[-1.25, 0, 0.25]} hasta={[1.2, 0, 0.25]} pose="corre" activo={activo} dur={2.2} reposo={0.42} />
        </>
      );
    case "b-parada":
      return (
        <>
          <Cielo />
          <Calle />
          <Cil p={[-0.55, 0.65, -0.15]} r={0.025} h={1.3} c="#cbd5e1" />
          <Cil p={[-0.55, 1.3, -0.15]} r={0.15} h={0.03} c="#2563eb" rot={[Math.PI / 2, 0, 0]} />
          <Chip p={[-0.55, 1.62, -0.15]} col="#60a5faaa" fs={10}>
            <i className="fa-solid fa-bus" style={{ color: "#60a5fa" }} />
            BUS STOP
          </Chip>
          <Caja p={[0.05, 1.05, -0.45]} s={[0.95, 0.04, 0.42]} c="#475569" />
          <Caja p={[0.05, 0.62, -0.64]} s={[0.95, 0.8, 0.02]} c="#bae6fd" op={0.45} rough={0.1} />
          <Caja p={[0.05, 0.36, -0.52]} s={[0.7, 0.05, 0.2]} c="#78350f" />
          <CamionSaliendo activo={activo} />
          <Persona {...YO} mochila pos={[0, 0, 0]} desde={[-1.3, 0, 0.05]} hasta={[-0.2, 0, 0.05]} pose="corre" poseFinal="sorpresa" activo={activo} dur={1.3} reposo={1} />
        </>
      );
    case "b-camina":
      return (
        <>
          <Arbol p={[-0.85, 0, -0.62]} />
          <Arbol p={[0.1, 0, -0.7]} s={0.85} />
          <Escuela p={[0.85, 0, -0.62]} s={0.62} />
          <Caja p={[0, 0.006, 0.25]} s={[2.96, 0.012, 0.5]} c="#6b7280" rough={0.95} />
          <Chip p={[-0.2, 1.8, -0.3]} col="#fbbf24aa" fs={11}>
            <i className="fa-solid fa-clock" style={{ color: "#fbbf24" }} />
            20 min
          </Chip>
          <Persona {...YO} mochila pos={[0, 0, 0.2]} desde={[-1.3, 0, 0.2]} hasta={[0.55, 0, 0.2]} pose="camina" activo={activo} dur={3} reposo={0.45} />
        </>
      );
    case "b-clase":
      return (
        <>
          <Caja p={[-0.35, 1.3, -0.88]} s={[1.3, 0.7, 0.04]} c="#14532d" rough={0.9} />
          <Caja p={[-0.35, 0.93, -0.84]} s={[1.3, 0.04, 0.08]} c="#78350f" />
          <group position={[0.75, 1.62, -0.88]}>
            <Cil p={[0, 0, 0]} r={0.14} h={0.04} c="#f8fafc" rot={[Math.PI / 2, 0, 0]} />
            <Chip p={[0, 0.28, 0.05]} fs={10}>
              8:25
            </Chip>
          </group>
          <Puerta p={[1.15, 0, -0.86]} abierta />
          <Persona ropa="#0f766e" pantalon="#334155" pelo="#4b5563" pos={[-0.95, 0, -0.45]} rot={0.6} pose="habla" activo={activo} />
          {[-0.25, 0.45].map((x, k) => (
            <group key={x}>
              <Caja p={[x, 0.5, -0.05]} s={[0.5, 0.04, 0.34]} c="#b45309" />
              <Caja p={[x, 0.25, -0.05]} s={[0.04, 0.5, 0.04]} c="#78350f" />
              <Silla p={[x, 0, 0.3]} rot={Math.PI} c="#475569" />
              <Persona ropa={k === 0 ? "#e11d48" : "#7c3aed"} pelo={k === 0 ? "#111827" : "#78350f"} pos={[x, 0, 0.25]} rot={Math.PI} pose="sentado" fase={k} />
            </group>
          ))}
          <Persona {...YO} mochila pos={[0.95, 0, 0.05]} desde={[1.2, 0, -0.6]} hasta={[0.98, 0, 0.1]} rot={-0.4} pose="camina" poseFinal="parado" activo={activo} dur={1.4} reposo={1} />
        </>
      );
    case "b-promesa":
      return (
        <>
          <Ventana p={[-0.55, 1.35, -0.88]} noche />
          <Cama p={[-0.35, 0, -0.35]} cobija="#4338ca" />
          <Caja p={[0.95, 0.25, -0.55]} s={[0.5, 0.5, 0.4]} c="#6b4a33" />
          <Reloj p={[0.84, 0.5, -0.5]} brillo />
          <Reloj p={[1.07, 0.5, -0.5]} brillo />
          <Chip p={[0.95, 0.98, -0.5]} col="#fbbf24aa" fs={11}>
            <i className="fa-solid fa-bell" style={{ color: "#fbbf24" }} />× 2
          </Chip>
          <pointLight position={[0.9, 1.1, 0.2]} intensity={1.6} distance={3} color="#fde68a" />
          <Persona {...YO} pos={[0.05, 0, 0.35]} rot={-0.2} pose={activo ? "promesa" : "parado"} activo={activo} />
        </>
      );
    case "g-visita":
      return (
        <>
          <Ventana p={[-0.65, 1.3, -0.88]} />
          <Puerta p={[0.45, 0, -0.86]} abierta c="#7c2d12" />
          {[-0.15, 1.05].map((x) => (
            <group key={x}>
              <Cil p={[x, 0.12, -0.7]} r={0.1} h={0.24} c="#c2410c" />
              <Esf p={[x, 0.36, -0.7]} s={0.15} c="#16a34a" />
              <Esf p={[x + 0.05, 0.48, -0.64]} s={0.05} c="#ec4899" />
            </group>
          ))}
          <Persona {...ABUELA} pos={[0.45, 0, -0.55]} pose="festeja" activo={activo} />
          <Persona {...YO} pos={[0, 0, 0]} desde={[-1.3, 0, 0.35]} hasta={[0.05, 0, 0.0]} pose="camina" poseFinal="festeja" activo={activo} dur={2} reposo={0.25} />
        </>
      );
    case "g-tamales":
      return (
        <>
          <PapelPicado />
          <Mesa p={[0, 0, -0.2]} w={1.1} d={0.62} c="#92400e" />
          <Cil p={[-0.15, 0.59, -0.2]} r={0.17} h={0.02} c="#f8fafc" />
          {[-0.06, 0, 0.06].map((z, k) => (
            <Caja key={z} p={[-0.15 + (k - 1) * 0.05, 0.63, -0.2 + z]} s={[0.18, 0.06, 0.07]} c="#e9d8a6" rot={[0, 0.5, 0]} />
          ))}
          <Cil p={[0.25, 0.67, -0.28]} r={0.12} h={0.19} c="#7c2d12" />
          <Cil p={[-0.42, 0.63, -0.02]} r={0.045} h={0.1} c="#c2410c" />
          <Cil p={[0.42, 0.63, -0.02]} r={0.045} h={0.1} c="#c2410c" />
          <Silla p={[-0.82, 0, -0.2]} rot={Math.PI / 2} />
          <Silla p={[0.82, 0, -0.2]} rot={-Math.PI / 2} />
          <Persona {...ABUELA} pos={[-0.8, 0, -0.2]} rot={Math.PI / 2} pose="come" activo={activo} />
          <Persona {...YO} pos={[0.8, 0, -0.2]} rot={-Math.PI / 2} pose="come" activo={activo} fase={1.2} />
          {activo && (
            <Chip p={[0, 1.25, -0.2]} col="#fbbf24aa" fs={10}>
              tamales + atole
            </Chip>
          )}
        </>
      );
    case "g-cuentos":
      return (
        <>
          <group position={[0.45, 1.35, -0.88]}>
            <Caja p={[0, 0, 0]} s={[0.9, 0.6, 0.04]} c="#78350f" />
            <Caja p={[0, 0, 0.025]} s={[0.8, 0.5, 0.01]} c="#bae6fd" />
            <Caja p={[-0.1, -0.08, 0.035]} s={[0.22, 0.2, 0.01]} c="#fef3c7" />
            <Caja p={[0.06, 0.0, 0.035]} s={[0.07, 0.36, 0.01]} c="#fef3c7" />
            <Caja p={[0.26, -0.13, 0.035]} s={[0.18, 0.12, 0.01]} c="#fca5a5" />
          </group>
          <Caja p={[-0.75, 0.22, -0.4]} s={[0.62, 0.44, 0.55]} c="#9d174d" />
          <Caja p={[-0.75, 0.62, -0.64]} s={[0.62, 0.5, 0.12]} c="#9d174d" />
          <Caja p={[-1.03, 0.52, -0.4]} s={[0.1, 0.2, 0.55]} c="#831843" />
          <Caja p={[-0.47, 0.52, -0.4]} s={[0.1, 0.2, 0.55]} c="#831843" />
          <Persona {...ABUELA} pos={[-0.75, 0, -0.38]} rot={0.5} pose="cuenta" activo={activo} />
          <Cil p={[0.45, 0.2, 0.25]} r={0.16} h={0.4} c="#0e7490" />
          <Persona {...YO} pos={[0.45, 0, 0.25]} rot={-2.3} pose="sentado" activo={activo} />
          {activo && (
            <Chip p={[-0.75, 1.65, -0.38]} col="#fbbf24aa" fs={10}>
              <i className="fa-solid fa-book-open" style={{ color: "#fbbf24" }} />
              old stories
            </Chip>
          )}
        </>
      );
    case "g-vecinos":
      return (
        <>
          <PapelPicado />
          <Puerta p={[0.95, 0, -0.86]} abierta={activo} />
          <Persona {...ABUELA} pos={[-1.0, 0, -0.35]} rot={1.0} pose={activo ? "sorpresa" : "parado"} activo={activo} />
          <Persona {...YO} pos={[-0.55, 0, 0.1]} rot={1.1} pose={activo ? "sorpresa" : "parado"} activo={activo} fase={0.7} />
          <Persona ropa="#2563eb" pantalon="#374151" pelo="#111827" pos={[0, 0, 0]} desde={[0.95, 0, -0.75]} hasta={[0.45, 0, -0.1]} pose="camina" poseFinal="festeja" activo={activo} dur={1.5} reposo={0} />
          <Persona ropa="#16a34a" pantalon="#1f2937" pelo="#78350f" gorra="#f59e0b" pos={[0, 0, 0]} desde={[1.3, 0, -0.75]} hasta={[1.0, 0, 0.2]} pose="camina" poseFinal="parado" activo={activo} dur={1.8} reposo={0}>
            <Guitarra p={[0.02, 0.72, 0.17]} rot={[0, 0, 0.9]} />
          </Persona>
          {activo && (
            <Chip p={[-0.55, 1.6, 0.1]} col="#facc15aa" fs={13}>
              <i className="fa-solid fa-bolt" style={{ color: "#facc15" }} />!
            </Chip>
          )}
        </>
      );
    case "g-musica":
      return (
        <>
          <Ventana p={[-0.7, 1.4, -0.88]} noche />
          <PapelPicado y={1.9} />
          <group position={[0.75, 1.45, -0.88]}>
            <Cil p={[0, 0, 0]} r={0.14} h={0.04} c="#f8fafc" rot={[Math.PI / 2, 0, 0]} />
            <Chip p={[0, 0.28, 0.05]} fs={10}>
              12:00
            </Chip>
          </group>
          <pointLight position={[0, 1.2, 0.4]} intensity={2.2} distance={3.5} color="#fdba74" />
          {(
            [
              [-0.95, -0.05, 0.7],
              [-0.35, -0.4, 0.25],
              [0.35, -0.4, -0.25],
              [0.95, -0.05, -0.7],
            ] as const
          ).map(([x, z, r], k) => (
            <group key={k}>
              <Cil p={[x, 0.2, z]} r={0.15} h={0.4} c="#78350f" />
              <Persona
                ropa={k === 0 ? YO.ropa : k === 1 ? "#16a34a" : k === 2 ? ABUELA.ropa : "#2563eb"}
                canas={k === 2}
                piel={k === 2 ? ABUELA.piel : undefined}
                pos={[x, 0, z]}
                rot={r}
                pose={k === 1 ? "toca" : "aplaude"}
                activo={activo}
                fase={k * 0.4}
              >
                {k === 1 && <Guitarra p={[0.02, 0.62, 0.2]} rot={[0.2, 0, 1.2]} />}
              </Persona>
            </group>
          ))}
          <Notas />
        </>
      );
    case "d-camino":
      return (
        <>
          <Cielo />
          <Esf p={[1.1, 1.75, -0.8]} s={0.16} c="#fde047" emis="#facc15" />
          <Arbol p={[0.25, 0, -0.55]} s={0.8} />
          <Caja p={[0, 0.006, 0.3]} s={[2.96, 0.012, 0.55]} c="#6b7280" rough={0.95} />
          <Persona {...YO} mochila pos={[0, 0, 0.3]} desde={[-1.3, 0, 0.3]} hasta={[1.1, 0, 0.3]} pose="camina" activo={activo} dur={3.2} reposo={0.35} />
        </>
      );
    case "d-perro":
      return (
        <>
          <Caja p={[-0.7, 0.6, -0.72]} s={[1.3, 1.2, 0.3]} c="#fdba74" />
          <Caja p={[-0.7, 1.25, -0.72]} s={[1.4, 0.1, 0.4]} c="#9a3412" />
          <Caja p={[-0.95, 0.35, -0.56]} s={[0.4, 0.7, 0.02]} c="#0f172a" />
          <Arbol p={[0.8, 0, -0.65]} s={0.9} />
          <Calle />
          <Perro pos={[0, 0, 0]} desde={[-0.9, 0, -0.35]} hasta={[1.15, 0, 0.5]} activo={activo} dur={2.2} reposo={0.5} />
          <Persona {...YO} mochila pos={[-0.85, 0, 0.45]} rot={1.2} pose={activo ? "senala" : "parado"} activo={activo} />
          {activo && (
            <Chip p={[-0.85, 1.6, 0.45]} col="#facc15aa" fs={12}>
              <i className="fa-solid fa-dog" style={{ color: "#facc15" }} />!
            </Chip>
          )}
        </>
      );
    case "d-gato":
      return (
        <>
          {Array.from({ length: 11 }, (_, k) => (
            <Caja key={k} p={[-1.4 + k * 0.28, 0.3, -0.55]} s={[0.05, 0.6, 0.05]} c="#f8fafc" />
          ))}
          <Caja p={[0, 0.45, -0.55]} s={[2.9, 0.05, 0.03]} c="#f8fafc" />
          <Caja p={[0, 0.2, -0.55]} s={[2.9, 0.05, 0.03]} c="#f8fafc" />
          {[-1.0, -0.2, 0.7].map((x) => (
            <Esf key={x} p={[x, 0.25, -0.78]} s={0.28} c="#15803d" rough={0.9} />
          ))}
          {[-0.6, 0.3, 1.1].map((x) => (
            <group key={x}>
              <Cil p={[x, 0.12, 0.65]} r={0.012} h={0.24} c="#16a34a" />
              <Esf p={[x, 0.26, 0.65]} s={0.05} c="#f472b6" />
            </group>
          ))}
          <Perro pos={[0, 0, 0]} desde={[-1.2, 0, 0.45]} hasta={[0.5, 0, -0.2]} activo={activo} dur={2.2} reposo={0.2} escala={1} />
          <Perro pos={[0, 0, 0]} desde={[-0.3, 0, 0.4]} hasta={[1.15, 0, -0.3]} activo={activo} dur={1.5} reposo={0.35} color="#f97316" escala={0.6} />
          <Chip p={[1.0, 0.75, -0.3]} col="#f9731699" fs={10}>
            <i className="fa-solid fa-cat" style={{ color: "#fb923c" }} />
            cat
          </Chip>
        </>
      );
    case "d-dueno":
      return (
        <>
          <Cielo tarde />
          <Calle />
          <Perro pos={[-0.05, 0, 0.25]} rot={0.3} sentado />
          <Persona ropa="#475569" pantalon="#1f2937" pelo="#111827" gorra="#dc2626" pos={[0, 0, 0]} desde={[1.3, 0, -0.3]} hasta={[0.35, 0, 0.05]} pose="corre" poseFinal="parado" activo={activo} dur={1.3} reposo={1} />
          <Persona {...YO} mochila pos={[-0.9, 0, 0.35]} rot={0.9} pose={activo ? "festeja" : "parado"} activo={activo} />
        </>
      );
    case "d-escuela":
      return (
        <>
          <Escuela p={[-0.35, 0, -0.62]} s={1.05} />
          <Caja p={[0, 0.006, 0.3]} s={[2.96, 0.012, 0.6]} c="#a8a29e" rough={0.95} />
          <Persona {...YO} mochila pos={[-0.45, 0, 0.3]} rot={0.9} pose="habla" activo={activo} />
          <Persona ropa="#db2777" pantalon="#312e81" pelo="#111827" pos={[0.45, 0, 0.1]} rot={-1.0} pose={activo ? "festeja" : "parado"} activo={activo} fase={0.5} />
          <Persona ropa="#0891b2" pantalon="#3f3f46" pelo="#78350f" pos={[0.95, 0, 0.35]} rot={-1.3} pose={activo ? "aplaude" : "parado"} activo={activo} fase={1.1} />
          {activo && (
            <Chip p={[0.7, 1.65, 0.2]} col="#34d399aa" fs={11}>
              Ha, ha!
            </Chip>
          )}
        </>
      );
    default:
      return null;
  }
}

/* ── Teatrino ─────────────────────────────────────────────────────────── */

const SPAN_X = 3.35;
const SPAN_Y = 2.85;

function slotPos(slot: number, n: number): [number, number] {
  const filas = Math.ceil(n / 3);
  const fila = Math.floor(slot / 3);
  const enFila = Math.min(3, n - fila * 3);
  const x = ((slot % 3) - (enFila - 1) / 2) * SPAN_X;
  const y = ((filas - 1) / 2 - fila) * SPAN_Y - 1.0;
  return [x, y];
}

const COLOR_ESTADO: Record<EstadoVineta, string> = {
  normal: "#334155",
  sel: "#ffffff",
  activo: "#ffffff",
  ok: OK,
  error: NO,
  pendiente: "#475569",
  hecho: "#94a3b8",
};

function Vineta({ escena, slot, n, estado, rotulo, activo, burbuja, modoColor, onVineta, hayFoco, enfocada }: { escena: EscenaId; slot: number; n: number; estado: EstadoVineta; rotulo: string; activo: boolean; burbuja: string | null; modoColor: string; onVineta?: (slot: number) => void; hayFoco: boolean; enfocada: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const [tx, ty] = slotPos(slot, n);
  const [inicial] = useState<Pt>(() => [tx, ty, 0]);
  const tema = TEMA[escena];
  const marco = estado === "sel" ? modoColor : COLOR_ESTADO[estado];
  const brilla = estado === "sel" || estado === "activo" || estado === "ok" || estado === "error";
  useFrame((_, dt) => {
    const g = grupo.current;
    if (!g) return;
    const k = suave(dt, 0.08);
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (ty - g.position.y) * k;
    const tz = estado === "sel" ? 0.5 : activo ? 0.3 : 0;
    g.position.z += (tz - g.position.z) * k;
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!onVineta) return;
    e.stopPropagation();
    onVineta(slot);
  };
  const sobre = (e: ThreeEvent<PointerEvent>) => {
    if (!onVineta) return;
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const fuera = () => {
    document.body.style.cursor = "";
  };
  return (
    <group ref={grupo} position={inicial}>
      <group onClick={click} onPointerOver={sobre} onPointerOut={fuera}>
        <Caja p={[0, -0.07, 0]} s={[W, 0.14, D]} c={tema.piso} rough={0.85} />
        <Caja p={[0, H / 2, -D / 2 + 0.04]} s={[W, H, 0.08]} c={tema.pared} rough={0.9} />
        <Caja p={[-W / 2 + 0.03, H / 2, -0.25]} s={[0.06, H, D - 0.5]} c={tema.pared} rough={0.9} />
        {/* Marco de la viñeta */}
        {[-1, 1].map((sx) => (
          <Caja key={sx} p={[(sx * W) / 2, H / 2, D / 2 - 0.02]} s={[0.07, H + 0.14, 0.07]} c={marco} emis={brilla ? marco : undefined} rough={0.4} />
        ))}
        <Caja p={[0, H + 0.035, D / 2 - 0.02]} s={[W + 0.07, 0.07, 0.07]} c={marco} emis={brilla ? marco : undefined} rough={0.4} />
        <Caja p={[0, -0.07, D / 2 - 0.02]} s={[W + 0.07, 0.16, 0.07]} c={marco} emis={brilla ? marco : undefined} rough={0.4} />
        <EtiquetasCtx.Provider value={!hayFoco || enfocada}>
          <Diorama escena={escena} activo={activo} />
        </EtiquetasCtx.Provider>
      </group>
      {tema.noche && <pointLight position={[0, 1.6, 0.6]} intensity={0.6} distance={3} color="#a5b4fc" />}
      {(!hayFoco || enfocada) && (
      <Html position={[-W / 2 + 0.22, H - 0.12, D / 2]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: brilla ? marco : "rgba(4,10,22,0.88)",
            color: brilla ? "#04121f" : "#fff",
            border: `1px solid ${marco}`,
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {slot + 1}
        </div>
      </Html>
      )}
      {!hayFoco && (
      <Html position={[0, -0.34, D / 2]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(4,10,22,0.88)",
            border: `1px solid ${brilla ? marco : "rgba(255,255,255,0.18)"}`,
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {estado === "ok" && <i className="fa-solid fa-circle-check" style={{ color: OK }} />}
          {estado === "error" && <i className="fa-solid fa-circle-xmark" style={{ color: NO }} />}
          {rotulo}
        </div>
      </Html>
      )}
      {activo && burbuja && (
        <Html position={[0, H + 0.66, 0.4]} center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: 300,
              padding: "9px 14px",
              borderRadius: 14,
              background: estado === "error" ? "#fee2e2" : "#ffffff",
              border: `2px solid ${estado === "error" ? NO : modoColor}`,
              color: "#0f172a",
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.35,
              textAlign: "center",
              boxShadow: "0 10px 26px -10px #000",
            }}
          >
            {burbuja}
          </div>
        </Html>
      )}
    </group>
  );
}

function Teatrino({ escenas, estados, rotulos, activa, foco, burbuja, modoColor, onVineta }: { escenas: EscenaId[]; estados: EstadoVineta[]; rotulos: string[]; activa: number | null; foco: number | null; burbuja: string | null; modoColor: string; onVineta?: (slot: number) => void }) {
  const n = escenas.length;
  const filas = Math.ceil(n / 3);
  const pliegues = useMemo(() => Array.from({ length: 26 }, (_, k) => -12.5 + k), []);
  return (
    <group>
      {/* Telón y repisas */}
      <mesh position={[0, 1, -1.75]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#3f0a1d" roughness={0.95} />
      </mesh>
      {pliegues.map((x) => (
        <mesh key={x} geometry={G_CIL} position={[x, 1, -1.62]} scale={[0.16, 16, 0.16]}>
          <meshStandardMaterial color="#5b0f2a" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: filas }, (_, f) => {
        const enFila = Math.min(3, n - f * 3);
        const [, y] = slotPos(f * 3, n);
        const ancho = enFila * SPAN_X + 0.2;
        return (
          <group key={f}>
            <Caja p={[0, y - 0.24, -0.05]} s={[ancho, 0.1, D + 0.4]} c="#6b3f24" rough={0.6} />
            <Caja p={[0, y - 0.24, D / 2 + 0.16]} s={[ancho, 0.12, 0.04]} c="#fbbf24" emis="#b45309" rough={0.4} />
          </group>
        );
      })}
      {escenas.map((esc, slot) => (
        <Vineta key={esc} escena={esc} slot={slot} n={n} estado={estados[slot] ?? "normal"} rotulo={rotulos[slot] ?? ""} activo={activa === slot} burbuja={activa === slot ? burbuja : null} modoColor={modoColor} onVineta={onVineta} hayFoco={foco !== null} enfocada={foco === slot} />
      ))}
    </group>
  );
}

/* ── Línea del tiempo (modo 2) ────────────────────────────────────────── */

const PASO_X = 2.5;
const X = (e: number) => e * PASO_X;

function Flecha({ x0, x1, y, col, discontinua = false, z = 0 }: { x0: number; x1: number; y: number; col: string; discontinua?: boolean; z?: number }) {
  const largo = Math.max(0.05, x1 - x0 - 0.18);
  const segs = discontinua ? 4 : 1;
  return (
    <group>
      {Array.from({ length: segs }, (_, k) => {
        const l = discontinua ? largo / (segs * 1.6) : largo;
        const cx = x0 + (discontinua ? (k + 0.5) * (largo / segs) : largo / 2);
        return (
          <mesh key={k} geometry={G_CIL} position={[cx, y, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.04, l, 0.04]}>
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} />
          </mesh>
        );
      })}
      <mesh geometry={G_CONO} position={[x1 - 0.09, y, z]} rotation={[0, 0, -Math.PI / 2]} scale={[0.1, 0.2, 0.1]}>
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function Tubo({ x0, x1, y, col, crece = 0 }: { x0: number; x1: number; y: number; col: string; crece?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.1);
    const m = ref.current;
    if (!m) return;
    const u = crece > 0 ? Math.min(1, t.current / crece) : 1;
    const l = Math.max(0.01, (x1 - x0) * u);
    m.scale.set(0.13, l, 0.13);
    m.position.x = x0 + l / 2;
  });
  return (
    <mesh ref={ref} geometry={G_CIL} position={[(x0 + x1) / 2, y, 0.35]} rotation={[0, 0, Math.PI / 2]} scale={[0.13, x1 - x0, 0.13]}>
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} transparent opacity={0.55} depthWrite={false} />
    </mesh>
  );
}

function FichaEvento({ e, it, texto, icono }: { e: number; it: ItemConectar | null; texto: string; icono: string }) {
  const rel = it ? RELACION_DEF[it.relacion] : null;
  const col = rel?.color ?? "#94a3b8";
  const x = X(e);
  const ficha = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  const domino = useRef<THREE.Group>(null);
  const t = useRef(0);
  const retardo = it && (it.relacion === "consecuencia" || it.relacion === "interrupcion" || it.relacion === "causa") ? 0.8 : 0;
  const pin = it && (it.relacion === "mientras" || it.relacion === "interrupcion");
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.1);
    const u = t.current;
    const g = ficha.current;
    if (g) {
      if (it?.relacion === "sorpresa") {
        const f = Math.min(1, u / 0.5);
        const rebote = f >= 1 ? Math.abs(Math.sin((u - 0.5) * 10)) * Math.exp(-(u - 0.5) * 5) * 0.35 : 0;
        g.position.y = 3.2 * (1 - f) * (1 - f) + rebote;
        g.scale.setScalar(1);
      } else if (retardo > 0) {
        const f = THREE.MathUtils.smoothstep(u, retardo, retardo + 0.4);
        g.scale.setScalar(Math.max(0.001, f));
        g.position.y = 0;
      } else {
        const f = THREE.MathUtils.smoothstep(u, 0, 0.45);
        g.position.y = 0;
        g.position.x = -0.8 * (1 - f);
        g.scale.setScalar(Math.max(0.001, f));
      }
    }
    if (aro.current) {
      const f = Math.min(1, Math.max(0, (u - 0.5) / 0.7));
      aro.current.scale.setScalar(0.2 + f * 1.4);
      (aro.current.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.9;
    }
    if (domino.current) domino.current.rotation.z = -THREE.MathUtils.smoothstep(u, 0.1, 0.7) * (Math.PI / 2 - 0.25);
  });
  const alto = pin ? 0.75 : 1.0;
  const ancho = pin ? 1.55 : 1.7;
  const yCentro = pin ? 1.05 : 0.62;
  return (
    <group position={[x, 0, 0]}>
      <group ref={ficha}>
        <Caja p={[0, yCentro, 0]} s={[ancho, alto, 0.14]} c="#0f172a" rough={0.5} />
        {pin && <Cil p={[0, 0.5, 0.2]} r={0.025} h={0.44} c={col} emis={col} />}
        <Caja p={[0, yCentro, 0.075]} s={[ancho - 0.08, alto - 0.08, 0.01]} c={col} emis={col} rough={0.4} />
        <Html position={[0, yCentro, 0.12]} center distanceFactor={8} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: pin ? 135 : 150, textAlign: "center", color: "#04121f", fontSize: pin ? 12 : 13, fontWeight: 900, lineHeight: 1.2 }}>
            <i className={`fa-solid ${icono}`} style={{ fontSize: 17, display: "block", marginBottom: 4 }} />
            {texto}
          </div>
        </Html>
        {it && (
          <Chip p={[0, yCentro + alto / 2 + 0.28, 0]} col={col} fs={12} df={8}>
            <i className={`fa-solid ${rel!.icono}`} style={{ color: col }} />
            {it.conector} · {rel!.etq.toLowerCase()}
          </Chip>
        )}
      </group>
      {it?.relacion === "sorpresa" && (
        <mesh ref={aro} geometry={G_ARO} position={[0, 0.62, 0.1]}>
          <meshBasicMaterial color={col} transparent opacity={0} />
        </mesh>
      )}
      {it?.relacion === "inicio" && (
        <group position={[-1.0, 0, 0.1]}>
          <Cil p={[0, 0.8, 0]} r={0.025} h={1.6} c="#e5e7eb" />
          <Caja p={[0.2, 1.45, 0]} s={[0.38, 0.24, 0.02]} c={col} emis={col} />
        </group>
      )}
      {it?.relacion === "cierre" && (
        <group position={[1.05, 0, 0.1]}>
          <Cil p={[0, 0.8, 0]} r={0.025} h={1.6} c="#e5e7eb" />
          {Array.from({ length: 12 }, (_, k) => (
            <Caja key={k} p={[0.1 + (k % 4) * 0.1, 1.55 - Math.floor(k / 4) * 0.1, 0]} s={[0.1, 0.1, 0.02]} c={(k + Math.floor(k / 4)) % 2 === 0 ? "#f8fafc" : "#111827"} />
          ))}
        </group>
      )}
      {(it?.relacion === "secuencia" || it?.relacion === "inicio") && e > 0 && <Flecha x0={-PASO_X + 0.85} x1={-0.85} y={0.62} col={col} />}
      {it?.relacion === "despues" && (
        <>
          <Flecha x0={-PASO_X + 0.85} x1={-0.85} y={0.62} col={col} discontinua />
          <Chip p={[-PASO_X / 2, 1.0, 0]} col={col} fs={11}>
            <i className="fa-solid fa-clock" style={{ color: col }} />
            later
          </Chip>
        </>
      )}
      {it?.relacion === "consecuencia" && (
        <>
          <group ref={domino} position={[-1.25, 0, 0.2]}>
            <Caja p={[0, 0.35, 0]} s={[0.12, 0.7, 0.4]} c={col} emis={col} />
          </group>
          <Flecha x0={-PASO_X + 0.85} x1={-0.88} y={0.2} col={col} />
        </>
      )}
      {it?.relacion === "causa" && (
        <>
          <Caja p={[-1.25, 0.3, 0.5]} s={[1.45, 0.44, 0.08]} c="#831843" emis="#831843" />
          <Html position={[-1.25, 0.3, 0.56]} center distanceFactor={8} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ width: 130, textAlign: "center", color: "#fff", fontSize: 10.5, fontWeight: 900, lineHeight: 1.2 }}>
              {it.fondo}
              <div style={{ fontSize: 9.5, color: "#fbcfe8" }}>causa · ocurrió antes</div>
            </div>
          </Html>
          <Flecha x0={-0.52} x1={-0.12} y={0.3} z={0.5} col={col} />
        </>
      )}
      {it?.relacion === "mientras" && (
        <>
          <Tubo x0={-PASO_X - 0.7} x1={1.0} y={0.28} col={col} />
          <Chip p={[-PASO_X / 2, 0.02, 0.5]} col={col} fs={11}>
            <i className="fa-solid fa-spinner" style={{ color: col }} />
            {it.fondo} (in progress)
          </Chip>
        </>
      )}
      {it?.relacion === "interrupcion" && (
        <>
          <Tubo x0={-1.3} x1={-0.02} y={0.28} col={col} crece={0.8} />
          <Chip p={[-0.75, 0.02, 0.5]} col={col} fs={11}>
            {it.fondo}…
          </Chip>
          <Chip p={[0.4, 0.28, 0.5]} col="#facc15" fs={11}>
            <i className="fa-solid fa-bolt" style={{ color: "#facc15" }} />
            when
          </Chip>
        </>
      )}
    </group>
  );
}

function LineaTiempo({ hechos, modoColor }: { hechos: number; modoColor: string }) {
  const total = ITEMS.length;
  const caminante = useRef<THREE.Group>(null);
  const vel = useRef(0);
  const xObj = X(Math.min(hechos, total)) + (hechos >= total ? 1.7 : 1.25);
  useFrame((_, dt) => {
    const g = caminante.current;
    if (!g) return;
    const x = g.position.x;
    const nx = x + (xObj - x) * suave(dt, 0.025);
    vel.current = Math.abs(nx - x) / Math.max(dt, 1e-3);
    g.position.x = nx;
  });
  return (
    <group>
      <mesh position={[X(total) / 2, -0.13, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[X(total) + 80, 40]} />
        <meshStandardMaterial color="#070d1c" roughness={1} />
      </mesh>
      <Caja p={[X(total) / 2, -0.06, 0.3]} s={[X(total) + 3.2, 0.12, 1.9]} c="#1e293b" rough={0.6} />
      <Caja p={[X(total) / 2, 0.005, 0.95]} s={[X(total) + 3.2, 0.012, 0.05]} c={modoColor} emis={modoColor} />
      {Array.from({ length: total + 1 }, (_, e) => (
        <Caja key={e} p={[X(e), 0.01, 0.95]} s={[0.05, 0.02, 0.3]} c={e <= hechos ? modoColor : "#475569"} emis={e <= hechos ? modoColor : undefined} />
      ))}
      <FichaEvento e={0} it={null} texto={EVENTO_INICIAL.evento} icono={EVENTO_INICIAL.icono} />
      {ITEMS.slice(0, hechos).map((it, i) => (
        <FichaEvento key={it.id} e={i + 1} it={it} texto={it.evento} icono={it.icono} />
      ))}
      {hechos < total && (
        <group position={[X(hechos + 1), 0, 0]}>
          <Caja p={[0, 0.62, 0]} s={[1.7, 1.0, 0.1]} c="#334155" op={0.35} />
          <Chip p={[0, 1.42, 0.1]} col={`${modoColor}aa`} fs={13}>
            <i className="fa-solid fa-circle-question" style={{ color: modoColor }} />
            ¿qué pasó después?
          </Chip>
        </group>
      )}
      <group ref={caminante} position={[xObj, 0, 0.95]}>
        <Persona ropa="#ec4899" pantalon="#1e3a8a" pelo="#111827" pos={[0, 0, 0]} rot={Math.PI / 2} pose="parado" velRef={vel} />
      </group>
    </group>
  );
}

/* ── Cámara guiada ────────────────────────────────────────────────────── */

function CamaraGuiada({ pos, target, clave }: { pos: Pt; target: Pt; clave: string }) {
  const est = useRef<{ clave: string; t: number } | null>(null);
  useFrame((state, dt) => {
    const { camera } = state;
    const controls = state.controls as unknown as { target?: THREE.Vector3; update?: () => void } | null;
    if (!est.current || est.current.clave !== clave) est.current = { clave, t: 0 };
    const d = est.current;
    if (d.t > 2.2) return;
    d.t += Math.min(dt, 0.25);
    const k = suave(dt, 0.06);
    camera.position.x += (pos[0] - camera.position.x) * k;
    camera.position.y += (pos[1] - camera.position.y) * k;
    camera.position.z += (pos[2] - camera.position.z) * k;
    if (controls?.target) {
      controls.target.x += (target[0] - controls.target.x) * k;
      controls.target.y += (target[1] - controls.target.y) * k;
      controls.target.z += (target[2] - controls.target.z) * k;
      controls.update?.();
    } else camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function RelatoSecuenciaInglesScene(p: RelatoSceneProps) {
  const { vista, modoColor, resetNonce, clave } = p;
  const n = p.escenas.length;
  const filas = Math.ceil(Math.max(1, n) / 3);
  const yMedio = -1.0 + H / 2 - 0.1;
  const general = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "conectar") return { pos: [-0.2, 3.3, 8.0], target: [-0.4, 0.65, 0] };
    return { pos: [0, yMedio + 1.6, filas > 1 ? 11.4 : 8.4], target: [0, yMedio, 0] };
  }, [vista, filas, yMedio]);

  let guia: { pos: Pt; target: Pt; clave: string } = { ...general, clave: `general-${clave}` };
  if (vista !== "conectar" && p.foco !== null) {
    const [x, y] = slotPos(p.foco, n);
    guia = { pos: [x * 0.9, y + 1.6, 7.3], target: [x, y + 1.35, 0], clave: `foco-${p.foco}-${clave}` };
  }
  if (vista === "conectar") {
    const xf = X(Math.min(p.hechos, ITEMS.length));
    guia = { pos: [xf - 0.2, 3.3, 8.0], target: [xf - 0.4, 0.65, 0], clave: `linea-${p.hechos}` };
  }

  return (
    <Canvas key={`${vista}-${clave}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: general.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[vista === "conectar" ? "#060b18" : "#12040b"]} />
      <fog attach="fog" args={[vista === "conectar" ? "#060b18" : "#12040b", 16, 40]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 8, 7]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <spotLight position={[0, 7, 6]} angle={0.7} penumbra={0.8} intensity={vista === "conectar" ? 0 : 30} color="#fff1d6" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 5, 6]} scale={[10, 6, 1]} color="#fde68a" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "conectar" ? (
        <LineaTiempo hechos={p.hechos} modoColor={modoColor} />
      ) : (
        <Teatrino escenas={p.escenas} estados={p.estados} rotulos={p.rotulos} activa={p.activa} foco={p.foco} burbuja={p.burbuja} modoColor={modoColor} onVineta={p.onVineta} />
      )}
      <CamaraGuiada pos={guia.pos} target={guia.target} clave={guia.clave} />

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3} maxDistance={18} maxPolarAngle={Math.PI * 0.56} minPolarAngle={Math.PI * 0.2} minAzimuthAngle={-Math.PI * 0.35} maxAzimuthAngle={Math.PI * 0.35} target={general.target} />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
