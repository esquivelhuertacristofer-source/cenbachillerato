"use client";

/**
 * Escena 3D del laboratorio "Plans and purposes: la colonia que planeamos"
 * (IN-IV-P05). Tres vistas:
 *
 *  - situaciones: un carrusel con ocho escenas de la colonia (nubes negras,
 *    las bolsas de Doña Lupe, la carta de Sofía, un salón caluroso, la cita
 *    con la dentista, una idea para vacaciones, un mural y una despedida en
 *    la central). Gira hasta la situación actual y, cuando el alumno elige la
 *    forma correcta del futuro, la escena muestra la consecuencia.
 *  - comunidad: la maqueta de una colonia con parque, huerto escolar,
 *    biblioteca, cancha y plaza. Una propuesta con «We could…» proyecta un
 *    holograma; un plan completo con be going to transforma el lugar.
 *  - metas: un camino con cinco fechas (next week → in five years); cada meta
 *    escrita correctamente levanta su bandera y el alumno sube hasta ella.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { SITUACIONES, PROYECTOS, HITOS, ESTRUCTURAS, mulberry32, type ZonaId } from "./planes-futuro-ingles-data";

export type VistaPlanes = "situaciones" | "comunidad" | "metas";

export interface PlanesSceneProps {
  vista: VistaPlanes;
  modoColor: string;
  resetNonce: number;
  /** Cambia en cada respuesta equivocada: hace parpadear la escena en naranja. */
  errorNonce: number;
  // Plan or decision?
  sitIdx: number;
  sitResueltas: string[];
  frase: string;
  /** valida = inglés correcto, pero no la forma más natural (ámbar). */
  fraseEstado: "pendiente" | "tipo" | "ok" | "valida" | "mal";
  hablante: string;
  // Community project
  zonaIdx: number;
  propuestas: string[];
  planeados: string[];
  oracionPlan: string;
  estadoPlan: "ok" | "mal" | null;
  // My goals
  hitoIdx: number;
  metas: (string | null)[];
  estadoMeta: "ok" | "mal" | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const WARN = "#fb923c";
const AMBAR = "#fbbf24";

const CAJA = new THREE.BoxGeometry(1, 1, 1);
const ESFERA = new THREE.SphereGeometry(1, 20, 14);
const CILINDRO = new THREE.CylinderGeometry(1, 1, 1, 24);
const CONO = new THREE.ConeGeometry(1, 1, 16);

function Caja({ p, s, c, rough = 0.75, metal = 0, sombra = true, rotY = 0, emis, op }: { p: Pt; s: Pt; c: string; rough?: number; metal?: number; sombra?: boolean; rotY?: number; emis?: number; op?: number }) {
  return (
    <mesh position={p} scale={s} rotation={[0, rotY, 0]} geometry={CAJA} castShadow={sombra} receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={emis ? c : "#000000"} emissiveIntensity={emis ?? 0} transparent={op !== undefined} opacity={op ?? 1} />
    </mesh>
  );
}

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

/** Figura estilizada: cuerpo cápsula, cabeza, cabello y ojos. */
function Figura({ camisa, coleta = false, cabello = "#2b1b12", piel = "#e8b98f", canas = false }: { camisa: string; coleta?: boolean; cabello?: string; piel?: string; canas?: boolean }) {
  const pelo = canas ? "#cbd5e1" : cabello;
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 6, 14]} />
        <meshStandardMaterial color={camisa} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow geometry={ESFERA} scale={0.15}>
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, -0.025]} geometry={ESFERA} scale={[0.158, 0.15, 0.158]}>
        <meshStandardMaterial color={pelo} roughness={0.8} />
      </mesh>
      {coleta && (
        <mesh position={[0, 0.98, -0.18]} geometry={ESFERA} scale={0.075}>
          <meshStandardMaterial color={pelo} roughness={0.8} />
        </mesh>
      )}
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.99, 0.135]} geometry={ESFERA} scale={0.02}>
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

function Arbol({ p, s = 1, c = "#166534" }: { p: Pt; s?: number; c?: string }) {
  return (
    <group position={p} scale={s}>
      <Caja p={[0, 0.45, 0]} s={[0.14, 0.9, 0.14]} c="#78350f" />
      <mesh position={[0, 1.25, 0]} geometry={ESFERA} scale={[0.55, 0.62, 0.55]} castShadow>
        <meshStandardMaterial color={c} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** Progreso 0→1 que sigue a `activo` con suavidad. */
function useProgreso(activo: boolean, velocidad = 0.05): RefObject<number> {
  const p = useRef(activo ? 1 : 0);
  useFrame((_, dt) => {
    p.current += ((activo ? 1 : 0) - p.current) * suave(dt, velocidad);
  });
  return p;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLAN OR DECISION? — el carrusel de situaciones
 * ════════════════════════════════════════════════════════════════════════ */

const N_SIT = SITUACIONES.length;
const PASO = (Math.PI * 2) / N_SIT;
const R_CAR = 5.0;

interface EstacionProps {
  activa: boolean;
  resuelta: boolean;
}

function Piso({ c, r = 1.9 }: { c: string; r?: number }) {
  return (
    <mesh position={[0, 0.34, 0]} geometry={CILINDRO} scale={[r, 0.08, r]} receiveShadow>
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  );
}

const GOTAS = 44;
const GOTAS_POS = (() => {
  const r = mulberry32(7);
  return Array.from({ length: GOTAS }, () => [(r() - 0.5) * 2.8, r(), (r() - 0.5) * 2.2] as Pt);
})();

function EstNubes({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta);
  const nubes = useRef<THREE.Group>(null);
  const rayo = useRef<THREE.MeshStandardMaterial>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const paraguas = useRef<THREE.Group>(null);
  const charco = useRef<THREE.Mesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const k = p.current;
    if (nubes.current) nubes.current.position.y = 3.05 + Math.sin(t * 0.8) * 0.06;
    if (rayo.current) rayo.current.emissiveIntensity = (t % 3.2 < 0.12 ? 1.6 : 0.05) * (1 - k * 0.5);
    const g = gotas.current;
    if (g) {
      for (let i = 0; i < GOTAS; i++) {
        const [x, f, z] = GOTAS_POS[i]!;
        const y = 2.75 - ((t * 2.4 + f * 2.4) % 2.4);
        obj.position.set(x, y, z);
        obj.scale.set(0.02, 0.12, 0.02).multiplyScalar(k > 0.05 ? k : 0.0001);
        obj.updateMatrix();
        g.setMatrixAt(i, obj.matrix);
      }
      g.instanceMatrix.needsUpdate = true;
    }
    if (paraguas.current) paraguas.current.scale.setScalar(Math.max(0.0001, k));
    if (charco.current) charco.current.scale.set(0.9 * k + 0.001, 1, 0.6 * k + 0.001);
  });
  return (
    <group>
      <Piso c="#a8a29e" />
      {/* Banca y farol de la plaza */}
      <Caja p={[0.75, 0.62, -0.55]} s={[1.1, 0.08, 0.36]} c="#92400e" />
      <Caja p={[0.75, 0.82, -0.72]} s={[1.1, 0.34, 0.06]} c="#92400e" />
      {[0.3, 1.2].map((x) => (
        <Caja key={x} p={[x, 0.5, -0.55]} s={[0.06, 0.3, 0.3]} c="#1f2937" />
      ))}
      <Caja p={[-1.3, 1.3, -0.8]} s={[0.07, 2.0, 0.07]} c="#334155" metal={0.6} />
      <mesh position={[-1.3, 2.33, -0.8]} geometry={ESFERA} scale={0.13}>
        <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <Arbol p={[-1.1, 0.38, 0.9]} s={0.8} />
      {/* Nubes negras con relámpago */}
      <group ref={nubes} position={[0, 3.05, -0.2]}>
        {(
          [
            [0, 0, 0, 0.62],
            [-0.7, -0.08, 0.1, 0.5],
            [0.72, -0.1, 0, 0.52],
            [-0.3, 0.25, -0.2, 0.48],
            [0.35, 0.22, 0.15, 0.46],
          ] as [number, number, number, number][]
        ).map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]} geometry={ESFERA} scale={[r * 1.2, r * 0.8, r]}>
            <meshStandardMaterial ref={k === 0 ? rayo : undefined} color="#475569" emissive="#e0f2fe" emissiveIntensity={0.05} roughness={1} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={gotas} args={[undefined, undefined, GOTAS]} frustumCulled={false} geometry={ESFERA}>
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.5} transparent opacity={0.85} />
      </instancedMesh>
      <mesh ref={charco} position={[0.1, 0.39, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 28]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.3} transparent opacity={0.45} />
      </mesh>
      {/* Diego */}
      <group position={[-0.25, 0.38, 0.3]} scale={1.15}>
        <Figura camisa="#22c55e" cabello="#111827" />
        <group ref={paraguas} position={[0.22, 1.5, 0]}>
          <mesh geometry={CONO} scale={[0.6, 0.28, 0.6]}>
            <meshStandardMaterial color="#e11d48" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <Caja p={[0, -0.45, 0]} s={[0.025, 0.9, 0.025]} c="#1f2937" sombra={false} />
        </group>
      </group>
      {activa && (
        <Etiqueta pos={[-0.25, 0.25, 1.1]} df={9} fs={11} col="#22c55eaa">
          Diego
        </Etiqueta>
      )}
    </group>
  );
}

