"use client";
// =============================================================================
// Sistema Solar — LA VITRINA (modos «Explorador» y «Periodos»)
// =============================================================================
// Port de ExploradorSistemaSolar (NEM básica) con la capa de bachillerato:
//
// · EXPLORADOR. Los ocho planetas con fotografías reales, cada uno donde está
//   HOY (elementos del JPL + ecuación de Kepler, ver sistema-solar-datos.ts) y
//   avanzando con su periodo real cuando corre el tiempo. Las órbitas son las
//   ELIPSES reales (la de Mercurio se ve achatada). El planeta elegido lleva
//   la flecha de la fuerza del Sol, F = G·M☉·m/r², calculada a su distancia de
//   ese día: Mercurio la ve crecer más del doble al pasar por el perihelio.
// · PERIODOS. «La carrera»: los planetas salen alineados y cada uno deja una
//   estela de su color sobre lo que ha recorrido. Un planeta X, que el alumno
//   pone a la distancia que quiera, obedece T = a^(3/2) (3.ª ley de Kepler).
//
// LO QUE NO ESTÁ A ESCALA, y el panel lo dice: distancias (crecen como r^0.6) y
// tamaños (como la raíz del radio), para que quepan juntos; el giro sobre el
// eje va más lento que el real. El largo de la flecha de fuerza crece con el
// LOGARITMO de F (de 10²⁰ a 10²⁴ N no cabe de otra forma).
//
// React Compiler: nada de Date.now()/Math.random()/setState en render; lo que
// se anima vive en useFrame con refs y vectores preasignados.
// =============================================================================

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViaLactea, resolucionEspacio, texturaResplandor } from "./_espacio";
import { FlechaY, Rotulo, SolFoto, azarCon, texturaPunto, useTexturaAnillo, useTexturaSS } from "./sistema-solar-comun";
import {
  ANIO_DIAS, DIA_MS, PLANETAS, elongacionLuna, estadoPlaneta, fuerzaSol, periodoAnios, resolverKepler, sci,
  type Planeta,
} from "./sistema-solar-datos";

export interface VitrinaProps {
  modo: "explorador" | "periodos";
  /** Explorador: segundos simulados por segundo real (0 = pausa). */
  velocidad: number;
  /** Cada incremento devuelve el reloj a este instante. */
  hoyN: number;
  /** Fecha que muestra la interfaz (ms): con ella se escriben los rótulos. */
  horaMs: number;
  seleccion: string;
  vuelo: { a: string; n: number };
  clara: boolean;
  orbitas: boolean;
  ejes: boolean;
  todosNombres: boolean;
  onSeleccion: (id: string) => void;
  onHora: (ms: number) => void;
  /** Periodos */
  aX: number;
  aniosPorSeg: number;
  carreraN: number;
  corriendo: boolean;
  onCarrera: (anios: number) => void;
}

const RADIO_SOL = 5;
const ESCALA_CLARA = 2.4;
const GRAD = Math.PI / 180;
export const C_X = "#a78bfa";

/** Distancia en la escena: crece como r^0.6 (no a escala). */
export const dist = (ua: number) => 9 + 15 * Math.pow(ua, 0.6);
/** Radio en la escena: crece con la raíz del radio real (no a escala). */
const radio = (p: Planeta) => 0.55 * Math.sqrt(p.radioKm / 6371);
/** Largo de la flecha de fuerza: logarítmico (10^19.5 N → 0). */
const largoFuerza = (F: number) => Math.max(1.2, 2.5 * (Math.log10(F) - 19.5));

const ASTEROIDES = { desde: dist(2.2), hasta: dist(3.2), periodoDias: 4.6 * 365.25 };
const KUIPER = { desde: dist(30), hasta: dist(50), periodoDias: 250 * 365.25 };
// Ejemplo: pasa cerca del Sol a fines de 2026, para que al abrir se vea con la cola larga.
const COMETA = { a: 85, e: 0.75, periodoDias: 25 * 365.25, inclinacion: 14 * GRAD, giro: 40 * GRAD, perihelio: Date.UTC(2026, 11, 1) / DIA_MS };
const TIERRA_T = PLANETAS[2]!.anioDias / ANIO_DIAS;
const EJE_X = new THREE.Vector3(1, 0, 0);
const EJE_Y = new THREE.Vector3(0, 1, 0);

