"use client";

/**
 * EL MODELO CUÁNTICO (Schrödinger, 1926): nubes de probabilidad REALES.
 *
 * Cada punto es una posición posible del electrón, muestreada de |ψ|² de la
 * función de onda hidrogenoide (parte radial R_nl por inversión de su
 * distribución, parte angular por aceptación–rechazo). Donde hay más puntos es
 * más probable encontrarlo. El color es la FASE (signo de ψ): los lóbulos
 * opuestos de un orbital p tienen fase contraria. Los lóbulos se pueden
 * separar para verlos uno por uno, y los planos o esferas nodales —donde la
 * probabilidad es cero— se pueden mostrar.
 *
 * Se dibuja con un solo `THREE.Points` por orbital y un sombreador propio:
 * decenas de miles de puntos sin crear una malla por punto.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Etiqueta, Halo, PROTON_COLOR } from "./modelos-atomicos-kit3d";
import {
  configuracion,
  muestrearOrbital,
  nodosRadiales,
  radio90,
  type Angular,
  type OrbitalSpec,
} from "./modelos-atomicos-fisica";

/** Lo que el alumno puede elegir en el panel. */
export type VistaOrbital =
  | "1s" | "2s" | "3s"
  | "2px" | "2py" | "2pz" | "2p"
  | "3dxy" | "3dxz" | "3dyz" | "3dx2y2" | "3dz2" | "3d"
  | "atomo";

const SPEC: Record<Exclude<VistaOrbital, "2p" | "3d" | "atomo">, OrbitalSpec> = {
  "1s": { n: 1, l: 0, ang: "s" },
  "2s": { n: 2, l: 0, ang: "s" },
  "3s": { n: 3, l: 0, ang: "s" },
  "2px": { n: 2, l: 1, ang: "px" },
  "2py": { n: 2, l: 1, ang: "py" },
  "2pz": { n: 2, l: 1, ang: "pz" },
  "3dxy": { n: 3, l: 2, ang: "dxy" },
  "3dxz": { n: 3, l: 2, ang: "dxz" },
  "3dyz": { n: 3, l: 2, ang: "dyz" },
  "3dx2y2": { n: 3, l: 2, ang: "dx2y2" },
  "3dz2": { n: 3, l: 2, ang: "dz2" },
};

/** Orbitales que componen una vista (uno, un subnivel completo o el átomo). */
export function orbitalesDeVista(v: VistaOrbital): OrbitalSpec[] {
  if (v === "2p") return [SPEC["2px"], SPEC["2py"], SPEC["2pz"]];
  if (v === "3d") return [SPEC["3dxy"], SPEC["3dxz"], SPEC["3dyz"], SPEC["3dx2y2"], SPEC["3dz2"]];
  if (v === "atomo") return [];
  return [SPEC[v]];
}

/** Radio del 90 % de la vista (a₀), para el tamaño y la escala. */
export function radioVista(v: VistaOrbital, Z = 1): number {
  if (v === "atomo") {
    const occ = configuracion(Z);
    return Math.max(...occ.map((o) => radio90(o.orb.n, o.orb.l, o.zEf)));
  }
  return Math.max(...orbitalesDeVista(v).map((o) => radio90(o.n, o.l, 1)));
}

const TAM = 1.85; // radio en escena del 90 % de la nube

/* Colores: fase + (azul) y fase − (naranja); por subnivel en la vista «átomo». */
const FASE_MAS = new THREE.Color("#4fb8ff");
const FASE_MENOS = new THREE.Color("#ff8a3d");
const NEUTRO = new THREE.Color("#9fdcff");
const COLOR_SUBNIVEL: Record<string, string> = {
  "1s": "#60a5fa", "2s": "#38bdf8", "2p": "#fb923c", "3s": "#a78bfa", "3p": "#f472b6", "4s": "#4ade80",
};

const VERT = /* glsl */ `
  uniform float uSeparar;
  uniform float uTam;
  uniform float uTiempo;
  uniform float uFase;
  uniform vec3 uMas;
  uniform vec3 uMenos;
  uniform vec3 uNeutro;
  attribute float aSigno;
  attribute vec3 aDir;
  attribute float aAzar;
  attribute vec3 aColor;
  attribute float aUsaColor;
  varying vec3 vCol;
  varying float vBrillo;
  void main() {
    vec3 p = position + aDir * uSeparar;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uTam * (0.65 + 0.7 * aAzar) / -mv.z;
    vec3 fase = aSigno > 0.0 ? uMas : uMenos;
    vec3 base = mix(uNeutro, fase, uFase);
    vCol = mix(base, aColor, aUsaColor);
    vBrillo = 0.72 + 0.28 * sin(uTiempo * 1.7 + aAzar * 40.0);
  }
`;
const FRAG = /* glsl */ `
  uniform float uIntensidad;
  varying vec3 vCol;
  varying float vBrillo;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    float a = exp(-d * 3.2);
    gl_FragColor = vec4(vCol * a * vBrillo * uIntensidad, 1.0);
  }
`;