function EstBolsas({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.04);
  const tu = useRef<THREE.Group>(null);
  const bolsas = useRef<THREE.Group>(null);
  const caida = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    const t = clock.elapsedTime;
    if (tu.current) {
      tu.current.position.x = -1.3 + k * 0.95;
      tu.current.position.y = 0.38 + Math.abs(Math.sin(t * 8)) * 0.05 * (k > 0.05 && k < 0.95 ? 1 : 0);
    }
    if (bolsas.current)
      bolsas.current.children.forEach((b, i) => {
        // Las bolsas 0 y 1 pasan de Doña Lupe a tus manos.
        const desde = i === 0 ? -0.28 : 1.28;
        const hasta = i === 0 ? -0.62 : -0.07;
        const mover = i < 2 ? k : 0;
        b.position.x = desde + (hasta - desde) * mover;
      });
    if (caida.current) caida.current.rotation.z = (1 - k) * (0.55 + Math.sin(t * 3) * 0.12);
  });
  return (
    <group>
      <Piso c="#d6c7ad" />
      {/* Puesto del mercado con toldo */}
      {[-1.15, 1.15].map((x) => (
        <Caja key={x} p={[x, 1.1, -1.05]} s={[0.07, 1.5, 0.07]} c="#57534e" />
      ))}
      <Caja p={[0, 0.72, -1.05]} s={[2.3, 0.7, 0.5]} c="#b45309" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Caja key={k} p={[-0.96 + k * 0.385, 1.9, -1.0]} s={[0.385, 0.08, 0.8]} c={k % 2 ? "#f8fafc" : "#dc2626"} />
      ))}
      {[-0.7, -0.2, 0.3, 0.8].map((x, k) => (
        <mesh key={x} position={[x, 1.14, -1.05]} geometry={ESFERA} scale={0.15}>
          <meshStandardMaterial color={["#f97316", "#84cc16", "#facc15", "#ef4444"][k]} roughness={0.6} />
        </mesh>
      ))}
      {/* Doña Lupe */}
      <group position={[0.5, 0.38, 0.25]} rotation={[0, -0.35, 0]} scale={1.1}>
        <Figura camisa="#7c3aed" canas />
      </group>
      <group ref={bolsas} position={[0, 0.38, 0.25]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i === 0 ? -0.28 : i === 1 ? 1.28 : i === 2 ? 0.15 : 0.85, 0.32, 0.12]} geometry={CAJA} scale={[0.26, 0.34, 0.2]} castShadow>
            <meshStandardMaterial color={["#fde68a", "#86efac", "#fca5a5", "#93c5fd"][i]} roughness={0.7} />
          </mesh>
        ))}
      </group>
      <mesh ref={caida} position={[1.1, 0.5, 0.55]} geometry={CAJA} scale={[0.24, 0.3, 0.18]}>
        <meshStandardMaterial color="#fdba74" roughness={0.7} />
      </mesh>
      {/* Tú */}
      <group ref={tu} position={[-1.3, 0.38, 0.35]} rotation={[0, 0.5, 0]} scale={1.1}>
        <Figura camisa="#0ea5e9" coleta />
      </group>
      {activa && (
        <>
          <Etiqueta pos={[0.55, 0.2, 1.1]} df={9} fs={11} col="#a78bfaaa">
            Doña Lupe
          </Etiqueta>
          <Etiqueta pos={[-1.05, 2.05, -1.0]} df={9} fs={11} col="#f97316aa">
            <i className="fa-solid fa-store" style={{ color: "#fb923c" }} />
            Market
          </Etiqueta>
        </>
      )}
    </group>
  );
}

function EstSofia({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.04);
  const carta = useRef<THREE.Group>(null);
  const ventanas = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    if (carta.current) {
      carta.current.position.y = 1.0 + k * 0.85 + Math.sin(clock.elapsedTime * 2) * 0.04 * k;
      carta.current.rotation.x = -0.3 + k * 0.3;
    }
    if (ventanas.current) ventanas.current.emissiveIntensity = 0.1 + k * 1.4;
  });
  return (
    <group>
      <Piso c="#cbd5e1" />
      {/* Universidad */}
      <group position={[0, 0.38, -0.95]}>
        <Caja p={[0, 0.12, 0]} s={[2.9, 0.24, 1.0]} c="#e2e8f0" />
        <Caja p={[0, 0.85, -0.15]} s={[2.6, 1.3, 0.6]} c="#f1e3c6" />
        {[-1.05, -0.35, 0.35, 1.05].map((x) => (
          <mesh key={x} position={[x, 0.85, 0.28]} geometry={CILINDRO} scale={[0.09, 1.25, 0.09]} castShadow>
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        ))}
        <Caja p={[0, 1.56, 0.08]} s={[2.8, 0.14, 0.95]} c="#e7dcc8" />
        <mesh position={[0, 1.86, 0.08]} rotation={[0, 0, 0]} scale={[1.55, 0.45, 0.5]}>
          <cylinderGeometry args={[0, 1, 1, 4, 1]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} flatShading />
        </mesh>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.95, 0.16]}>
            <planeGeometry args={[0.36, 0.5]} />
            <meshStandardMaterial ref={x < 0 ? ventanas : undefined} color="#bfdbfe" emissive="#fde68a" emissiveIntensity={0.1} />
          </mesh>
        ))}
        <Caja p={[0, 0.55, 0.16]} s={[0.4, 0.7, 0.03]} c="#7c2d12" sombra={false} />
      </group>
      {/* Sofía con su carta */}
      <group position={[0.35, 0.38, 0.55]} rotation={[0, -0.3, 0]} scale={1.15}>
        <Figura camisa="#f472b6" coleta />
      </group>
      <group ref={carta} position={[0.05, 1.0, 0.85]}>
        <Caja p={[0, 0, 0]} s={[0.36, 0.26, 0.02]} c="#ffffff" sombra={false} />
        <Caja p={[0, 0.02, 0.012]} s={[0.24, 0.03, 0.005]} c="#16a34a" sombra={false} />
        <Caja p={[0, -0.05, 0.012]} s={[0.24, 0.02, 0.005]} c="#94a3b8" sombra={false} />
      </group>
      {activa && (
        <>
          <Etiqueta pos={[0, 2.55, -0.85]} df={9} fs={11} col="#fbbf24aa">
            <i className="fa-solid fa-building-columns" style={{ color: "#fbbf24" }} />
            University
          </Etiqueta>
          <Etiqueta pos={[0.4, 0.2, 1.3]} df={9} fs={11} col="#f472b6aa">
            Sofía
          </Etiqueta>
          {resuelta && (
            <Etiqueta pos={[-1.05, 1.75, 0.9]} df={9} fs={11} col={`${OK}aa`}>
              <i className="fa-solid fa-envelope-open-text" style={{ color: OK }} />
              Accepted · Nursing
            </Etiqueta>
          )}
        </>
      )}
    </group>
  );
}

function EstCalor({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.05);
  const hojaIzq = useRef<THREE.Group>(null);
  const hojaDer = useRef<THREE.Group>(null);
  const cortina = useRef<THREE.Mesh>(null);
  const columna = useRef<THREE.Mesh>(null);
  const ondas = useRef<THREE.Group>(null);
  const brisa = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    const t = clock.elapsedTime;
    if (hojaIzq.current) hojaIzq.current.rotation.y = k * 1.25;
    if (hojaDer.current) hojaDer.current.rotation.y = -k * 1.25;
    if (cortina.current) cortina.current.rotation.x = k * (0.25 + Math.sin(t * 3) * 0.12);
    if (columna.current) {
      const alto = 0.5 - k * 0.22;
      columna.current.scale.y = alto;
      columna.current.position.y = 0.95 + alto / 2;
    }
    if (ondas.current)
      ondas.current.children.forEach((o, i) => {
        const f = (t * 0.45 + i / 3) % 1;
        o.position.y = 0.6 + f * 1.6;
        o.scale.setScalar((0.25 + f * 0.25) * Math.max(0.0001, 1 - k));
      });
    if (brisa.current)
      brisa.current.children.forEach((o, i) => {
        const f = (t * 0.6 + i / 3) % 1;
        o.position.z = -0.9 + f * 1.8;
        o.scale.setScalar(Math.max(0.0001, k) * (1 - Math.abs(f - 0.5)));
      });
  });
  return (
    <group>
      <Piso c="#a07c5a" />
      {/* Muro del salón con ventana */}
      <Caja p={[-0.95, 1.45, -1.1]} s={[1.3, 2.1, 0.12]} c="#e7dcc8" />
      <Caja p={[1.25, 1.45, -1.1]} s={[0.7, 2.1, 0.12]} c="#e7dcc8" />
      <Caja p={[0.4, 0.75, -1.1]} s={[1.0, 0.7, 0.12]} c="#e7dcc8" />
      <Caja p={[0.4, 2.3, -1.1]} s={[1.0, 0.4, 0.12]} c="#e7dcc8" />
      <mesh position={[0.4, 1.6, -1.25]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial color="#7dd3fc" />
      </mesh>
      <mesh position={[0.62, 1.82, -1.3]} geometry={ESFERA} scale={0.16}>
        <meshBasicMaterial color="#fde047" toneMapped={false} />
      </mesh>
      <group ref={hojaIzq} position={[-0.1, 1.6, -1.04]}>
        <mesh position={[0.25, 0, 0]} geometry={CAJA} scale={[0.5, 1.0, 0.03]}>
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.05} />
        </mesh>
      </group>
      <group ref={hojaDer} position={[0.9, 1.6, -1.04]}>
        <mesh position={[-0.25, 0, 0]} geometry={CAJA} scale={[0.5, 1.0, 0.03]}>
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.05} />
        </mesh>
      </group>
      <mesh ref={cortina} position={[-0.25, 2.1, -0.98]} geometry={CAJA} scale={[0.3, 1.0, 0.02]}>
        <meshStandardMaterial color="#f97316" roughness={0.8} />
      </mesh>
      {/* Pupitre y compañero */}
      <Caja p={[1.0, 0.8, 0.35]} s={[0.8, 0.06, 0.5]} c="#b08968" />
      {[0.7, 1.3].map((x) => (
        <Caja key={x} p={[x, 0.58, 0.35]} s={[0.05, 0.42, 0.05]} c="#475569" />
      ))}
      <group position={[1.0, 0.38, 0.9]} rotation={[0, Math.PI, 0]}>
        <Figura camisa="#eab308" cabello="#3f2a1d" />
      </group>
      <group position={[-0.75, 0.38, 0.4]} rotation={[0, 0.3, 0]} scale={1.1}>
        <Figura camisa="#0ea5e9" coleta />
      </group>
      {/* Termómetro */}
      <Caja p={[1.25, 1.2, -1.02]} s={[0.2, 0.75, 0.05]} c="#f8fafc" sombra={false} />
      <mesh ref={columna} position={[1.25, 1.2, -0.99]} geometry={CAJA} scale={[0.06, 0.5, 0.02]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <group ref={ondas} position={[0.9, 0, 0.2]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.06, 8, 28]} />
            <meshBasicMaterial color="#fb923c" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={brisa} position={[0.4, 1.6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.3, (i - 1) * 0.25, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.2, 0.025, 6, 16, Math.PI]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.8} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {activa && (
        <Etiqueta pos={[1.25, 2.2, -0.9]} df={9} fs={11} col={resuelta ? "#38bdf8aa" : "#ef4444aa"}>
          <i className="fa-solid fa-temperature-high" style={{ color: resuelta ? "#38bdf8" : "#ef4444" }} />
          {resuelta ? "Fresh air" : "32 °C"}
        </Etiqueta>
      )}
    </group>
  );
}

