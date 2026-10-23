"use client";
/* eslint-disable -- Código portado tal cual de NEM; las reglas de React Compiler de CEN no aplican a escenas three.js. */
// =============================================================================
// Explorador espacial · vista SISTEMA SOLAR (va dentro del lienzo de
// ExploradorEspacialScene)
// =============================================================================
// Los ocho planetas con fotografías reales, cada uno donde está HOY en su
// órbita (explorador-espacial-datos, elementos del JPL) y avanzando con su
// periodo real cuando corre el tiempo. Lo que se puede encender:
//   • órbitas: la ruta de traslación de cada planeta, con flechas del sentido;
//   • ejes: el eje de giro con su inclinación real y una flecha que da vueltas
//     en el sentido de la rotación (Venus y Urano, al revés: la inclinación de
//     más de 90° lo hace sola, como en la realidad);
//   • vista clara: los planetas iluminados por todos lados y más grandes, para
//     que no se pierdan en la oscuridad del espacio.
//
// LO QUE NO ESTÁ A ESCALA, y la interfaz lo dice: distancias (raíz de la
// distancia real) y tamaños (raíz del radio real), para que quepan juntos; el
// giro sobre su eje va más lento de lo real. El cometa es un ejemplo: su
// órbita no es la de un cometa en particular.
// =============================================================================

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls, Stars, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RUTA, ViaLactea, resolucion, texturaResplandor } from "./explorador-espacial-comun";
import { PLANETAS, elongacionLuna, longitudPlaneta, type Planeta } from "./explorador-espacial-datos";

export interface SistemaProps {
  velocidad: number;
  ahoraN: number;
  enfoque: { a: string; n: number };
  clara: boolean;
  orbitas: boolean;
  ejes: boolean;
  nombres: boolean;
  onSeleccion: (id: string) => void;
  onHora: (fecha: Date) => void;
  onListo: () => void;
  /** Sin Vía Láctea ni estrellas: en el Observatorio CEN el cielo lo pone la pintura. */
  sinCielo?: boolean;
}

const RADIO_SOL = 5;
/** En «vista clara» los planetas crecen para que se distingan desde lejos. */
const ESCALA_CLARA = 2.4;
const GRAD = Math.PI / 180;
const DIA_MS = 86_400_000;

/** Distancia en la escena: crece con la raíz de la distancia real (no a escala). */
const dist = (ua: number) => 9 + 15 * Math.pow(ua, 0.6);
/** Radio en la escena: crece con la raíz del radio real (no a escala). */
const radio = (p: Planeta) => 0.55 * Math.sqrt(p.radioKm / 6371);

const ASTEROIDES = { desde: dist(2.2), hasta: dist(3.2), periodoDias: 4.6 * 365.25 };
const KUIPER = { desde: dist(30), hasta: dist(50), periodoDias: 250 * 365.25 };
// Ejemplo: pasa cerca del Sol a fines de 2026, para que al abrir se vea con la cola larga.
const COMETA = { a: 85, e: 0.75, periodoDias: 25 * 365.25, inclinacion: 14 * GRAD, giro: 40 * GRAD, perihelio: Date.UTC(2026, 11, 1) / DIA_MS };

function posicionPlaneta(p: Planeta, fecha: Date, out: THREE.Vector3) {
  const l = longitudPlaneta(p, fecha) * GRAD;
  const d = dist(p.ua);
  // Longitud creciente = giro antihorario visto desde el norte (+Y).
  return out.set(d * Math.cos(l), 0, -d * Math.sin(l));
}

/** Posición del cometa de ejemplo resolviendo la ecuación de Kepler. */
function posicionCometa(fecha: Date, out: THREE.Vector3) {
  const { a, e, periodoDias } = COMETA;
  const fase = (((fecha.getTime() / DIA_MS - COMETA.perihelio) % periodoDias) + periodoDias) % periodoDias;
  const M = (fase / periodoDias) * 2 * Math.PI;
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const b = a * Math.sqrt(1 - e * e);
  out.set(a * (Math.cos(E) - e), 0, -b * Math.sin(E));
  out.applyAxisAngle(new THREE.Vector3(1, 0, 0), COMETA.inclinacion);
  return out.applyAxisAngle(new THREE.Vector3(0, 1, 0), COMETA.giro);
}

