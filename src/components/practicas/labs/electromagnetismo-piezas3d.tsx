"use client";

/**
 * Piezas 3D compartidas por los tres modos del laboratorio de Electromagnetismo:
 * el foco incandescente (vidrio, filamento en espiral, rosca), el cable con
 * funda de goma translúcida y alma de cobre, las puntas banana, los postes de
 * conexión, las perillas moleteadas, los electrones instanciados que viajan
 * por una curva y el rótulo <Html> (≥ 14 px).
 *
 * Reglas: nada de `new THREE.X` dentro de useFrame (todo se reserva antes);
 * las geometrías van en useMemo; la animación solo MUTA refs.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export type P3 = [number, number, number];

export const COBRE = { color: "#c8763a", metalness: 1, roughness: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.2 } as const;
export const LATON = { color: "#c9a44a", metalness: 1, roughness: 0.3 } as const;
export const ACERO = { color: "#b9c2cc", metalness: 1, roughness: 0.32 } as const;
export const ACERO_OSCURO = { color: "#5b636d", metalness: 0.9, roughness: 0.4 } as const;
export const CARBON = { color: "#2a2a2c", metalness: 0.1, roughness: 0.85 } as const;

/* ── Rótulo ───────────────────────────────────────────────────────────────── */
export function Rotulo({ pos, color, children, sub }: { pos: P3; color: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div
        style={{
          whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 9, background: "rgba(5,13,26,0.82)",
          border: `1px solid ${color}99`, color, fontWeight: 900, fontSize: 14, lineHeight: 1.25,
          fontFamily: "ui-monospace, monospace", boxShadow: "0 6px 18px -8px rgba(0,0,0,0.8)", textAlign: "center",
        }}
      >
        {children}
        {sub && <div style={{ fontSize: 14, fontWeight: 700, color: "#cbd5e1", fontFamily: "system-ui, sans-serif" }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* ── Foco incandescente ───────────────────────────────────────────────────── */
const C_TIBIO = new THREE.Color("#ff4a12");
const C_BLANCO = new THREE.Color("#ffe7bf");

/**
 * Foco con vidrio, rosca de aluminio y filamento en espiral. `brillo` (ref
 * 0–1) se lee en cada cuadro: el filamento pasa de rojo a blanco cálido, la
 * luz puntual crece y el bloom hace el resto.
 */
export function Foco({ brillo, escala = 1 }: { brillo: React.MutableRefObject<number>; escala?: number }) {
  const geos = useMemo(() => {
    // vidrio (perfil A19)
    const perfil = new THREE.SplineCurve([
      new THREE.Vector2(0.2, 0.42), new THREE.Vector2(0.23, 0.56), new THREE.Vector2(0.32, 0.76),
      new THREE.Vector2(0.47, 0.98), new THREE.Vector2(0.56, 1.2), new THREE.Vector2(0.57, 1.4),
      new THREE.Vector2(0.52, 1.6), new THREE.Vector2(0.4, 1.76), new THREE.Vector2(0.22, 1.86),
      new THREE.Vector2(0.001, 1.9),
    ]).getPoints(40);
    const vidrio = new THREE.LatheGeometry(perfil, 48);
    // rosca: diente de sierra
    const rosca: THREE.Vector2[] = [new THREE.Vector2(0.001, 0)];
    for (let i = 0; i <= 24; i++) {
      const y = 0.04 + (i / 24) * 0.4;
      rosca.push(new THREE.Vector2(0.19 + (i % 2 === 0 ? 0.0 : 0.028), y));
    }
    rosca.push(new THREE.Vector2(0.2, 0.44));
    const casquillo = new THREE.LatheGeometry(rosca, 40);
    // filamento: espiral apretada entre los dos soportes
    const pts: THREE.Vector3[] = [];
    const vueltas = 14;
    for (let i = 0; i <= vueltas * 12; i++) {
      const u = i / (vueltas * 12);
      const a = u * vueltas * Math.PI * 2;
      pts.push(new THREE.Vector3(-0.17 + u * 0.34, 1.3 + Math.sin(u * Math.PI) * 0.05 + Math.cos(a) * 0.028, Math.sin(a) * 0.028));
    }
    const filamento = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.009, 6, false);
    const soporte = (x: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(x * 0.3, 0.5, 0), new THREE.Vector3(x * 0.6, 0.95, 0), new THREE.Vector3(x, 1.3, 0)]),
        20, 0.008, 5, false,
      );
    return { vidrio, casquillo, filamento, sopI: soporte(-0.17), sopD: soporte(0.17) };
  }, []);

  const filMat = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const luz = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const b = Math.max(0, Math.min(1.2, brillo.current));
    if (filMat.current) {
      filMat.current.emissive.copy(C_TIBIO).lerp(C_BLANCO, Math.min(1, b * 1.1));
      filMat.current.emissiveIntensity = 0.3 + b * b * 9;
    }
    if (halo.current) {
      halo.current.color.copy(C_TIBIO).lerp(C_BLANCO, Math.min(1, b));
      halo.current.opacity = Math.min(0.55, b * b * 0.6);
    }
    if (luz.current) {
      luz.current.intensity = b * b * 16;
      luz.current.color.copy(C_TIBIO).lerp(C_BLANCO, Math.min(1, b));
    }
  });

  return (
    <group scale={escala}>
      <mesh geometry={geos.casquillo} castShadow>
        <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.28} />
      </mesh>
      {/* aislante negro y contacto de la punta */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 0.05, 24]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* tallo de vidrio y soportes */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.035, 0.08, 0.36, 16]} />
        <meshPhysicalMaterial color="#e8f4ff" roughness={0.1} transparent opacity={0.45} clearcoat={1} />
      </mesh>
      <mesh geometry={geos.sopI}><meshStandardMaterial {...ACERO} /></mesh>
      <mesh geometry={geos.sopD}><meshStandardMaterial {...ACERO} /></mesh>
      <mesh geometry={geos.filamento}>
        <meshStandardMaterial ref={filMat} color="#3a2a1e" emissive="#ff4a12" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      {/* resplandor que llena el vidrio cuando el filamento está caliente */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshBasicMaterial ref={halo} color="#ffcf8a" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh geometry={geos.vidrio} renderOrder={2}>
        <meshPhysicalMaterial
          color="#fffaf0" roughness={0.03} metalness={0} transparent opacity={0.2} clearcoat={1}
          clearcoatRoughness={0.05} envMapIntensity={2.2} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={luz} position={[0, 1.3, 0]} intensity={0} distance={11} decay={1.6} color="#ffd9a0" />
    </group>
  );
}

