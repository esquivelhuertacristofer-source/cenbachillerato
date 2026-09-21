"use client";

/**
 * Escena 3D del laboratorio "Can you…? May I…? El centro comunitario"
 * (IN-II-P03). Un mismo centro comunitario en maqueta —biblioteca, laboratorio
 * de cómputo, salón de música, cocina, cancha y alberca— con tres vistas:
 *
 *  - club: seis candidatos en el pasillo; al preguntarles, caminan al espacio
 *    de la habilidad y lo intentan (nadan o chapotean, encestan o fallan,
 *    voltean la quesadilla o la queman, tocan o desafinan, editan o marcan
 *    error, saludan en náhuatl o se encogen de hombros).
 *  - permiso: tú frente a un adulto o un amigo; tu petición, su respuesta, el
 *    medidor de cortesía y, al entenderla, vas a hacerlo donde te dijeron.
 *  - letreros: el letrero del espacio en grande, la persona con lo que quiere
 *    hacer y, al decidir, lo hace o se detiene.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type EspacioId,
  type LugarId,
  type HabilidadId,
  type Persona as PersonaData,
  type Registro,
  LUGAR_DEF,
  HABILIDAD_DEF,
  ESPACIOS,
  CANDIDATOS,
  MISIONES,
  SITUACIONES,
  CASOS,
  REGISTRO_DEF,
  persona as personaPorId,
  tipoLinea,
  horaCorta,
  albercaAbierta,
} from "./habilidades-permisos-ingles-data";

export type VistaHP = Modo;

export interface IntentoClub {
  persona: string;
  habilidad: HabilidadId;
  clave: number;
}

export interface HabilidadesSceneProps {
  vista: VistaHP;
  modoColor: string;
  resetNonce: number;
  // Club
  seleccion: string | null;
  intento: IntentoClub | null;
  burbujaClub: string | null;
  insignias: Record<string, string[]>;
  misionIdx: number;
  onElegir: (id: string) => void;
  // Permiso
  sitIdx: number;
  pasoP: number;
  registro: Registro | null;
  peticionTxt: string | null;
  // Letreros
  casoIdx: number;
  estadoCaso: "leer" | "decidido";
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

/* ════════════════════════════════════════════════════════════════════════
 * Texto en escena
 * ════════════════════════════════════════════════════════════════════════ */

function Etiqueta({ pos, children, df = 10, col, fs = 12, fondo = "rgba(4,10,22,0.86)" }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; fondo?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: fondo,
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

function Burbuja({ pos, texto, col, df = 8, lado = "centro" }: { pos: Pt; texto: string; col: string; df?: number; lado?: "izq" | "der" | "centro" }) {
  const dx = lado === "izq" ? "-78%" : lado === "der" ? "-22%" : "-50%";
  const cola = lado === "izq" ? "78%" : lado === "der" ? "22%" : "50%";
  return (
    <Html position={pos} distanceFactor={df} zIndexRange={[24, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ transform: `translate(${dx}, -100%)` }}>
        <div style={{ position: "relative", padding: "8px 14px", borderRadius: 14, background: "#fff", color: "#0f172a", fontSize: 15, fontWeight: 900, maxWidth: 300, width: "max-content", lineHeight: 1.3, border: `3px solid ${col}`, boxShadow: "0 10px 24px -10px #000", fontFamily: "ui-rounded, system-ui, sans-serif" }}>
          {texto}
          <div style={{ position: "absolute", left: cola, bottom: -9, width: 14, height: 14, marginLeft: -7, background: "#fff", borderRight: `3px solid ${col}`, borderBottom: `3px solid ${col}`, transform: "rotate(45deg)" }} />
        </div>
      </div>
    </Html>
  );
}

/** Letrero en inglés: prohibiciones en rojo, permisos en verde, información en gris. */
function LetreroHtml({ pos, lugar, df = 8, resalta }: { pos: Pt; lugar: LugarId; df?: number; resalta?: string | null }) {
  const d = LUGAR_DEF[lugar];
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ minWidth: 190, padding: "8px 12px 9px", borderRadius: 10, background: "#fffdf5", border: "3px solid #1f2937", boxShadow: "0 10px 26px -10px #000", fontFamily: "ui-rounded, system-ui, sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>
          <i className={`fa-solid ${d.icono}`} style={{ marginRight: 6, color: d.color }} />
          {d.en}
        </div>
        {d.letrero.map((l) => {
          const tipo = tipoLinea(l);
          const col = tipo === "no" ? "#dc2626" : tipo === "si" ? "#059669" : "#334155";
          const on = resalta === l;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 900, color: col, whiteSpace: "nowrap", padding: "2px 5px", margin: "1px -5px", borderRadius: 6, background: on ? `${col}22` : "transparent", outline: on ? `2px solid ${col}` : "none" }}>
              <i className={`fa-solid ${tipo === "no" ? "fa-ban" : tipo === "si" ? "fa-circle-check" : l.startsWith("Open") ? "fa-clock" : "fa-circle-info"}`} />
              {l}
            </div>
          );
        })}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Geometrías compartidas
 * ════════════════════════════════════════════════════════════════════════ */