function posicionExplorador(p: Planeta, fecha: number, out: THREE.Vector3): number {
  const s = estadoPlaneta(p, fecha);
  const l = s.lon * GRAD;
  const d = dist(s.r);
  // Longitud creciente = giro antihorario visto desde el norte (+Y).
  out.set(d * Math.cos(l), 0, -d * Math.sin(l));
  return s.r;
}

function posicionCometa(fechaMs: number, out: THREE.Vector3) {
  const { a, e, periodoDias } = COMETA;
  const fase = (((fechaMs / DIA_MS - COMETA.perihelio) % periodoDias) + periodoDias) % periodoDias;
  const E = resolverKepler((fase / periodoDias) * 2 * Math.PI, e);
  const b = a * Math.sqrt(1 - e * e);
  out.set(a * (Math.cos(E) - e), 0, -b * Math.sin(E));
  out.applyAxisAngle(EJE_X, COMETA.inclinacion);
  return out.applyAxisAngle(EJE_Y, COMETA.giro);
}

/* ── Un planeta ──────────────────────────────────────────────────────────── */
function CuerpoPlaneta({
  p, grupo, clara, ejes, girando, onSeleccion,
}: {
  p: Planeta;
  grupo: (g: THREE.Group | null) => void;
  clara: boolean;
  ejes: boolean;
  girando: boolean;
  onSeleccion: (id: string) => void;
}) {
  const mapa = useTexturaSS(p.textura);
  const r = radio(p);
  const giro = useRef<THREE.Mesh>(null);
  const flecha = useRef<THREE.Group>(null);
  // El giro se ve más lento que el real, pero conserva el orden.
  const w = 0.6 * Math.pow(24 / p.giroHoras, 0.35);
  useFrame((_, dt) => {
    if (!girando) return;
    const paso = Math.min(dt, 0.1) * w;
    if (giro.current) giro.current.rotation.y += paso;
    if (flecha.current) flecha.current.rotation.y += paso;
  });

  const clic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSeleccion(p.id);
  };

  return (
    <group ref={grupo}>
      <group scale={clara ? ESCALA_CLARA : 1}>
        {/* Inclinación del eje. Para la Tierra el polo norte mira al Sol en junio. */}
        <group rotation={[-p.ejeGrados * GRAD, 0, 0]}>
          <mesh ref={giro} onClick={clic}>
            <sphereGeometry args={[r, 64, 32]} />
            <meshStandardMaterial map={mapa} roughness={1} metalness={0} emissiveMap={mapa} emissive="#ffffff" emissiveIntensity={clara ? 0.55 : 0.012} />
          </mesh>
          {p.anillo && <AnilloSaturno r={r} interior={p.anillo.interior} exterior={p.anillo.exterior} clara={clara} />}
          {ejes && (
            <group raycast={() => null}>
              <mesh>
                <cylinderGeometry args={[r * 0.035, r * 0.035, r * 3.3, 8]} />
                <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, r * 1.65, 0]}>
                <coneGeometry args={[r * 0.1, r * 0.25, 12]} />
                <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.6} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r * 1.35, r * 0.03, 8, 96]} />
                <meshBasicMaterial color="#fde68a" transparent opacity={0.85} toneMapped={false} />
              </mesh>
              {/* La flecha recorre el ecuador en el sentido del giro. */}
              <group ref={flecha}>
                <mesh position={[r * 1.35, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[r * 0.13, r * 0.36, 12]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.7} />
                </mesh>
              </group>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

/** El anillo de Saturno: la textura va de dentro hacia fuera (u = distancia al centro). */
function AnilloSaturno({ r, interior, exterior, clara }: { r: number; interior: number; exterior: number; clara: boolean }) {
  const mapa = useTexturaAnillo();
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(r * interior, r * exterior, 160, 1);
    const pos = g.attributes.position!;
    const uv = g.attributes.uv!;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - r * interior) / (r * (exterior - interior)), 0.5);
    }
    return g;
  }, [r, interior, exterior]);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <meshStandardMaterial map={mapa} color={[2.6, 2.4, 2.1]} transparent side={THREE.DoubleSide} depthWrite={false} roughness={1} emissiveMap={mapa} emissive="#ffffff" emissiveIntensity={clara ? 0.9 : 0.45} />
    </mesh>
  );
}

