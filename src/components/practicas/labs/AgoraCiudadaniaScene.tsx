"use client";

/**
 * Escena 3D del laboratorio "Ágora: ciudadanía y democracia" (CS-I-P02).
 * Tres vistas:
 *
 *  - agora: una plaza cercada con su estoa, su tribuna de 10 lugares y una
 *    multitud diversa de 40 personas. Al abrir el ágora de una época, quienes
 *    tenían derechos políticos cruzan la puerta y ocupan la plaza; las personas
 *    excluidas se quedan fuera y se apagan. La arquitectura del centro cambia
 *    con la época (bema ateniense, mesa electoral, casilla con urnas) y quienes
 *    viven en el extranjero esperan en la otra orilla.
 *  - asamblea: una colonia con seis casas (una por grupo de vecinos), el salón
 *    de la asamblea (en primer piso con escaleras o en planta baja con rampa) y
 *    la zona del problema, que se transforma en la opción ganadora.
 *  - debate: el podio con dos atriles, un pizarrón con la intervención, tres
 *    urnas (hecho, valor, falacia) y el público.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Condicion,
  type Escenario,
  type Ganador,
  type Intervencion,
  type Postura,
  type ResultadoAsamblea,
  type TipoAfirmacion,
  EPOCAS,
  CASOS,
  N_TRIBUNA,
  COLOR_OPCION,
  TIPOS,
  AFIRMACIONES,
  ARGUMENTOS,
  PROPUESTAS,
  HUECOS_DEBATE,
  REPLICA_FALAZ,
  porcentajeEntra,
  pct,
} from "./agora-ciudadania-data";

export type VistaAgora = "agora" | "asamblea" | "debate";

export interface Lanzamiento {
  id: string;
  tipo: TipoAfirmacion;
  ok: boolean;
  nonce: number;
}

export interface AgoraSceneProps {
  vista: VistaAgora;
  modoColor: string;
  resetNonce: number;
  // Ágora
  epocaIdx: number;
  revelada: boolean;
  prediccion: Record<string, boolean>;
  // Asamblea
  casoId: string;
  condiciones: Condicion[];
  celebrada: number;
  resultado: ResultadoAsamblea | null;
  // Debate
  paso: "clasificar" | "intervencion";
  afirmacionId: string | null;
  lanzamiento: Lanzamiento | null;
  intervencion: Intervencion;
  pronunciada: number;
  revisionOk: boolean[] | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";
const PIELES = ["#f1c9a5", "#d9a47e", "#b98260", "#8d5a3b", "#e8b98f", "#a86f4c"];

/* ── Geometrías compartidas ───────────────────────────────────────────── */
const GEO_CUERPO = new THREE.CapsuleGeometry(0.17, 0.42, 4, 10);
const GEO_CABEZA = new THREE.SphereGeometry(0.15, 14, 10);
const GEO_CARTEL = new THREE.BoxGeometry(0.34, 0.24, 0.03);
const GEO_COLUMNA = new THREE.CylinderGeometry(0.16, 0.19, 2.6, 16);
const GEO_PILAR = new THREE.BoxGeometry(0.34, 2.4, 0.34);
const GEO_ASIENTO = new THREE.BoxGeometry(0.34, 0.24, 0.34);
const GEO_SOBRE = new THREE.BoxGeometry(0.22, 0.02, 0.15);
const GEO_DISCO = new THREE.CircleGeometry(0.28, 20);