const G = {
  esfera: new THREE.SphereGeometry(1, 20, 14),
  esferaB: new THREE.SphereGeometry(1, 10, 8),
  caja: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(1, 1, 1, 18),
  pierna: new THREE.CapsuleGeometry(0.075, 0.62, 5, 12),
  brazo: new THREE.CapsuleGeometry(0.052, 0.46, 5, 10),
  torso: new THREE.CapsuleGeometry(0.17, 0.34, 6, 16),
  pelo: new THREE.SphereGeometry(0.142, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
  gorra: new THREE.SphereGeometry(0.146, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.4),
  falda: new THREE.CylinderGeometry(0.19, 0.3, 0.5, 22, 1, true),
  aro: new THREE.TorusGeometry(0.034, 0.007, 8, 20),
  anillo: new THREE.RingGeometry(0.42, 0.52, 40),
  aroCanasta: new THREE.TorusGeometry(0.23, 0.02, 10, 32),
  red: new THREE.CylinderGeometry(0.23, 0.15, 0.36, 14, 1, true),
  rueda: new THREE.TorusGeometry(0.26, 0.035, 10, 28),
  copa: new THREE.IcosahedronGeometry(1, 1),
  nota: new THREE.SphereGeometry(0.06, 10, 8),
};

function Mat({ c, r = 0.62, m = 0, e, ei = 0.6, t, o = 1 }: { c: string; r?: number; m?: number; e?: string; ei?: number; t?: boolean; o?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000000"} emissiveIntensity={e ? ei : 0} transparent={t} opacity={o} />;
}

function Caja({ p, s, c, r = 0.75, m = 0, rotY = 0, sombra = true }: { p: Pt; s: Pt; c: string; r?: number; m?: number; rotY?: number; sombra?: boolean }) {
  return (
    <mesh geometry={G.caja} position={p} scale={s} rotation={[0, rotY, 0]} castShadow={sombra} receiveShadow>
      <Mat c={c} r={r} m={m} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Distribución del centro
 * ════════════════════════════════════════════════════════════════════════ */

const CEL: Record<EspacioId, [number, number]> = { library: [-6.8, -3.6], computer: [0, -3.6], music: [6.8, -3.6], kitchen: [-6.8, 3.4], court: [0, 3.4], pool: [6.8, 3.4] };
const W = 6.6;
const D = 4.6;
const CORR_Z = -0.1;

const mira = (de: [number, number], a: [number, number]) => Math.atan2(a[0] - de[0], a[1] - de[1]);

/** Encuadre de cámara para un lugar. */
function foco(l: LugarId): { pos: Pt; target: Pt } {
  if (l === "patio") return { pos: [-3.4, 4.4, 5.4], target: [-9.0, 1.0, -0.3] };
  const [x, z] = CEL[l];
  if (z < 0) return { target: [x, 0.9, z + 0.2], pos: [x * 0.9, 7.0, z + 7.0] };
  return { target: [x, 0.8, z], pos: [x * 0.9, 6.4, z + 7.4] };
}
const GENERAL = { pos: [0, 14.2, 16.6] as Pt, target: [0, 0, -0.2] as Pt };

/* ════════════════════════════════════════════════════════════════════════
 * Personas
 * ════════════════════════════════════════════════════════════════════════ */

export type Pose = "parado" | "saluda" | "nadar" | "chapotear" | "guitarra" | "guitarraMal" | "cocinar" | "tirar" | "teclear" | "hablar" | "encoger" | "comer" | "celular" | "leer" | "no" | "si" | "bici";
type Accesorio = "guitarra" | "libro" | "torta" | "papitas" | "refresco" | "celular" | "almuerzo" | "espatula" | null;

function Guitarra() {
  return (
    <group>
      <mesh geometry={G.esfera} position={[0, -0.1, 0]} scale={[0.17, 0.2, 0.06]} castShadow>
        <Mat c="#b45309" r={0.4} />
      </mesh>
      <mesh geometry={G.esfera} position={[0, 0.12, 0]} scale={[0.13, 0.14, 0.055]} castShadow>
        <Mat c="#b45309" r={0.4} />
      </mesh>
      <mesh geometry={G.cil} position={[0, -0.02, 0.058]} scale={[0.045, 0.01, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <Mat c="#1c1917" />
      </mesh>
      <mesh geometry={G.caja} position={[0, 0.48, 0]} scale={[0.045, 0.6, 0.03]}>
        <Mat c="#3f2a14" />
      </mesh>
      <mesh geometry={G.caja} position={[0, 0.82, 0]} scale={[0.07, 0.12, 0.035]}>
        <Mat c="#292524" />
      </mesh>
    </group>
  );
}

function AccesorioMano({ a }: { a: Accesorio }) {
  if (a === "libro")
    return (
      <group rotation={[0.3, 0, 0]}>
        <Caja p={[0, 0, 0.06]} s={[0.26, 0.34, 0.05]} c="#7c3aed" sombra={false} />
        <Caja p={[0, 0, 0.087]} s={[0.24, 0.32, 0.01]} c="#f8fafc" sombra={false} />
      </group>
    );
  if (a === "torta")
    return (
      <group>
        <mesh geometry={G.esfera} scale={[0.1, 0.05, 0.08]} position={[0, 0.02, 0.05]}>
          <Mat c="#d6a354" r={0.8} />
        </mesh>
        <Caja p={[0, -0.02, 0.05]} s={[0.17, 0.02, 0.13]} c="#65a30d" sombra={false} />
      </group>
    );
  if (a === "papitas") return <Caja p={[0, 0.02, 0.05]} s={[0.16, 0.22, 0.06]} c="#facc15" sombra={false} />;
  if (a === "refresco")
    return (
      <mesh geometry={G.cil} position={[0, 0.03, 0.04]} scale={[0.045, 0.16, 0.045]}>
        <Mat c="#dc2626" r={0.3} m={0.6} />
      </mesh>
    );
  if (a === "celular")
    return (
      <mesh geometry={G.caja} position={[0, 0.03, 0.06]} scale={[0.09, 0.17, 0.02]} rotation={[0.5, 0, 0]}>
        <Mat c="#111827" e="#60a5fa" ei={0.35} />
      </mesh>
    );
  if (a === "almuerzo") return <Caja p={[0, 0, 0.07]} s={[0.24, 0.12, 0.16]} c="#0ea5e9" sombra={false} />;
  if (a === "espatula") return <Caja p={[0, -0.12, 0.02]} s={[0.03, 0.28, 0.02]} c="#334155" sombra={false} />;
  return null;
}

function Bici() {
  return (
    <group position={[0, 0, 0.1]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} geometry={G.rueda} position={[x, 0.28, 0]}>
          <Mat c="#0f172a" r={0.5} />
        </mesh>
      ))}
      <mesh geometry={G.cil} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 0.9, 0.025]}>
        <Mat c="#16a34a" m={0.4} r={0.35} />
      </mesh>
      <mesh geometry={G.cil} position={[-0.22, 0.4, 0]} rotation={[0, 0, 0.9]} scale={[0.025, 0.5, 0.025]}>
        <Mat c="#16a34a" m={0.4} r={0.35} />
      </mesh>
      <mesh geometry={G.cil} position={[0.42, 0.62, 0]} scale={[0.02, 0.5, 0.02]}>
        <Mat c="#334155" m={0.5} />
      </mesh>
      <mesh geometry={G.cil} position={[0.42, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.018, 0.5, 0.018]}>
        <Mat c="#334155" m={0.5} />
      </mesh>
      <Caja p={[-0.22, 0.66, 0]} s={[0.22, 0.05, 0.1]} c="#111827" sombra={false} />
    </group>
  );
}

function PersonaFig({
  p,
  destino,
  rotY,
  pose,
  accesorio = null,
  fase = 0,
  etiqueta,
  etiquetaCol,
  children,
  onClick,
  anillo,
  conBici = false,
}: {
  p: PersonaData;
  destino: Pt;
  rotY: number;
  pose: Pose;
  accesorio?: Accesorio;
  fase?: number;
  etiqueta?: ReactNode;
  etiquetaCol?: string;
  children?: ReactNode;
  onClick?: () => void;
  anillo?: string | null;
  conBici?: boolean;
}) {
  const raiz = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Group>(null);
  const bI = useRef<THREE.Group>(null);
  const bD = useRef<THREE.Group>(null);
  const pI = useRef<THREE.Group>(null);
  const pD = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const guitarra = useRef<THREE.Group>(null);
  const est = useRef({ init: false, andando: false, hundir: 0 });
  const esc = p.adulto ? 1.05 : 0.94;

  useFrame(({ clock }, dt) => {
    const g = raiz.current;
    const c = cuerpo.current;
    if (!g || !c) return;
    const s = est.current;
    const t = clock.elapsedTime + fase;
    if (!s.init) {
      g.position.set(destino[0], destino[1], destino[2]);
      g.rotation.y = rotY;
      s.init = true;
    }
    // Camino: por el pasillo cuando hay que cambiar de espacio.
    const dxT = destino[0] - g.position.x;
    const dzT = destino[2] - g.position.z;
    let objX = destino[0];
    let objZ = destino[2];
    if (Math.abs(dxT) > 0.6 && Math.abs(g.position.z - CORR_Z) > 0.5 && Math.abs(dzT) + Math.abs(dxT) > 1.5) {
      objX = g.position.x;
      objZ = CORR_Z;
    } else if (Math.abs(dxT) > 0.6 && Math.abs(destino[2] - CORR_Z) > 0.5) {
      objX = destino[0];
      objZ = CORR_Z;
    }
    const ex = objX - g.position.x;
    const ez = objZ - g.position.z;
    const dist = Math.hypot(ex, ez);
    const andando = dist > 0.04;
    s.andando = andando;
    if (andando) {
      const paso = Math.min(dist, 4.2 * Math.min(dt, 0.1));
      g.position.x += (ex / dist) * paso;
      g.position.z += (ez / dist) * paso;
      const ang = Math.atan2(ex, ez);
      let dA = ang - g.rotation.y;
      dA = Math.atan2(Math.sin(dA), Math.cos(dA));
      g.rotation.y += dA * suave(dt, 0.25);
    } else {
      let dA = rotY - g.rotation.y;
      dA = Math.atan2(Math.sin(dA), Math.cos(dA));
      g.rotation.y += dA * suave(dt, 0.12);
    }
    const poseReal: Pose = andando ? "parado" : pose;
    const hundir = poseReal === "nadar" ? -0.62 : poseReal === "chapotear" ? -1.02 : 0;
    s.hundir += (hundir - s.hundir) * suave(dt, 0.12);
    const reset = (gr: THREE.Group | null) => gr && gr.rotation.set(0, 0, 0);
    [bI.current, bD.current, pI.current, pD.current, cabeza.current].forEach(reset);
    c.rotation.set(0, 0, 0);
    c.position.set(0, 0.9 + s.hundir, 0);
    const bi = bI.current!;
    const bd = bD.current!;
    const pi = pI.current!;
    const pd = pD.current!;
    const cab = cabeza.current!;
    if (guitarra.current) guitarra.current.visible = poseReal === "guitarra" || poseReal === "guitarraMal" || accesorio === "guitarra";
    if (andando) {
      const a = Math.sin(t * 9) * 0.55;
      pi.rotation.x = a;
      pd.rotation.x = -a;
      bi.rotation.x = -a * 0.7;
      bd.rotation.x = a * 0.7;
      c.position.y += Math.abs(Math.sin(t * 9)) * 0.03;
      return;
    }
    bi.rotation.z = -0.08;
    bd.rotation.z = 0.08;
    cab.rotation.y = Math.sin(t * 0.6) * 0.08;
    switch (poseReal) {
      case "saluda":
        bd.rotation.z = 2.6 + Math.sin(t * 8) * 0.25;
        break;
      case "si":
        c.position.y += Math.abs(Math.sin(t * 5)) * 0.14;
        bi.rotation.z = -2.5;
        bd.rotation.z = 2.5;
        break;
      case "nadar":
        c.rotation.x = Math.PI / 2 - 0.12;
        bi.rotation.x = t * 4.5;
        bd.rotation.x = t * 4.5 + Math.PI;
        pi.rotation.x = Math.sin(t * 11) * 0.3;
        pd.rotation.x = -Math.sin(t * 11) * 0.3;
        cab.rotation.x = -0.5;
        c.position.z = Math.sin(t * 0.7) * 0.9;
        break;
      case "chapotear":
        c.position.y += Math.sin(t * 6) * 0.07;
        bi.rotation.z = -2.3 + Math.sin(t * 10) * 0.6;
        bd.rotation.z = 2.3 - Math.sin(t * 10 + 1.3) * 0.6;
        cab.rotation.x = -0.25;
        break;
      case "guitarra":
        bd.rotation.x = -0.75 + Math.sin(t * 10) * 0.22;
        bd.rotation.z = -0.35;
        bi.rotation.x = -1.15;
        bi.rotation.z = 0.55;
        cab.rotation.x = 0.15;
        cab.rotation.z = Math.sin(t * 2.5) * 0.08;
        break;
      case "guitarraMal":
        bd.rotation.x = -0.75 + (Math.sin(t * 3) > 0.6 ? 0.3 : 0);
        bd.rotation.z = -0.35;
        bi.rotation.x = -1.15;
        bi.rotation.z = 0.55;
        cab.rotation.z = Math.sin(t * 1.3) * 0.22;
        cab.rotation.x = 0.3;
        break;
      case "cocinar":
        bd.rotation.x = -1.0 + Math.sin(t * 2.6) * 0.25;
        bi.rotation.x = -0.6;
        cab.rotation.x = 0.35;
        break;
      case "tirar": {
        const ciclo = (t % 2.4) / 2.4;
        const u = ciclo < 0.18 ? ciclo / 0.18 : Math.max(0, 1 - (ciclo - 0.18) / 0.25);
        bi.rotation.x = -2.7 * u;
        bd.rotation.x = -2.7 * u;
        c.position.y += ciclo < 0.25 ? Math.sin((ciclo / 0.25) * Math.PI) * 0.12 : 0;
        break;
      }
      case "teclear":
        bi.rotation.x = -1.25 + Math.sin(t * 17) * 0.06;
        bd.rotation.x = -1.25 + Math.cos(t * 19) * 0.06;
        cab.rotation.x = 0.12;
        break;
      case "hablar":
        bd.rotation.x = -0.6 + Math.sin(t * 3) * 0.25;
        bd.rotation.z = 0.5;
        bi.rotation.x = -0.3 + Math.sin(t * 3 + 1) * 0.2;
        break;
      case "encoger": {
        const u = (Math.sin(t * 2.2) + 1) / 2;
        bi.rotation.z = -0.55 * u;
        bd.rotation.z = 0.55 * u;
        bi.rotation.x = -0.7 * u;
        bd.rotation.x = -0.7 * u;
        cab.rotation.z = 0.2 * u;
        break;
      }
      case "comer":
        bd.rotation.x = -2.0 + Math.sin(t * 3) * 0.3;
        bd.rotation.z = -0.4;
        cab.rotation.x = -0.05;
        break;
      case "celular":
        bd.rotation.x = -1.3;
        bd.rotation.z = -0.25;
        cab.rotation.x = 0.35;
        break;
      case "leer":
        bd.rotation.x = -1.15;
        bd.rotation.z = -0.3;
        bi.rotation.x = -1.0;
        bi.rotation.z = 0.25;
        cab.rotation.x = 0.35;
        break;
      case "bici":
        bd.rotation.x = -0.55;
        bi.rotation.x = -0.55;
        break;
      case "no":
        cab.rotation.y = Math.sin(t * 7) * 0.45;
        bi.rotation.z = -0.25;
        bd.rotation.z = 0.25;
        break;
      default:
        bi.rotation.x = Math.sin(t * 1.4) * 0.05;
        bd.rotation.x = -Math.sin(t * 1.4) * 0.05;
    }
  });

  const hombroX = 0.25;
  const peloCol = p.pelo;
  const accMano = accesorio && accesorio !== "guitarra" ? accesorio : null;
  return (
    <group ref={raiz}>
      <group scale={esc}>
        {conBici && <Bici />}
        <group ref={cuerpo} position={[0, 0.9, 0]}>
          <group position={[0, -0.9, 0]}>
            {[-1, 1].map((lado) => (
              <group key={lado} ref={lado < 0 ? pI : pD} position={[lado * 0.095, 0.88, 0]}>
                <mesh geometry={G.pierna} position={[0, -0.42, 0]} castShadow>
                  <Mat c={p.falda ? p.piel : p.pantalon} />
                </mesh>
                <mesh geometry={G.caja} position={[0, -0.84, 0.04]} scale={[0.11, 0.07, 0.22]} castShadow>
                  <Mat c="#1f2937" r={0.5} />
                </mesh>
              </group>
            ))}
            {p.falda ? (
              <mesh geometry={G.falda} position={[0, 0.66, 0]} castShadow>
                <meshStandardMaterial color={p.pantalon} roughness={0.8} side={THREE.DoubleSide} />
              </mesh>
            ) : (
              <mesh geometry={G.caja} position={[0, 0.9, 0]} scale={[0.36, 0.16, 0.22]} castShadow>
                <Mat c={p.pantalon} />
              </mesh>
            )}
            <mesh geometry={G.torso} position={[0, 1.14, 0]} scale={[1, 1, 0.78]} castShadow>
              <Mat c={p.camisa} r={0.7} />
            </mesh>
            {p.id === "salas" && (
              <mesh geometry={G.esferaB} position={[0.05, 1.2, 0.16]} scale={0.03}>
                <Mat c="#e5e7eb" m={0.8} r={0.2} />
              </mesh>
            )}
            {[-1, 1].map((lado) => (
              <group key={lado} ref={lado < 0 ? bI : bD} position={[lado * hombroX, 1.38, 0]}>
                <mesh geometry={G.brazo} position={[0, -0.28, 0]} castShadow>
                  <Mat c={p.camisa} r={0.7} />
                </mesh>
                <mesh geometry={G.esfera} position={[0, -0.56, 0]} scale={0.055}>
                  <Mat c={p.piel} />
                </mesh>
                {lado > 0 && accMano && (
                  <group position={[0, -0.6, 0.02]}>
                    <AccesorioMano a={accMano} />
                  </group>
                )}
              </group>
            ))}
            <group ref={guitarra} position={[0.02, 1.02, 0.2]} rotation={[0.15, 0, -1.0]} visible={false}>
              <Guitarra />
            </group>
            <mesh geometry={G.cil} position={[0, 1.47, 0]} scale={[0.05, 0.1, 0.05]}>
              <Mat c={p.piel} />
            </mesh>
            <group ref={cabeza} position={[0, 1.6, 0]}>
              <mesh geometry={G.esfera} scale={0.13} castShadow>
                <Mat c={p.piel} r={0.55} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.esferaB} position={[s * 0.045, 0.015, 0.118]} scale={0.017}>
                  <meshStandardMaterial color="#0b0f14" roughness={0.3} />
                </mesh>
              ))}
              <mesh geometry={G.caja} position={[0, -0.056, 0.12]} scale={[0.05, 0.008, 0.01]}>
                <meshStandardMaterial color="#7c2d12" />
              </mesh>
              <mesh geometry={G.pelo} rotation={[-0.42, 0, 0]} position={[0, 0.012, -0.01]} castShadow>
                <Mat c={peloCol} r={0.85} />
              </mesh>
              {p.peinado === "largo" && <Caja p={[0, -0.16, -0.095]} s={[0.27, 0.34, 0.06]} c={peloCol} sombra={false} />}
              {p.peinado === "cola" && (
                <mesh geometry={G.esfera} position={[0, -0.02, -0.17]} scale={[0.06, 0.12, 0.06]} rotation={[0.4, 0, 0]}>
                  <Mat c={peloCol} r={0.85} />
                </mesh>
              )}
              {p.peinado === "chongo" && (
                <mesh geometry={G.esfera} position={[0, 0.1, -0.12]} scale={0.075}>
                  <Mat c={peloCol} r={0.85} />
                </mesh>
              )}
              {p.lentes && (
                <group position={[0, 0.015, 0.134]}>
                  {[-1, 1].map((s) => (
                    <mesh key={s} geometry={G.aro} position={[s * 0.047, 0, 0]}>
                      <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} />
                    </mesh>
                  ))}
                </group>
              )}
              {p.gorra && (
                <>
                  <mesh geometry={G.gorra} position={[0, 0.045, -0.005]} rotation={[-0.2, 0, 0]} castShadow>
                    <Mat c={p.gorra} r={0.7} />
                  </mesh>
                  <Caja p={[0, 0.05, 0.16]} s={[0.17, 0.014, 0.13]} c={p.gorra} sombra={false} />
                </>
              )}
            </group>
          </group>
        </group>
      </group>
      {anillo && (
        <mesh geometry={G.anillo} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={anillo} transparent opacity={0.95} toneMapped={false} />
        </mesh>
      )}
      {onClick && (
        <mesh
          position={[0, 0.95, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <cylinderGeometry args={[0.42, 0.42, 1.9, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {etiqueta && (
        <Etiqueta pos={[0, 2.05, 0]} df={9} fs={12} col={etiquetaCol}>
          {etiqueta}
        </Etiqueta>
      )}
      {children}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Efectos
 * ════════════════════════════════════════════════════════════════════════ */

const ARO: Pt = [2.3, 2.45, 3.4];
const MANOS_TIRO: Pt = [-0.62, 2.0, 3.4];

function Balon({ activo, exito, desde = MANOS_TIRO }: { activo: boolean; exito: boolean; desde?: Pt }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    m.visible = activo;
    if (!activo) return;
    const ciclo = (clock.elapsedTime % 2.4) / 2.4;
    const sube = 0.16;
    const vuelo = 0.44;
    if (ciclo < sube) {
      m.position.set(desde[0] - 0.05, desde[1] - 0.25 + (ciclo / sube) * 0.4, desde[2]);
      return;
    }
    const u = Math.min(1, (ciclo - sube) / (vuelo - sube));
    if (ciclo < vuelo) {
      const fin: Pt = exito ? [ARO[0], ARO[1] + 0.05, ARO[2]] : [ARO[0] - 0.24, ARO[1] + 0.05, ARO[2]];
      m.position.set(desde[0] + (fin[0] - desde[0]) * u, desde[1] + 0.15 + (fin[1] - desde[1] - 0.15) * u + 1.5 * 4 * u * (1 - u), desde[2] + (fin[2] - desde[2]) * u);
      m.rotation.z -= 0.2;
      return;
    }
    const v = Math.min(1, (ciclo - vuelo) / 0.3);
    if (exito) {
      m.position.set(ARO[0], ARO[1] + 0.05 - (ARO[1] - 0.12) * v * v, ARO[2]);
    } else {
      const x0 = ARO[0] - 0.24;
      m.position.set(x0 - 1.3 * v, ARO[1] + 0.05 + 0.6 * 4 * v * (1 - v) - (ARO[1] - 0.12) * v, ARO[2] + 0.7 * v);
    }
    m.rotation.z -= 0.12;
  });
  return (
    <mesh ref={ref} geometry={G.esfera} scale={0.12} visible={false} castShadow>
      <Mat c="#ea580c" r={0.7} />
    </mesh>
  );
}

/** Partículas deterministas: salpicaduras, notas musicales o humo. */
function Particulas({ tipo, origen, activo, col }: { tipo: "salpica" | "notas" | "humo"; origen: Pt; activo: boolean; col: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const N = 18;
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    m.visible = activo;
    if (!activo) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const p = (t * (tipo === "salpica" ? 1.3 : 0.45) + i / N) % 1;
      if (tipo === "salpica") {
        const a = i * 2.4;
        obj.position.set(origen[0] + Math.cos(a) * (0.2 + p * 0.5), origen[1] + 1.2 * 4 * p * (1 - p) * (0.5 + (i % 3) * 0.25), origen[2] + Math.sin(a) * (0.2 + p * 0.5));
        obj.scale.setScalar(0.05 * (1 - p) + 0.01);
      } else if (tipo === "notas") {
        const lado = i % 2 === 0 ? 1 : -1;
        obj.position.set(origen[0] + lado * (0.15 + p * 0.5) + Math.sin(t * 2 + i) * 0.08, origen[1] + p * 1.4, origen[2] + Math.cos(i * 1.7) * 0.2);
        obj.scale.setScalar(p < 0.85 ? 1 : (1 - p) * 6.6);
      } else {
        obj.position.set(origen[0] + Math.sin(i * 1.9 + t) * 0.15 * p, origen[1] + p * 1.3, origen[2] + Math.cos(i * 2.3) * 0.12 * p);
        obj.scale.setScalar((0.08 + p * 0.22) * (1 - p * 0.4));
      }
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  const geo = tipo === "notas" ? G.nota : G.esferaB;
  return (
    <instancedMesh ref={ref} args={[geo, undefined, N]} frustumCulled={false} visible={false}>
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={tipo === "humo" ? 0.05 : 0.6} transparent opacity={tipo === "humo" ? 0.55 : 0.95} depthWrite={false} toneMapped={tipo === "humo"} />
    </instancedMesh>
  );
}

function Quesadilla({ activo, exito }: { activo: boolean; exito: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const ciclo = (clock.elapsedTime % 1.8) / 1.8;
    if (activo && exito && ciclo < 0.45) {
      const u = ciclo / 0.45;
      m.position.y = 1.04 + 4 * u * (1 - u) * 0.5;
      m.rotation.x = u * Math.PI;
    } else {
      m.position.y = 1.04;
      m.rotation.x = 0;
    }
  });
  return (
    <group>
      <mesh geometry={G.cil} position={[-6.95, 0.99, 3.3]} scale={[0.26, 0.05, 0.26]} castShadow>
        <Mat c="#1f2937" m={0.6} r={0.35} />
      </mesh>
      <mesh geometry={G.cil} position={[-6.52, 1.0, 3.3]} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 0.36, 0.025]}>
        <Mat c="#111827" />
      </mesh>
      <mesh ref={ref} position={[-6.95, 1.04, 3.3]} scale={[0.2, 0.025, 0.2]} geometry={G.cil}>
        <Mat c={activo && !exito ? "#292524" : "#eab308"} r={0.8} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * El centro comunitario
 * ════════════════════════════════════════════════════════════════════════ */

function Arbol({ pos, s = 1 }: { pos: Pt; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <mesh geometry={G.cil} position={[0, 0.5, 0]} scale={[0.09, 1, 0.09]} castShadow>
        <Mat c="#6b4423" />
      </mesh>
      <mesh geometry={G.copa} position={[0, 1.35, 0]} scale={0.62} castShadow>
        <Mat c="#2f7d4a" r={0.9} />
      </mesh>
      <mesh geometry={G.copa} position={[0.25, 1.65, 0.1]} scale={0.4} castShadow>
        <Mat c="#3b9a5c" r={0.9} />
      </mesh>
    </group>
  );
}

function Estante({ pos, rotY = 0 }: { pos: Pt; rotY?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const libros = useMemo(() => {
    const out: { p: Pt; h: number; c: string }[] = [];
    const cols = ["#dc2626", "#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#be185d", "#f8fafc"];
    for (let fila = 0; fila < 3; fila++)
      for (let k = 0; k < 11; k++) {
        const h = 0.26 + ((k * 7 + fila * 3) % 5) * 0.025;
        out.push({ p: [-0.66 + k * 0.132, 0.36 + fila * 0.55 + h / 2, 0.02], h, c: cols[(k * 3 + fila) % cols.length]! });
      }
    return out;
  }, []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    libros.forEach((l, i) => {
      o.position.set(l.p[0], l.p[1], l.p[2]);
      o.scale.set(0.11, l.h, 0.24);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(l.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [libros]);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Caja p={[0, 0.95, -0.06]} s={[1.6, 1.9, 0.08]} c="#7c4a24" />
      {[0, 1, 2, 3].map((k) => (
        <Caja key={k} p={[0, 0.2 + k * 0.55, 0.06]} s={[1.6, 0.05, 0.36]} c="#8b5a2b" sombra={false} />
      ))}
      {[-1, 1].map((s) => (
        <Caja key={s} p={[s * 0.78, 0.95, 0.06]} s={[0.05, 1.9, 0.36]} c="#8b5a2b" sombra={false} />
      ))}
      <instancedMesh ref={ref} args={[G.caja, undefined, libros.length]} castShadow>
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

function Monitor({ pos, rotY = 0, color = "#1e3a8a" }: { pos: Pt; rotY?: number; color?: string }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Caja p={[0, 0.34, 0]} s={[0.62, 0.4, 0.04]} c="#0f172a" />
      <mesh geometry={G.caja} position={[0, 0.34, 0.022]} scale={[0.56, 0.34, 0.005]}>
        <Mat c={color} e={color} ei={0.9} />
      </mesh>
      <Caja p={[0, 0.08, -0.02]} s={[0.06, 0.16, 0.04]} c="#334155" sombra={false} />
      <Caja p={[0, 0.005, 0]} s={[0.26, 0.02, 0.16]} c="#334155" sombra={false} />
      <Caja p={[0, 0.005, 0.28]} s={[0.46, 0.02, 0.15]} c="#1e293b" sombra={false} />
    </group>
  );
}

function PosteLetrero({ pos, col }: { pos: Pt; col: string }) {
  return (
    <group position={pos}>
      <mesh geometry={G.cil} position={[0, 0.55, 0]} scale={[0.04, 1.1, 0.04]} castShadow>
        <Mat c="#334155" m={0.5} r={0.4} />
      </mesh>
      <Caja p={[0, 1.2, 0]} s={[0.9, 0.5, 0.05]} c="#fffdf5" />
      <Caja p={[0, 1.47, 0]} s={[0.9, 0.06, 0.06]} c={col} sombra={false} />
    </group>
  );
}

function Reloj({ pos, min }: { pos: Pt; min: number }) {
  const h = ((min / 60) % 12) / 12;
  const m = (min % 60) / 60;
  return (
    <group position={pos}>
      <mesh geometry={G.cil} rotation={[Math.PI / 2, 0, 0]} scale={[0.26, 0.05, 0.26]} castShadow>
        <Mat c="#f8fafc" />
      </mesh>
      <mesh geometry={G.aroCanasta} scale={1.15}>
        <Mat c="#1f2937" m={0.5} />
      </mesh>
      <group position={[0, 0, 0.03]} rotation={[0, 0, -h * Math.PI * 2]}>
        <Caja p={[0, 0.06, 0]} s={[0.03, 0.13, 0.01]} c="#0f172a" sombra={false} />
      </group>
      <group position={[0, 0, 0.035]} rotation={[0, 0, -m * Math.PI * 2]}>
        <Caja p={[0, 0.09, 0]} s={[0.02, 0.19, 0.01]} c="#2563eb" sombra={false} />
      </group>
    </group>
  );
}

const PISO: Record<EspacioId, string> = { library: "#a97a52", computer: "#9aa6b8", music: "#5b4a8a", kitchen: "#e7e2d6", court: "#c8743c", pool: "#e6dcc4" };
const MURO: Record<EspacioId, string> = { library: "#e9dcc2", computer: "#dbe7f3", music: "#efd9e6", kitchen: "#f3e1cf", court: "#e4eadf", pool: "#d9eef2" };

function Centro({ relojMin, cerrada, focoLugar, destacados, sinNombre }: { sinNombre: LugarId | null; relojMin: number; cerrada: boolean; focoLugar: LugarId | null; destacados: LugarId[] }) {
  const agua = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const a = agua.current;
    if (a) (a.material as THREE.MeshStandardMaterial).emissiveIntensity = cerrada ? 0.02 : 0.18 + Math.sin(clock.elapsedTime * 1.6) * 0.05;
  });
  return (
    <group>
      {/* Base y pasillo */}
      <mesh position={[0, -0.16, -0.1]} receiveShadow>
        <boxGeometry args={[21.8, 0.3, 14.6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.005, CORR_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[21.6, 2.4]} />
        <meshStandardMaterial color="#d8c7a3" roughness={0.9} />
      </mesh>
      {Array.from({ length: 18 }, (_, k) => (
        <mesh key={k} position={[-10.2 + k * 1.2, 0.008, CORR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 2.4]} />
          <meshStandardMaterial color="#b9a680" />
        </mesh>
      ))}
      {ESPACIOS.map((e) => {
        const [x, z] = CEL[e];
        return (
          <mesh key={e} position={[x, 0.02, z]} receiveShadow>
            <boxGeometry args={[W - 0.12, 0.04, D - 0.1]} />
            <meshStandardMaterial color={PISO[e]} roughness={e === "pool" ? 0.6 : 0.85} />
          </mesh>
        );
      })}
      {/* Muros de la fila de atrás */}
      {(["library", "computer", "music"] as EspacioId[]).map((e) => {
        const [x] = CEL[e];
        return <Caja key={e} p={[x, 1.35, -6.0]} s={[W, 2.7, 0.2]} c={MURO[e]} r={0.95} />;
      })}
      {[-10.0, -3.3, 3.3, 10.0].map((x) => (
        <Caja key={x} p={[x, 0.5, -3.6]} s={[0.16, 1.0, D]} c="#cbd5e1" r={0.9} />
      ))}
      <Caja p={[-10.0, 0.45, 3.4]} s={[0.16, 0.9, D]} c="#e2d3bd" r={0.9} />
      <Caja p={[-6.8, 0.25, 5.75]} s={[W, 0.5, 0.14]} c="#e2d3bd" r={0.9} />

      {/* Nombres de los espacios */}
      {ESPACIOS.map((e) => {
        const [x, z] = CEL[e];
        const d = LUGAR_DEF[e];
        const atras = z < 0;
        const on = focoLugar === e || destacados.includes(e);
        if ((focoLugar && !on) || sinNombre === e) return null;
        return (
          <Etiqueta key={e} pos={atras ? [x, 3.0, -6.0] : [x, 0.55, 5.95]} df={focoLugar ? 6 : 12} fs={13} col={on ? d.color : `${d.color}88`}>
            <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
            {d.en}
          </Etiqueta>
        );
      })}

      {/* ── Biblioteca ── */}
      <Estante pos={[-8.7, 0, -5.75]} />
      <Estante pos={[-7.0, 0, -5.75]} />
      <Caja p={[-4.4, 0.45, -3.4]} s={[0.6, 0.9, 1.5]} c="#7c4a24" />
      <Caja p={[-4.4, 0.92, -3.4]} s={[0.7, 0.05, 1.6]} c="#a16207" sombra={false} />
      <Caja p={[-4.4, 1.05, -3.0]} s={[0.2, 0.16, 0.26]} c="#2563eb" sombra={false} />
      <mesh position={[-7.4, 0.045, -2.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.95} />
      </mesh>
      <mesh geometry={G.cil} position={[-8.6, 0.38, -2.6]} scale={[0.5, 0.05, 0.5]} castShadow>
        <Mat c="#a16207" />
      </mesh>
      <mesh geometry={G.cil} position={[-8.6, 0.19, -2.6]} scale={[0.06, 0.38, 0.06]}>
        <Mat c="#78350f" />
      </mesh>

      {/* ── Laboratorio de cómputo ── */}
      <Caja p={[0, 0.72, -5.2]} s={[5.4, 0.06, 0.8]} c="#e5e7eb" r={0.5} />
      {[-2.5, 2.5].map((x) => (
        <Caja key={x} p={[x, 0.36, -5.2]} s={[0.06, 0.72, 0.7]} c="#94a3b8" sombra={false} />
      ))}
      {[-1.6, 0, 1.6].map((x, k) => (
        <Monitor key={x} pos={[x, 0.75, -5.35]} color={k === 2 ? "#16a34a" : "#1e3a8a"} />
      ))}
      <Caja p={[2.3, 0.9, -5.25]} s={[0.4, 0.3, 0.36]} c="#475569" />

      {/* ── Salón de música ── */}
      <Caja p={[5.0, 0.55, -5.4]} s={[1.9, 1.1, 0.6]} c="#111827" r={0.3} />
      <Caja p={[5.0, 0.9, -5.02]} s={[1.8, 0.05, 0.22]} c="#f8fafc" sombra={false} />
      <mesh geometry={G.cil} position={[8.9, 0.32, -5.0]} scale={[0.36, 0.5, 0.36]} castShadow>
        <Mat c="#dc2626" r={0.4} />
      </mesh>
      <mesh geometry={G.cil} position={[8.9, 0.58, -5.0]} scale={[0.37, 0.02, 0.37]}>
        <Mat c="#f1f5f9" />
      </mesh>
      <group position={[8.1, 0.55, -5.5]} rotation={[-0.2, 0, 0]}>
        <Guitarra />
      </group>
      {[5.6, 7.9].map((x) => (
        <group key={x} position={[x, 0, -3.4]}>
          <mesh geometry={G.cil} position={[0, 0.55, 0]} scale={[0.02, 1.1, 0.02]}>
            <Mat c="#1f2937" m={0.6} />
          </mesh>
          <Caja p={[0, 1.12, 0.05]} s={[0.46, 0.32, 0.03]} c="#1f2937" sombra={false} />
        </group>
      ))}

      {/* ── Cocina ── */}
      <Caja p={[-6.6, 0.46, 3.3]} s={[2.4, 0.92, 0.9]} c="#f1f5f9" r={0.5} />
      <Caja p={[-6.6, 0.94, 3.3]} s={[2.5, 0.05, 1.0]} c="#78716c" r={0.3} />
      <Caja p={[-9.6, 1.0, 1.9]} s={[0.7, 2.0, 0.7]} c="#e2e8f0" r={0.3} m={0.2} />
      <Caja p={[-9.55, 0.46, 3.8]} s={[0.7, 0.92, 2.4]} c="#f1f5f9" r={0.5} />
      <Caja p={[-9.5, 1.08, 3.3]} s={[0.4, 0.26, 0.5]} c="#334155" r={0.3} />
      <mesh geometry={G.cil} position={[-8.3, 0.4, 4.75]} scale={[0.6, 0.05, 0.6]} castShadow>
        <Mat c="#f59e0b" r={0.6} />
      </mesh>
      <mesh geometry={G.cil} position={[-8.3, 0.2, 4.75]} scale={[0.06, 0.4, 0.06]}>
        <Mat c="#78350f" />
      </mesh>

      {/* ── Cancha ── */}
      <mesh position={[0, 0.045, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.76, 40]} />
        <meshStandardMaterial color="#fff7ed" />
      </mesh>
      <mesh position={[0, 0.045, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 4.3]} />
        <meshStandardMaterial color="#fff7ed" />
      </mesh>
      <mesh position={[2.1, 0.045, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.6]} />
        <meshStandardMaterial color="#9a3412" />
      </mesh>
      <mesh geometry={G.cil} position={[3.05, 1.5, 3.4]} scale={[0.07, 3.0, 0.07]} castShadow>
        <Mat c="#334155" m={0.6} r={0.3} />
      </mesh>
      <Caja p={[2.65, 2.75, 3.4]} s={[0.06, 0.95, 1.35]} c="#f8fafc" r={0.2} />
      <Caja p={[2.62, 2.7, 3.4]} s={[0.07, 0.36, 0.5]} c="#ef4444" sombra={false} />
      <mesh geometry={G.aroCanasta} position={ARO} rotation={[Math.PI / 2, 0, 0]}>
        <Mat c="#ea580c" m={0.6} r={0.3} />
      </mesh>
      <mesh geometry={G.red} position={[ARO[0], ARO[1] - 0.2, ARO[2]]}>
        <meshStandardMaterial color="#f8fafc" wireframe transparent opacity={0.8} />
      </mesh>

      {/* ── Alberca ── */}
      {[
        [7.2, 0.25, 2.0, 5.0, 0.18],
        [7.2, 0.25, 5.2, 5.0, 0.18],
      ].map(([x, y, z, w, d], k) => (
        <Caja key={`rz${k}`} p={[x!, y!, z!]} s={[w!, 0.5, d!]} c="#f1f5f9" r={0.5} />
      ))}
      {[4.7, 9.7].map((x) => (
        <Caja key={`rx${x}`} p={[x, 0.25, 3.6]} s={[0.18, 0.5, 3.38]} c="#f1f5f9" r={0.5} />
      ))}
      <mesh ref={agua} position={[7.2, 0.2, 3.6]} receiveShadow>
        <boxGeometry args={[4.82, 0.44, 3.02]} />
        <meshStandardMaterial color={cerrada ? "#1e3a5f" : "#38bdf8"} emissive="#0ea5e9" emissiveIntensity={0.18} roughness={0.15} metalness={0.1} transparent opacity={0.82} />
      </mesh>
      {[-0.18, 0.18].map((dz) => (
        <mesh key={dz} geometry={G.cil} position={[4.85, 0.6, 3.0 + dz]} scale={[0.025, 0.7, 0.025]}>
          <Mat c="#cbd5e1" m={0.9} r={0.2} />
        </mesh>
      ))}
      {cerrada && <Caja p={[7.2, 0.62, 2.0]} s={[5.0, 0.04, 0.04]} c="#dc2626" sombra={false} />}
      <group position={[9.6, 0, 1.45]}>
        {[-0.25, 0.25].map((dx) => (
          <mesh key={dx} geometry={G.cil} position={[dx, 0.7, 0]} scale={[0.03, 1.4, 0.03]}>
            <Mat c="#f8fafc" />
          </mesh>
        ))}
        <Caja p={[0, 1.4, 0]} s={[0.6, 0.06, 0.5]} c="#dc2626" />
      </group>

      {/* ── Postes de letreros y reloj ── */}
      <PosteLetrero pos={[-4.4, 0, 1.55]} col={LUGAR_DEF.kitchen.color} />
      <PosteLetrero pos={[-2.6, 0, 1.55]} col={LUGAR_DEF.court.color} />
      <PosteLetrero pos={[4.1, 0, 1.55]} col={LUGAR_DEF.pool.color} />
      <Reloj pos={[4.1, 2.05, 1.6]} min={relojMin} />
      {(!focoLugar || focoLugar === "pool") && (
      <Etiqueta pos={[4.1, 2.75, 1.6]} df={focoLugar ? 7 : 9} fs={11} col={albercaAbierta(relojMin) ? `${OK}aa` : `${NO}aa`}>
        <i className="fa-solid fa-clock" style={{ color: albercaAbierta(relojMin) ? OK : NO }} />
        {horaCorta(relojMin)} · {albercaAbierta(relojMin) ? "open" : "closed"}
      </Etiqueta>
      )}
      <PosteLetrero pos={[-9.75, 0, -1.0]} col={LUGAR_DEF.patio.color} />

      {/* Arco de entrada */}
      <group position={[-10.55, 0, CORR_Z]}>
        {[-1.15, 1.15].map((dz) => (
          <Caja key={dz} p={[0, 1.3, dz]} s={[0.22, 2.6, 0.22]} c="#9a3412" />
        ))}
        <Caja p={[0, 2.7, 0]} s={[0.3, 0.3, 2.6]} c="#c2410c" />
      </group>
      {!focoLugar && (
        <Etiqueta pos={[-9.2, 3.15, CORR_Z]} df={12} fs={13} col="#fdba74aa">
          <i className="fa-solid fa-people-roof" style={{ color: "#fdba74" }} />
          Centro Comunitario Los Fresnos
        </Etiqueta>
      )}

      <Arbol pos={[-10.6, 0, -6.6]} s={1.1} />
      <Arbol pos={[10.6, 0, -6.6]} s={1.2} />
      <Arbol pos={[10.5, 0, 6.3]} />
      <Arbol pos={[-10.6, 0, 6.3]} s={0.9} />
    </group>
  );
}

/** Posiciones de los letreros en Html. */
const POS_LETRERO: Record<LugarId, Pt> = {
  library: [-7.85, 2.4, -5.8],
  computer: [-1.0, 2.05, -5.8],
  music: [8.4, 1.95, -5.8],
  kitchen: [-4.4, 1.75, 1.6],
  court: [-2.6, 1.75, 1.6],
  pool: [4.1, 1.75, 1.6],
  patio: [-9.75, 1.75, -0.95],
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. CAN YOU…?
 * ════════════════════════════════════════════════════════════════════════ */

interface Puesto {
  pos: Pt;
  rot: number;
  si: Pose;
  no: Pose;
}

const PUESTO_HAB: Record<HabilidadId, Puesto> = {
  swim: { pos: [7.2, 0, 3.6], rot: Math.PI / 2, si: "nadar", no: "chapotear" },
  basketball: { pos: [-0.9, 0, 3.4], rot: Math.PI / 2, si: "tirar", no: "tirar" },
  cook: { pos: [-7.5, 0, 2.62], rot: 0.35, si: "cocinar", no: "cocinar" },
  nahuatl: { pos: [-8.0, 0, -3.0], rot: Math.PI / 2, si: "hablar", no: "encoger" },
  guitar: { pos: [6.8, 0, -3.1], rot: 0, si: "guitarra", no: "guitarraMal" },
  video: { pos: [1.2, 0, -4.55], rot: mira([1.2, -4.55], [1.6, -5.35]), si: "teclear", no: "encoger" },
};

const LINEA = (k: number): Pt => [-6.25 + k * 2.5, 0, CORR_Z];

function VistaClub({ seleccion, intento, burbuja, insignias, misionIdx, onElegir, modoColor }: { seleccion: string | null; intento: IntentoClub | null; burbuja: string | null; insignias: Record<string, string[]>; misionIdx: number; onElegir: (id: string) => void; modoColor: string }) {
  const lupe = personaPorId("lupe");
  const salas = personaPorId("salas");
  const h = intento && intento.persona === seleccion ? intento.habilidad : null;
  const quien = intento ? personaPorId(intento.persona) : null;
  const puede = !!(quien && h && quien.puede?.[h]);
  const m = MISIONES[misionIdx] ?? MISIONES[0]!;
  const enfoque = !!intento && intento.persona === seleccion;
  return (
    <group>
      {CANDIDATOS.map((id, k) => {
        const p = personaPorId(id);
        const intentando = enfoque && intento?.persona === id;
        const puesto = intentando && h ? PUESTO_HAB[h] : null;
        const sel = seleccion === id;
        return (
          <PersonaFig
            key={id}
            p={p}
            destino={puesto ? puesto.pos : LINEA(k)}
            rotY={puesto ? puesto.rot : 0}
            pose={puesto ? (puede ? puesto.si : puesto.no) : sel ? "saluda" : "parado"}
            accesorio={puesto && h === "cook" ? "espatula" : null}
            fase={k * 0.8}
            onClick={() => onElegir(id)}
            anillo={sel ? modoColor : null}
            etiquetaCol={sel ? modoColor : "rgba(255,255,255,0.28)"}
            etiqueta={
              enfoque && !sel ? undefined : (
              <>
                {p.nombre}
                {(insignias[id] ?? []).map((c, i) => (
                  <i key={i} className="fa-solid fa-star" style={{ color: c, fontSize: 11 }} />
                ))}
              </>
              )
            }
          >
            {intentando && burbuja && <Burbuja pos={[0, 2.45, 0]} texto={burbuja} col={puede ? OK : "#fb923c"} df={8} />}
          </PersonaFig>
        );
      })}
      {/* Doña Lupe escucha en la biblioteca; la entrenadora cuida la alberca. */}
      <PersonaFig p={lupe} destino={[-6.55, 0, -3.0]} rotY={-Math.PI / 2} pose="parado">
        {h === "nahuatl" && intento && (
          <Etiqueta pos={[0, 2.25, 0]} df={8} fs={13} col={puede ? `${OK}cc` : "#fb923ccc"}>
            <i className={`fa-solid ${puede ? "fa-heart" : "fa-circle-question"}`} style={{ color: puede ? OK : "#fb923c" }} />
            {puede ? "Niltze! (hola)" : "…?"}
          </Etiqueta>
        )}
      </PersonaFig>
      <PersonaFig p={salas} destino={[8.9, 0, 1.55]} rotY={0} pose="parado" />
      <Balon activo={h === "basketball"} exito={puede} />
      <Particulas tipo="salpica" origen={[PUESTO_HAB.swim.pos[0], 0.45, PUESTO_HAB.swim.pos[2]]} activo={h === "swim" && !puede} col="#e0f2fe" />
      <Particulas tipo="notas" origen={[7.0, 1.5, -2.9]} activo={h === "guitar"} col={puede ? "#fde047" : "#94a3b8"} />
      <Particulas tipo="humo" origen={[-6.95, 1.1, 3.3]} activo={h === "cook" && !puede} col="#6b7280" />
      <Quesadilla activo={h === "cook"} exito={puede} />
      {h === "video" && (
        <Etiqueta pos={[2.3, 1.3, -4.95]} df={7} fs={12} col={puede ? `${OK}cc` : "#fb923ccc"}>
          <i className={`fa-solid ${puede ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ color: puede ? OK : "#fb923c" }} />
          {puede ? "Export 100%" : "Error"}
        </Etiqueta>
      )}
      {/* Tablero del club */}
      <group position={[9.75, 0, CORR_Z]}>
        {[-0.7, 0.7].map((dz) => (
          <mesh key={dz} geometry={G.cil} position={[0, 0.8, dz]} scale={[0.04, 1.6, 0.04]}>
            <Mat c="#334155" />
          </mesh>
        ))}
        <Caja p={[0, 1.45, 0]} s={[0.08, 0.9, 1.6]} c="#92400e" />
      </group>
      {!enfoque && (
        <Etiqueta pos={[9.75, 2.3, CORR_Z]} df={10} fs={12} col={`${m.color}cc`}>
          <i className={`fa-solid ${m.icono}`} style={{ color: m.color }} />
          {m.club}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. MAY I…? CAN I…?
 * ════════════════════════════════════════════════════════════════════════ */

interface Guion {
  npc: Pt;
  npcRot?: number;
  tu: Pt;
  accTu: Accesorio;
  accion: { pos: Pt; rot: number; pose: Pose; acc: Accesorio };
}

const GUIONES: Record<string, Guion> = {
  book: { npc: [-3.8, 0, -3.4], tu: [-5.5, 0, -2.9], accTu: null, accion: { pos: [-8.2, 0, -2.2], rot: 0.5, pose: "leer", acc: "libro" } },
  sandwich: { npc: [-3.8, 0, -3.4], tu: [-5.5, 0, -2.9], accTu: "torta", accion: { pos: [-8.3, 0, 4.05], rot: 0, pose: "comer", acc: "torta" } },
  computer: { npc: [-1.8, 0, -3.1], tu: [-0.5, 0, -2.5], accTu: null, accion: { pos: [1.2, 0, -4.55], rot: mira([1.2, -4.55], [1.6, -5.35]), pose: "teclear", acc: null } },
  "ball-pool": { npc: [4.15, 0, 2.55], tu: [4.15, 0, 4.1], accTu: null, accion: { pos: [-0.9, 0, 3.4], rot: Math.PI / 2, pose: "tirar", acc: null } },
  "ball-diego": { npc: [-1.9, 0, 2.3], tu: [-0.9, 0, 3.4], accTu: null, accion: { pos: [-0.9, 0, 3.4], rot: Math.PI / 2, pose: "tirar", acc: null } },
  "guitar-kitchen": { npc: [-6.6, 0, 2.45], tu: [-8.1, 0, 3.8], accTu: "guitarra", accion: { pos: [6.8, 0, -3.1], rot: 0, pose: "guitarra", acc: "guitarra" } },
};

function Medidor({ pos, registro }: { pos: Pt; registro: Registro }) {
  const d = REGISTRO_DEF[registro];
  return (
    <Html position={pos} center distanceFactor={8} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ padding: "6px 10px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
        <div style={{ marginBottom: 4, letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)" }}>CORTESÍA · {d.es.toUpperCase()}</div>
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3].map((k) => (
            <div key={k} style={{ width: 30, height: 8, borderRadius: 3, background: k <= d.nivel ? ["#fbbf24", "#38bdf8", "#34d399"][d.nivel - 1] : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
      </div>
    </Html>
  );
}

function VistaPermiso({ sitIdx, pasoP, registro, peticionTxt }: { sitIdx: number; pasoP: number; registro: Registro | null; peticionTxt: string | null }) {
  const s = SITUACIONES[sitIdx] ?? SITUACIONES[0]!;
  const g = GUIONES[s.id]!;
  const npc = personaPorId(s.quien);
  const tu = personaPorId("tu");
  const hecho = pasoP >= 3;
  const npcRot = g.npcRot ?? mira([g.npc[0], g.npc[2]], [g.tu[0], g.tu[2]]);
  const tuRot = mira([g.tu[0], g.tu[2]], [g.npc[0], g.npc[2]]);
  const tiro = hecho && g.accion.pose === "tirar";
  const npcIzq = g.npc[0] > g.tu[0];
  return (
    <group>
      <PersonaFig key={`npc-${s.id}`} p={npc} destino={g.npc} rotY={npcRot} pose={pasoP >= 1 && !hecho ? "hablar" : "parado"} etiqueta={<>{npc.nombre}{npc.rol ? <span style={{ fontWeight: 600, opacity: 0.7 }}> · {npc.rol.en}</span> : <span style={{ fontWeight: 600, opacity: 0.7 }}> · friend</span>}</>} etiquetaCol={npc.adulto ? "#c4b5fdaa" : "#fde68aaa"}>
        {pasoP >= 1 && !hecho && <Burbuja pos={[0, 2.45, 0]} texto={s.respuesta} col={s.permitido ? OK : "#fb923c"} df={8} lado={npcIzq ? "izq" : "der"} />}
        {pasoP >= 1 && registro && !hecho && <Medidor pos={[0, 0.35, 0.6]} registro={registro} />}
      </PersonaFig>
      <PersonaFig
        key={`tu-${s.id}`}
        p={tu}
        destino={hecho ? g.accion.pos : g.tu}
        rotY={hecho ? g.accion.rot : tuRot}
        pose={hecho ? g.accion.pose : "parado"}
        accesorio={hecho ? g.accion.acc : g.accTu}
        etiqueta={<>You</>}
        etiquetaCol="#facc15cc"
        anillo={hecho ? OK : "#facc15"}
      >
        {peticionTxt && pasoP === 0 && <Burbuja pos={[0, 2.45, 0]} texto={peticionTxt} col="#facc15" df={8} lado={npcIzq ? "der" : "izq"} />}
      </PersonaFig>
      <Balon activo={tiro} exito />
      <Particulas tipo="notas" origen={[7.0, 1.5, -2.9]} activo={hecho && g.accion.pose === "guitarra"} col="#fde047" />
      {hecho && s.id === "computer" && (
        <Etiqueta pos={[2.3, 1.3, -4.95]} df={7} fs={12} col={`${OK}cc`}>
          <i className="fa-solid fa-circle-check" style={{ color: OK }} />
          Computer 3 · homework
        </Etiqueta>
      )}
      {s.id === "computer" &&
        !hecho &&
        [-1.6, 0, 1.6].map((x, k) => (
          <Etiqueta key={x} pos={[x, 1.55, -5.3]} df={8} fs={11} col={k === 2 ? `${OK}cc` : undefined}>
            {k + 1}
          </Etiqueta>
        ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. READ THE SIGNS
 * ════════════════════════════════════════════════════════════════════════ */

const ESCENA_CASO: Record<string, { pos: Pt; rot: number; antes: Pose; acc: Accesorio; si?: { pos: Pt; rot: number; pose: Pose; acc: Accesorio }; bici?: boolean; icono: string }> = {
  wifi: { pos: [-7.3, 0, 0.55], rot: -0.9, antes: "celular", acc: "celular", si: { pos: [-7.3, 0, 0.55], rot: -0.9, pose: "celular", acc: "celular" }, icono: "fa-wifi" },
  chips: { pos: [-6.6, 0, -2.7], rot: 0, antes: "parado", acc: "papitas", icono: "fa-cookie-bite" },
  soda: { pos: [-0.6, 0, -3.0], rot: 0.2, antes: "parado", acc: "refresco", icono: "fa-bottle-water" },
  guitar: { pos: [7.9, 0, -4.4], rot: -0.3, antes: "parado", acc: null, si: { pos: [6.8, 0, -3.1], rot: 0, pose: "guitarra", acc: "guitarra" }, icono: "fa-guitar" },
  bike: { pos: [-0.6, 0, 3.2], rot: 0.3, antes: "bici", acc: null, bici: true, icono: "fa-bicycle" },
  swim5: { pos: [4.15, 0, 3.6], rot: Math.PI / 2, antes: "parado", acc: null, si: { pos: [7.2, 0, 3.6], rot: Math.PI / 2, pose: "nadar", acc: null }, icono: "fa-person-swimming" },
  swim7: { pos: [4.15, 0, 3.6], rot: Math.PI / 2, antes: "parado", acc: null, icono: "fa-person-swimming" },
  lunch: { pos: [-8.3, 0, 4.05], rot: 0, antes: "parado", acc: "almuerzo", si: { pos: [-8.3, 0, 4.05], rot: 0, pose: "comer", acc: "torta" }, icono: "fa-bowl-food" },
};

function VistaLetreros({ casoIdx, estado, modoColor }: { casoIdx: number; estado: "leer" | "decidido"; modoColor: string }) {
  const c = CASOS[casoIdx] ?? CASOS[0]!;
  const e = ESCENA_CASO[c.id]!;
  const p = personaPorId(c.quien);
  const decidido = estado === "decidido";
  const hace = decidido && c.puede && e.si;
  const col = decidido ? (c.puede ? OK : NO) : modoColor;
  return (
    <group>
      <PersonaFig
        key={c.id}
        p={p}
        destino={hace ? e.si!.pos : e.pos}
        rotY={hace ? e.si!.rot : e.rot}
        pose={hace ? e.si!.pose : decidido && !c.puede ? "no" : e.antes}
        accesorio={hace ? e.si!.acc : decidido && !c.puede ? null : e.acc}
        conBici={!!e.bici}
        anillo={col}
        etiquetaCol={`${col}cc`}
        etiqueta={
          <>
            {p.nombre}
            {decidido ? <i className={`fa-solid ${c.puede ? "fa-circle-check" : "fa-ban"}`} style={{ color: col }} /> : <i className={`fa-solid ${e.icono}`} style={{ color: modoColor }} />}
            {decidido ? (c.puede ? "can" : "can't") : "?"}
          </>
        }
      />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Cámara guiada y escena
 * ════════════════════════════════════════════════════════════════════════ */

function CamaraGuiada({ pos, target, clave }: { pos: Pt; target: Pt; clave: string }) {
  const est = useRef<{ clave: string; t: number } | null>(null);
  useFrame((state, dt) => {
    const { camera } = state;
    const controls = state.controls as unknown as { target?: THREE.Vector3; update?: () => void } | null;
    if (!est.current || est.current.clave !== clave) est.current = { clave, t: 0 };
    const d = est.current;
    if (d.t > 2.4) return;
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

export default function HabilidadesPermisosInglesScene(p: HabilidadesSceneProps) {
  const { vista, modoColor, resetNonce } = p;

  let focoLugar: LugarId | null = null;
  let clave = `${vista}-general`;
  const destacados: LugarId[] = [];
  let relojMin = 17 * 60;
  let letrero: { lugar: LugarId; resalta: string | null } | null = null;

  if (vista === "club") {
    if (p.intento && p.intento.persona === p.seleccion) {
      focoLugar = HABILIDAD_DEF[p.intento.habilidad].espacio;
      clave = `club-${p.intento.clave}`;
    } else clave = `club-general-${p.seleccion ?? ""}`;
  } else if (vista === "permiso") {
    const s = SITUACIONES[p.sitIdx] ?? SITUACIONES[0]!;
    focoLugar = p.pasoP >= 3 ? s.destino : s.lugar;
    clave = `permiso-${p.sitIdx}-${p.pasoP >= 3 ? "hecho" : "pide"}`;
    letrero = { lugar: p.pasoP >= 3 ? s.destino : s.lugar, resalta: null };
    destacados.push(s.lugar, s.destino);
  } else {
    const c = CASOS[p.casoIdx] ?? CASOS[0]!;
    focoLugar = c.lugar;
    clave = `letreros-${p.casoIdx}`;
    letrero = { lugar: c.lugar, resalta: p.estadoCaso === "decidido" ? c.linea : null };
    if (c.hora) relojMin = c.hora;
  }
  const cam = focoLugar ? foco(focoLugar) : GENERAL;
  const cerrada = !albercaAbierta(relojMin);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: GENERAL.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0a1426"]} />
      <fog attach="fog" args={["#0a1426", 30, 60]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#dbeafe", "#3f3a2f", 0.4]} />
      <directionalLight position={[-7, 13, 9]} intensity={1.25} color="#fff3d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} />
      <pointLight position={[0, 4, 1]} intensity={0.6} color={modoColor} distance={14} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 6, -8]} scale={[12, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.6} position={[-8, 2, 6]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      <Centro sinNombre={letrero?.lugar ?? null} relojMin={relojMin} cerrada={cerrada} focoLugar={focoLugar} destacados={destacados} />
      {letrero && <LetreroHtml pos={POS_LETRERO[letrero.lugar]} lugar={letrero.lugar} resalta={letrero.resalta} df={vista === "letreros" ? 6.5 : 7.5} />}

      {vista === "club" && <VistaClub seleccion={p.seleccion} intento={p.intento} burbuja={p.burbujaClub} insignias={p.insignias} misionIdx={p.misionIdx} onElegir={p.onElegir} modoColor={modoColor} />}
      {vista === "permiso" && <VistaPermiso sitIdx={p.sitIdx} pasoP={p.pasoP} registro={p.registro} peticionTxt={p.peticionTxt} />}
      {vista === "letreros" && <VistaLetreros casoIdx={p.casoIdx} estado={p.estadoCaso} modoColor={modoColor} />}

      <CamaraGuiada pos={cam.pos} target={cam.target} clave={clave} />
      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={30} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.1} minAzimuthAngle={-Math.PI * 0.45} maxAzimuthAngle={Math.PI * 0.45} />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.8} luminanceSmoothing={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}