function EstDentista({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.06);
  const sello = useRef<THREE.Group>(null);
  const pagina = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    if (sello.current) {
      const s = Math.max(0.0001, k * (1 + Math.max(0, 1 - k) * 0.6));
      sello.current.scale.setScalar(s);
      sello.current.rotation.z = (1 - k) * 0.8;
    }
    if (pagina.current) pagina.current.emissiveIntensity = k * (0.25 + Math.sin(clock.elapsedTime * 3) * 0.08);
  });
  return (
    <group>
      <Piso c="#fbcfe8" />
      {/* Calendario de escritorio gigante */}
      <group position={[0.35, 0.38, -0.6]} rotation={[-0.12, 0, 0]}>
        <mesh position={[0, 1.0, 0]} geometry={CAJA} scale={[1.9, 1.7, 0.1]} castShadow>
          <meshStandardMaterial ref={pagina} color="#ffffff" emissive={OK} emissiveIntensity={0} roughness={0.6} />
        </mesh>
        <Caja p={[0, 1.72, 0.02]} s={[1.9, 0.3, 0.12]} c="#e11d48" />
        {[-0.6, -0.2, 0.2, 0.6].map((x) => (
          <mesh key={x} position={[x, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.07, 0.02, 8, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Reloj a las 4:00 */}
        <group position={[-0.5, 0.85, 0.07]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.32, 0.03, 0.32]}>
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0, 0.02]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.32, 0.03, 8, 32]} />
            <meshStandardMaterial color="#e11d48" />
          </mesh>
          <group rotation={[0, 0, -(4 / 12) * Math.PI * 2]}>
            <Caja p={[0, 0.1, 0.03]} s={[0.04, 0.2, 0.01]} c="#0f172a" sombra={false} />
          </group>
          <Caja p={[0, 0.13, 0.035]} s={[0.025, 0.26, 0.01]} c="#0284c7" sombra={false} />
        </group>
        {/* Diente */}
        <group position={[0.45, 0.8, 0.1]}>
          <mesh geometry={ESFERA} scale={[0.26, 0.2, 0.14]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, -0.2, 0]} geometry={CONO} scale={[0.07, 0.24, 0.07]} rotation={[Math.PI, 0, 0]}>
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          ))}
        </group>
        <group ref={sello} position={[0.78, 0.3, 0.12]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.3, 0.05, 0.3]}>
            <meshStandardMaterial color={OK} emissive={OK} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.07, -0.03, 0.04]} rotation={[0, 0, 0.75]} geometry={CAJA} scale={[0.06, 0.17, 0.02]}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.063, 0.043, 0.04]} rotation={[0, 0, -0.6]} geometry={CAJA} scale={[0.06, 0.32, 0.02]}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
      {/* Tú, con el teléfono */}
      <group position={[-1.2, 0.38, 0.55]} rotation={[0, 0.55, 0]} scale={1.1}>
        <Figura camisa="#0ea5e9" coleta />
        <Caja p={[0.18, 0.95, 0.1]} s={[0.07, 0.14, 0.02]} c="#111827" sombra={false} />
      </group>
      {activa && (
        <Etiqueta pos={[0.35, 2.45, -0.6]} df={9} fs={11} col="#e11d48aa">
          <i className="fa-solid fa-calendar-day" style={{ color: "#fb7185" }} />
          Tomorrow · 4:00 p.m.
        </Etiqueta>
      )}
    </group>
  );
}