/* ── Órbita: la elipse real (explorador) o el círculo medio (periodos) ───── */
function puntosOrbita(p: Planeta | null, aUA: number, elipse: boolean): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i <= 256; i++) {
    const nu = (i / 256) * 2 * Math.PI;
    if (p && elipse) {
      const r = (p.ua * (1 - p.e * p.e)) / (1 + p.e * Math.cos(nu));
      const l = nu + p.perihelio * GRAD;
      const d = dist(r);
      out.push([d * Math.cos(l), 0, -d * Math.sin(l)]);
    } else {
      const d = dist(aUA);
      out.push([d * Math.cos(nu), 0, -d * Math.sin(nu)]);
    }
  }
  return out;
}

function Orbita({ p, elipse, clara, resaltada }: { p: Planeta; elipse: boolean; clara: boolean; resaltada: boolean }) {
  const puntos = useMemo(() => puntosOrbita(p, p.ua, elipse), [p, elipse]);
  return (
    <Line
      points={puntos}
      color={p.color}
      lineWidth={resaltada ? 2.6 : clara ? 2 : 1.3}
      transparent
      opacity={resaltada ? 0.95 : clara ? 0.8 : 0.45}
    />
  );
}

/* ── Estela de la carrera: un anillo que se llena con lo recorrido ───────── */
const SEG_ESTELA = 256;
function Estela({ d, color, estela }: { d: number; color: string; estela: (m: THREE.Mesh | null) => void }) {
  const geo = useMemo(() => new THREE.RingGeometry(d - 0.45, d + 0.45, SEG_ESTELA, 1), [d]);
  return (
    <mesh ref={estela} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <meshBasicMaterial color={color} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ── Cinturón de asteroides: rocas de verdad, no puntos ──────────────────── */
function Asteroides({ grupo, clara, onSeleccion }: { grupo: React.RefObject<THREE.Group | null>; clara: boolean; onSeleccion: (id: string) => void }) {
  const n = useMemo(() => (resolucionEspacio() === "4k" ? 2600 : 1300), []);
  const malla = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = malla.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const azar = azarCon(11);
    for (let i = 0; i < n; i++) {
      const t = azar() * 2 * Math.PI;
      const u = (azar() + azar()) / 2; // más rocas en el centro del cinturón
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
        <meshStandardMaterial roughness={1} metalness={0} flatShading emissive="#8a7f72" emissiveIntensity={clara ? 0.5 : 0.06} />
      </instancedMesh>
    </group>
  );
}

function Kuiper({ grupo, clara }: { grupo: React.RefObject<THREE.Group | null>; clara: boolean }) {
  const punto = useMemo(() => texturaPunto(), []);
  const geo = useMemo(() => {
    const n = 3500;
    const p = new Float32Array(n * 3);
    const azar = azarCon(29);
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

/* ── Cometa de ejemplo, con su cola apuntando lejos del Sol ──────────────── */
function Cometa({ nucleo, clara, onSeleccion }: { nucleo: React.RefObject<THREE.Group | null>; clara: boolean; onSeleccion: (id: string) => void }) {
  const N = 700;
  const cola = useRef<THREE.Points>(null);
  const resplandor = useMemo(() => texturaResplandor(), []);
  const punto = useMemo(() => texturaPunto(), []);
  const base = useMemo(() => {
    const azar = azarCon(5);
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
      v.applyAxisAngle(EJE_X, COMETA.inclinacion).applyAxisAngle(EJE_Y, COMETA.giro);
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
        anti.z * b.t * largo + (lado.z * Math.cos(b.a) + arriba.z * Math.sin(b.a)) * abre,
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
      </group>
    </>
  );
}

/* ── La Luna junto a la Tierra ───────────────────────────────────────────── */
function LunaPequena({ luna, clara }: { luna: React.RefObject<THREE.Mesh | null>; clara: boolean }) {
  const mapa = useTexturaSS("luna");
  return (
    <mesh ref={luna} scale={clara ? ESCALA_CLARA : 1} raycast={() => null}>
      <sphereGeometry args={[0.16, 32, 16]} />
      <meshStandardMaterial map={mapa} roughness={1} emissiveMap={mapa} emissive="#ffffff" emissiveIntensity={clara ? 0.5 : 0.03} />
    </mesh>
  );
}

/* ── El planeta X de la 3.ª ley ──────────────────────────────────────────── */
function PlanetaX({ grupo, aX }: { grupo: React.RefObject<THREE.Group | null>; aX: number }) {
  const resplandor = useMemo(() => texturaResplandor(), []);
  const puntos = useMemo(() => puntosOrbita(null, aX, false), [aX]);
  return (
    <>
      <Line points={puntos} color={C_X} lineWidth={2} dashed dashSize={1.6} gapSize={1.1} transparent opacity={0.9} />
      <group ref={grupo}>
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.85, 48, 24]} />
          <meshStandardMaterial color={C_X} emissive={C_X} emissiveIntensity={0.45} roughness={0.35} metalness={0.1} />
        </mesh>
        <sprite scale={4.2} raycast={() => null}>
          <spriteMaterial map={resplandor} color={C_X} opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
        </sprite>
      </group>
    </>
  );
}

/* ── Reloj, cámara y todo junto ──────────────────────────────────────────── */
export function MundoVitrina(p: VitrinaProps) {
  const explorador = p.modo === "explorador";
  const tiempo = useRef(0);
  const anios = useRef(0);
  const ultimoAviso = useRef(0);
  const ultimoAvisoCarrera = useRef(0);
  const grupos = useRef<Record<string, THREE.Group | null>>({});
  const estelas = useRef<Record<string, THREE.Mesh | null>>({});
  const luna = useRef<THREE.Mesh>(null);
  const asteroides = useRef<THREE.Group>(null);
  const kuiper = useRef<THREE.Group>(null);
  const cometa = useRef<THREE.Group>(null);
  const planetaX = useRef<THREE.Group>(null);
  const flecha = useRef<THREE.Group>(null);
  const rUltimo = useRef(1);
  const vueltasTierra = useRef<HTMLSpanElement>(null);
  const vueltasX = useRef<HTMLSpanElement>(null);
  const controles = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const lejos = Math.max(1, 1.15 / (size.width / size.height));

  const vuelo = useRef<{ pos: THREE.Vector3; obj: THREE.Vector3; seguir: string | null } | null>(null);
  const siguiendo = useRef<string | null>(null);
  const antes = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const dirSol = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  // El reloj arranca en este instante (y vuelve a él con «Hoy»).
  useEffect(() => {
    tiempo.current = Date.now();
  }, [p.hoyN]);
  useEffect(() => {
    anios.current = 0;
  }, [p.carreraN]);
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

  // A dónde vuela la cámara: con cada botón y al cambiar de modo.
  useEffect(() => {
    const a = explorador ? p.vuelo.a : "periodos";
    const escala = p.clara ? ESCALA_CLARA : 1;
    siguiendo.current = null;
    if (a === "periodos") {
      const k = Math.max(1, dist(p.aX) / dist(9.54));
      vuelo.current = { pos: new THREE.Vector3(0, 150, 112).multiplyScalar(Math.sqrt(lejos) * k), obj: new THREE.Vector3(0, 0, -4), seguir: null };
    } else if (a === "sistema") {
      vuelo.current = { pos: new THREE.Vector3(0, 128, 205).multiplyScalar(lejos), obj: new THREE.Vector3(0, 0, -6), seguir: null };
    } else if (a === "interior") {
      vuelo.current = { pos: new THREE.Vector3(0, 46, 62).multiplyScalar(lejos), obj: new THREE.Vector3(0, 0, -3), seguir: null };
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
      // De lado respecto a la línea Sol–planeta (un poco hacia el Sol): se ve
      // el día y la noche, y la flecha de la fuerza cruza la pantalla
      // apuntando al lado iluminado. La mira se corre hacia el Sol para que
      // la flecha quepa completa.
      const haciaSol = centro.clone().normalize().multiplyScalar(-1);
      const lado = new THREE.Vector3(0, 1, 0).cross(haciaSol).normalize();
      const alto = planeta?.anillo ? 0.9 : 0.42;
      const dir = haciaSol.clone().multiplyScalar(0.14).add(lado.multiplyScalar(1)).add(new THREE.Vector3(0, alto, 0)).normalize();
      const d = (a === "cometa" ? 14 : Math.max(r * 7.5, 3.6)) * lejos;
      const mira = centro.clone().addScaledVector(haciaSol, a === "cometa" ? 0 : r * 1.3);
      antes.current.copy(centro);
      vuelo.current = { pos: mira.clone().add(dir.multiplyScalar(d)), obj: mira, seguir: a };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.vuelo.n, p.modo]);

  useFrame((_, dtReal) => {
    const dt = Math.min(dtReal, 0.1);

    if (explorador) {
      tiempo.current += dt * 1000 * p.velocidad;
      const fecha = tiempo.current;
      const dias = fecha / DIA_MS;
      for (const pl of PLANETAS) {
        const g = grupos.current[pl.id];
        if (g) {
          const r = posicionExplorador(pl, fecha, g.position);
          if (pl.id === p.seleccion) rUltimo.current = r;
        }
      }
      const tierra = grupos.current.tierra;
      if (tierra && luna.current) {
        // La Luna, en la dirección del día: longitud del Sol vista desde la Tierra + elongación.
        const lSol = estadoPlaneta(PLANETAS[2]!, fecha).lon + 180;
        const l = (lSol + elongacionLuna(fecha)) * GRAD;
        const d = 1.25 * (p.clara ? ESCALA_CLARA : 1);
        luna.current.position.set(tierra.position.x + d * Math.cos(l), 0, tierra.position.z - d * Math.sin(l));
      }
      if (asteroides.current) asteroides.current.rotation.y = ((dias / ASTEROIDES.periodoDias) % 1) * 2 * Math.PI;
      if (kuiper.current) kuiper.current.rotation.y = ((dias / KUIPER.periodoDias) % 1) * 2 * Math.PI;
      if (cometa.current) posicionCometa(fecha, cometa.current.position);

      // La flecha de la fuerza sale del planeta elegido y apunta al Sol.
      const sel = grupos.current[p.seleccion];
      if (flecha.current && sel) {
        dirSol.copy(sel.position).multiplyScalar(-1).normalize();
        q.setFromUnitVectors(EJE_Y, dirSol);
        flecha.current.quaternion.copy(q);
        const planeta = PLANETAS.find((x) => x.id === p.seleccion);
        const rr = planeta ? radio(planeta) * (p.clara ? ESCALA_CLARA : 1) * 1.15 : 0;
        flecha.current.position.copy(sel.position).addScaledVector(dirSol, rr);
        // Grosor casi constante en pantalla: delgada de cerca, visible de lejos.
        // De cerca también se acorta, para que no pase junto a la cámara.
        const dCam = camera.position.distanceTo(sel.position);
        const g = THREE.MathUtils.clamp((dCam * 0.0022) / 0.1, 0.2, 2.2);
        const L = largoFuerza(fuerzaSol(planeta?.masaKg ?? 1, rUltimo.current));
        const largo = Math.min(1, Math.max(dCam / 40, (rr * 1.5) / L));
        flecha.current.scale.set(g, largo, g);
      }

      ultimoAviso.current += dtReal;
      if (ultimoAviso.current > 0.12) {
        ultimoAviso.current = 0;
        p.onHora(fecha);
      }
    } else {
      if (p.corriendo) anios.current += dt * p.aniosPorSeg;
      const t = anios.current;
      for (const pl of PLANETAS) {
        const T = pl.anioDias / ANIO_DIAS;
        const ang = (t / T) * 2 * Math.PI;
        const d = dist(pl.ua);
        const g = grupos.current[pl.id];
        if (g) g.position.set(d * Math.cos(ang), 0, -d * Math.sin(ang));
        const est = estelas.current[pl.id];
        if (est) est.geometry.setDrawRange(0, 6 * Math.min(SEG_ESTELA, Math.floor((t / T) * SEG_ESTELA)));
      }
      const TX = periodoAnios(p.aX);
      if (planetaX.current) {
        const ang = (t / TX) * 2 * Math.PI;
        const d = dist(p.aX);
        planetaX.current.position.set(d * Math.cos(ang), 0, -d * Math.sin(ang));
      }
      const estX = estelas.current.x;
      if (estX) estX.geometry.setDrawRange(0, 6 * Math.min(SEG_ESTELA, Math.floor((t / TX) * SEG_ESTELA)));
      if (vueltasTierra.current) vueltasTierra.current.textContent = (t / TIERRA_T).toFixed(2);
      if (vueltasX.current) vueltasX.current.textContent = (t / TX).toFixed(2);
      ultimoAvisoCarrera.current += dtReal;
      if (ultimoAvisoCarrera.current > 0.15) {
        ultimoAvisoCarrera.current = 0;
        p.onCarrera(t);
      }
    }

    // Seguir al cuerpo elegido: la cámara viaja «montada» en él (port de NEM).
    const sigue = vuelo.current?.seguir ?? siguiendo.current;
    const ctlS = controles.current;
    if (sigue && ctlS && explorador) {
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
      const k = 1 - Math.exp(-dt * 2.2);
      camera.position.lerp(v.pos, k);
      ctl.target.lerp(v.obj, k);
      if (camera.position.distanceTo(v.pos) < 0.02 * Math.max(1, v.pos.distanceTo(v.obj) / 4)) {
        siguiendo.current = v.seguir;
        vuelo.current = null;
      }
    }
  });

  // Rótulos: como mucho 4 a la vez (Sol, Tierra, el elegido y el planeta X),
  // salvo que el alumno pida todos los nombres.
  const sel = PLANETAS.find((x) => x.id === p.seleccion);
  const rSel = sel ? estadoPlaneta(sel, p.horaMs).r : 1;
  const Fsel = sel ? fuerzaSol(sel.masaKg, rSel) : 0;
  const escala = p.clara ? ESCALA_CLARA : 1;
  const alto = (pl: Planeta) => radio(pl) * escala * (pl.anillo ? 1.35 : 1.08) + 0.12;
  const conNombre = (id: string) => (explorador ? p.todosNombres || id === p.seleccion || id === "tierra" : id === "tierra" || id === "jupiter");

  return (
    <>
      <ambientLight intensity={p.clara ? 0.55 : 0.03} />
      <ViaLactea brillo={p.clara ? 0.55 : 0.85} />
      <Stars radius={900} depth={300} count={6000} factor={8} saturation={0.25} fade speed={0} />
      <SolFoto radio={RADIO_SOL} onClick={() => p.onSeleccion("sol")} />
      <Rotulo posicion={[0, RADIO_SOL + 1.4, 0]} color="#fbbf24">Sol</Rotulo>

      {PLANETAS.map((pl) => (
        <group key={pl.id}>
          <CuerpoPlaneta
            p={pl}
            grupo={(g) => {
              grupos.current[pl.id] = g;
            }}
            clara={p.clara}
            ejes={p.ejes}
            girando={explorador ? p.velocidad !== 0 : p.corriendo}
            onSeleccion={p.onSeleccion}
          />
          {!explorador && (
            <Estela
              d={dist(pl.ua)}
              color={pl.color}
              estela={(m) => {
                estelas.current[pl.id] = m;
              }}
            />
          )}
        </group>
      ))}

      {/* Rótulos que viajan con su planeta: se montan dentro del grupo con un portal sencillo. */}
      {PLANETAS.filter((pl) => conNombre(pl.id)).map((pl) => (
        <RotuloQueSigue key={pl.id} grupos={grupos} id={pl.id} alto={alto(pl)}>
          {explorador && pl.id === p.seleccion ? (
            <Rotulo posicion={[0, 0, 0]} color={pl.color} fuerte onClick={() => p.onSeleccion(pl.id)}>
              {pl.nombre} · F = {sci(Fsel)} N
            </Rotulo>
          ) : !explorador && pl.id === "tierra" ? (
            <Rotulo posicion={[0, 0, 0]} color={pl.color} fuerte>
              Tierra · <span ref={vueltasTierra}>0.00</span> vueltas
            </Rotulo>
          ) : (
            <Rotulo posicion={[0, 0, 0]} color={pl.color} onClick={explorador ? () => p.onSeleccion(pl.id) : undefined}>
              {pl.nombre}
            </Rotulo>
          )}
        </RotuloQueSigue>
      ))}

      {explorador && p.orbitas && PLANETAS.map((pl) => <Orbita key={pl.id} p={pl} elipse clara={p.clara} resaltada={pl.id === p.seleccion} />)}
      {!explorador && PLANETAS.map((pl) => <Orbita key={pl.id} p={pl} elipse={false} clara={p.clara} resaltada={false} />)}

      {explorador && sel && (
        <group ref={flecha}>
          <FlechaY largo={largoFuerza(Fsel)} grosor={0.1} color="#fbbf24" />
        </group>
      )}

      {explorador && (
        <>
          <LunaPequena luna={luna} clara={p.clara} />
          <Cometa nucleo={cometa} clara={p.clara} onSeleccion={p.onSeleccion} />
        </>
      )}
      <Asteroides grupo={asteroides} clara={p.clara} onSeleccion={p.onSeleccion} />
      <Kuiper grupo={kuiper} clara={p.clara} />

      {!explorador && (
        <>
          <PlanetaX grupo={planetaX} aX={p.aX} />
          <Estela
            d={dist(p.aX)}
            color={C_X}
            estela={(m) => {
              estelas.current.x = m;
            }}
          />
          <RotuloQueSigue id="x" alto={-1.4} refGrupo={planetaX}>
            <Rotulo posicion={[0, 0, 0]} color={C_X} lado="abajo" fuerte>
              X · <span ref={vueltasX}>0.00</span> vueltas
            </Rotulo>
          </RotuloQueSigue>
        </>
      )}

      <OrbitControls
        ref={controles}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.6}
        maxDistance={760}
        rotateSpeed={0.55}
        zoomSpeed={0.9}
      />
    </>
  );
}

/** Pone a sus hijos sobre la posición del cuerpo `id`, cuadro por cuadro. */
function RotuloQueSigue({
  grupos, id, alto, children, refGrupo,
}: {
  grupos?: React.RefObject<Record<string, THREE.Group | null>>;
  id: string;
  alto: number;
  children: React.ReactNode;
  refGrupo?: React.RefObject<THREE.Group | null>;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const destino = refGrupo?.current ?? grupos?.current?.[id];
    if (g.current && destino) g.current.position.set(destino.position.x, destino.position.y + alto, destino.position.z);
  });
  return <group ref={g}>{children}</group>;
}
