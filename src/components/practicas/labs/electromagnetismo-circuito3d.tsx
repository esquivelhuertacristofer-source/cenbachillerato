"use client";

/**
 * Modo «Circuito» (ley de Ohm) — un circuito REAL sobre un banco de trabajo:
 *
 *   fuente de laboratorio (pantallas LED de V y A, perillas, postes rojo/negro)
 *     → cable rojo → resistencia axial con su CÓDIGO DE COLORES correcto
 *     → cable → foco incandescente (su brillo sigue a P = V²/R)
 *     → cable negro → de vuelta a la fuente.
 *   Un multímetro digital con las puntas sobre la resistencia marca V e I.
 *
 * Los electrones (una malla instanciada) salen del borne NEGATIVO y recorren
 * el lazo a una rapidez proporcional a I = V/R (ver `rapidezElectrones`).
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  resolverCircuito, codigoColoresResistencia, rapidezElectrones, brilloFoco,
  V_MIN, V_MAX, V_DEF, R_DEF, fmtV, fmtA, fmtR, fmtW,
} from "./electromagnetismo-data";
import { crearPantalla, dibujarFuente, dibujarMultimetro, texturaTapete } from "./electromagnetismo-texturas";
import {
  type P3, Rotulo, Foco, Cable, PuntaBanana, PosteConexion, Perilla, ElectronesFlujo,
  curvaCompuesta, curvaDe, ACERO, LATON,
} from "./electromagnetismo-piezas3d";

const I_REF = V_DEF / R_DEF;

/* ── Trazado del circuito (unidades de escena; la mesa está en y = 0) ─────── */
const FUENTE: P3 = [-3.3, 0, -1.0];
const POSTE_MAS: P3 = [-2.95, 0.46, -0.13];
const POSTE_MENOS: P3 = [-2.45, 0.46, -0.13];
const RES_C: P3 = [-0.1, 0, 1.0];
const FOCO_C: P3 = [2.75, 0, -0.1];
const MULTI: P3 = [3.55, 0.02, 2.05];

const PTS_ROJO: P3[] = [
  [-2.95, 0.46, 0.2], [-2.98, 0.3, 0.5], [-2.85, 0.1, 0.95], [-2.35, 0.09, 1.3], [-1.85, 0.1, 1.18], [-1.62, 0.2, 1.0],
];
const PTS_PUENTE: P3[] = [
  [1.42, 0.2, 1.0], [1.72, 0.09, 1.1], [2.1, 0.09, 0.92], [2.37, 0.12, 0.55], [2.37, 0.26, 0.28],
];
const PTS_NEGRO: P3[] = [
  [3.13, 0.26, 0.28], [3.32, 0.1, 0.5], [3.7, 0.09, 0.0], [3.45, 0.09, -0.7], [2.3, 0.09, -0.85], [0.6, 0.09, -0.45],
  [-1.1, 0.09, -0.15], [-2.0, 0.1, 0.45], [-2.45, 0.3, 0.5], [-2.45, 0.46, 0.2],
];