function Etiqueta({ pos, children, df = 10, col, fs = 12, ancho }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; ancho?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: ancho ? "normal" : "nowrap",
          width: ancho,
          textAlign: "center",
          lineHeight: 1.2,
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Persona estilizada suelta (para la tribuna, el podio y los intérpretes). */
function Persona({ pos, color, escala = 1, piel = PIELES[0]! }: { pos: Pt; color: string; escala?: number; piel?: string }) {
  return (
    <group position={pos} scale={escala}>
      <mesh geometry={GEO_CUERPO} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh geometry={GEO_CABEZA} position={[0, 0.98, 0]} castShadow>
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Multitud animada (instanciada) ───────────────────────────────────── */

interface PersonaAnim {
  desde: Pt;
  via: Pt | null;
  hasta: Pt;
  color: string;
  escala: number;
  retraso: number;
  atenua: boolean;
  cartel: string | null;
}

const DUR_VIA = 2.3;
const DUR_DIRECTO = 1.5;

function Multitud({ personas, activo }: { personas: PersonaAnim[]; activo: boolean }) {
  const cuerpos = useRef<THREE.InstancedMesh>(null);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  const carteles = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const gris = useMemo(() => new THREE.Color("#2f3a4c"), []);
  const colores = useMemo(() => personas.map((p) => new THREE.Color(p.color)), [personas]);
  const pieles = useMemo(() => personas.map((_, i) => new THREE.Color(PIELES[(i * 7 + 3) % PIELES.length]!)), [personas]);
  const colCartel = useMemo(() => personas.map((p) => new THREE.Color(p.cartel ?? "#ffffff")), [personas]);
  const n = personas.length;

  useFrame((_, dt) => {
    t.current = activo ? t.current + Math.min(dt, 0.1) : 0;
    const cu = cuerpos.current;
    const ca = cabezas.current;
    const ct = carteles.current;
    if (!cu || !ca || !ct) return;
    personas.forEach((p, i) => {
      const dur = p.via ? DUR_VIA : DUR_DIRECTO;
      const quieto = p.desde === p.hasta;
      const k = quieto ? 1 : Math.min(1, Math.max(0, (t.current - p.retraso) / dur));
      const e = k * k * (3 - 2 * k);
      let x: number;
      let y: number;
      let z: number;
      if (quieto) {
        [x, y, z] = p.hasta;
      } else if (p.via) {
        const a = e < 0.5 ? p.desde : p.via;
        const b = e < 0.5 ? p.via : p.hasta;
        const f = e < 0.5 ? e * 2 : (e - 0.5) * 2;
        x = a[0] + (b[0] - a[0]) * f;
        y = a[1] + (b[1] - a[1]) * f;
        z = a[2] + (b[2] - a[2]) * f;
      } else {
        x = p.desde[0] + (p.hasta[0] - p.desde[0]) * e;
        y = p.desde[1] + (p.hasta[1] - p.desde[1]) * e;
        z = p.desde[2] + (p.hasta[2] - p.desde[2]) * e;
      }
      const paso = !quieto && k > 0 && k < 1 ? Math.abs(Math.sin(t.current * 11 + i)) * 0.07 : 0;
      const s = p.escala;
      obj.rotation.set(0, 0, 0);
      obj.scale.setScalar(s);
      obj.position.set(x, y + 0.42 * s + paso, z);
      obj.updateMatrix();
      cu.setMatrixAt(i, obj.matrix);
      obj.position.set(x, y + 0.98 * s + paso, z);
      obj.updateMatrix();
      ca.setMatrixAt(i, obj.matrix);
      const apaga = p.atenua ? Math.min(1, t.current / 0.8) * 0.72 : 0;
      col.copy(colores[i]!).lerp(gris, apaga);
      cu.setColorAt(i, col);
      col.copy(pieles[i]!).lerp(gris, apaga * 0.6);
      ca.setColorAt(i, col);
      // Cartel de voto: aparece al llegar.
      const llega = quieto ? 0.4 : p.retraso + dur + 0.25;
      const c = p.cartel && activo ? Math.min(1, Math.max(0, (t.current - llega) / 0.35)) : 0;
      obj.scale.setScalar(Math.max(0.0001, c));
      obj.position.set(x, y + 1.42 * s + Math.sin(t.current * 5 + i) * 0.03 * c, z);
      obj.updateMatrix();
      ct.setMatrixAt(i, obj.matrix);
      ct.setColorAt(i, colCartel[i]!);
    });
    cu.instanceMatrix.needsUpdate = true;
    ca.instanceMatrix.needsUpdate = true;
    ct.instanceMatrix.needsUpdate = true;
    if (cu.instanceColor) cu.instanceColor.needsUpdate = true;
    if (ca.instanceColor) ca.instanceColor.needsUpdate = true;
    if (ct.instanceColor) ct.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={cuerpos} args={[GEO_CUERPO, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[GEO_CABEZA, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={carteles} args={[GEO_CARTEL, undefined, n]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.4} emissive="#ffffff" emissiveIntensity={0.12} />
      </instancedMesh>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL ÁGORA
 * ════════════════════════════════════════════════════════════════════════ */

const R_PLAZA = 4.6;
const R_MURO = 4.8;
const PUERTA_ANG = 0.3;
const PUERTA: Pt = [0, 0.02, R_MURO + 0.3];
const ISLA: Pt = [-7.6, 0, -3.6];

/** Lugares dentro de la plaza (patrón de girasol en la mitad delantera). */
const LUGARES_DENTRO: Pt[] = (() => {
  const xs: Pt[] = [];
  for (let k = 0; xs.length < 40 && k < 400; k++) {
    const r = 4.1 * Math.sqrt((k + 0.5) / 70);
    const a = k * 2.39996;
    const x = r * Math.sin(a);
    const z = r * Math.cos(a);
    if (z < -1.7 || Math.hypot(x, z) < 1.35 || r > 4.05) continue;
    xs.push([x, 0.06, z]);
  }
  // De la puerta hacia dentro: los primeros en entrar ocupan lo más cercano.
  return xs.sort((a, b) => b[2] - a[2]);
})();

/** Columnas radiales de espera fuera del muro, a los lados de la puerta (lo más lejos de ella primero). */
const RADIOS_FUERA = [5.75, 6.45, 7.15];
const COLUMNAS_FUERA: number[] = (() => {
  const paso = 0.8 / 6.45;
  const xs: number[] = [];
  for (let a = 1.42; a >= 0.4; a -= paso) xs.push(a, -a);
  return xs;
})();

function lugarFuera(i: number, total: number): Pt {
  const cols = Math.ceil(total / RADIOS_FUERA.length);
  const elegidas = COLUMNAS_FUERA.slice(0, cols).sort((a, b) => a - b);
  const a = elegidas[Math.floor(i / RADIOS_FUERA.length)] ?? 0;
  const r = RADIOS_FUERA[i % RADIOS_FUERA.length]!;
  return [r * Math.sin(a), 0, r * Math.cos(a)];
}

function lugarIsla(i: number): Pt {
  return [ISLA[0] + ((i % 2) - 0.5) * 0.6, 0.3, ISLA[2] + (Math.floor(i / 2) - 0.5) * 0.6];
}

const ESCALA_FIGURA = { adulto: 1, adulta: 0.95, joven: 0.88, menor: 0.66 } as const;

function Estoa({ escenario, modoColor }: { escenario: Escenario; modoColor: string }) {
  const n = escenario === "casilla" ? 7 : 9;
  const angs = Array.from({ length: n }, (_, i) => Math.PI - 1.05 + (2.1 * i) / (n - 1));
  if (escenario === "atenas") {
    return (
      <group>
        {angs.map((a, i) => (
          <group key={i} position={[Math.sin(a) * 5.5, 0, Math.cos(a) * 5.5]}>
            <mesh geometry={GEO_COLUMNA} position={[0, 1.3, 0]} castShadow>
              <meshStandardMaterial color="#ede4cf" roughness={0.6} />
            </mesh>
            <mesh position={[0, 2.66, 0]}>
              <boxGeometry args={[0.5, 0.14, 0.5]} />
              <meshStandardMaterial color="#e2d6ba" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {angs.slice(0, -1).map((a, i) => {
          const b = angs[i + 1]!;
          const m = (a + b) / 2;
          const largo = 2 * 5.5 * Math.sin((b - a) / 2) + 0.5;
          return (
            <mesh key={i} position={[Math.sin(m) * 5.5, 2.86, Math.cos(m) * 5.5]} rotation={[0, m, 0]}>
              <boxGeometry args={[largo, 0.28, 0.6]} />
              <meshStandardMaterial color="#d9ccae" roughness={0.65} />
            </mesh>
          );
        })}
      </group>
    );
  }
  if (escenario === "cabildo") {
    return (
      <group>
        {angs.map((a, i) => (
          <mesh key={i} geometry={GEO_PILAR} position={[Math.sin(a) * 5.5, 1.2, Math.cos(a) * 5.5]} rotation={[0, a, 0]} castShadow>
            <meshStandardMaterial color="#b7794b" roughness={0.75} />
          </mesh>
        ))}
        {angs.slice(0, -1).map((a, i) => {
          const b = angs[i + 1]!;
          const m = (a + b) / 2;
          const media = 5.5 * Math.sin((b - a) / 2);
          return (
            <group key={i} position={[Math.sin(m) * 5.5, 2.4, Math.cos(m) * 5.5]} rotation={[0, m, 0]}>
              <mesh rotation={[0, 0, 0]}>
                <torusGeometry args={[media, 0.12, 8, 20, Math.PI]} />
                <meshStandardMaterial color="#c98a58" roughness={0.75} />
              </mesh>
              <mesh position={[0, media + 0.2, 0]}>
                <boxGeometry args={[media * 2 + 0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#a86a3f" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }
  return (
    <group>
      {angs.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 5.6, 1.1, Math.cos(a) * 5.6]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.2, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {angs.slice(0, -1).map((a, i) => {
        const b = angs[i + 1]!;
        const m = (a + b) / 2;
        const largo = 2 * 5.6 * Math.sin((b - a) / 2);
        return (
          <mesh key={i} position={[Math.sin(m) * 5.6, 2.25, Math.cos(m) * 5.6]} rotation={[0, m, 0]}>
            <boxGeometry args={[largo + 0.1, 0.12, 1.1]} />
            <meshStandardMaterial color={i % 2 ? "#334155" : modoColor} roughness={0.5} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

function Centro({ escenario }: { escenario: Escenario }) {
  if (escenario === "atenas") {
    return (
      <group position={[0, 0, -0.2]}>
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.36, 1.1]} />
          <meshStandardMaterial color="#cfc2a3" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, -0.15]} castShadow>
          <boxGeometry args={[1.0, 0.3, 0.7]} />
          <meshStandardMaterial color="#d8ccb0" roughness={0.8} />
        </mesh>
        <Persona pos={[0, 0.65, -0.15]} color="#60a5fa" escala={0.9} />
      </group>
    );
  }
  if (escenario === "cabildo") {
    return (
      <group position={[0, 0, -0.2]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 0.9]} />
          <meshStandardMaterial color="#6b4226" roughness={0.6} />
        </mesh>
        {[-0.8, 0.8].map((x) =>
          [-0.35, 0.35].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.2, z]}>
              <boxGeometry args={[0.07, 0.4, 0.07]} />
              <meshStandardMaterial color="#4a2d19" />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.66, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.87, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.04]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    );
  }
  return (
    <group position={[0, 0, -0.2]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.0, 0.07, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.06, 0.4, 0.7]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.66, 0]}>
          <boxGeometry args={[0.5, 0.46, 0.46]} />
          <meshPhysicalMaterial color="#e0f2fe" transmission={0.6} roughness={0.1} thickness={0.2} transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Mampara */}
      <mesh position={[1.55, 0.75, 0.2]} rotation={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1.5, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Sobres({ activo }: { activo: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = activo ? t.current + dt : 0;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const f = ((t.current * 0.45 + i / 3) % 1 + 1) % 1;
      m.visible = activo;
      const x = ISLA[0] + (0 - ISLA[0]) * f;
      const z = ISLA[2] + (-0.2 - ISLA[2]) * f;
      m.position.set(x, 0.9 + Math.sin(f * Math.PI) * 2.4, z);
      m.rotation.set(0, f * 6, Math.sin(f * 9) * 0.3);
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={GEO_SOBRE}
          visible={false}
        >
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </>
  );
}

function EscenaAgora({ epocaIdx, revelada, prediccion, modoColor }: { epocaIdx: number; revelada: boolean; prediccion: Record<string, boolean>; modoColor: string }) {
  const epoca = EPOCAS[epocaIdx] ?? EPOCAS[0]!;
  const esc = epoca.escenario;

  const { personas, grupos } = useMemo(() => {
    const cerca = epoca.grupos.filter((g) => !g.lejos).reduce((a, g) => a + g.n, 0);
    const lista: PersonaAnim[] = [];
    const info: { id: string; etq: string; n: number; entra: boolean; color: string; lejos: boolean; pts: Pt[]; centro: Pt }[] = [];
    let fuera = 0;
    let dentro = 0;
    let isla = 0;
    epoca.grupos.forEach((g) => {
      const pts: Pt[] = [];
      for (let j = 0; j < g.n; j++) {
        const desde = g.lejos ? lugarIsla(isla++) : lugarFuera(fuera++, cerca);
        pts.push(desde);
        const pasa = revelada && g.entra && !g.lejos;
        const hasta = pasa ? LUGARES_DENTRO[dentro % LUGARES_DENTRO.length]! : desde;
        lista.push({ desde, via: pasa ? PUERTA : null, hasta, color: g.color, escala: ESCALA_FIGURA[g.figura], retraso: pasa ? dentro * 0.07 : 0, atenua: revelada && !g.entra, cartel: null });
        if (pasa) dentro++;
      }
      info.push({ id: g.id, etq: g.etq, n: g.n, entra: g.entra, color: g.color, lejos: !!g.lejos, pts, centro: pts[Math.floor((pts.length - 1) / 2)]! });
    });
    return { personas: lista, grupos: info };
  }, [epoca, revelada]);

  const colorPiso = esc === "atenas" ? "#b9ab8a" : esc === "cabildo" ? "#8a6a4e" : "#4b5563";
  const lejosEntra = epoca.grupos.some((g) => g.lejos && g.entra);
  const hayLejos = epoca.grupos.some((g) => g.lejos);
  const porc = porcentajeEntra(epoca);
  const dentroN = epoca.grupos.filter((g) => g.entra).reduce((a, g) => a + g.n, 0);

  return (
    <group position={[0, -1.2, 0]}>
      <mesh position={[0, -0.08, 1]} receiveShadow>
        <cylinderGeometry args={[11, 11, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[R_PLAZA, R_PLAZA, 0.08, 64]} />
        <meshStandardMaterial color={colorPiso} roughness={0.85} />
      </mesh>
      {/* Muro con puerta al frente */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[R_MURO, R_MURO, 0.56, 72, 1, true, PUERTA_ANG, Math.PI * 2 - PUERTA_ANG * 2]} />
        <meshStandardMaterial color={esc === "casilla" ? "#64748b" : "#8b7355"} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[Math.sin(PUERTA_ANG) * R_MURO * s, 0.55, Math.cos(PUERTA_ANG) * R_MURO]} castShadow>
          <boxGeometry args={[0.32, 1.1, 0.32]} />
          <meshStandardMaterial color={modoColor} roughness={0.5} emissive={modoColor} emissiveIntensity={revelada ? 0.35 : 0.08} />
        </mesh>
      ))}

      <Estoa escenario={esc} modoColor={modoColor} />
      <Centro escenario={esc} />

      {/* Tribuna: quién puede ser votado */}
      <mesh position={[0, 0.22, -3.25]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.44, 1.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {Array.from({ length: N_TRIBUNA }, (_, k) => {
        const mujer = (k * epoca.tribunaMujeres) % N_TRIBUNA < epoca.tribunaMujeres;
        const x = -1.98 + k * 0.44;
        return (
          <group key={k}>
            <mesh geometry={GEO_ASIENTO} position={[x, 0.56, -3.35]}>
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
            <Persona pos={[x, 0.5, -3.3]} color={mujer ? "#f472b6" : "#60a5fa"} escala={0.62} piel={PIELES[(k * 5 + 1) % PIELES.length]} />
          </group>
        );
      })}
      <Etiqueta pos={[3.3, 1.25, -3.1]} col="#f472b688" fs={11}>
        <i className="fa-solid fa-chair" style={{ color: "#f472b6" }} />
        Tribuna · {epoca.tribunaMujeres}/{N_TRIBUNA} mujeres
      </Etiqueta>

      {/* Otra orilla: quienes viven en el extranjero */}
      {hayLejos && (
        <group>
          <mesh position={[-6.25, -0.02, -3.4]} rotation={[-Math.PI / 2, 0, 0.5]}>
            <planeGeometry args={[0.8, 4.4]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1e40af" emissiveIntensity={0.35} roughness={0.2} />
          </mesh>
          <mesh position={[ISLA[0], 0.12, ISLA[2]]} receiveShadow>
            <cylinderGeometry args={[1.05, 1.15, 0.26, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <Sobres activo={revelada && lejosEntra} />
        </group>
      )}

      {/* Discos de predicción bajo cada persona de cada grupo */}
      {grupos.map((g) => {
        const pred = prediccion[g.id];
        const color = revelada ? (pred === g.entra ? OK : NO) : pred === undefined ? "#475569" : pred ? "#22c55e" : "#ef4444";
        if (revelada && g.entra && !g.lejos) return null;
        return g.pts.map((q, j) => (
          <mesh key={`${g.id}-${j}`} geometry={GEO_DISCO} position={[q[0], g.lejos ? 0.27 : 0.015, q[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color={color} transparent opacity={revelada ? 0.5 : pred === undefined ? 0.25 : 0.55} toneMapped={false} />
          </mesh>
        ));
      })}

      <Multitud key={`${epoca.id}-${revelada}`} personas={personas} activo={revelada} />

      {/* Etiquetas de grupos: todas antes de abrir; después, solo las de quienes quedan fuera */}
      {grupos.map((g, i) =>
        !revelada || !g.entra || g.lejos ? (
          <Etiqueta key={g.id} pos={[g.centro[0], g.lejos ? 1.9 : 1.7 + (i % 3) * 0.62, g.centro[2]]} col={`${g.color}aa`} fs={10} ancho={112}>
            {revelada && <i className={`fa-solid ${g.entra ? "fa-check" : "fa-xmark"}`} style={{ color: g.entra ? OK : NO }} />}
            <span>
              {g.etq} · {g.n}
            </span>
          </Etiqueta>
        ) : null,
      )}

      <Etiqueta pos={[0, 2.25, -4.4]} df={9} col={`${modoColor}aa`} fs={15}>
        <i className="fa-solid fa-landmark-dome" style={{ color: modoColor }} />
        {epoca.titulo}
      </Etiqueta>
      {revelada && (
        <Etiqueta pos={[-2.3, 1.2, 1.2]} df={9} col={`${OK}aa`} fs={13}>
          <i className="fa-solid fa-people-group" style={{ color: OK }} />
          Dentro: {dentroN} de 40 · {pct(porc)}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. ASAMBLEA VECINAL
 * ════════════════════════════════════════════════════════════════════════ */

const CASAS: Pt[] = [
  [-6.3, 0, -2.4],
  [-6.3, 0, 0.8],
  [-6.3, 0, 4.0],
  [6.3, 0, -2.4],
  [6.3, 0, 0.8],
  [6.3, 0, 4.0],
];
const SALON_Z = -4.6;

function lugarCasa(casa: number, j: number): Pt {
  const c = CASAS[casa]!;
  const lado = Math.sign(c[0]);
  const col = j % 3;
  const fila = Math.floor(j / 3);
  return [c[0] - lado * (1.7 + col * 0.52), 0, c[2] - 0.55 + fila * 0.55];
}

function lugarSalon(i: number, alto: number): Pt {
  const col = i % 10;
  const fila = Math.floor(i / 10);
  return [-2.35 + col * 0.52, alto, SALON_Z - 0.75 + fila * 0.5];
}

function Casa({ pos, color }: { pos: Pt; color: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.3, 1.6]} />
        <meshStandardMaterial color="#e7dcc8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.3, 0.7, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[-Math.sign(pos[0]) * 0.81, 0.45, 0]}>
        <boxGeometry args={[0.02, 0.9, 0.5]} />
        <meshStandardMaterial color="#5b3a1e" />
      </mesh>
      <mesh position={[-Math.sign(pos[0]) * 0.81, 0.85, 0.5]}>
        <boxGeometry args={[0.02, 0.35, 0.35]} />
        <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/** Crece al aparecer el resultado. */
function Aparece({ retraso, children }: { retraso: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const k = Math.min(1, Math.max(0, (t.current - retraso) / 0.7));
    const e = 1 - Math.pow(1 - k, 3);
    if (ref.current) {
      ref.current.scale.set(1, Math.max(0.001, e), 1);
      ref.current.visible = k > 0;
    }
  });
  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}

function Cancha({ ancho = 5.2, x = 0 }: { ancho?: number; x?: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[ancho, 0.04, 3.0]} />
        <meshStandardMaterial color="#15803d" roughness={0.85} />
      </mesh>
      {[
        [0, ancho - 0.3, 0.04, 1.3],
        [0, ancho - 0.3, 0.04, -1.3],
        [0, 0.04, 2.6, 0],
      ].map(([px, w, d, pz], i) => (
        <mesh key={i} position={[px!, 0.1, pz!]}>
          <boxGeometry args={[w!, 0.01, d!]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (ancho / 2 - 0.2), 0, 0]}>
          {[-0.45, 0.45].map((z) => (
            <mesh key={z} position={[0, 0.4, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
          <mesh position={[0, 0.76, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.95]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Estacionamiento({ ancho = 5.2, autos = 4, x = 0 }: { ancho?: number; autos?: number; x?: number }) {
  const cols = ["#ef4444", "#e2e8f0", "#3b82f6", "#facc15"];
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[ancho, 0.04, 3.0]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      {Array.from({ length: autos + 1 }, (_, i) => (
        <mesh key={i} position={[-ancho / 2 + 0.3 + (i * (ancho - 0.6)) / autos, 0.1, -0.5]}>
          <boxGeometry args={[0.04, 0.01, 1.6]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {Array.from({ length: autos }, (_, i) => (
        <group key={i} position={[-ancho / 2 + 0.3 + ((i + 0.5) * (ancho - 0.6)) / autos, 0.09, -0.5]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.62, 0.3, 1.2]} />
            <meshStandardMaterial color={cols[i % 4]} roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.44, 0.05]}>
            <boxGeometry args={[0.52, 0.2, 0.62]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Huerto({ ancho = 5.2, x = 0 }: { ancho?: number; x?: number }) {
  const camas = Math.max(2, Math.round(ancho / 1.3));
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[ancho, 0.04, 3.0]} />
        <meshStandardMaterial color="#65a30d" roughness={0.9} />
      </mesh>
      {Array.from({ length: camas }, (_, i) => {
        const cx = -ancho / 2 + ((i + 0.5) * ancho) / camas;
        return (
          <group key={i} position={[cx, 0, -0.5]}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <boxGeometry args={[0.8, 0.18, 1.3]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            {[-0.4, 0, 0.4].map((z) => (
              <mesh key={z} position={[0, 0.34, z]}>
                <sphereGeometry args={[0.16, 10, 8]} />
                <meshStandardMaterial color="#22c55e" roughness={0.7} />
              </mesh>
            ))}
          </group>
        );
      })}
      {[-0.9, 0.9].map((bx) => (
        <mesh key={bx} position={[bx, 0.25, 1.05]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.3]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      ))}
      <group position={[ancho / 2 - 0.5, 0, 1.0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
          <meshStandardMaterial color="#713f12" />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <sphereGeometry args={[0.6, 14, 10]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Puestos({ n = 6, basura = false, sabado = false }: { n?: number; basura?: boolean; sabado?: boolean }) {
  const toldos = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"];
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = -2.2 + (i * 4.4) / (n - 1);
        const z = i % 2 ? 0.8 : -0.8;
        return (
          <group key={i} position={[x, 0.07, z]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.7, 0.5, 0.5]} />
              <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
            </mesh>
            {[-0.32, 0.32].map((px) => (
              <mesh key={px} position={[px, 0.6, 0.22]}>
                <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
                <meshStandardMaterial color="#9ca3af" />
              </mesh>
            ))}
            <mesh position={[0, 1.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.62, 0.3, 4]} />
              <meshStandardMaterial color={sabado ? "#64748b" : toldos[i % toldos.length]} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      {basura &&
        [-2.6, 2.6].map((x) => (
          <mesh key={x} position={[x, 0.3, 1.3]} castShadow>
            <cylinderGeometry args={[0.18, 0.15, 0.46, 12]} />
            <meshStandardMaterial color="#16a34a" roughness={0.5} />
          </mesh>
        ))}
    </group>
  );
}

function Farol({ pos, prendido }: { pos: Pt; prendido: boolean }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={prendido ? "#fef08a" : "#1f2937"} emissive={prendido ? "#fde047" : "#000000"} emissiveIntensity={prendido ? 2.4 : 0} toneMapped={!prendido} />
      </mesh>
      {prendido && (
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.75, 1.8, 20, 1, true]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function Zona({ casoId, ganador, mostrar }: { casoId: string; ganador: Ganador | null; mostrar: boolean }) {
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const R = 3.5;
  let base: ReactNode = null;
  let resultado: ReactNode = null;
  let letrero = "";

  if (caso.id === "terreno") {
    base = (
      <>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[5.4, 0.04, 3.2]} />
          <meshStandardMaterial color="#6b4f35" roughness={1} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-2.2 + ((i * 1.37) % 4.4), 0.18, -1.1 + ((i * 0.83) % 2.2)]}>
            <coneGeometry args={[0.1, 0.28, 5]} />
            <meshStandardMaterial color="#4d7c0f" />
          </mesh>
        ))}
      </>
    );
    if (mostrar && ganador) {
      resultado =
        ganador === "A" ? <Cancha /> : ganador === "B" ? <Estacionamiento /> : ganador === "C" ? <Huerto /> : ganador === "mixta" ? (
          <>
            <Huerto ancho={2.6} x={-1.35} />
            <Cancha ancho={1.9} x={1.2} />
            <Estacionamiento ancho={0.75} autos={1} x={2.55} />
          </>
        ) : null;
    }
    letrero = ganador && mostrar ? (ganador === "nada" ? caso.statusQuo : ganador === "mixta" ? "Propuesta mixta" : caso.opciones[ganador]) : "Terreno baldío";
  } else if (caso.id === "tianguis") {
    base = (
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[6.2, 0.04, 3.2]} />
        <meshStandardMaterial color="#374151" roughness={0.95} />
      </mesh>
    );
    const g = mostrar ? ganador : null;
    resultado = <Puestos basura={g === "B" || g === "mixta"} sabado={g === "C"} />;
    letrero = !g ? "Tianguis: domingo 7:00–17:00" : g === "nada" ? "Sin acuerdo: domingo 7:00–17:00" : g === "mixta" ? "Domingo 7:00–15:00 y carril de emergencia" : g === "A" ? "Domingo 7:00–17:00" : g === "B" ? "Domingo 7:00–14:00 y limpieza" : "Se muda al sábado";
  } else {
    const zonas = [
      { etq: "Avenida", x: -2.1, col: "#4b5563" },
      { etq: "Callejón", x: 0, col: "#334155" },
      { etq: "Andador", x: 2.1, col: "#3f3f46" },
    ];
    const g = mostrar ? ganador : null;
    const prende = (i: number) => (g === "A" && i === 0) || (g === "B" && i === 1) || (g === "C" && i === 2) || (g === "mixta" && i > 0);
    base = (
      <>
        {zonas.map((z, i) => (
          <group key={z.etq} position={[z.x, 0, 0]}>
            <mesh position={[0, 0.04 + i * 0.002, 0]} receiveShadow>
              <boxGeometry args={[1.8, 0.04, 3.4]} />
              <meshStandardMaterial color={z.col} roughness={0.95} />
            </mesh>
            {[-1.1, 0, 1.1].map((fz) => (
              <Farol key={fz} pos={[0.7, 0.06, fz]} prendido={prende(i)} />
            ))}
            <Etiqueta pos={[0, 0.3, 1.95]} fs={10} df={10}>
              {z.etq}
            </Etiqueta>
          </group>
        ))}
      </>
    );
    letrero = !g ? "Tres zonas a oscuras" : g === "nada" ? caso.statusQuo : g === "mixta" ? "Callejón y andador con LED" : `Se ilumina: ${caso.opciones[g]}`;
  }

  return (
    <group position={[0, 0, 0.6]}>
      {base}
      {resultado && (caso.id === "terreno" ? <Aparece retraso={0}>{resultado}</Aparece> : resultado)}
      <Etiqueta pos={[0, 0.3, R / 2 + 0.55]} fs={12} col={mostrar && ganador ? `${COLOR_OPCION[ganador]}cc` : "rgba(255,255,255,0.3)"}>
        <i className={`fa-solid ${caso.icono}`} style={{ color: mostrar && ganador ? COLOR_OPCION[ganador] : "#cbd5e1" }} />
        {letrero}
      </Etiqueta>
    </group>
  );
}

/** Muestra el resultado solo cuando la asamblea termina de votar. */
function ZonaDemorada({ casoId, ganador, segundos }: { casoId: string; ganador: Ganador | null; segundos: number }) {
  const [listo, setListo] = useState(false);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (listo || !ganador) return;
    t.current += dt;
    if (t.current >= segundos) setListo(true);
  });
  return <Zona casoId={casoId} ganador={listo ? ganador : null} mostrar={listo} />;
}

function EscenaAsamblea({ casoId, condiciones, celebrada, resultado, modoColor }: { casoId: string; condiciones: Condicion[]; celebrada: number; resultado: ResultadoAsamblea | null; modoColor: string }) {
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0]!;
  const accesible = condiciones.includes("sede");
  const alto = accesible ? 0.3 : 1.5;
  const activo = !!resultado && celebrada > 0;

  const personas = useMemo(() => {
    const lista: PersonaAnim[] = [];
    let s = 0;
    caso.grupos.forEach((g, gi) => {
      const va = !!resultado && resultado.presentes.includes(g.id);
      const voto = resultado?.votoDe[g.id];
      for (let j = 0; j < g.n; j++) {
        const desde = lugarCasa(gi, j);
        const hasta = va ? lugarSalon(s, alto) : desde;
        lista.push({
          desde,
          via: va ? [0, 0, SALON_Z + 1.9] : null,
          hasta,
          color: g.color,
          escala: g.soloVoz ? 0.82 : 1,
          retraso: va ? s * 0.045 : 0,
          atenua: !!resultado && !va,
          cartel: va ? (voto ? COLOR_OPCION[voto] : "#f8fafc") : null,
        });
        if (va) s++;
      }
    });
    return lista;
  }, [caso, resultado, alto]);

  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[17, 0.1, 13]} />
        <meshStandardMaterial color="#1b2638" roughness={0.95} />
      </mesh>
      {/* Calles */}
      {[-4.35, 4.35].map((x) => (
        <mesh key={x} position={[x, 0.0, 0.5]} receiveShadow>
          <boxGeometry args={[1.1, 0.02, 11]} />
          <meshStandardMaterial color="#2b3547" roughness={0.9} />
        </mesh>
      ))}

      {CASAS.map((c, i) => {
        const g = caso.grupos[i]!;
        const falta = !!resultado && !resultado.presentes.includes(g.id);
        return (
          <group key={g.id}>
            <Casa pos={c} color={g.color} />
            <Etiqueta pos={[c[0], 2.55, c[2]]} col={`${g.color}bb`} fs={10} ancho={118}>
              {resultado && <i className={`fa-solid ${falta ? "fa-user-slash" : "fa-check"}`} style={{ color: falta ? NO : OK }} />}
              <span>
                {g.etq} · {g.n}
                {g.soloVoz ? " (voz)" : ""}
              </span>
            </Etiqueta>
          </group>
        );
      })}

      {/* Salón de la asamblea */}
      <group position={[0, 0, SALON_Z]}>
        <mesh position={[0, alto / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, alto, 2.2]} />
          <meshStandardMaterial color={accesible ? "#475569" : "#57534e"} roughness={0.7} />
        </mesh>
        {[-2.9, 2.9].map((x) =>
          [-1.0, 1.0].map((z) => (
            <mesh key={`${x}${z}`} position={[x, alto + 1.05, z]}>
              <boxGeometry args={[0.12, 2.1, 0.12]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          )),
        )}
        <mesh position={[0, alto + 2.15, 0]} castShadow>
          <boxGeometry args={[6.3, 0.12, 2.5]} />
          <meshStandardMaterial color={modoColor} roughness={0.5} transparent opacity={0.8} />
        </mesh>
        {accesible ? (
          <mesh position={[0, alto / 2 - 0.02, 1.55]} rotation={[0.28, 0, 0]}>
            <boxGeometry args={[1.4, 0.06, 1.05]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.6} />
          </mesh>
        ) : (
          Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[0, (k + 0.5) * (alto / 6), 1.1 + (6 - k) * 0.17]} castShadow>
              <boxGeometry args={[1.2, alto / 6, 0.17]} />
              <meshStandardMaterial color="#78716c" roughness={0.8} />
            </mesh>
          ))
        )}
        {condiciones.includes("lsm") && (
          <group position={[3.4, alto, 0.4]}>
            <Persona pos={[0, 0, 0]} color="#c084fc" piel={PIELES[2]} />
            {[-0.24, 0.24].map((x) => (
              <mesh key={x} position={[x, 0.82, 0.12]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshStandardMaterial color={PIELES[2]} />
              </mesh>
            ))}
          </group>
        )}
        <Etiqueta pos={[0, alto + 2.75, 0]} col={`${modoColor}aa`} fs={11}>
          <i className="fa-solid fa-people-roof" style={{ color: modoColor }} />
          Asamblea · {condiciones.includes("horario") ? "domingo 17:00" : "martes 11:00"} · {accesible ? "planta baja con rampa" : "primer piso"}
        </Etiqueta>
      </group>

      {condiciones.includes("cuidados") && (
        <group position={[-3.7, 0.02, SALON_Z + 1.4]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.3, 1.0]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.9} />
          </mesh>
          {[
            [-0.35, "#ef4444"],
            [0.1, "#3b82f6"],
            [0.4, "#facc15"],
          ].map(([x, c]) => (
            <mesh key={String(x)} position={[x as number, 0.1, 0.15]}>
              <boxGeometry args={[0.18, 0.18, 0.18]} />
              <meshStandardMaterial color={c as string} />
            </mesh>
          ))}
          <Persona pos={[0.2, 0, -0.3]} color="#f9a8d4" escala={0.9} piel={PIELES[4]} />
          <Persona pos={[-0.2, 0, -0.1]} color="#fde047" escala={0.55} piel={PIELES[1]} />
        </group>
      )}

      <ZonaDemorada key={`${casoId}-${celebrada}-${activo}`} casoId={casoId} ganador={activo && resultado ? resultado.ganador : null} segundos={3.6} />

      <Multitud key={`${casoId}-${celebrada}-${alto}`} personas={personas} activo={activo} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DEBATE ESTRUCTURADO
 * ════════════════════════════════════════════════════════════════════════ */

const URNA_X: Record<TipoAfirmacion, number> = { hecho: -2.3, valor: 0, falacia: 2.3 };
const URNA_Z = 1.6;
const CARTA_POS: Pt = [0, 2.05, 0.9];

function Tarjeta({ texto, col, ancho = 250, divRef }: { texto: string; col: string; ancho?: number; divRef?: Ref<HTMLDivElement> }) {
  return (
    <Html center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div ref={divRef} style={{ transition: "opacity .15s", width: ancho, padding: "10px 13px", borderRadius: 12, background: "rgba(248,250,252,0.97)", color: "#0f172a", fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, borderLeft: `6px solid ${col}`, boxShadow: "0 12px 30px -10px #000" }}>
        {texto}
      </div>
    </Html>
  );
}

function Urna({ tipo, lanzamiento }: { tipo: TipoAfirmacion; lanzamiento: Lanzamiento | null }) {
  const def = TIPOS.find((t) => t.id === tipo)!;
  const aro = useRef<THREE.MeshStandardMaterial>(null);
  const t = useRef(10);
  const ultimo = useRef(-1);
  const mia = !!lanzamiento && lanzamiento.tipo === tipo;
  const flash = mia ? (lanzamiento.ok ? OK : NO) : def.color;
  const nonce = lanzamiento?.nonce ?? -1;
  useFrame((_, dt) => {
    if (nonce !== ultimo.current) {
      ultimo.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    if (aro.current) {
      const brillo = mia && t.current > 0.75 && t.current < 1.9 ? 1.6 : 0.35;
      aro.current.emissiveIntensity += (brillo - aro.current.emissiveIntensity) * suave(dt, 0.2);
    }
  });
  return (
    <group position={[URNA_X[tipo], 0, URNA_Z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.45, 0.9, 28, 1, true]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.04, 28]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.05, 10, 36]} />
        <meshStandardMaterial ref={aro} color={flash} emissive={flash} emissiveIntensity={0.35} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[0, 1.38, 0]} col={`${def.color}cc`} fs={12} df={9}>
        <i className={`fa-solid ${def.icono}`} style={{ color: def.color }} />
        {def.etq}
      </Etiqueta>
    </group>
  );
}

function CartaLanzada({ l }: { l: Lanzamiento }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const caja = useRef<HTMLDivElement>(null);
  const af = AFIRMACIONES.find((a) => a.id === l.id);
  const destino: Pt = [URNA_X[l.tipo], 1.0, URNA_Z];
  useFrame((_, dt) => {
    t.current += dt;
    const g = ref.current;
    if (!g) return;
    const ida = Math.min(1, t.current / 0.75);
    const e = ida * ida * (3 - 2 * ida);
    let x = CARTA_POS[0] + (destino[0] - CARTA_POS[0]) * e;
    let y = CARTA_POS[1] + (destino[1] - CARTA_POS[1]) * e + Math.sin(e * Math.PI) * 0.8;
    let z = CARTA_POS[2] + (destino[2] - CARTA_POS[2]) * e;
    let s = 1;
    if (t.current > 0.75) {
      const k = Math.min(1, (t.current - 0.75) / 0.5);
      if (l.ok) {
        y = destino[1] - k * 0.9;
        s = 1 - k;
      } else {
        const b = k * k * (3 - 2 * k);
        x = destino[0] + (CARTA_POS[0] - destino[0]) * b;
        y = destino[1] + (CARTA_POS[1] - destino[1]) * b + Math.sin(b * Math.PI) * 0.5;
        z = destino[2] + (CARTA_POS[2] - destino[2]) * b;
        s = 1 - Math.sin(k * Math.PI) * 0.2;
      }
    }
    g.position.set(x, y, z);
    g.scale.setScalar(Math.max(0.001, s));
    g.visible = t.current < 1.3;
    if (caja.current) caja.current.style.opacity = t.current < 1.2 ? String(Math.min(1, s * 1.4)) : "0";
  });
  return (
    <group ref={ref} position={CARTA_POS}>
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {af && <Tarjeta texto={af.texto} col={l.ok ? OK : NO} ancho={210} divRef={caja} />}
    </group>
  );
}

/** Oculta la carta en espera mientras vuela la lanzada. */
function CartaEnEspera({ id, nonce }: { id: string; nonce: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const ultimo = useRef(nonce);
  const caja = useRef<HTMLDivElement>(null);
  const af = AFIRMACIONES.find((a) => a.id === id);
  useFrame(({ clock }, dt) => {
    if (ultimo.current !== nonce) {
      ultimo.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    if (!ref.current) return;
    const ver = nonce < 0 || t.current > 1.3;
    ref.current.visible = ver;
    if (caja.current) caja.current.style.opacity = ver ? "1" : "0";
    ref.current.position.y = CARTA_POS[1] + Math.sin(clock.elapsedTime * 1.6) * 0.05;
  });
  if (!af) return null;
  return (
    <group ref={ref} position={CARTA_POS}>
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <Tarjeta texto={af.texto} col="#c084fc" divRef={caja} />
    </group>
  );
}

function Publico({ pronunciada }: { pronunciada: number }) {
  const cuerpos = useRef<THREE.InstancedMesh>(null);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  const t = useRef(99);
  const ultimo = useRef(pronunciada);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const lugares = useMemo(() => {
    const xs: { x: number; z: number; c: string; p: string }[] = [];
    const cols = ["#64748b", "#0ea5e9", "#f472b6", "#a3e635", "#f59e0b", "#94a3b8", "#c084fc"];
    [0, 1, 2].forEach((fila) => {
      const n = 9 + fila * 2;
      for (let i = 0; i < n; i++) {
        const a = -0.62 + (1.24 * i) / (n - 1);
        const r = 5.4 + fila * 0.8;
        xs.push({ x: Math.sin(a) * r, z: Math.cos(a) * r - 1.2, c: cols[(i * 3 + fila) % cols.length]!, p: PIELES[(i + fila * 2) % PIELES.length]! });
      }
    });
    return xs;
  }, []);
  const col = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) => {
    if (ultimo.current !== pronunciada) {
      ultimo.current = pronunciada;
      t.current = 0;
    }
    t.current += dt;
    const cu = cuerpos.current;
    const ca = cabezas.current;
    if (!cu || !ca) return;
    const aplauso = t.current < 3.5 ? 1 - t.current / 3.5 : 0;
    lugares.forEach((l, i) => {
      const y = Math.abs(Math.sin(clock.elapsedTime * 9 + i * 1.7)) * 0.12 * aplauso;
      obj.position.set(l.x, 0.42 + y, l.z);
      obj.updateMatrix();
      cu.setMatrixAt(i, obj.matrix);
      obj.position.set(l.x, 0.98 + y, l.z);
      obj.updateMatrix();
      ca.setMatrixAt(i, obj.matrix);
      cu.setColorAt(i, col.set(l.c));
      ca.setColorAt(i, col.set(l.p));
    });
    cu.instanceMatrix.needsUpdate = true;
    ca.instanceMatrix.needsUpdate = true;
    if (cu.instanceColor) cu.instanceColor.needsUpdate = true;
    if (ca.instanceColor) ca.instanceColor.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={cuerpos} args={[GEO_CUERPO, undefined, lugares.length]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[GEO_CABEZA, undefined, lugares.length]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </>
  );
}

function OndasVoz({ x, pronunciada }: { x: number; pronunciada: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(99);
  const ultimo = useRef(pronunciada);
  useFrame((_, dt) => {
    if (ultimo.current !== pronunciada) {
      ultimo.current = pronunciada;
      t.current = 0;
    }
    t.current += dt;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const f = ((t.current * 0.9 + i / 3) % 1 + 1) % 1;
      const on = t.current < 4;
      m.visible = on;
      m.scale.setScalar(0.3 + f * 2.2);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.5;
    });
  });
  return (
    <group position={[x, 1.95, -0.6]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          visible={false}
        >
          <torusGeometry args={[0.5, 0.02, 8, 40]} />
          <meshBasicMaterial color="#e9d5ff" transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function recorta(s: string, n = 78): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function textoHueco(iv: Intervencion, h: (typeof HUECOS_DEBATE)[number]["id"]): string | null {
  const id = iv[h];
  if (!id) return null;
  if (h === "argumento" || h === "reconoce") return ARGUMENTOS.find((a) => a.id === id)?.texto ?? null;
  if (h === "dato") return AFIRMACIONES.find((a) => a.id === id)?.texto ?? null;
  if (h === "replica") return id === "falaz" ? REPLICA_FALAZ : (ARGUMENTOS.find((a) => a.id === id)?.replica ?? null);
  return PROPUESTAS.find((p) => p.id === id)?.texto ?? null;
}

function Pizarron({ intervencion, revisionOk, modoColor }: { intervencion: Intervencion; revisionOk: boolean[] | null; modoColor: string }) {
  const p: Postura | null = intervencion.postura;
  return (
    <group position={[0, 3.5, -3.05]}>
      <mesh castShadow>
        <boxGeometry args={[6.6, 3.9, 0.12]} />
        <meshStandardMaterial color="#0b1424" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[6.85, 4.15, 0.08]} />
        <meshStandardMaterial color={modoColor} roughness={0.5} emissive={modoColor} emissiveIntensity={0.15} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[-1.2 + k * 0.8, 2.2, 0.05]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color={revisionOk ? (revisionOk[k] ? OK : NO) : "#334155"} emissive={revisionOk ? (revisionOk[k] ? OK : NO) : "#000"} emissiveIntensity={revisionOk ? 1.4 : 0} toneMapped={!revisionOk} />
        </mesh>
      ))}
      <Html position={[0, 0.45, 0.08]} transform center distanceFactor={4} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 640, color: "#e2e8f0", fontSize: 16, lineHeight: 1.3 }}>
          <div style={{ fontSize: 14, letterSpacing: "0.12em", color: modoColor, fontWeight: 900, marginBottom: 8 }}>MI INTERVENCIÓN · {p === "si" ? "SÍ ES POSIBLE" : p === "no" ? "NO ES POSIBLE" : "ELIGE TU POSTURA"}</div>
          {HUECOS_DEBATE.map((h) => {
            const txt = textoHueco(intervencion, h.id);
            return (
              <div key={h.id} style={{ display: "flex", gap: 10, padding: "7px 10px", marginBottom: 6, borderRadius: 7, background: txt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", border: `1px dashed ${txt ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}` }}>
                <span style={{ width: 160, flexShrink: 0, fontWeight: 900, color: "#cbd5e1", fontSize: 14 }}>{h.etq}</span>
                <span style={{ color: txt ? "#fff" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>{txt ? recorta(txt) : "—"}</span>
              </div>
            );
          })}
        </div>
      </Html>
    </group>
  );
}

function EscenaDebate({ paso, afirmacionId, lanzamiento, intervencion, pronunciada, revisionOk, modoColor }: { paso: "clasificar" | "intervencion"; afirmacionId: string | null; lanzamiento: Lanzamiento | null; intervencion: Intervencion; pronunciada: number; revisionOk: boolean[] | null; modoColor: string }) {
  const p = intervencion.postura;
  const atril = (lado: Postura) => (
    <group position={[lado === "si" ? -2.7 : 2.7, 0.4, -0.7]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.6]} />
        <meshStandardMaterial color={lado === "si" ? "#0f766e" : "#9a3412"} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.14, 0.08]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.05, 0.06, 0.7]} />
        <meshStandardMaterial color={lado === "si" ? "#2dd4bf" : "#fb923c"} roughness={0.4} emissive={lado === "si" ? "#2dd4bf" : "#fb923c"} emissiveIntensity={p === lado ? 0.6 : 0.1} />
      </mesh>
      <Persona pos={[0, 0, -0.62]} color={p === lado ? modoColor : "#64748b"} piel={PIELES[lado === "si" ? 1 : 3]} escala={1.3} />
      <Etiqueta pos={[0, 0.62, 0.42]} col={lado === "si" ? "#2dd4bfaa" : "#fb923caa"} fs={11}>
        {p === lado && <i className="fa-solid fa-user" style={{ color: modoColor }} />}
        {lado === "si" ? "Sí es posible" : "No es posible"}
        {p === lado ? " · tú" : ""}
      </Etiqueta>
    </group>
  );
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.06, 1.5]} receiveShadow>
        <cylinderGeometry args={[9, 9, 0.1, 64]} />
        <meshStandardMaterial color="#141d2e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, -1.4]} castShadow receiveShadow>
        <boxGeometry args={[8.6, 0.4, 3.8]} />
        <meshStandardMaterial color="#3b2a1f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.41, 0.49]}>
        <boxGeometry args={[8.6, 0.02, 0.05]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {atril("si")}
      {atril("no")}
      <Pizarron intervencion={intervencion} revisionOk={revisionOk} modoColor={modoColor} />
      {p && <OndasVoz x={p === "si" ? -2.7 : 2.7} pronunciada={pronunciada} />}

      {paso === "clasificar" && (
        <>
          {TIPOS.map((t) => (
            <Urna key={t.id} tipo={t.id} lanzamiento={lanzamiento} />
          ))}
          {afirmacionId && <CartaEnEspera id={afirmacionId} nonce={lanzamiento?.nonce ?? -1} />}
          {lanzamiento && <CartaLanzada key={lanzamiento.nonce} l={lanzamiento} />}
        </>
      )}

      <Publico pronunciada={pronunciada} />
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function AgoraCiudadaniaScene(p: AgoraSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "agora") return { pos: [0, 10.2, 13.0], target: [-0.4, -1.0, 0.9] };
    if (vista === "asamblea") return { pos: [0, 10.8, 12.4], target: [0, -1.2, -0.3] };
    return { pos: [0, 5.8, 11.4], target: [0, 0.55, -0.6] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 22, 44]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 11, 7]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight position={[-7, 4, 5]} intensity={0.45} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 5, -7]} scale={[12, 6, 1]} color="#fde68a" />
        <Lightformer form="rect" intensity={0.8} position={[-7, 1, 5]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "agora" && <EscenaAgora epocaIdx={p.epocaIdx} revelada={p.revelada} prediccion={p.prediccion} modoColor={modoColor} />}
      {vista === "asamblea" && <EscenaAsamblea casoId={p.casoId} condiciones={p.condiciones} celebrada={p.celebrada} resultado={p.resultado} modoColor={modoColor} />}
      {vista === "debate" && (
        <EscenaDebate paso={p.paso} afirmacionId={p.afirmacionId} lanzamiento={p.lanzamiento} intervencion={p.intervencion} pronunciada={p.pronunciada} revisionOk={p.revisionOk} modoColor={modoColor} />
      )}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5} maxDistance={24} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.08} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