// ── Etiqueta con el nombre, que también se puede tocar ──────────────────────
function Etiqueta({ texto, color, alto, onClick, visible }: { texto: string; color: string; alto: number; onClick: () => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <Html position={[0, alto, 0]} center zIndexRange={[20, 0]}>
      <button
        type="button"
        onClick={onClick}
        style={{
          transform: "translateY(-50%)",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          // La regla táctil del marco (44 px) estiraba la pastilla y las
          // encimaba: el rótulo es chico a propósito, el planeta también se toca.
          minHeight: 0,
          minWidth: 0,
          lineHeight: 1.2,
          padding: "2px 9px 2px 7px",
          border: "1px solid rgba(184,235,80,.55)",
          borderRadius: 999,
          background: "rgba(0,21,59,.8)",
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: ".02em",
          whiteSpace: "nowrap",
          cursor: "pointer",
          fontFamily: "var(--font-cen),'Montserrat',var(--font-sans),sans-serif",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 99, background: color, boxShadow: `0 0 6px ${color}` }} />
        {texto}
      </button>
    </Html>
  );
}

// ── Un planeta ──────────────────────────────────────────────────────────────
function CuerpoPlaneta({
  p,
  grupo,
  clara,
  ejes,
  nombres,
  velocidad,
  onSeleccion,
}: {
  p: Planeta;
  grupo: (g: THREE.Group | null) => void;
  clara: boolean;
  ejes: boolean;
  nombres: boolean;
  velocidad: number;
  onSeleccion: (id: string) => void;
}) {
  const res = useMemo(() => resolucion(), []);
  const mapa = useTexture(`${RUTA}/${p.textura}-${p.cuatroK && res === "4k" ? "4k" : "2k"}.webp`);
  const anilloMapa = useTexture(`${RUTA}/saturno-anillo.png`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
    mapa.anisotropy = 8;
    anilloMapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa, anilloMapa]);
  const r = radio(p);
  const giro = useRef<THREE.Mesh>(null);
  const flecha = useRef<THREE.Group>(null);
  // El giro se ve más lento que el real (la duración real está en la ficha),
  // pero conserva el orden: Júpiter el más rápido, Venus el más lento.
  const w = 0.6 * Math.pow(24 / p.giroHoras, 0.35);
  useFrame((_, dt) => {
    if (velocidad === 0) return;
    const paso = Math.min(dt, 0.1) * w;
    if (giro.current) giro.current.rotation.y += paso;
    if (flecha.current) flecha.current.rotation.y += paso;
  });

  // El anillo de Saturno: la textura va de dentro hacia fuera, así que la
  // coordenada u de cada vértice es su distancia al centro.
  const anilloGeo = useMemo(() => {
    if (!p.anillo) return null;
    const g = new THREE.RingGeometry(r * p.anillo.interior, r * p.anillo.exterior, 160, 1);
    const pos = g.attributes.position!;
    const uv = g.attributes.uv!;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.length() - r * p.anillo.interior) / (r * (p.anillo.exterior - p.anillo.interior));
      uv.setXY(i, t, 0.5);
    }
    return g;
  }, [p.anillo, r]);

  const clic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSeleccion(p.id);
  };

  return (
    <group ref={grupo} scale={clara ? ESCALA_CLARA : 1}>
      {/* Inclinación del eje. Para la Tierra el polo norte mira al Sol en junio. */}
      <group rotation={[-p.ejeGrados * GRAD, 0, 0]}>
        <mesh ref={giro} onClick={clic}>
          <sphereGeometry args={[r, 64, 32]} />
          <meshStandardMaterial
            map={mapa}
            roughness={1}
            metalness={0}
            emissiveMap={mapa}
            emissive="#ffffff"
            emissiveIntensity={clara ? 0.55 : 0.02}
          />
        </mesh>
        {anilloGeo && (
          <mesh geometry={anilloGeo} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <meshStandardMaterial
              map={anilloMapa}
              color={[2.6, 2.4, 2.1]}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={1}
              emissiveMap={anilloMapa}
              emissive="#ffffff"
              emissiveIntensity={clara ? 0.9 : 0.45}
            />
          </mesh>
        )}
        {ejes && (
          <group raycast={() => null}>
            <mesh>
              <cylinderGeometry args={[r * 0.035, r * 0.035, r * 3.3, 8]} />
              <meshBasicMaterial color="#f8fafc" toneMapped={false} />
            </mesh>
            <mesh position={[0, r * 1.65, 0]}>
              <coneGeometry args={[r * 0.1, r * 0.25, 12]} />
              <meshBasicMaterial color="#f8fafc" toneMapped={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r * 1.35, r * 0.03, 8, 96]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.85} toneMapped={false} />
            </mesh>
            {/* La flecha recorre el ecuador en el sentido del giro. */}
            <group ref={flecha}>
              <mesh position={[r * 1.35, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[r * 0.13, r * 0.36, 12]} />
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
              </mesh>
            </group>
          </group>
        )}
      </group>
      <Etiqueta texto={p.nombre} color={p.color} alto={r * (p.anillo ? 1.5 : 1.25) + 0.35} onClick={() => onSeleccion(p.id)} visible={nombres} />
    </group>
  );
}