function EstCurso({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.05);
  const pantalla = useRef<THREE.MeshStandardMaterial>(null);
  const burbujas = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    const t = clock.elapsedTime;
    if (pantalla.current) pantalla.current.emissiveIntensity = 0.15 + k * 1.1;
    if (burbujas.current)
      burbujas.current.children.forEach((b, i) => {
        b.position.y = [1.62, 1.95, 2.45][i]! + Math.sin(t * 1.6 + i) * 0.04;
      });
  });
  return (
    <group>
      <Piso c="#ddd6fe" />
      {/* Mesa, laptop y banco */}
      <Caja p={[0.35, 0.95, 0]} s={[1.2, 0.06, 0.7]} c="#a47148" />
      {[-0.15, 0.85].map((x) => (
        <Caja key={x} p={[x, 0.65, 0]} s={[0.06, 0.55, 0.55]} c="#7f5539" />
      ))}
      <Caja p={[0.35, 1.0, 0.05]} s={[0.56, 0.03, 0.38]} c="#334155" metal={0.4} />
      <group position={[0.35, 1.0, -0.14]} rotation={[-0.25, 0, 0]}>
        <Caja p={[0, 0.2, 0]} s={[0.56, 0.4, 0.03]} c="#1e293b" metal={0.4} />
        <mesh position={[0, 0.2, 0.017]}>
          <planeGeometry args={[0.5, 0.34]} />
          <meshStandardMaterial ref={pantalla} color="#0b1220" emissive="#60a5fa" emissiveIntensity={0.15} toneMapped={false} />
        </mesh>
      </group>
      <Caja p={[0.35, 0.58, 0.72]} s={[0.45, 0.4, 0.45]} c="#6d28d9" />
      <group position={[0.35, 0.55, 0.75]} rotation={[0, Math.PI, 0]}>
        <Figura camisa="#0ea5e9" coleta />
      </group>
      {/* Burbuja de pensamiento */}
      <group ref={burbujas} position={[-0.55, 0, 0.6]}>
        {[0.08, 0.13, 0.42].map((r, i) => (
          <mesh key={i} position={[-0.1 * i, [1.62, 1.95, 2.45][i]!, 0]} geometry={ESFERA} scale={[r * (i === 2 ? 1.5 : 1), r, r]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.4} transparent opacity={0.92} />
          </mesh>
        ))}
      </group>
      {activa && (
        <Html position={[-0.75, 2.45, 1.05]} center distanceFactor={9} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4c1d95", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap" }}>
            {resuelta ? (
              <>
                <i className="fa-solid fa-laptop" />
                English course?
              </>
            ) : (
              <span style={{ fontSize: 22 }}>? ? ?</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function EstMural({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.03);
  const franjas = useRef<THREE.Group>(null);
  const rodillo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    if (franjas.current)
      franjas.current.children.forEach((f, i) => {
        const local = Math.min(1, Math.max(0, k * 6 - i));
        f.scale.y = Math.max(0.0001, local);
      });
    if (rodillo.current) {
      rodillo.current.position.x = -1.3 + Math.min(1, k) * 2.6;
      rodillo.current.position.y = 1.0 + Math.sin(clock.elapsedTime * 4) * 0.35 * (k > 0.02 && k < 0.98 ? 1 : 0.2);
    }
  });
  const COLORES = ["#f43f5e", "#f97316", "#facc15", "#22c55e", "#0ea5e9", "#8b5cf6"];
  return (
    <group>
      <Piso c="#d1d5db" />
      <Caja p={[0, 1.2, -1.0]} s={[3.2, 1.7, 0.22]} c="#9ca3af" rough={0.95} />
      <Caja p={[0, 2.1, -1.0]} s={[3.3, 0.1, 0.3]} c="#6b7280" />
      <group ref={franjas} position={[0, 0.36, -0.88]}>
        {COLORES.map((c, i) => (
          <group key={c} position={[-1.32 + i * 0.53, 0, 0]}>
            <mesh position={[0, 0.84, 0]} geometry={CAJA} scale={[0.53, 1.62, 0.02]}>
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
      {resuelta && (
        <group position={[0, 1.25, -0.86]}>
          <mesh position={[0.6, 0.3, 0]}>
            <circleGeometry args={[0.28, 24]} />
            <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[-0.5, -0.35, 0.005]}>
            <circleGeometry args={[0.55, 3]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      )}
      {/* Botes de pintura */}
      {[-1.1, -0.75, 1.05].map((x, k) => (
        <group key={x} position={[x, 0.52, -0.45]}>
          <mesh geometry={CILINDRO} scale={[0.14, 0.26, 0.14]} castShadow>
            <meshStandardMaterial color="#e5e7eb" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 20]} />
            <meshStandardMaterial color={COLORES[k * 2]!} />
          </mesh>
        </group>
      ))}
      <group ref={rodillo} position={[-1.3, 1.0, -0.75]}>
        <mesh rotation={[0, 0, Math.PI / 2]} geometry={CILINDRO} scale={[0.07, 0.3, 0.07]}>
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <Caja p={[0, -0.3, 0.05]} s={[0.03, 0.55, 0.03]} c="#1f2937" sombra={false} />
      </group>
      {/* Carmen y un vecino */}
      <group position={[-0.55, 0.38, 0.5]} rotation={[0, 0.3, 0]} scale={1.1}>
        <Figura camisa="#db2777" coleta cabello="#111827" />
      </group>
      <group position={[0.65, 0.38, 0.6]} rotation={[0, -0.4, 0]} scale={1.1}>
        <Figura camisa="#65a30d" canas />
      </group>
      {activa && (
        <Etiqueta pos={[-0.55, 0.22, 1.25]} df={9} fs={11} col="#db2777aa">
          Carmen
        </Etiqueta>
      )}
    </group>
  );
}

function EstLlamada({ activa, resuelta }: EstacionProps) {
  const p = useProgreso(resuelta, 0.03);
  const bus = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    const t = clock.elapsedTime;
    if (bus.current) bus.current.position.x = 0.4 + k * 0.9;
    if (aro.current) {
      const f = (t * 0.9) % 1;
      aro.current.scale.setScalar(Math.max(0.0001, k) * (0.15 + f * 0.45));
      (aro.current.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.8 * k;
    }
  });
  return (
    <group>
      <Piso c="#94a3b8" />
      <Caja p={[0, 0.4, -0.35]} s={[3.4, 0.04, 0.6]} c="#374151" sombra={false} />
      {/* Autobús */}
      <group ref={bus} position={[0.4, 0.42, -0.95]} scale={0.62}>
        <Caja p={[0, 0.72, 0]} s={[2.9, 1.0, 1.05]} c="#f8fafc" rough={0.4} />
        <Caja p={[0, 0.42, 0]} s={[2.92, 0.16, 1.07]} c="#2563eb" rough={0.4} />
        {[-0.95, -0.35, 0.25, 0.85].map((x) => (
          <mesh key={x} position={[x, 0.9, 0.53]}>
            <planeGeometry args={[0.46, 0.34]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.4} />
          </mesh>
        ))}
        {[-0.95, 0.95].map((x) =>
          [-0.5, 0.5].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.2, 0.12, 0.2]}>
              <meshStandardMaterial color="#111827" roughness={0.9} />
            </mesh>
          )),
        )}
      </group>
      {/* Tú y mamá */}
      <group position={[-0.45, 0.38, 0.55]} rotation={[0, 0.6, 0]} scale={1.1}>
        <Figura camisa="#0ea5e9" coleta />
        <Caja p={[0.24, 0.55, 0]} s={[0.3, 0.36, 0.18]} c="#4338ca" />
      </group>
      <group position={[0.55, 0.38, 0.75]} rotation={[0, -0.6, 0]} scale={1.1}>
        <Figura camisa="#f59e0b" cabello="#3f2a1d" coleta />
        <Caja p={[-0.18, 0.9, 0.12]} s={[0.07, 0.14, 0.02]} c="#111827" sombra={false} />
      </group>
      <mesh ref={aro} position={[0.35, 1.38, 0.9]}>
        <torusGeometry args={[1, 0.05, 8, 32]} />
        <meshBasicMaterial color={OK} transparent opacity={0} depthWrite={false} />
      </mesh>
      {activa && (
        <>
          <Etiqueta pos={[0.6, 0.22, 1.45]} df={9} fs={11} col="#f59e0baa">
            Mom
          </Etiqueta>
          <Etiqueta pos={[1.0, 1.75, -0.95]} df={9} fs={11} col="#2563ebaa">
            <i className="fa-solid fa-bus" style={{ color: "#60a5fa" }} />
            To Puebla
          </Etiqueta>
          {resuelta && (
            <Etiqueta pos={[0.05, 2.15, 0.75]} df={9} fs={12} col={`${OK}aa`}>
              <i className="fa-solid fa-heart" style={{ color: "#f472b6" }} />
              <i className="fa-solid fa-phone-volume" style={{ color: OK }} />
            </Etiqueta>
          )}
        </>
      )}
    </group>
  );
}

const ESTACIONES: Record<string, (p: EstacionProps) => ReactNode> = {
  nubes: EstNubes,
  bolsas: EstBolsas,
  sofia: EstSofia,
  calor: EstCalor,
  dentista: EstDentista,
  curso: EstCurso,
  mural: EstMural,
  llamada: EstLlamada,
};

const EDIFICIOS_FONDO: [number, number, number, string][] = (() => {
  const r = mulberry32(19);
  return Array.from({ length: 22 }, (_, i) => {
    const a = Math.PI * 0.55 + (i / 21) * Math.PI * 0.9;
    const rad = 12.5 + r() * 2.5;
    return [Math.cos(a) * rad, Math.sin(a) * -rad, 0.8 + r() * 2.2, ["#334155", "#3b4b61", "#475569", "#1e293b"][i % 4]!] as [number, number, number, string];
  });
})();