interface Capa {
  geo: THREE.BufferGeometry;
}

function construirNube(
  orbs: { spec: OrbitalSpec; Z: number; cuantos: number; color?: string; brillo?: number }[],
  escala: number,
  semilla: number,
): THREE.BufferGeometry {
  const total = orbs.reduce((a, o) => a + o.cuantos, 0);
  const pos = new Float32Array(total * 3);
  const signo = new Float32Array(total);
  const dir = new Float32Array(total * 3);
  const azar = new Float32Array(total);
  const col = new Float32Array(total * 3);
  const usa = new Float32Array(total);
  let k = 0;
  const c = new THREE.Color();
  orbs.forEach((o, idx) => {
    const m = muestrearOrbital(o.spec, o.Z, o.cuantos, semilla + idx * 7919);
    if (o.color) c.set(o.color).multiplyScalar(o.brillo ?? 1);
    for (let i = 0; i < o.cuantos; i++, k++) {
      pos[k * 3] = m.pos[i * 3]! * escala;
      pos[k * 3 + 1] = m.pos[i * 3 + 1]! * escala;
      pos[k * 3 + 2] = m.pos[i * 3 + 2]! * escala;
      dir[k * 3] = m.dir[i * 3]!;
      dir[k * 3 + 1] = m.dir[i * 3 + 1]!;
      dir[k * 3 + 2] = m.dir[i * 3 + 2]!;
      signo[k] = m.signo[i]!;
      azar[k] = m.azar[i]!;
      if (o.color) {
        col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
        usa[k] = 1;
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSigno", new THREE.BufferAttribute(signo, 1));
  g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  g.setAttribute("aAzar", new THREE.BufferAttribute(azar, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aUsaColor", new THREE.BufferAttribute(usa, 1));
  g.computeBoundingSphere();
  return g;
}

/* Planos nodales (donde ψ = 0 por la parte angular), en ejes de la escena:
 * x → x, y del orbital → −z de la escena, z del orbital → y de la escena. */
function planosNodales(a: Angular): { rot: [number, number, number] }[] {
  const PX: [number, number, number] = [0, Math.PI / 2, 0]; // plano x = 0
  const PY: [number, number, number] = [0, 0, 0]; // plano y(orbital) = 0 → z escena = 0
  const PZ: [number, number, number] = [Math.PI / 2, 0, 0]; // plano z(orbital) = 0 → y escena = 0
  switch (a) {
    case "px": return [{ rot: PX }];
    case "py": return [{ rot: PY }];
    case "pz": return [{ rot: PZ }];
    case "dxy": return [{ rot: PX }, { rot: PY }];
    case "dxz": return [{ rot: PX }, { rot: PZ }];
    case "dyz": return [{ rot: PY }, { rot: PZ }];
    case "dx2y2": return [{ rot: [0, Math.PI / 4, 0] }, { rot: [0, -Math.PI / 4, 0] }];
    default: return [];
  }
}

export default function NubeOrbital({
  vista,
  Z,
  separar,
  fases,
  nodos,
  ligero,
}: {
  vista: VistaOrbital;
  Z: number;
  separar: number;
  fases: boolean;
  nodos: boolean;
  ligero: boolean;
}) {
  const dpr = useThree((s) => s.viewport.dpr);
  const alto = useThree((s) => s.size.height);

  const { capa, escala, specs } = useMemo(() => {
    const porOrb = ligero ? 9000 : 32000;
    let orbs: { spec: OrbitalSpec; Z: number; cuantos: number; color?: string; brillo?: number }[];
    let r90: number;
    if (vista === "atomo") {
      const occ = configuracion(Z);
      r90 = Math.max(...occ.map((o) => radio90(o.orb.n, o.orb.l, o.zEf)));
      // Peso por electrones Y por tamaño: la nube interna es diminuta y, con
      // tantos puntos como la externa, se quemaba en un punto blanco.
      const peso = occ.map((o) => o.electrones * Math.pow(radio90(o.orb.n, o.orb.l, o.zEf) / r90, 0.8));
      const totalP = peso.reduce((a, b) => a + b, 0) || 1;
      const presupuesto = ligero ? 16000 : 48000;
      orbs = occ.map((o, i) => ({
        spec: o.orb,
        Z: o.zEf,
        cuantos: Math.max(400, Math.round((peso[i]! / totalP) * presupuesto)),
        brillo: Math.min(1, Math.max(0.08, (radio90(o.orb.n, o.orb.l, o.zEf) / r90) * 1.1)),
        color: COLOR_SUBNIVEL[`${o.orb.n}${o.orb.l === 0 ? "s" : "p"}`],
      }));
    } else {
      const lista = orbitalesDeVista(vista);
      r90 = Math.max(...lista.map((o) => radio90(o.n, o.l, 1)));
      const cada = lista.length > 1 ? Math.round((porOrb * 1.6) / lista.length) : porOrb;
      orbs = lista.map((o) => ({ spec: o, Z: 1, cuantos: cada }));
    }
    const escala = TAM / r90;
    const capa: Capa = { geo: construirNube(orbs, escala, 4242 + Z * 13) };
    return { capa, escala, specs: orbs.map((o) => o.spec) };
  }, [vista, Z, ligero]);

  useEffect(() => () => capa.geo.dispose(), [capa]);

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const brumaRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsBruma = useMemo(
    () => ({
      uSeparar: { value: 0 },
      uTam: { value: 160 },
      uTiempo: { value: 0 },
      uFase: { value: 1 },
      uMas: { value: FASE_MAS.clone() },
      uMenos: { value: FASE_MENOS.clone() },
      uNeutro: { value: NEUTRO.clone() },
      uIntensidad: { value: 0.03 },
    }),
    [],
  );
  const uniforms = useMemo(
    () => ({
      uSeparar: { value: 0 },
      uTam: { value: 40 },
      uTiempo: { value: 0 },
      uFase: { value: 1 },
      uMas: { value: FASE_MAS.clone() },
      uMenos: { value: FASE_MENOS.clone() },
      uNeutro: { value: NEUTRO.clone() },
      uIntensidad: { value: 0.55 },
    }),
    [],
  );

  const nPuntos = capa.geo.getAttribute("position").count;
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 5);
    const base = alto * dpr * (ligero ? 0.05 : 0.036) * Math.sqrt(32000 / Math.max(8000, nPuntos));
    const pares: [THREE.ShaderMaterial | null, number, number][] = [
      [matRef.current, base, vista === "atomo" ? 0.4 : 0.5],
      // bruma: los mismos puntos, grandes y tenues → la nube se lee como volumen
      [brumaRef.current, base * 5, vista === "atomo" ? 0.018 : 0.026],
    ];
    for (const [m, tam, inten] of pares) {
      if (!m) continue;
      const u = m.uniforms;
      u.uTiempo!.value = state.clock.elapsedTime;
      u.uSeparar!.value += (separar * 1.1 - u.uSeparar!.value) * k;
      u.uFase!.value += ((fases ? 1 : 0) - u.uFase!.value) * k;
      u.uTam!.value = tam;
      u.uIntensidad!.value = inten;
    }
  });

  // Superficies nodales: planos angulares y esferas radiales (solo un orbital)
  const unico = specs.length === 1 ? specs[0]! : null;
  const planos = unico ? planosNodales(unico.ang) : [];
  const esferas = unico ? nodosRadiales(unico.n, unico.l).map((rho) => rho * escala) : [];

  return (
    <group>
      <points geometry={capa.geo} frustumCulled={false}>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {!ligero && (
        <points geometry={capa.geo} frustumCulled={false}>
          <shaderMaterial
            ref={brumaRef}
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={uniformsBruma}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      {/* Núcleo diminuto */}
      <mesh>
        <sphereGeometry args={[0.045, 24, 16]} />
        <meshPhysicalMaterial color={PROTON_COLOR} emissive="#ff3b2a" emissiveIntensity={1.4} roughness={0.3} clearcoat={1} />
      </mesh>
      <Halo color="#ff6b5a" escala={0.35} opacidad={0.5} />

      {/* Ejes (tubos, no líneas de 1 px) */}
      {[
        { rot: [0, 0, Math.PI / 2] as [number, number, number], col: "#ff7b7b" },
        { rot: [0, 0, 0] as [number, number, number], col: "#7bffb0" },
        { rot: [Math.PI / 2, 0, 0] as [number, number, number], col: "#7bb8ff" },
      ].map((e, i) => (
        <mesh key={i} rotation={e.rot}>
          <cylinderGeometry args={[0.009, 0.009, TAM * 2.3, 8]} />
          <meshStandardMaterial color={e.col} emissive={e.col} emissiveIntensity={0.4} transparent opacity={0.55} />
        </mesh>
      ))}

      {nodos &&
        planos.map((p, i) => (
          <mesh key={`p${i}`} rotation={p.rot}>
            <circleGeometry args={[TAM * 1.25, 72]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      {nodos &&
        esferas.map((r, i) => (
          <mesh key={`e${i}`}>
            <sphereGeometry args={[r, 48, 32]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}

      <Etiqueta pos={[TAM * 1.12, 0, 0]} color="#ff7b7b" lado="right">x</Etiqueta>
      <Etiqueta pos={[0, TAM * 1.12, 0]} color="#7bffb0" lado="right">z</Etiqueta>
      <Etiqueta pos={[0, 0, -TAM * 1.12]} color="#7bb8ff" lado="up">y</Etiqueta>
    </group>
  );
}