// ── Órbitas con flechas de sentido ──────────────────────────────────────────
function Orbita({ d, color, clara }: { d: number; color: string; clara: boolean }) {
  const puntos = useMemo(() => {
    const a: [number, number, number][] = [];
    for (let i = 0; i <= 256; i++) {
      const t = (i / 256) * 2 * Math.PI;
      a.push([d * Math.cos(t), 0, -d * Math.sin(t)]);
    }
    return a;
  }, [d]);
  const flechas = useMemo(
    () =>
      [0.1, 0.35, 0.6, 0.85].map((f) => {
        const t = f * 2 * Math.PI;
        const pos = new THREE.Vector3(d * Math.cos(t), 0, -d * Math.sin(t));
        const tangente = new THREE.Vector3(-Math.sin(t), 0, -Math.cos(t));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangente);
        return { pos, q };
      }),
    [d]
  );
  const s = Math.max(0.35, d * 0.012);
  return (
    <group>
      <Line points={puntos} color={color} lineWidth={clara ? 2 : 1.2} transparent opacity={clara ? 0.85 : 0.45} />
      {flechas.map((f, i) => (
        <mesh key={i} position={f.pos} quaternion={f.q} raycast={() => null}>
          <coneGeometry args={[s * 0.45, s * 1.3, 10]} />
          <meshBasicMaterial color={color} transparent opacity={clara ? 0.95 : 0.7} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Disco suave para que los puntos (cola del cometa, Kuiper) sean redondos. */
function texturaPunto() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.45, "rgba(255,255,255,0.6)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ── Cinturón de asteroides: rocas de verdad, no puntos ──────────────────────
function Asteroides({ grupo, clara, onSeleccion }: { grupo: React.RefObject<THREE.Group | null>; clara: boolean; onSeleccion: (id: string) => void }) {
  const n = useMemo(() => (resolucion() === "4k" ? 2600 : 1300), []);
  const malla = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = malla.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let semilla = 11;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const t = azar() * 2 * Math.PI;
      // Más rocas en el centro del cinturón que en los bordes.
      const u = (azar() + azar()) / 2;
      const d = ASTEROIDES.desde + u * (ASTEROIDES.hasta - ASTEROIDES.desde);
      o.position.set(d * Math.cos(t), (azar() - 0.5) * 1.4, -d * Math.sin(t));
      const s = 0.04 + Math.pow(azar(), 3) * 0.22;
      o.scale.set(s * (0.7 + azar() * 0.6), s * (0.6 + azar() * 0.5), s * (0.7 + azar() * 0.6));
      o.rotation.set(azar() * 6, azar() * 6, azar() * 6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      const g = 0.38 + azar() * 0.25;
      m.setColorAt(i, c.setRGB(g * 1.05, g * 0.95, g * 0.85));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [n]);
  return (
    <group ref={grupo}>
      <instancedMesh
        ref={malla}
        args={[undefined, undefined, n]}
        scale={clara ? 1.5 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onSeleccion("asteroides");
        }}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={1} metalness={0} flatShading emissive="#8a7f72" emissiveIntensity={clara ? 0.5 : 0.04} />
      </instancedMesh>
    </group>
  );
}

function Kuiper({ grupo, clara }: { grupo: React.RefObject<THREE.Group | null>; clara: boolean }) {
  const punto = useMemo(() => texturaPunto(), []);
  const geo = useMemo(() => {
    const n = 3500;
    const p = new Float32Array(n * 3);
    let semilla = 29;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const t = azar() * 2 * Math.PI;
      const d = KUIPER.desde + azar() * (KUIPER.hasta - KUIPER.desde);
      p.set([d * Math.cos(t), (azar() - 0.5) * 9, -d * Math.sin(t)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <group ref={grupo}>
      <points geometry={geo} raycast={() => null}>
        <pointsMaterial map={punto} color="#b9cde6" size={clara ? 1.1 : 0.75} sizeAttenuation transparent opacity={clara ? 0.85 : 0.55} depthWrite={false} />
      </points>
    </group>
  );
}

// ── Cometa de ejemplo, con su cola apuntando lejos del Sol ──────────────────
function Cometa({ nucleo, clara, nombres, onSeleccion }: { nucleo: React.RefObject<THREE.Group | null>; clara: boolean; nombres: boolean; onSeleccion: (id: string) => void }) {
  const N = 700;
  const cola = useRef<THREE.Points>(null);
  const resplandor = useMemo(() => texturaResplandor(), []);
  const punto = useMemo(() => texturaPunto(), []);
  const base = useMemo(() => {
    let semilla = 5;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: N }, () => ({ t: Math.pow(azar(), 1.6), a: azar() * 2 * Math.PI, r: azar() }));
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const col = new Float32Array(N * 3);
    base.forEach((b, i) => {
      const k = 1 - b.t;
      col.set([0.75 * k, 0.88 * k, 1.0 * k], i * 3);
    });
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [base]);
  const orbita = useMemo(() => {
    const pts: [number, number, number][] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i <= 360; i++) {
      const E = (i / 360) * 2 * Math.PI;
      const b = COMETA.a * Math.sqrt(1 - COMETA.e ** 2);
      v.set(COMETA.a * (Math.cos(E) - COMETA.e), 0, -b * Math.sin(E));
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), COMETA.inclinacion).applyAxisAngle(new THREE.Vector3(0, 1, 0), COMETA.giro);
      pts.push([v.x, v.y, v.z]);
    }
    return pts;
  }, []);
  const anti = useMemo(() => new THREE.Vector3(), []);
  const lado = useMemo(() => new THREE.Vector3(), []);
  const arriba = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const n = nucleo.current;
    const c = cola.current;
    if (!n || !c) return;
    const r = n.position.length();
    anti.copy(n.position).normalize();
    lado.set(0, 1, 0).cross(anti).normalize();
    arriba.copy(anti).cross(lado).normalize();
    // La cola crece al acercarse al Sol, porque es hielo que se evapora.
    const largo = THREE.MathUtils.clamp(16 * Math.pow(30 / r, 1.4), 0.4, 26);
    const ancho = largo * 0.16;
    const pos = c.geometry.attributes.position as THREE.BufferAttribute;
    base.forEach((b, i) => {
      const abre = b.t * ancho * b.r;
      pos.setXYZ(
        i,
        anti.x * b.t * largo + (lado.x * Math.cos(b.a) + arriba.x * Math.sin(b.a)) * abre,
        anti.y * b.t * largo + (lado.y * Math.cos(b.a) + arriba.y * Math.sin(b.a)) * abre,
        anti.z * b.t * largo + (lado.z * Math.cos(b.a) + arriba.z * Math.sin(b.a)) * abre
      );
    });
    pos.needsUpdate = true;
  });
  return (
    <>
      <Line points={orbita} color="#93c5fd" lineWidth={1} dashed dashSize={2} gapSize={2} transparent opacity={clara ? 0.6 : 0.3} />
      <group ref={nucleo}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSeleccion("cometa");
          }}
        >
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshBasicMaterial color={[1.05, 1.15, 1.3]} toneMapped={false} />
        </mesh>
        <sprite scale={2.2} raycast={() => null}>
          <spriteMaterial map={resplandor} color="#9cc8ff" opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
        </sprite>
        <points ref={cola} geometry={geo} raycast={() => null}>
          <pointsMaterial map={punto} size={0.55} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </points>
        <Etiqueta texto="Cometa (ejemplo)" color="#bfe0ff" alto={1.4} onClick={() => onSeleccion("cometa")} visible={nombres} />
      </group>
    </>
  );
}