/* ── Cable con funda de goma ──────────────────────────────────────────────── */
/**
 * Funda de goma translúcida (como las puntas de prueba de silicón) con el
 * alma de cobre dentro: así se ven los electrones que viajan por el cable.
 */
export function Cable({ curva, color, radio = 0.075, opacidad = 0.55, segmentos = 120 }: {
  curva: THREE.Curve<THREE.Vector3>; color: string; radio?: number; opacidad?: number; segmentos?: number;
}) {
  const geos = useMemo(() => ({
    funda: new THREE.TubeGeometry(curva, segmentos, radio, 14, false),
    alma: new THREE.TubeGeometry(curva, segmentos, radio * 0.3, 6, false),
  }), [curva, radio, segmentos]);
  return (
    <group>
      <mesh geometry={geos.alma}>
        <meshStandardMaterial {...COBRE} />
      </mesh>
      <mesh geometry={geos.funda} castShadow renderOrder={1}>
        <meshPhysicalMaterial
          color={color} roughness={0.38} metalness={0} clearcoat={0.5} clearcoatRoughness={0.4}
          sheen={0.4} sheenColor="#ffffff" transparent opacity={opacidad} depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Orientación (cuaternión) que lleva el eje +Y local a la dirección `dir`. */
export function orientar(dir: THREE.Vector3): THREE.Quaternion {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
}

/** Punta banana: funda de color + espiga de cobre. `dir` apunta hacia donde entra. */
export function PuntaBanana({ pos, dir, color }: { pos: P3; dir: P3; color: string }) {
  const q = useMemo(() => orientar(new THREE.Vector3(...dir)), [dir]);
  return (
    <group position={pos} quaternion={q}>
      <mesh position={[0, -0.16, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.085, 0.3, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.16, 12]} />
        <meshStandardMaterial {...COBRE} />
      </mesh>
    </group>
  );
}

/** Poste de conexión de laboratorio (rojo o negro) que sale de un panel hacia +Z. */
export function PosteConexion({ pos, color }: { pos: P3; color: string }) {
  return (
    <group position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 6]} />
        <meshStandardMaterial {...ACERO} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.16, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
        <meshStandardMaterial {...LATON} />
      </mesh>
    </group>
  );
}

/** Perilla moleteada con faldón y marca blanca; gira `angulo` rad sobre su eje Z. */
export function Perilla({ pos, angulo, radio = 0.17, color = "#1a1d21" }: { pos: P3; angulo: number; radio?: number; color?: string }) {
  return (
    <group position={pos}>
      <group rotation={[0, 0, angulo]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
          <cylinderGeometry args={[radio * 1.25, radio * 1.25, 0.04, 32]} />
          <meshStandardMaterial {...ACERO_OSCURO} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]} castShadow>
          <cylinderGeometry args={[radio * 0.92, radio, 0.16, 28]} />
          <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, radio * 0.55, 0.205]}>
          <boxGeometry args={[0.03, radio * 0.75, 0.01]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    </group>
  );
}

/* ── Electrones que viajan por una curva ──────────────────────────────────── */
/**
 * `n` electrones instanciados, repartidos a lo largo de `curva` (parametrizada
 * por longitud de arco), que avanzan a `rapidez` unidades/s. Una sola malla
 * instanciada: un dibujo por cuadro aunque sean cien.
 */
export function ElectronesFlujo({ curva, n, rapidez, playing, color = "#7dd3fc", radio = 0.04 }: {
  curva: THREE.Curve<THREE.Vector3>; n: number; rapidez: number; playing: boolean; color?: string; radio?: number;
}) {
  const malla = useRef<THREE.InstancedMesh>(null);
  const fase = useRef(0);
  const largo = useMemo(() => curva.getLength(), [curva]);
  const aux = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3() }), []);
  useFrame((_, dt) => {
    const m = malla.current;
    if (!m) return;
    if (playing) fase.current = (fase.current + (Math.min(dt, 0.05) * rapidez) / largo) % 1;
    for (let i = 0; i < n; i++) {
      const u = (fase.current + i / n) % 1;
      curva.getPointAt(u, aux.p);
      aux.o.position.copy(aux.p);
      aux.o.updateMatrix();
      m.setMatrixAt(i, aux.o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={malla} args={[undefined, undefined, n]} frustumCulled={false}>
      <sphereGeometry args={[radio, 12, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} toneMapped={false} />
    </instancedMesh>
  );
}

/** Curva compuesta de varios tramos (para el lazo de electrones). */
export function curvaCompuesta(tramos: THREE.Curve<THREE.Vector3>[]): THREE.CurvePath<THREE.Vector3> {
  const cp = new THREE.CurvePath<THREE.Vector3>();
  for (const t of tramos) cp.add(t);
  return cp;
}

/** CatmullRom a partir de puntos [x,y,z]. */
export function curvaDe(pts: P3[], tension = 0.5): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", tension);
}