export function EscenaCircuito({ V, R, playing, angosto, pocos }: {
  V: number; R: number; playing: boolean; angosto: boolean; pocos: boolean;
}) {
  const c = resolverCircuito(V, R, 1, 1);
  const codigo = codigoColoresResistencia(R);
  const rapidez = rapidezElectrones(c.I, I_REF);
  const b = brilloFoco(c.P);
  // calor de la resistencia: se nota a partir de ~150 W (un calentador la pone al rojo)
  const calor = Math.max(0, Math.min(1, (Math.log10(Math.max(c.P, 1)) - 2.2) / 1.1));

  const brillo = useRef(b);
  useFrame(() => { brillo.current = b; });

  const curvas = useMemo(() => {
    const rojo = curvaDe(PTS_ROJO);
    const puente = curvaDe(PTS_PUENTE);
    const negro = curvaDe(PTS_NEGRO);
    // Lazo de los electrones: del borne NEGATIVO al POSITIVO por fuera.
    const rev = (pts: P3[]) => curvaDe([...pts].reverse());
    const porFoco = curvaDe([[3.13, 0.26, 0.28], [2.95, 0.3, 0.05], [2.75, 0.42, -0.1], [2.55, 0.3, 0.05], [2.37, 0.26, 0.28]]);
    const rx = RES_C[0], rz = RES_C[2];
    const porRes = curvaDe([
      [rx + 1.52, 0.2, rz], [rx + 1.22, 0.32, rz], [rx + 1.2, 0.46, rz], [rx + 0.95, 0.56, rz],
      [rx - 0.95, 0.56, rz], [rx - 1.2, 0.46, rz], [rx - 1.22, 0.32, rz], [rx - 1.52, 0.2, rz],
    ], 0.2);
    const lazo = curvaCompuesta([rev(PTS_NEGRO), porFoco, rev(PTS_PUENTE), porRes, rev(PTS_ROJO)]);
    return { rojo, puente, negro, lazo };
  }, []);

  return (
    <group>
      <Tapete />
      <FuenteLaboratorio V={V} I={c.I} />
      <Cable curva={curvas.rojo} color="#e0262b" />
      <Cable curva={curvas.puente} color="#e0262b" />
      <Cable curva={curvas.negro} color="#18191c" opacidad={0.62} />
      <PuntaBanana pos={[-2.95, 0.46, 0.08]} dir={[0, 0, -1]} color="#e0262b" />
      <PuntaBanana pos={[-2.45, 0.46, 0.08]} dir={[0, 0, -1]} color="#18191c" />

      <group position={RES_C}>
        <Resistencia bandas={codigo.bandas} calor={calor} />
      </group>
      <group position={FOCO_C}>
        <BaseFoco />
        <group position={[0, 0.36, 0]}>
          <Foco brillo={brillo} />
        </group>
      </group>
      <Multimetro V={V} I={c.I} />

      <ElectronesFlujo curva={curvas.lazo} n={pocos ? 30 : 56} rapidez={rapidez} playing={playing} />

      {!angosto && <Rotulo pos={[FUENTE[0], 1.95, FUENTE[2]]} color="#fca5a5">Fuente · {fmtV(V)}</Rotulo>}
      <Rotulo pos={[RES_C[0], 1.15, RES_C[2]]} color="#fde68a" sub={angosto ? undefined : codigo.texto}>R = {fmtR(R)}</Rotulo>
      <Rotulo pos={[FOCO_C[0], 2.75, FOCO_C[2]]} color="#fde047">P = {fmtW(c.P)}</Rotulo>
      <Rotulo pos={[-2.3, 0.6, 1.95]} color="#7dd3fc">I = {fmtA(c.I)}</Rotulo>
    </group>
  );
}

/* ── Tapete antiestático ──────────────────────────────────────────────────── */
function Tapete() {
  const tex = texturaTapete();
  return (
    <RoundedBox args={[10.6, 0.03, 5.6]} radius={0.012} smoothness={2} position={[0.1, 0.015, 0.3]} receiveShadow>
      <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
    </RoundedBox>
  );
}

/* ── Fuente de laboratorio ────────────────────────────────────────────────── */
function FuenteLaboratorio({ V, I }: { V: number; I: number }) {
  const [pantalla] = useState(() => crearPantalla(512, 176));
  useFrame(() => dibujarFuente(pantalla, V, I));
  const giro = (0.75 - ((V - V_MIN) / (V_MAX - V_MIN)) * 1.5) * Math.PI;
  const W = 2.6, H = 1.5, D = 1.7;
  const zF = D / 2;
  return (
    <group position={FUENTE}>
      {/* patas */}
      {[[-1.1, -0.65], [1.1, -0.65], [-1.1, 0.65], [1.1, 0.65]].map(([x, z], i) => (
        <mesh key={i} position={[x!, 0.04, z!]}>
          <cylinderGeometry args={[0.09, 0.11, 0.06, 14]} />
          <meshStandardMaterial color="#0d0d0f" roughness={0.9} />
        </mesh>
      ))}
      {/* gabinete metálico */}
      <RoundedBox args={[W, H, D]} radius={0.06} smoothness={4} position={[0, 0.07 + H / 2, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#39414a" metalness={0.65} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.5} />
      </RoundedBox>
      {/* rejillas de ventilación */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.8 + i * 0.2, 0.07 + H + 0.001, -0.1]}>
          <boxGeometry args={[0.07, 0.004, 0.9]} />
          <meshStandardMaterial color="#0b0d10" roughness={0.9} />
        </mesh>
      ))}
      {/* panel frontal */}
      <mesh position={[0, 0.07 + H / 2, zF + 0.005]}>
        <boxGeometry args={[W - 0.14, H - 0.14, 0.02]} />
        <meshStandardMaterial color="#1b1f24" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* pantallas LED */}
      <mesh position={[0, 1.08, zF + 0.017]}>
        <planeGeometry args={[2.2, 0.76]} />
        <meshBasicMaterial map={pantalla.tex} toneMapped={false} />
      </mesh>
      {/* perillas de V y de límite de corriente */}
      <Perilla pos={[-0.85, 0.42, zF + 0.01]} angulo={giro} />
      <Perilla pos={[-0.3, 0.42, zF + 0.01]} angulo={0.2} />
      {/* interruptor */}
      <mesh position={[-1.08, 0.3, zF + 0.04]}>
        <boxGeometry args={[0.16, 0.24, 0.06]} />
        <meshPhysicalMaterial color="#d81e1e" roughness={0.4} clearcoat={0.6} />
      </mesh>
      <PosteConexion pos={[POSTE_MAS[0] - FUENTE[0], 0.46, zF]} color="#d81e1e" />
      <PosteConexion pos={[POSTE_MENOS[0] - FUENTE[0], 0.46, zF]} color="#141518" />
    </group>
  );
}