// ── El Sol en el centro ─────────────────────────────────────────────────────
function SolCentral({ nombres, onSeleccion }: { nombres: boolean; onSeleccion: (id: string) => void }) {
  const mapa = useTexture(`${RUTA}/sol-2k.webp`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa]);
  const resplandor = useMemo(() => texturaResplandor(), []);
  const esfera = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (esfera.current) esfera.current.rotation.y += Math.min(dt, 0.1) * 0.03;
  });
  return (
    <group>
      <mesh
        ref={esfera}
        onClick={(e) => {
          e.stopPropagation();
          onSeleccion("sol");
        }}
      >
        <sphereGeometry args={[RADIO_SOL, 96, 48]} />
        <meshBasicMaterial map={mapa} color={[2.2, 1.75, 1.2]} toneMapped={false} />
      </mesh>
      <sprite scale={RADIO_SOL * 7.5} raycast={() => null}>
        <spriteMaterial map={resplandor} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
      <pointLight intensity={3.2} decay={0} color="#fff3e0" />
      <Etiqueta texto="Sol" color="#fbbf24" alto={RADIO_SOL + 1.2} onClick={() => onSeleccion("sol")} visible={nombres} />
    </group>
  );
}

// ── La Luna junto a la Tierra ───────────────────────────────────────────────
function LunaPequena({ luna, clara }: { luna: React.RefObject<THREE.Mesh | null>; clara: boolean }) {
  const mapa = useTexture(`${RUTA}/luna-2k.webp`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa]);
  return (
    <mesh ref={luna} scale={clara ? ESCALA_CLARA : 1} raycast={() => null}>
      <sphereGeometry args={[0.16, 32, 16]} />
      <meshStandardMaterial map={mapa} roughness={1} emissiveMap={mapa} emissive="#ffffff" emissiveIntensity={clara ? 0.5 : 0.03} />
    </mesh>
  );
}