function EscenaSituaciones({ sitIdx, sitResueltas, frase, fraseEstado, hablante, errorNonce, modoColor }: Pick<PlanesSceneProps, "sitIdx" | "sitResueltas" | "frase" | "fraseEstado" | "hablante" | "errorNonce" | "modoColor">) {
  const plato = useRef<THREE.Group>(null);
  const ang = useRef(-sitIdx * PASO);
  const aro = useRef<THREE.Mesh>(null);
  const ultimo = useRef(errorNonce);
  const flash = useRef(0);
  useFrame(({ clock }, dt) => {
    let d = -sitIdx * PASO - ang.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    ang.current += d * suave(dt, 0.07);
    if (plato.current) plato.current.rotation.y = ang.current;
    if (ultimo.current !== errorNonce) {
      ultimo.current = errorNonce;
      flash.current = 1;
    }
    flash.current = Math.max(0, flash.current - dt * 1.4);
    if (aro.current) {
      const m = aro.current.material as THREE.MeshStandardMaterial;
      const c = flash.current > 0 ? WARN : fraseEstado === "ok" ? OK : fraseEstado === "valida" ? AMBAR : modoColor;
      m.color.set(c);
      m.emissive.set(c);
      m.emissiveIntensity = 0.5 + flash.current * 1.5 + Math.sin(clock.elapsedTime * 3) * 0.2;
      aro.current.scale.setScalar(1 + flash.current * 0.08);
    }
  });
  const colFrase = fraseEstado === "ok" ? OK : fraseEstado === "valida" ? AMBAR : fraseEstado === "mal" ? WARN : modoColor;
  return (
    <group position={[0, -1.2, 0]}>
      {/* Suelo y colonia lejana */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 48]} />
        <meshStandardMaterial color="#1e3a2f" roughness={1} />
      </mesh>
      {EDIFICIOS_FONDO.map(([x, z, h, c], k) => (
        <Caja key={k} p={[x, h / 2, z]} s={[1.3, h, 1.1]} c={c} sombra={false} />
      ))}
      {/* Carrusel */}
      <group ref={plato}>
        <mesh position={[0, 0.12, 0]} geometry={CILINDRO} scale={[7.4, 0.28, 7.4]} receiveShadow castShadow>
          <meshStandardMaterial color="#3b2a1e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.27, 0]} geometry={CILINDRO} scale={[7.2, 0.04, 7.2]} receiveShadow>
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
        {SITUACIONES.map((s, i) => {
          const th = i * PASO;
          const Est = ESTACIONES[s.id]!;
          const hecha = sitResueltas.includes(s.id);
          return (
            <group key={s.id}>
              <group position={[Math.sin(th) * R_CAR, 0, Math.cos(th) * R_CAR]} rotation={[0, th, 0]}>
                <Est activa={i === sitIdx} resuelta={hecha} />
              </group>
              <mesh position={[Math.sin(th) * 7.05, 0.34, Math.cos(th) * 7.05]} geometry={ESFERA} scale={0.16}>
                <meshStandardMaterial color={hecha ? OK : i === sitIdx ? modoColor : "#475569"} emissive={hecha ? OK : i === sitIdx ? modoColor : "#000000"} emissiveIntensity={hecha || i === sitIdx ? 0.9 : 0} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* Aro de la situación actual (no gira) */}
      <mesh ref={aro} position={[0, 0.42, R_CAR]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.95, 2.08, 64]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 4.0, R_CAR - 0.2]} center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ padding: "3px 11px", borderRadius: 999, background: colFrase, color: "#04121f", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-comment" style={{ marginRight: 6 }} />
            {hablante}
          </div>
          <div
            style={{
              maxWidth: 520,
              width: "max-content",
              padding: "10px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.97)",
              border: `3px solid ${colFrase}`,
              color: "#0f172a",
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1.3,
              textAlign: "center",
              boxShadow: `0 0 30px -8px ${colFrase}`,
            }}
          >
            {(fraseEstado === "ok" || fraseEstado === "valida") && <i className="fa-solid fa-circle-check" style={{ color: fraseEstado === "ok" ? "#059669" : "#d97706", marginRight: 8 }} />}
            {frase}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. COMMUNITY PROJECT — la maqueta de la colonia
 * ════════════════════════════════════════════════════════════════════════ */

const CENTROS: Record<ZonaId, Pt> = {
  biblioteca: [-5.2, 0, -3.1],
  huerto: [5.2, 0, -3.1],
  parque: [-5.2, 0, 2.9],
  cancha: [5.2, 0, 2.9],
  plaza: [0, 0, 0],
};

interface ZonaProps {
  planeado: boolean;
  propuesto: boolean;
  activa: boolean;
  color: string;
}

function Holograma({ visible, color, radio = 1.9, alto = 2.2 }: { visible: boolean; color: string; radio?: number; alto?: number }) {
  const g = useRef<THREE.Group>(null);
  const p = useProgreso(visible, 0.08);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const k = p.current;
    g.current.visible = k > 0.02;
    g.current.scale.set(1, Math.max(0.0001, k), 1);
    g.current.children.forEach((c, i) => {
      if (i > 0) c.position.y = ((clock.elapsedTime * 0.5 + i / 3) % 1) * alto;
    });
  });
  return (
    <group ref={g} visible={false}>
      <mesh position={[0, alto / 2, 0]} geometry={CILINDRO} scale={[radio, alto, radio]}>
        <meshBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radio - 0.05, radio, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

const BASURA = (() => {
  const r = mulberry32(3);
  return Array.from({ length: 18 }, () => ({ x: (r() - 0.5) * 3.4, z: (r() - 0.5) * 2.6, rot: r() * Math.PI, c: ["#f8fafc", "#a16207", "#60a5fa", "#ef4444", "#e5e7eb"][Math.floor(r() * 5)]!, s: 0.1 + r() * 0.1 }));
})();

function ZonaParque({ planeado, propuesto, color }: ZonaProps) {
  const p = useProgreso(planeado, 0.03);
  const basura = useRef<THREE.InstancedMesh>(null);
  const nuevo = useRef<THREE.Group>(null);
  const pasto = useRef<THREE.MeshStandardMaterial>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const seco = useMemo(() => new THREE.Color("#7c7a4a"), []);
  const verde = useMemo(() => new THREE.Color("#4d8a4f"), []);
  useFrame(() => {
    const k = p.current;
    const b = basura.current;
    if (b) {
      BASURA.forEach((q, i) => {
        const local = Math.min(1, Math.max(0, k * 3 - (i / BASURA.length) * 2));
        obj.position.set(q.x, 0.17, q.z);
        obj.rotation.set(0.3, q.rot, 0.2);
        obj.scale.setScalar(Math.max(0.0001, q.s * (1 - local)));
        obj.updateMatrix();
        b.setMatrixAt(i, obj.matrix);
      });
      b.instanceMatrix.needsUpdate = true;
    }
    if (nuevo.current) nuevo.current.children.forEach((c, i) => c.scale.setScalar(Math.max(0.0001, Math.min(1, k * 2.2 - i * 0.3))));
    if (pasto.current) pasto.current.color.copy(seco).lerp(verde, k);
  });
  return (
    <group>
      <mesh position={[0, 0.08, 0]} geometry={CAJA} scale={[4.2, 0.1, 3.2]} receiveShadow>
        <meshStandardMaterial ref={pasto} color="#7c7a4a" roughness={1} />
      </mesh>
      <Caja p={[0, 0.14, 0]} s={[0.6, 0.02, 3.2]} c="#d6c7ad" sombra={false} />
      <Arbol p={[-1.6, 0.1, -1.1]} s={0.9} />
      <Arbol p={[1.6, 0.1, 1.0]} s={0.8} c="#15803d" />
      {[-1.0, 1.0].map((x) => (
        <group key={x} position={[x, 0.1, -0.2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <Caja p={[0, 0.3, 0]} s={[0.9, 0.06, 0.3]} c="#92400e" />
          <Caja p={[0, 0.5, -0.14]} s={[0.9, 0.3, 0.05]} c="#92400e" />
        </group>
      ))}
      <instancedMesh ref={basura} args={[undefined, undefined, BASURA.length]} frustumCulled={false} geometry={CAJA} castShadow>
        <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
      </instancedMesh>
      <group ref={nuevo}>
        <group>
          {(
            [
              ["#2563eb", -0.55],
              ["#16a34a", 0],
              ["#eab308", 0.55],
            ] as [string, number][]
          ).map(([c, x]) => (
            <mesh key={c} position={[x + 1.0, 0.38, -1.25]} geometry={CILINDRO} scale={[0.2, 0.5, 0.2]} castShadow>
              <meshStandardMaterial color={c} roughness={0.5} />
            </mesh>
          ))}
        </group>
        <group>
          {[-1.2, -0.6, 0.6, 1.3].map((x, i) => (
            <mesh key={x} position={[x, 0.25, 1.2 - (i % 2) * 0.2]} geometry={ESFERA} scale={0.1}>
              <meshStandardMaterial color={["#f472b6", "#facc15", "#fb7185", "#c084fc"][i]} emissive={["#f472b6", "#facc15", "#fb7185", "#c084fc"][i]} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
        <group>
          <group position={[-0.5, 0.13, 0.55]} scale={0.8}>
            <Figura camisa="#f97316" />
          </group>
          <group position={[0.45, 0.13, 0.35]} scale={0.75} rotation={[0, -0.8, 0]}>
            <Figura camisa="#a855f7" coleta />
          </group>
        </group>
      </group>
      <Holograma visible={propuesto && !planeado} color={color} radio={2.3} />
    </group>
  );
}

const MALEZA = (() => {
  const r = mulberry32(5);
  return Array.from({ length: 22 }, () => ({ x: (r() - 0.5) * 3.6, z: (r() - 0.5) * 2.0, s: 0.12 + r() * 0.12 }));
})();
const PLANTAS = (() => {
  const xs: Pt[] = [];
  for (let c = 0; c < 3; c++) for (let f = 0; f < 5; f++) xs.push([-1.2 + c * 1.2, 0.46, -0.72 + f * 0.36]);
  return xs;
})();

function ZonaHuerto({ planeado, propuesto, color }: ZonaProps) {
  const p = useProgreso(planeado, 0.025);
  const maleza = useRef<THREE.InstancedMesh>(null);
  const plantas = useRef<THREE.InstancedMesh>(null);
  const camas = useRef<THREE.Group>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const k = p.current;
    const m = maleza.current;
    if (m) {
      MALEZA.forEach((q, i) => {
        obj.position.set(q.x, 0.2, q.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(q.s, q.s * 2.2, q.s).multiplyScalar(Math.max(0.0001, 1 - Math.min(1, k * 2.5)));
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
    const pl = plantas.current;
    if (pl) {
      PLANTAS.forEach(([x, y, z], i) => {
        const local = Math.min(1, Math.max(0, k * 2.2 - 0.8 - (i % 5) * 0.08));
        obj.position.set(x, y + 0.12 * local, z);
        obj.rotation.set(0, i + clock.elapsedTime * 0.2, 0);
        obj.scale.set(0.14, 0.24, 0.14).multiplyScalar(Math.max(0.0001, local));
        obj.updateMatrix();
        pl.setMatrixAt(i, obj.matrix);
      });
      pl.instanceMatrix.needsUpdate = true;
    }
    if (camas.current) camas.current.children.forEach((c, i) => c.scale.setScalar(Math.max(0.0001, Math.min(1, k * 3 - i * 0.3))));
  });
  return (
    <group>
      {/* Escuela */}
      <group position={[0, 0, -1.75]}>
        <Caja p={[0, 0.95, 0]} s={[4.4, 1.9, 0.9]} c="#f1e3c6" />
        <Caja p={[0, 1.95, 0]} s={[4.6, 0.12, 1.1]} c="#9a3412" />
        {[-1.6, -0.8, 0.8, 1.6].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.46]}>
            <planeGeometry args={[0.5, 0.45]} />
            <meshStandardMaterial color="#bfdbfe" emissive="#fde68a" emissiveIntensity={0.15} />
          </mesh>
        ))}
        <Caja p={[0, 0.5, 0.46]} s={[0.7, 1.0, 0.04]} c="#7c2d12" />
      </group>
      <mesh position={[0, 0.08, 0]} geometry={CAJA} scale={[4.2, 0.1, 2.3]} receiveShadow>
        <meshStandardMaterial color="#8b6b4a" roughness={1} />
      </mesh>
      <instancedMesh ref={maleza} args={[undefined, undefined, MALEZA.length]} frustumCulled={false} geometry={CONO}>
        <meshStandardMaterial color="#a3a355" roughness={0.9} flatShading />
      </instancedMesh>
      <group ref={camas}>
        {[-1.2, 0, 1.2].map((x) => (
          <group key={x} position={[x, 0.13, 0]}>
            <mesh position={[0, 0.14, 0]} geometry={CAJA} scale={[0.85, 0.28, 1.9]} castShadow receiveShadow>
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.285, 0]} geometry={CAJA} scale={[0.72, 0.02, 1.76]}>
              <meshStandardMaterial color="#3f2a1d" roughness={1} />
            </mesh>
          </group>
        ))}
      </group>
      <instancedMesh ref={plantas} args={[undefined, undefined, PLANTAS.length]} frustumCulled={false} geometry={ESFERA} castShadow>
        <meshStandardMaterial color="#22c55e" roughness={0.7} flatShading />
      </instancedMesh>
      <Holograma visible={propuesto && !planeado} color={color} radio={2.2} />
    </group>
  );
}

const LIBROS = (() => {
  const r = mulberry32(9);
  const xs: { p: Pt; h: number; c: string }[] = [];
  for (let e = 0; e < 3; e++)
    for (let n = 0; n < 3; n++)
      for (let b = 0; b < 9; b++) xs.push({ p: [-1.1 + e * 1.1 - 0.4 + b * 0.1, 0.42 + n * 0.45, -0.55], h: 0.26 + r() * 0.1, c: ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316", "#14b8a6"][Math.floor(r() * 7)]! });
  return xs;
})();

function ZonaBiblioteca({ planeado, propuesto, activa, color }: ZonaProps) {
  const p = useProgreso(planeado, 0.03);
  const libros = useRef<THREE.InstancedMesh>(null);
  const caja = useRef<THREE.Group>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const iniciado = useRef(false);
  useFrame(() => {
    const k = p.current;
    const l = libros.current;
    if (l) {
      LIBROS.forEach((q, i) => {
        // Sin colecta solo quedan unos pocos libros; con la colecta se llenan.
        const pocos = i % 9 < 1 && i % 2 === 0;
        const local = pocos ? 1 : Math.min(1, Math.max(0, k * 2.4 - (i / LIBROS.length) * 1.4));
        obj.position.set(q.p[0], q.p[1] + (q.h * local) / 2, q.p[2]);
        obj.rotation.set(0, 0, 0);
        const vis = local > 0.001 ? 1 : 0.0001;
        obj.scale.set(0.08 * vis, Math.max(0.0001, q.h * local), 0.28 * vis);
        obj.updateMatrix();
        l.setMatrixAt(i, obj.matrix);
        if (!iniciado.current) l.setColorAt(i, col.set(q.c));
      });
      l.instanceMatrix.needsUpdate = true;
      if (!iniciado.current && l.instanceColor) l.instanceColor.needsUpdate = true;
      iniciado.current = true;
    }
    if (caja.current) caja.current.scale.setScalar(Math.max(0.0001, Math.min(1, k * 1.6)));
  });
  return (
    <group>
      <mesh position={[0, 0.08, 0]} geometry={CAJA} scale={[4.2, 0.1, 2.6]} receiveShadow>
        <meshStandardMaterial color="#cbb89d" roughness={0.9} />
      </mesh>
      {/* Edificio abierto al frente */}
      <Caja p={[0, 1.05, -0.85]} s={[3.8, 1.9, 0.12]} c="#e2e8f0" />
      <Caja p={[-1.86, 1.05, -0.2]} s={[0.12, 1.9, 1.4]} c="#cbd5e1" />
      <Caja p={[1.86, 1.05, -0.2]} s={[0.12, 1.9, 1.4]} c="#cbd5e1" />
      <Caja p={[0, 2.05, -0.2]} s={[4.0, 0.12, 1.5]} c="#1d4ed8" />
      {[-1.1, 0, 1.1].map((x) => (
        <group key={x} position={[x, 0, -0.55]}>
          {[0.4, 0.85, 1.3, 1.75].map((y) => (
            <Caja key={y} p={[0, y, 0]} s={[1.0, 0.04, 0.34]} c="#92400e" sombra={false} />
          ))}
          {[-0.5, 0.5].map((dx) => (
            <Caja key={dx} p={[dx, 1.07, 0]} s={[0.04, 1.4, 0.34]} c="#78350f" sombra={false} />
          ))}
        </group>
      ))}
      <instancedMesh ref={libros} args={[undefined, undefined, LIBROS.length]} frustumCulled={false} geometry={CAJA}>
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </instancedMesh>
      {/* Caja de la colecta */}
      <group ref={caja} position={[1.2, 0.13, 0.75]}>
        <Caja p={[0, 0.22, 0]} s={[0.7, 0.44, 0.5]} c="#d97706" />
        {[-0.2, 0, 0.2].map((x, i) => (
          <Caja key={x} p={[x, 0.52, 0]} s={[0.12, 0.3, 0.32]} c={["#ef4444", "#3b82f6", "#22c55e"][i]!} />
        ))}
      </group>
      {activa && planeado && (
        <Etiqueta pos={[1.2, 1.15, 0.75]} df={11} fs={11} col={`${OK}aa`}>
          <i className="fa-solid fa-box-open" style={{ color: OK }} />
          Book drive
        </Etiqueta>
      )}
      <Holograma visible={propuesto && !planeado} color={color} radio={2.3} />
    </group>
  );
}

function ZonaCancha({ planeado, propuesto, color }: ZonaProps) {
  const p = useProgreso(planeado, 0.025);
  const pintura = useRef<THREE.Group>(null);
  const grietas = useRef<THREE.Group>(null);
  useFrame(() => {
    const k = p.current;
    if (pintura.current) {
      pintura.current.scale.x = Math.max(0.0001, k);
      pintura.current.position.x = -2.0 * (1 - k);
    }
    if (grietas.current) grietas.current.visible = k < 0.95;
  });
  return (
    <group>
      <mesh position={[0, 0.08, 0]} geometry={CAJA} scale={[4.4, 0.1, 2.8]} receiveShadow>
        <meshStandardMaterial color="#9ca3af" roughness={0.95} />
      </mesh>
      <group ref={grietas}>
        {(
          [
            [-1.0, 0.4, 0.5, 0.9],
            [0.6, -0.6, -0.4, 1.1],
            [1.4, 0.7, 1.0, 0.7],
          ] as [number, number, number, number][]
        ).map(([x, z, r, l], k) => (
          <Caja key={k} p={[x, 0.135, z]} s={[l, 0.01, 0.04]} rotY={r} c="#4b5563" sombra={false} />
        ))}
        <Caja p={[0, 0.135, 0]} s={[0.05, 0.01, 2.6]} c="#d1d5db" op={0.35} sombra={false} />
      </group>
      <group ref={pintura}>
        <Caja p={[0, 0.14, 0]} s={[4.2, 0.02, 2.6]} c="#1d4ed8" sombra={false} />
        {[-1.55, 1.55].map((x) => (
          <Caja key={x} p={[x, 0.155, 0]} s={[1.1, 0.02, 1.1]} c="#f97316" sombra={false} />
        ))}
        <Caja p={[0, 0.16, 0]} s={[0.05, 0.02, 2.6]} c="#ffffff" sombra={false} />
        <Caja p={[0, 0.16, 1.28]} s={[4.2, 0.02, 0.05]} c="#ffffff" sombra={false} />
        <Caja p={[0, 0.16, -1.28]} s={[4.2, 0.02, 0.05]} c="#ffffff" sombra={false} />
        <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.47, 40]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      {[-2.05, 2.05].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Caja p={[0, 0.9, 0]} s={[0.08, 1.6, 0.08]} c="#374151" metal={0.5} />
          <Caja p={[x < 0 ? 0.08 : -0.08, 1.6, 0]} s={[0.04, 0.5, 0.8]} c="#f8fafc" />
          <mesh position={[x < 0 ? 0.3 : -0.3, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.02, 8, 20]} />
            <meshStandardMaterial color="#ea580c" metalness={0.4} />
          </mesh>
        </group>
      ))}
      <Holograma visible={propuesto && !planeado} color={color} radio={2.4} />
    </group>
  );
}

const ARBOLES_PLAZA: Pt[] = [
  [-1.45, 0.1, -1.45],
  [1.45, 0.1, -1.45],
  [-1.45, 0.1, 1.45],
  [1.45, 0.1, 1.45],
];

function ZonaPlaza({ planeado, propuesto, color }: ZonaProps) {
  const p = useProgreso(planeado, 0.025);
  const arboles = useRef<THREE.Group>(null);
  const sombras = useRef<THREE.Group>(null);
  const sol = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const k = p.current;
    if (arboles.current) arboles.current.children.forEach((c, i) => c.scale.setScalar(Math.max(0.0001, Math.min(1.05, k * 2 - i * 0.2))));
    if (sombras.current) sombras.current.children.forEach((c, i) => c.scale.setScalar(Math.max(0.0001, Math.min(1, k * 2 - i * 0.2))));
    if (sol.current) sol.current.scale.setScalar(0.35 * (1 - k * 0.6) + Math.sin(clock.elapsedTime * 2) * 0.02);
  });
  return (
    <group>
      <mesh position={[0, 0.08, 0]} geometry={CAJA} scale={[4.0, 0.1, 4.0]} receiveShadow>
        <meshStandardMaterial color="#d6c3a5" roughness={0.9} />
      </mesh>
      {/* Kiosco */}
      <mesh position={[0, 0.22, 0]} geometry={CILINDRO} scale={[0.95, 0.2, 0.95]} castShadow>
        <meshStandardMaterial color="#e7dcc8" roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return <Caja key={k} p={[Math.cos(a) * 0.8, 0.8, Math.sin(a) * 0.8]} s={[0.06, 1.0, 0.06]} c="#0f766e" />;
      })}
      <mesh position={[0, 1.55, 0]} scale={[1.15, 0.55, 1.15]} castShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} flatShading />
      </mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r) => (
        <group key={r} rotation={[0, r, 0]}>
          <Caja p={[0, 0.32, 1.75]} s={[0.8, 0.06, 0.26]} c="#92400e" />
        </group>
      ))}
      <group ref={sombras}>
        {ARBOLES_PLAZA.map(([x, , z]) => (
          <mesh key={`${x}${z}`} position={[x + 0.2, 0.14, z + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.75, 24]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={arboles}>
        {ARBOLES_PLAZA.map((q, i) => (
          <group key={i} position={q}>
            <Arbol p={[0, 0, 0]} s={1.05} c={i % 2 ? "#15803d" : "#166534"} />
          </group>
        ))}
      </group>
      <mesh ref={sol} position={[1.5, 3.4, -1.6]} geometry={ESFERA} scale={0.35}>
        <meshBasicMaterial color="#fde047" toneMapped={false} />
      </mesh>
      <Holograma visible={propuesto && !planeado} color={color} radio={2.1} alto={2.6} />
    </group>
  );
}

const ZONAS: Record<ZonaId, (p: ZonaProps) => ReactNode> = {
  parque: ZonaParque,
  huerto: ZonaHuerto,
  biblioteca: ZonaBiblioteca,
  cancha: ZonaCancha,
  plaza: ZonaPlaza,
};

function Vecinos({ zonaIdx, propuesto }: { zonaIdx: number; propuesto: boolean }) {
  const g = useRef<THREE.Group>(null);
  const id = PROYECTOS[zonaIdx]?.id ?? "plaza";
  const [cx, , cz] = CENTROS[id];
  // Los vecinos se paran del lado de la calle que mira a la plaza.
  const destino: Pt = id === "plaza" ? [0.9, 0, 2.55] : [cx - Math.sign(cx) * 2.55, 0, cz - Math.sign(cz) * 0.2];
  useFrame(({ clock }, dt) => {
    const r = g.current;
    if (!r) return;
    const k = suave(dt, 0.05);
    const dx = destino[0] - r.position.x;
    const dz = destino[2] - r.position.z;
    r.position.x += dx * k;
    r.position.z += dz * k;
    r.position.y = Math.min(0.4, Math.hypot(dx, dz)) * Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.3;
  });
  return (
    <group ref={g} position={destino}>
      {(
        [
          ["#f472b6", true, -0.35, 0.1],
          ["#22c55e", false, 0.05, -0.25],
          ["#eab308", false, 0.4, 0.15],
          ["#7c3aed", true, 0.0, 0.45],
        ] as [string, boolean, number, number][]
      ).map(([c, coleta, x, z], i) => (
        <group key={i} position={[x, 0.1, z]} scale={0.95} rotation={[0, (i - 1.5) * 0.3, 0]}>
          <Figura camisa={c} coleta={coleta} canas={i === 1} />
        </group>
      ))}
      {propuesto && (
        <Etiqueta pos={[0, 1.65, 0.1]} df={12} fs={11} col="#fbbf24aa">
          <i className="fa-solid fa-hand" style={{ color: "#fbbf24" }} />
          <i className="fa-solid fa-hand" style={{ color: "#fbbf24" }} />
          <i className="fa-solid fa-hand" style={{ color: "#fbbf24" }} />
        </Etiqueta>
      )}
    </group>
  );
}

function EscenaComunidad({ zonaIdx, propuestas, planeados, oracionPlan, estadoPlan, errorNonce, modoColor }: Pick<PlanesSceneProps, "zonaIdx" | "propuestas" | "planeados" | "oracionPlan" | "estadoPlan" | "errorNonce" | "modoColor">) {
  const pr = PROYECTOS[zonaIdx] ?? PROYECTOS[0]!;
  const aro = useRef<THREE.Mesh>(null);
  const ultimo = useRef(errorNonce);
  const flash = useRef(0);
  const centro = CENTROS[pr.id];
  useFrame(({ clock }, dt) => {
    if (ultimo.current !== errorNonce) {
      ultimo.current = errorNonce;
      flash.current = 1;
    }
    flash.current = Math.max(0, flash.current - dt * 1.4);
    const a = aro.current;
    if (a) {
      a.position.x += (centro[0] - a.position.x) * suave(dt, 0.12);
      a.position.z += (centro[2] - a.position.z) * suave(dt, 0.12);
      const m = a.material as THREE.MeshStandardMaterial;
      const c = flash.current > 0 ? WARN : planeados.includes(pr.id) ? OK : modoColor;
      m.color.set(c);
      m.emissive.set(c);
      m.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.25 + flash.current;
    }
  });
  const colOracion = estadoPlan === "ok" ? OK : estadoPlan === "mal" ? WARN : pr.color;
  const texto = oracionPlan || (propuestas.includes(pr.id) ? "Now make the plan: who + be going to + what + when + why." : pr.problema);
  return (
    <group position={[0, -1.1, 0]}>
      {/* Tablero y calles */}
      <Caja p={[0, -0.2, 0]} s={[17.2, 0.4, 12]} c="#35573c" rough={1} />
      <Caja p={[0, 0.02, 0]} s={[17.2, 0.06, 1.0]} c="#374151" sombra={false} />
      <Caja p={[0, 0.02, 0]} s={[1.0, 0.06, 12]} c="#374151" sombra={false} />
      {Array.from({ length: 8 }, (_, k) => (
        <Caja key={`h${k}`} p={[-7.6 + k * 2.15, 0.06, 0]} s={[0.8, 0.01, 0.06]} c="#f8fafc" sombra={false} />
      ))}
      {Array.from({ length: 5 }, (_, k) => (
        <Caja key={`v${k}`} p={[0, 0.06, -5.0 + k * 2.5]} s={[0.06, 0.01, 0.8]} c="#f8fafc" sombra={false} />
      ))}
      {PROYECTOS.map((x, i) => {
        const Z = ZONAS[x.id];
        const [cx, , cz] = CENTROS[x.id];
        return (
          <group key={x.id} position={[cx, 0, cz]}>
            <Z planeado={planeados.includes(x.id)} propuesto={propuestas.includes(x.id)} activa={i === zonaIdx} color={x.color} />
            <Etiqueta pos={x.id === "huerto" ? [-2.55, 0.9, 0.2] : [0, x.id === "plaza" ? 2.7 : 2.35, x.id === "biblioteca" ? -0.4 : 0]} df={13} fs={i === zonaIdx ? 13 : 11} col={`${planeados.includes(x.id) ? OK : x.color}aa`}>
              <i className={`fa-solid ${planeados.includes(x.id) ? "fa-circle-check" : x.icono}`} style={{ color: planeados.includes(x.id) ? OK : x.color }} />
              {x.lugar}
            </Etiqueta>
          </group>
        );
      })}
      <mesh ref={aro} position={[centro[0], 0.2, centro[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.75, 2.92, 64]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Vecinos zonaIdx={zonaIdx} propuesto={propuestas.includes(pr.id) && !planeados.includes(pr.id)} />
      <Html position={[0, 1.6, -6.6]} center distanceFactor={13} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            maxWidth: 640,
            width: "max-content",
            padding: "10px 18px",
            borderRadius: 14,
            background: "rgba(4,10,22,0.92)",
            border: `2px solid ${colOracion}`,
            color: "#fff",
            fontSize: 17,
            fontWeight: 900,
            lineHeight: 1.35,
            textAlign: "center",
            boxShadow: `0 0 28px -8px ${colOracion}`,
          }}
        >
          <i className={`fa-solid ${estadoPlan === "ok" ? "fa-circle-check" : pr.icono}`} style={{ color: estadoPlan === "ok" ? OK : pr.color, marginRight: 8 }} />
          {texto}
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MY GOALS — el camino de las metas
 * ════════════════════════════════════════════════════════════════════════ */

/** Plataformas: la de salida (Today) y las cinco fechas. [x, z, alto]. */
const PLATAFORMAS: [number, number, number][] = [
  [-7.0, 1.7, 0.25],
  [-4.4, 0.5, 0.55],
  [-1.6, 1.5, 0.95],
  [1.2, 0.3, 1.45],
  [4.0, 1.3, 2.05],
  [6.8, -0.1, 2.75],
];

const PIEDRAS = (() => {
  const xs: Pt[] = [];
  for (let i = 0; i < PLATAFORMAS.length - 1; i++) {
    const [x0, z0, h0] = PLATAFORMAS[i]!;
    const [x1, z1, h1] = PLATAFORMAS[i + 1]!;
    for (let k = 1; k <= 3; k++) {
      const f = k / 4;
      xs.push([x0 + (x1 - x0) * f, h0 + (h1 - h0) * f - 0.05, z0 + (z1 - z0) * f]);
    }
  }
  return xs;
})();

function Hito3D({ i, meta, actual, estadoMeta, modoColor }: { i: number; meta: string | null; actual: boolean; estadoMeta: "ok" | "mal" | null; modoColor: string }) {
  const h = HITOS[i]!;
  const [x, z, alto] = PLATAFORMAS[i + 1]!;
  const bandera = useRef<THREE.Group>(null);
  const flecha = useRef<THREE.Group>(null);
  const tela = useRef<THREE.Mesh>(null);
  const p = useProgreso(meta !== null, 0.05);
  useFrame(({ clock }) => {
    const k = p.current;
    const t = clock.elapsedTime;
    if (bandera.current) bandera.current.position.y = 0.35 + k * 1.15;
    if (tela.current) tela.current.rotation.y = Math.sin(t * 3 + i) * 0.2;
    if (flecha.current) {
      flecha.current.visible = actual && meta === null;
      flecha.current.position.y = alto + 3.1 + Math.sin(t * 3) * 0.12;
    }
  });
  const colBorde = meta ? OK : actual ? (estadoMeta === "mal" ? WARN : modoColor) : `${h.color}88`;
  return (
    <group>
      <mesh position={[x, alto / 2, z]} geometry={CILINDRO} scale={[1.15, alto, 1.15]} castShadow receiveShadow>
        <meshStandardMaterial color={i % 2 ? "#57534e" : "#78716c"} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[x, alto + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.12, 40]} />
        <meshStandardMaterial color={meta ? OK : h.color} emissive={meta ? OK : h.color} emissiveIntensity={actual ? 0.9 : 0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Página de calendario */}
      <group position={[x - 0.25, alto, z - 0.35]} rotation={[-0.1, 0, 0]}>
        <Caja p={[0, 0.72, 0]} s={[1.4, 1.3, 0.08]} c="#f8fafc" />
        <Caja p={[0, 1.3, 0.01]} s={[1.4, 0.2, 0.1]} c={h.color} />
      </group>
      <Html position={[x - 0.25, alto + 0.66, z - 0.26]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 66, textAlign: "center", color: "#0f172a", fontWeight: 900, lineHeight: 1.05 }}>
          <i className={`fa-solid ${meta ? "fa-circle-check" : h.icono}`} style={{ fontSize: 15, color: meta ? "#059669" : h.color }} />
          <div style={{ fontSize: 10, marginTop: 3 }}>{h.tiempo}</div>
        </div>
      </Html>
      {/* Mástil y bandera */}
      <Caja p={[x + 0.55, alto + 0.9, z - 0.2]} s={[0.05, 1.8, 0.05]} c="#cbd5e1" metal={0.7} rough={0.3} />
      <group ref={bandera} position={[x + 0.55, alto + 0.35, z - 0.2]}>
        <mesh ref={tela} position={[0.28, 0.12, 0]}>
          <boxGeometry args={[0.55, 0.34, 0.02]} />
          <meshStandardMaterial color={meta ? h.color : "#64748b"} emissive={meta ? h.color : "#000000"} emissiveIntensity={meta ? 0.4 : 0} />
        </mesh>
      </group>
      <group ref={flecha} position={[x, alto + 3.1, z]}>
        <mesh rotation={[Math.PI, 0, 0]} geometry={CONO} scale={[0.18, 0.36, 0.18]}>
          <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.9} />
        </mesh>
      </group>
      {actual && (
        <Html position={[x, alto + 2.45, z]} center distanceFactor={10} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: meta ? 250 : "max-content",
              maxWidth: 250,
              padding: "8px 12px",
              borderRadius: 12,
              background: "rgba(4,10,22,0.92)",
              border: `2px solid ${colBorde}`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.35,
              textAlign: "center",
              boxShadow: `0 0 24px -8px ${colBorde}`,
            }}
          >
            {meta ? (
              <>
                <i className="fa-solid fa-flag" style={{ color: h.color, marginRight: 6 }} />
                {meta}
              </>
            ) : (
              <span style={{ whiteSpace: "nowrap" }}>
                <i className="fa-solid fa-pen" style={{ color: colBorde, marginRight: 6 }} />
                {h.tiempo} · {ESTRUCTURAS[h.estructura].molde}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function Caminante({ metas }: { metas: (string | null)[] }) {
  const g = useRef<THREE.Group>(null);
  let ultimo = 0;
  metas.forEach((m, i) => {
    if (m !== null) ultimo = Math.max(ultimo, i + 1);
  });
  const [tx, tz, th] = PLATAFORMAS[ultimo]!;
  useFrame(({ clock }, dt) => {
    const r = g.current;
    if (!r) return;
    const k = suave(dt, 0.035);
    const dx = tx + 0.6 - r.position.x;
    const dz = tz + 0.45 - r.position.z;
    r.position.x += dx * k;
    r.position.z += dz * k;
    const dist = Math.hypot(dx, dz);
    const salto = Math.min(dist, 1) * Math.abs(Math.sin(clock.elapsedTime * 7)) * 0.4;
    r.position.y += (th + salto - r.position.y) * suave(dt, 0.2);
    r.rotation.y = dist > 0.2 ? Math.atan2(dx, dz) : r.rotation.y + (0.35 - r.rotation.y) * suave(dt, 0.05);
  });
  const [x0, z0, h0] = PLATAFORMAS[0]!;
  return (
    <group ref={g} position={[x0 + 0.6, h0, z0 + 0.45]}>
      <group scale={1.15}>
        <Figura camisa="#a78bfa" coleta />
        <Caja p={[0, 0.52, -0.22]} s={[0.28, 0.32, 0.14]} c="#1d4ed8" />
      </group>
      <Etiqueta pos={[0, -0.12, 0.5]} df={11} fs={10} col="#a78bfaaa">
        You
      </Etiqueta>
    </group>
  );
}

function EscenaMetas({ hitoIdx, metas, estadoMeta, errorNonce, modoColor }: Pick<PlanesSceneProps, "hitoIdx" | "metas" | "estadoMeta" | "errorNonce" | "modoColor">) {
  const piedras = useRef<THREE.InstancedMesh>(null);
  const estrella = useRef<THREE.Mesh>(null);
  const luz = useRef<THREE.PointLight>(null);
  const ultimo = useRef(errorNonce);
  const flash = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const completas = metas.filter((m) => m !== null).length;
  useFrame(({ clock }, dt) => {
    const p = piedras.current;
    if (p && !p.userData.listo) {
      PIEDRAS.forEach((q, i) => {
        obj.position.set(q[0], q[1], q[2]);
        obj.rotation.set(0, i * 0.7, 0);
        obj.scale.set(0.42, 0.12, 0.34);
        obj.updateMatrix();
        p.setMatrixAt(i, obj.matrix);
      });
      p.instanceMatrix.needsUpdate = true;
      p.userData.listo = true;
    }
    if (estrella.current) {
      estrella.current.rotation.y = clock.elapsedTime * 1.2;
      const m = estrella.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = completas === HITOS.length ? 2.2 : 0.3;
    }
    if (ultimo.current !== errorNonce) {
      ultimo.current = errorNonce;
      flash.current = 1;
    }
    flash.current = Math.max(0, flash.current - dt * 1.5);
    if (luz.current) {
      const [x, z, h] = PLATAFORMAS[hitoIdx + 1]!;
      luz.current.position.set(x, h + 1.5, z + 1);
      luz.current.intensity = flash.current * 12;
    }
  });
  const [sx, sz, sh] = PLATAFORMAS[PLATAFORMAS.length - 1]!;
  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 26]} />
        <meshStandardMaterial color="#2f4a3a" roughness={1} />
      </mesh>
      {(
        [
          [-9, -9, 6, 4],
          [-3, -11, 7, 5.5],
          [4, -10, 6, 4.5],
          [10, -9, 6.5, 6.5],
        ] as [number, number, number, number][]
      ).map(([x, z, r, h], k) => (
        <mesh key={k} position={[x, h / 2 - 0.3, z]} scale={[r, h, r * 0.55]}>
          <coneGeometry args={[1, 1, 7]} />
          <meshStandardMaterial color={k % 2 ? "#3b3561" : "#463f73"} roughness={1} flatShading />
        </mesh>
      ))}
      {/* Salida: Today */}
      <mesh position={[PLATAFORMAS[0]![0], PLATAFORMAS[0]![2] / 2, PLATAFORMAS[0]![1]]} geometry={CILINDRO} scale={[1.15, PLATAFORMAS[0]![2], 1.15]} receiveShadow castShadow>
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
      <Etiqueta pos={[PLATAFORMAS[0]![0], PLATAFORMAS[0]![2] + 2.0, PLATAFORMAS[0]![1] - 0.4]} df={11} fs={12} col="#e2e8f0aa">
        <i className="fa-solid fa-location-dot" style={{ color: "#e2e8f0" }} />
        Today
      </Etiqueta>
      <instancedMesh ref={piedras} args={[undefined, undefined, PIEDRAS.length]} frustumCulled={false} geometry={CILINDRO} castShadow receiveShadow>
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </instancedMesh>
      {HITOS.map((h, i) => (
        <Hito3D key={h.id} i={i} meta={metas[i] ?? null} actual={i === hitoIdx} estadoMeta={estadoMeta} modoColor={modoColor} />
      ))}
      {/* Cima con estrella */}
      <mesh position={[sx + 1.6, sh + 1.3, sz - 1.8]} scale={[1.6, 2.6, 1.6]} castShadow>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial color="#6b7280" roughness={1} flatShading />
      </mesh>
      <mesh ref={estrella} position={[sx + 1.6, sh + 3.05, sz - 1.8]} scale={0.32}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <pointLight ref={luz} color={WARN} intensity={0} distance={5} />
      <Caminante metas={metas} />
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function PlanesFuturoInglesScene(p: PlanesSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; fondo: string } => {
    if (vista === "situaciones") return { pos: [0, 3.7, 12.9], target: [0, 0.8, 4.6], fondo: "#0b1b2e" };
    if (vista === "comunidad") return { pos: [0, 12.6, 13.2], target: [0, -0.6, 0.4], fondo: "#07142a" };
    return { pos: [0, 5.2, 15.4], target: [0, 1.2, 0.2], fondo: "#1a1433" };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[cam.fondo]} />
      <fog attach="fog" args={[cam.fondo, 26, 52]} />
      <hemisphereLight args={["#bfdbfe", "#1f2937", 0.45]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 11, 8]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <pointLight position={[-7, 4, 6]} intensity={0.6} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.3} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "situaciones" && (
        <EscenaSituaciones sitIdx={p.sitIdx} sitResueltas={p.sitResueltas} frase={p.frase} fraseEstado={p.fraseEstado} hablante={p.hablante} errorNonce={p.errorNonce} modoColor={modoColor} />
      )}
      {vista === "comunidad" && (
        <EscenaComunidad zonaIdx={p.zonaIdx} propuestas={p.propuestas} planeados={p.planeados} oracionPlan={p.oracionPlan} estadoPlan={p.estadoPlan} errorNonce={p.errorNonce} modoColor={modoColor} />
      )}
      {vista === "metas" && <EscenaMetas hitoIdx={p.hitoIdx} metas={p.metas} estadoMeta={p.estadoMeta} errorNonce={p.errorNonce} modoColor={modoColor} />}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI * 0.46}
        minPolarAngle={Math.PI * 0.1}
        minAzimuthAngle={-Math.PI * 0.35}
        maxAzimuthAngle={Math.PI * 0.35}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.28} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