/* ── Resistencia axial con código de colores ──────────────────────────────── */
/** Perfil de «hueso» del cuerpo: radio en función de x ∈ [−0.78, 0.78]. */
function radioCuerpo(x: number): number {
  const a = Math.abs(x);
  if (a > 0.78) return 0;
  if (a > 0.7) return 0.2 * Math.sqrt(Math.max(0, 1 - ((a - 0.7) / 0.08) ** 2)) + 0.02;
  if (a > 0.46) return 0.21;
  if (a > 0.38) return 0.21 - ((0.46 - a) / 0.08) * 0.045;
  return 0.165;
}

function Resistencia({ bandas, calor }: { bandas: ReturnType<typeof codigoColoresResistencia>["bandas"]; calor: number }) {
  const geos = useMemo(() => {
    const perfil: THREE.Vector2[] = [];
    const M = 64;
    for (let i = 0; i <= M; i++) {
      const x = -0.78 + (1.56 * i) / M;
      perfil.push(new THREE.Vector2(Math.max(0.001, radioCuerpo(x)), x));
    }
    const cuerpo = new THREE.LatheGeometry(perfil, 40);
    const pata = (s: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(s * 0.75, 0.56, 0), new THREE.Vector3(s * 1.05, 0.56, 0),
          new THREE.Vector3(s * 1.2, 0.48, 0), new THREE.Vector3(s * 1.22, 0.3, 0),
        ], false, "catmullrom", 0.1),
        24, 0.024, 8, false,
      );
    return { cuerpo, pataI: pata(-1), pataD: pata(1) };
  }, []);

  // posiciones de las bandas: dígitos y multiplicador juntos a la izquierda, tolerancia aparte
  const xs = bandas.length === 5 ? [-0.56, -0.33, -0.15, 0.03, 0.56] : [-0.56, -0.3, -0.1, 0.1, 0.56];

  return (
    <group>
      {/* tablilla de madera con dos clemas verdes */}
      <RoundedBox args={[3.4, 0.12, 0.95]} radius={0.04} smoothness={3} position={[0, 0.09, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#b98a55" roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.6} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.32, 0.3, 0]}>
          <RoundedBox args={[0.42, 0.32, 0.5]} radius={0.03} smoothness={2} castShadow>
            <meshPhysicalMaterial color="#1f8a4c" roughness={0.45} clearcoat={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
            <meshStandardMaterial {...ACERO} />
          </mesh>
          <mesh position={[0, 0.19, 0]}>
            <boxGeometry args={[0.16, 0.02, 0.03]} />
            <meshStandardMaterial color="#555b63" metalness={0.9} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh geometry={geos.pataI}><meshStandardMaterial color="#d6dbe0" metalness={1} roughness={0.22} /></mesh>
      <mesh geometry={geos.pataD}><meshStandardMaterial color="#d6dbe0" metalness={1} roughness={0.22} /></mesh>
      <group position={[0, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={geos.cuerpo} castShadow>
          <meshPhysicalMaterial
            color="#d9c08c" roughness={0.5} clearcoat={0.7} clearcoatRoughness={0.25}
            emissive="#ff3a0a" emissiveIntensity={calor * 1.6}
          />
        </mesh>
        {bandas.map((bd, i) => {
          const x = xs[i]!;
          const r = radioCuerpo(x) + 0.006;
          return (
            <mesh key={i} position={[0, -x, 0]}>
              <cylinderGeometry args={[r, r, 0.085, 40, 1, true]} />
              <meshPhysicalMaterial
                color={bd.hex} roughness={bd.metal ? 0.28 : 0.45} metalness={bd.metal ? 0.95 : 0}
                clearcoat={0.7} clearcoatRoughness={0.25} side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ── Portalámparas ────────────────────────────────────────────────────────── */
function BaseFoco() {
  return (
    <group>
      <RoundedBox args={[1.05, 0.2, 0.8]} radius={0.05} smoothness={3} position={[0, 0.12, 0.05]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#3a2618" roughness={0.45} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.3, 0.2, 32]} />
        <meshPhysicalMaterial color="#f1ece2" roughness={0.3} clearcoat={0.8} />
      </mesh>
      {[-0.38, 0.38].map((x) => (
        <group key={x} position={[x, 0.24, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 6]} />
            <meshStandardMaterial {...LATON} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 18]} />
            <meshStandardMaterial {...ACERO} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Multímetro digital con puntas sobre la resistencia ───────────────────── */
function Multimetro({ V, I }: { V: number; I: number }) {
  const [lcd] = useState(() => crearPantalla(384, 256));
  useFrame(() => dibujarMultimetro(lcd, V, I));

  // marco del aparato: recargado hacia atrás sobre su soporte, mirando al frente
  const marco = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...MULTI);
    o.rotation.set(-1.02, -0.42, 0, "YXZ");
    o.updateMatrixWorld(true);
    const local = (x: number, y: number, z: number): P3 => {
      const v = new THREE.Vector3(x, y, z).applyMatrix4(o.matrixWorld);
      return [v.x, v.y, v.z];
    };
    return { rot: o.rotation.clone(), local };
  }, []);

  const cables = useMemo(() => {
    const rx = RES_C[0], rz = RES_C[2];
    const jackRojo = marco.local(0.32, 0.22, 0.2);
    const jackNegro = marco.local(-0.32, 0.22, 0.2);
    const tipRojo: P3 = [rx + 0.98, 0.58, rz + 0.04];
    const tipNegro: P3 = [rx - 0.98, 0.58, rz + 0.04];
    const dir = new THREE.Vector3(0, 0.55, 1).normalize();
    const mango = (tip: P3): P3 => [tip[0] + dir.x * 0.85, tip[1] + dir.y * 0.85, tip[2] + dir.z * 0.85];
    const mR = mango(tipRojo), mN = mango(tipNegro);
    const cR = curvaDe([mR, [mR[0] + 0.2, 0.25, mR[2] + 0.5], [jackRojo[0] - 0.3, 0.12, jackRojo[2] + 0.6], jackRojo]);
    const cN = curvaDe([mN, [mN[0] + 0.3, 0.12, mN[2] + 0.6], [0.9, 0.1, 2.4], [jackNegro[0] - 0.5, 0.12, jackNegro[2] + 0.6], jackNegro]);
    return { tipRojo, tipNegro, dir, cR, cN };
  }, [marco]);

  return (
    <group>
      <group position={MULTI} rotation={marco.rot}>
        {/* funda de hule */}
        <RoundedBox args={[1.32, 2.2, 0.42]} radius={0.12} smoothness={4} position={[0, 1.1, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f2a51a" roughness={0.68} sheen={0.5} sheenColor="#ffd88a" />
        </RoundedBox>
        {/* cara */}
        <RoundedBox args={[1.12, 2.0, 0.08]} radius={0.05} smoothness={3} position={[0, 1.1, 0.19]}>
          <meshPhysicalMaterial color="#25292e" roughness={0.5} clearcoat={0.4} />
        </RoundedBox>
        {/* LCD */}
        <mesh position={[0, 1.65, 0.236]}>
          <planeGeometry args={[0.96, 0.64]} />
          <meshStandardMaterial map={lcd.tex} roughness={0.25} metalness={0} emissive="#ffffff" emissiveMap={lcd.tex} emissiveIntensity={0.25} />
        </mesh>
        {/* selector rotatorio */}
        <group position={[0, 0.95, 0.24]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.34, 0.06, 40]} />
            <meshStandardMaterial color="#3a3f46" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -0.6]} position={[0, 0, 0.06]}>
            <boxGeometry args={[0.1, 0.56, 0.08]} />
            <meshPhysicalMaterial color="#14161a" roughness={0.45} clearcoat={0.5} />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => {
            const a = -2.2 + i * 0.49;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.43, Math.cos(a) * 0.43, 0.005]}>
                <boxGeometry args={[0.035, 0.035, 0.01]} />
                <meshStandardMaterial color={i === 3 ? "#fde047" : "#cbd5e1"} />
              </mesh>
            );
          })}
        </group>
        {/* bornes */}
        {[[-0.32, "#111"], [0, "#111"], [0.32, "#d81e1e"]].map(([x, col]) => (
          <mesh key={String(x)} position={[x as number, 0.22, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.07, 0.025, 10, 24]} />
            <meshPhysicalMaterial color={col as string} roughness={0.4} clearcoat={0.6} />
          </mesh>
        ))}
      </group>
      <Cable curva={cables.cR} color="#d81e1e" radio={0.035} opacidad={0.95} segmentos={80} />
      <Cable curva={cables.cN} color="#16171a" radio={0.035} opacidad={0.95} segmentos={80} />
      <Punta tip={cables.tipRojo} dir={cables.dir} color="#d81e1e" />
      <Punta tip={cables.tipNegro} dir={cables.dir} color="#16171a" />
    </group>
  );
}

/** Punta de prueba: aguja de acero, guarda y mango de color. */
function Punta({ tip, dir, color }: { tip: P3; dir: THREE.Vector3; color: string }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), [dir]);
  return (
    <group position={tip} quaternion={q}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.016, 0.004, 0.24, 10]} />
        <meshStandardMaterial {...ACERO} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.075, 0.06, 0.06, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.56, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.5} />
      </mesh>
    </group>
  );
}