// ── Reloj, cámara y todo junto ──────────────────────────────────────────────
export function MundoSistema(p: SistemaProps) {
  const tiempo = useRef(Date.now());
  const ultimoAviso = useRef(0);
  const grupos = useRef<Record<string, THREE.Group | null>>({});
  const luna = useRef<THREE.Mesh>(null);
  const asteroides = useRef<THREE.Group>(null);
  const kuiper = useRef<THREE.Group>(null);
  const cometa = useRef<THREE.Group>(null);
  const controles = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const lejos = Math.max(1, 1.1 / (size.width / size.height));

  const vuelo = useRef<{ pos: THREE.Vector3; obj: THREE.Vector3; seguir: string | null } | null>(null);
  const siguiendo = useRef<string | null>(null);
  const antes = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const { onListo, onHora } = p;
  useEffect(() => {
    onListo();
  }, [onListo]);
  useEffect(() => {
    tiempo.current = Date.now();
  }, [p.ahoraN]);
  useEffect(() => {
    camera.position.set(0, 420, 620);
  }, [camera]);
  useEffect(() => {
    const c = controles.current;
    if (!c) return;
    const cancelar = () => {
      vuelo.current = null;
    };
    c.addEventListener("start", cancelar);
    return () => c.removeEventListener("start", cancelar);
  }, []);

  const posicionDe = (id: string, out: THREE.Vector3) => {
    if (id === "cometa" && cometa.current) return out.copy(cometa.current.position);
    const g = grupos.current[id];
    return g ? out.copy(g.position) : out.set(0, 0, 0);
  };

  // A dónde vuela la cámara con cada botón.
  useEffect(() => {
    const a = p.enfoque.a;
    const escala = p.clara ? ESCALA_CLARA : 1;
    siguiendo.current = null;
    if (a === "sistema") {
      vuelo.current = { pos: new THREE.Vector3(0, 135, 215).multiplyScalar(lejos), obj: new THREE.Vector3(), seguir: null };
    } else if (a === "sol") {
      vuelo.current = { pos: new THREE.Vector3(6, 7, 24).multiplyScalar(lejos), obj: new THREE.Vector3(), seguir: null };
    } else if (a === "asteroides") {
      const t = new THREE.Vector3(36, 0, 0);
      vuelo.current = { pos: t.clone().add(new THREE.Vector3(-14, 6, 15).multiplyScalar(lejos)), obj: t, seguir: null };
    } else if (a === "kuiper") {
      vuelo.current = { pos: new THREE.Vector3(0, 170, 300).multiplyScalar(lejos), obj: new THREE.Vector3(), seguir: null };
    } else {
      const planeta = PLANETAS.find((x) => x.id === a);
      const r = planeta ? radio(planeta) * escala * (planeta.anillo ? 2.3 : 1) : 1.2;
      const centro = posicionDe(a, new THREE.Vector3());
      // Del lado del Sol y un poco de lado y arriba: se ve la cara iluminada.
      const haciaSol = centro.clone().normalize().multiplyScalar(-1);
      const lado = new THREE.Vector3(0, 1, 0).cross(haciaSol).normalize();
      // Con anillos, desde más arriba: de canto los anillos casi desaparecen.
      const alto = planeta?.anillo ? 1.15 : 0.38;
      const dir = haciaSol.multiplyScalar(0.75).add(lado.multiplyScalar(0.6)).add(new THREE.Vector3(0, alto, 0)).normalize();
      const d = (a === "cometa" ? 14 : Math.max(r * 4.2, 1.6)) * lejos;
      antes.current.copy(centro);
      vuelo.current = { pos: centro.clone().add(dir.multiplyScalar(d)), obj: centro.clone(), seguir: a };
    }
     
  }, [p.enfoque.n]);

  useFrame((_, dtReal) => {
    const dt = Math.min(dtReal, 0.1);
    tiempo.current += dt * 1000 * p.velocidad;
    const fecha = new Date(tiempo.current);
    const dias = tiempo.current / DIA_MS;

    for (const pl of PLANETAS) {
      const g = grupos.current[pl.id];
      if (g) posicionPlaneta(pl, fecha, g.position);
    }
    const tierra = grupos.current.tierra;
    if (tierra && luna.current) {
      // La Luna, en la dirección del día: longitud del Sol vista desde la Tierra + elongación.
      const lSol = longitudPlaneta(PLANETAS[2]!, fecha) + 180;
      const l = (lSol + elongacionLuna(fecha)) * GRAD;
      const d = 1.25 * (p.clara ? ESCALA_CLARA : 1);
      luna.current.position.set(tierra.position.x + d * Math.cos(l), 0, tierra.position.z - d * Math.sin(l));
    }
    if (asteroides.current) asteroides.current.rotation.y = ((dias / ASTEROIDES.periodoDias) % 1) * 2 * Math.PI;
    if (kuiper.current) kuiper.current.rotation.y = ((dias / KUIPER.periodoDias) % 1) * 2 * Math.PI;
    if (cometa.current) posicionCometa(fecha, cometa.current.position);

    // Seguir al cuerpo elegido: la cámara viaja «montada» en él. Se le suma a
    // la cámara, a su mira y a la meta del vuelo lo que el cuerpo avanzó; así,
    // vista desde el cuerpo, la meta queda quieta y el vuelo siempre llega
    // (antes solo se movía la meta y la cámara lo perseguía sin alcanzarlo).
    // Además gira con él alrededor del Sol: la cara iluminada queda siempre de
    // frente y el Sol quieto en la pantalla (si no, a las pocas semanas se ve
    // el lado de la noche y el fondo da vueltas).
    const sigue = vuelo.current?.seguir ?? siguiendo.current;
    const ctlS = controles.current;
    if (sigue && ctlS) {
      posicionDe(sigue, tmp);
      const viejo = new THREE.Vector3(antes.current.x, 0, antes.current.z);
      const nuevo = new THREE.Vector3(tmp.x, 0, tmp.z);
      const giro = viejo.lengthSq() > 1e-6 && nuevo.lengthSq() > 1e-6 ? new THREE.Quaternion().setFromUnitVectors(viejo.normalize(), nuevo.normalize()) : new THREE.Quaternion();
      const d = tmp.clone().sub(antes.current);
      const desfase = camera.position.clone().sub(ctlS.target).applyQuaternion(giro);
      ctlS.target.add(d);
      camera.position.copy(ctlS.target).add(desfase);
      if (vuelo.current) {
        const meta = vuelo.current.pos.clone().sub(vuelo.current.obj).applyQuaternion(giro);
        vuelo.current.obj.add(d);
        vuelo.current.pos.copy(vuelo.current.obj).add(meta);
      }
      antes.current.copy(tmp);
    }

    const v = vuelo.current;
    const ctl = controles.current;
    if (v && ctl) {
      const k = 1 - Math.exp(-dt * 2.0);
      camera.position.lerp(v.pos, k);
      ctl.target.lerp(v.obj, k);
      if (camera.position.distanceTo(v.pos) < 0.02 * Math.max(1, v.pos.distanceTo(v.obj) / 4)) {
        siguiendo.current = v.seguir;
        vuelo.current = null;
      }
    }

    if (Math.abs(fecha.getTime() - ultimoAviso.current) > 900 * Math.max(1, p.velocidad / 8)) {
      ultimoAviso.current = fecha.getTime();
      onHora(fecha);
    }
  });

  return (
    <>
      <ambientLight intensity={p.clara ? 0.55 : 0.03} />
      {!p.sinCielo && <ViaLactea brillo={p.clara ? 0.55 : 0.85} />}
      {!p.sinCielo && <Stars radius={900} depth={300} count={6000} factor={8} saturation={0.25} fade speed={0} />}
      <SolCentral nombres={p.nombres} onSeleccion={p.onSeleccion} />
      {PLANETAS.map((pl) => (
        <CuerpoPlaneta
          key={pl.id}
          p={pl}
          grupo={(g) => {
            grupos.current[pl.id] = g;
          }}
          clara={p.clara}
          ejes={p.ejes}
          nombres={p.nombres}
          velocidad={p.velocidad}
          onSeleccion={p.onSeleccion}
        />
      ))}
      {p.orbitas && PLANETAS.map((pl) => <Orbita key={pl.id} d={dist(pl.ua)} color={pl.color} clara={p.clara} />)}
      <LunaPequena luna={luna} clara={p.clara} />
      <Asteroides grupo={asteroides} clara={p.clara} onSeleccion={p.onSeleccion} />
      <Kuiper grupo={kuiper} clara={p.clara} />
      <Cometa nucleo={cometa} clara={p.clara} nombres={p.nombres} onSeleccion={p.onSeleccion} />
      <OrbitControls
        ref={controles}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.6}
        maxDistance={700}
        rotateSpeed={0.55}
        zoomSpeed={0.9}
      />
    </>
  );
}
