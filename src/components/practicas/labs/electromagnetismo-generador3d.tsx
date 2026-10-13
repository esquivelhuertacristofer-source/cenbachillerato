"use client";

/**
 * Modo «Generador» (inducción de Faraday) — un generador de verdad:
 *
 *   turbina Francis (como las de Chicoasén o Malpaso) movida por el agua de la
 *   tubería forzada → flecha → bobina de cobre de N vueltas que gira entre los
 *   polos N (rojo) y S (azul) de un imán de herradura → anillos colectores y
 *   escobillas de carbón → un foco y un osciloscopio de dos canales.
 *
 * Todo corre con UN reloj: el tiempo real t (s), que avanza en cámara lenta
 * ×60. Con él gira la bobina (θ = ωt), late el foco (∝ sen²ωt), oscilan los
 * electrones en los cables (corriente ALTERNA) y el osciloscopio dibuja
 * FEM = N·B·A·ω·sen(ωt) (CH1) y el flujo Φ = B·A·cos(ωt) (CH2): la FEM es
 * máxima justo cuando el flujo cruza por cero.
 */

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  resolverGenerador, escalaVoltsDiv, fmtVDiv, CAMARA_LENTA, OSC_MS_DIV, OSC_DIV_X, OSC_DIV_Y,
  fmtV, fmtHz, fmt2,
} from "./electromagnetismo-data";
import { crearPantalla, dibujarOsciloscopio, texturaRayas, texturaLetra } from "./electromagnetismo-texturas";
import { type P3, Rotulo, Foco, Cable, Perilla, curvaDe, COBRE, LATON, ACERO, ACERO_OSCURO, CARBON } from "./electromagnetismo-piezas3d";

/** Altura del eje de giro sobre la mesa. */
const YE = 1.75;
const X_TURB = -3.75;
const X_ANILLO_A = 1.62;
const X_ANILLO_B = 2.0;
const FOCO_G: P3 = [4.25, 0, -1.05];
const OSC: P3 = [4.45, 0, 1.0];

type Reloj = React.MutableRefObject<number>;

export function EscenaGenerador({ N, B, area, f, playing, angosto, pocos }: {
  N: number; B: number; area: number; f: number; playing: boolean; angosto: boolean; pocos: boolean;
}) {
  const g = resolverGenerador(N, B, area, f);
  const t = useRef(0);
  const brillo = useRef(0);
  const nivel = Math.max(0.05, Math.min(1.15, Math.log10(g.femRms + 1) / Math.log10(128)));
  useFrame((_, dt) => {
    if (playing) t.current += Math.min(dt, 0.05) / CAMARA_LENTA;
    const s = Math.sin(g.omega * t.current);
    brillo.current = nivel * s * s;
  });

  const cables = useMemo(() => {
    const a = curvaDe([[X_ANILLO_A, YE + 0.72, 0], [X_ANILLO_A + 0.1, YE + 1.05, -0.2], [2.6, 1.6, -0.9], [3.4, 0.4, -1.05], [3.86, 0.26, -0.85]]);
    const b = curvaDe([[X_ANILLO_B, YE + 0.72, 0], [X_ANILLO_B + 0.15, YE + 1.0, 0.1], [3.0, 1.3, -0.3], [4.1, 0.35, -0.55], [4.64, 0.26, -0.85]]);
    const sondaA = curvaDe([[3.86, 0.3, -0.85], [3.7, 0.12, -0.2], [3.85, 0.1, 0.5], [4.05, 0.35, 0.72]]);
    const sondaB = curvaDe([[4.64, 0.3, -0.85], [4.7, 0.12, -0.3], [4.55, 0.1, 0.4], [4.35, 0.35, 0.62]]);
    // trayecto de los electrones: escobilla A → foco → escobilla B
    const lazo = new THREE.CurvePath<THREE.Vector3>();
    lazo.add(a);
    lazo.add(curvaDe([[3.86, 0.26, -0.85], [4.25, 0.5, -1.05], [4.64, 0.26, -0.85]]));
    lazo.add(curvaDe([...b.points.map((p) => [p.x, p.y, p.z] as P3)].reverse()));
    return { a, b, sondaA, sondaB, lazo };
  }, []);

  return (
    <group>
      <Bancada />
      <Presa />
      <Turbina reloj={t} omega={g.omega} pocos={pocos} />
      <Chumacera x={-2.05} />
      <Chumacera x={2.55} />
      {/* flecha */}
      <mesh position={[(-4.3 + 2.85) / 2, YE, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 4.3 + 2.85, 20]} />
        <meshStandardMaterial {...ACERO} />
      </mesh>
      <ImanHerradura />
      <LineasCampo B={B} />
      <Rotor reloj={t} omega={g.omega} N={N} area={area} />
      <Escobillas />
      <Cable curva={cables.a} color="#d81e1e" radio={0.05} opacidad={0.6} segmentos={90} />
      <Cable curva={cables.b} color="#18191c" radio={0.05} opacidad={0.65} segmentos={90} />
      <Cable curva={cables.sondaA} color="#fde047" radio={0.028} opacidad={0.95} segmentos={50} />
      <Cable curva={cables.sondaB} color="#16171a" radio={0.028} opacidad={0.95} segmentos={50} />
      <ElectronesAlternos curva={cables.lazo} n={pocos ? 30 : 64} reloj={t} omega={g.omega} femPico={g.femPico} />
      <group position={FOCO_G}>
        <BaseFocoGen />
        <group position={[0, 0.36, 0]}>
          <Foco brillo={brillo} />
        </group>
      </group>
      <Osciloscopio reloj={t} femPico={g.femPico} omega={g.omega} f={f} />

      {!angosto && <Rotulo pos={[X_TURB, 3.55, 0.2]} color="#7dd3fc" sub="como en Chicoasén, Chiapas">Turbina Francis</Rotulo>}
      <Rotulo pos={[0.3, YE + 2.55, 0.9]} color="#fdba74">{N} vueltas · B = {fmt2(B)} T</Rotulo>
      <Rotulo pos={[OSC[0] + 0.35, 2.55, OSC[2] + 0.2]} color="#fde047">FEM máx = {fmtV(g.femPico)}</Rotulo>
      {!angosto && <Rotulo pos={[FOCO_G[0], 3.1, FOCO_G[2]]} color="#fcd34d">{fmtHz(f)} · cámara lenta ×{CAMARA_LENTA}</Rotulo>}
    </group>
  );
}

/* ── Bancada de hierro fundido ────────────────────────────────────────────── */
function Bancada() {
  return (
    <group>
      <RoundedBox args={[8.6, 0.14, 2.7]} radius={0.05} smoothness={3} position={[-0.95, 0.07, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2c3b3a" metalness={0.55} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.6} />
      </RoundedBox>
      {/* zócalo de concreto bajo la turbina */}
      <RoundedBox args={[2.3, 0.3, 2.4]} radius={0.04} smoothness={2} position={[X_TURB, 0.29, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7c7f80" roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

/** Tubería forzada que baja de la presa (se pierde en la niebla del fondo). */
function Presa() {
  const tubo = useMemo(() => new THREE.TubeGeometry(curvaDe([
    [X_TURB, 9.5, -12], [X_TURB, 7.4, -8.2], [X_TURB, 5.6, -5.0], [X_TURB, 4.6, -3.6], [X_TURB, 3.5, -2.1], [X_TURB, 2.85, -1.05],
  ]), 40, 0.42, 24, false), []);
  return (
    <group>
      <mesh geometry={tubo} castShadow>
        <meshPhysicalMaterial color="#3f5f7d" metalness={0.6} roughness={0.42} clearcoat={0.4} />
      </mesh>
      {/* anillos de refuerzo de la tubería */}
      {[[4.6, -3.6], [3.5, -2.1]].map(([y, z], i) => (
        <mesh key={i} position={[X_TURB, y!, z!]} rotation={[Math.PI / 2 - 0.6, 0, 0]}>
          <torusGeometry args={[0.45, 0.05, 10, 32]} />
          <meshStandardMaterial {...ACERO_OSCURO} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Turbina Francis en corte ─────────────────────────────────────────────── */
function Turbina({ reloj, omega, pocos }: { reloj: Reloj; omega: number; pocos: boolean }) {
  const rodete = useRef<THREE.Group>(null);
  const agua = useRef<THREE.InstancedMesh>(null);
  const nAgua = pocos ? 50 : 120;
  const geos = useMemo(() => {
    // álabe curvo y torcido: una caja con segmentos que se dobla
    const alabe = new THREE.BoxGeometry(0.72, 0.5, 0.035, 10, 4, 1);
    const p = alabe.attributes.position!;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const u = (x + 0.36) / 0.72;
      p.setZ(i, z + 0.28 * u * u + y * 0.45);
    }
    alabe.computeVertexNormals();
    return { alabe };
  }, []);
  const aux = useMemo(() => ({ o: new THREE.Object3D() }), []);
  const semillas = useMemo(() => Array.from({ length: nAgua }, (_, i) => ({
    f: (i * 0.618034) % 1, x: ((i * 0.3819) % 1 - 0.5) * 0.6, r: 0.92 + ((i * 0.7548) % 1) * 0.36,
  })), [nAgua]);

  useFrame(() => {
    const th = omega * reloj.current;
    if (rodete.current) rodete.current.rotation.x = th;
    const m = agua.current;
    if (!m) return;
    for (let i = 0; i < nAgua; i++) {
      const s = semillas[i]!;
      const u = (s.f + th * 0.06) % 1;
      const r = s.r - u * 0.62;
      const a = -u * Math.PI * 2.6 + s.f * 9;
      aux.o.position.set(X_TURB + s.x, YE + Math.sin(a) * r, Math.cos(a) * r);
      aux.o.rotation.set(-a, 0, 0);
      aux.o.scale.set(0.6, 1, 3.2);
      aux.o.updateMatrix();
      m.setMatrixAt(i, aux.o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  const TH0 = Math.PI / 2, THL = (7 * Math.PI) / 6;
  return (
    <group>
      {/* caracol (carcasa espiral) abierto al frente */}
      <mesh position={[X_TURB, YE, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[1.42, 1.42, 0.86, 64, 1, true, TH0, THL]} />
        <meshPhysicalMaterial color="#3d6488" metalness={0.55} roughness={0.38} clearcoat={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[-0.43, 0.43].map((dx) => (
        <mesh key={dx} position={[X_TURB + dx, YE, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.32, 1.42, 64, 1, -2 * Math.PI / 3, THL]} />
          <meshPhysicalMaterial color="#35587a" metalness={0.55} roughness={0.4} clearcoat={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* canto del corte, pintado de rojo como en las maquetas de corte */}
      {[TH0, TH0 + THL].map((th, i) => (
        <mesh key={i} position={[X_TURB, YE + Math.sin(th) * 1.42, Math.cos(th) * 1.42]} rotation={[-th, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.07]} />
          <meshStandardMaterial color="#e2483d" roughness={0.6} />
        </mesh>
      ))}
      {/* rodete */}
      <group ref={rodete} position={[X_TURB, YE, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.42, 0.62, 32]} />
          <meshStandardMaterial {...ACERO} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.3, 0, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.05, 48]} />
          <meshStandardMaterial {...ACERO} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.3, 0, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.07, 48, 1, true]} />
          <meshStandardMaterial {...ACERO} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2;
          return (
            <group key={i} rotation={[a, 0, 0]}>
              <mesh geometry={geos.alabe} position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <meshStandardMaterial color="#d3d9df" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* agua que entra en espiral */}
      <instancedMesh ref={agua} args={[undefined, undefined, nAgua]} frustumCulled={false}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#6fd3ff" emissive="#1f8fd6" emissiveIntensity={1.1} transparent opacity={0.8} roughness={0.1} />
      </instancedMesh>
    </group>
  );
}

/* ── Chumacera (soporte con rodamiento) ───────────────────────────────────── */
function Chumacera({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[0.45, YE - 0.1, 0.9]} radius={0.05} smoothness={2} position={[0, 0.14 + (YE - 0.3) / 2, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2f4a5c" metalness={0.5} roughness={0.45} clearcoat={0.4} />
      </RoundedBox>
      <mesh position={[0, YE, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
        <meshPhysicalMaterial color="#2f4a5c" metalness={0.5} roughness={0.4} clearcoat={0.5} />
      </mesh>
      {[-0.26, 0.26].map((dx) => (
        <mesh key={dx} position={[dx, YE, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.16, 0.035, 10, 28]} />
          <meshStandardMaterial {...ACERO} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Imán de herradura: N rojo arriba, S azul abajo ───────────────────────── */
function ImanHerradura() {
  const geos = useMemo(() => {
    // Perfil en el plano (z, y) relativo al eje; se extruye a lo largo de X.
    const zB = -1.3, rI = 1.05, rE = 1.65, zF = 1.08;
    const mitad = (s: 1 | -1) => {
      const sh = new THREE.Shape();
      sh.moveTo(zF, s * rI);
      sh.lineTo(zF, s * rE);
      sh.lineTo(zB, s * rE);
      sh.absarc(zB, 0, rE, s > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI, s < 0);
      sh.lineTo(zB - rI, 0);
      sh.absarc(zB, 0, rI, Math.PI, s > 0 ? Math.PI / 2 : -Math.PI / 2, s > 0);
      sh.lineTo(zF, s * rI);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 36 });
      geo.translate(0, 0, -1.25);
      return geo;
    };
    return { norte: mitad(1), sur: mitad(-1) };
  }, []);
  const letraN = texturaLetra("N");
  const letraS = texturaLetra("S");
  // shape (z, y) extruida en su Z local → girar −90° en Y lleva la extrusión a X
  return (
    <group position={[0, YE, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh geometry={geos.norte} castShadow receiveShadow>
        <meshPhysicalMaterial color="#c81e28" metalness={0.45} roughness={0.32} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh geometry={geos.sur} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1f4fc8" metalness={0.45} roughness={0.32} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      {/* caras polares de acero rectificado */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.11, s * 1.03, 0]}>
          <boxGeometry args={[2.38, 0.03, 2.5]} />
          <meshStandardMaterial {...ACERO} roughness={0.22} />
        </mesh>
      ))}
      {/* letras pintadas en el frente de cada brazo */}
      <mesh position={[1.13, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial map={letraN} transparent roughness={0.4} />
      </mesh>
      <mesh position={[1.13, -1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial map={letraS} transparent roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Líneas de campo: tubos finos que fluyen de N a S ─────────────────────── */
function LineasCampo({ B }: { B: number }) {
  const tex = texturaRayas();
  const geo = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (const x of [-0.9, -0.3, 0.3, 0.9]) {
      for (const z of [-0.95, -0.32, 0.32, 0.95]) {
        const borde = Math.abs(z) > 0.9 || Math.abs(x) > 0.8 ? 0.14 : 0.03;
        const c = curvaDe([
          [x, YE + 1.02, z], [x + Math.sign(x) * borde * 0.5, YE + 0.5, z + Math.sign(z) * borde * 0.6],
          [x + Math.sign(x) * borde, YE, z + Math.sign(z) * borde],
          [x + Math.sign(x) * borde * 0.5, YE - 0.5, z + Math.sign(z) * borde * 0.6], [x, YE - 1.02, z],
        ]);
        geos.push(new THREE.TubeGeometry(c, 28, 0.016, 6, false));
      }
    }
    return mergeGeos(geos);
  }, []);
  // más campo → líneas más intensas (la densidad de líneas es B)
  const op = Math.min(1, 0.35 + B * 0.55);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    const mp = matRef.current?.map;
    if (mp) mp.offset.x -= Math.min(dt, 0.05) * (0.25 + B * 0.5);
  });
  return (
    <mesh geometry={geo} renderOrder={3}>
      <meshBasicMaterial ref={matRef} color="#c4b5fd" map={tex} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/** Une geometrías no indexadas/indexadas del mismo tipo en una sola (un solo dibujo). */
function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0, totalIdx = 0;
  for (const g of geos) { total += g.attributes.position!.count; totalIdx += g.index ? g.index.count : 0; }
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  const idx = new Uint32Array(totalIdx);
  let o = 0, oi = 0;
  for (const g of geos) {
    const n = g.attributes.position!.count;
    pos.set(g.attributes.position!.array as Float32Array, o * 3);
    nor.set(g.attributes.normal!.array as Float32Array, o * 3);
    uv.set(g.attributes.uv!.array as Float32Array, o * 2);
    if (g.index) { for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.array[i]! + o; oi += g.index.count; }
    o += n;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/* ── Rotor: bobina de cobre de N vueltas + flujo que la atraviesa ─────────── */
const C_FLUJO_POS = new THREE.Color("#34d399");
const C_FLUJO_NEG = new THREE.Color("#f472b6");

function Rotor({ reloj, omega, N, area }: { reloj: Reloj; omega: number; N: number; area: number }) {
  const grupo = useRef<THREE.Group>(null);
  const membrana = useRef<THREE.MeshBasicMaterial>(null);
  // el área de la espira se ve: lado transversal ∝ √A (acotado para que quepa entre los polos)
  const semi = Math.max(0.45, Math.min(0.9, 0.85 * Math.sqrt(area / 0.02)));
  const vueltas = Math.max(3, Math.min(25, Math.round(N / 15)));
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const L = 1.0;
    for (let k = 0; k < vueltas; k++) {
      const ins = (k % 5) * 0.045;
      const capa = (Math.floor(k / 5) - (Math.ceil(vueltas / 5) - 1) / 2) * 0.05;
      const a = L - ins, b = semi - ins, rc = 0.12;
      // rectángulo redondeado en el plano XZ, recorrido en sentido fijo
      const esquinas: [number, number, number][] = [[a - rc, b - rc, 0], [-(a - rc), b - rc, Math.PI / 2], [-(a - rc), -(b - rc), Math.PI], [a - rc, -(b - rc), (3 * Math.PI) / 2]];
      for (const [cx, cz, a0] of esquinas) {
        for (let j = 0; j <= 4; j++) {
          const ang = a0 + (j / 4) * (Math.PI / 2);
          pts.push(new THREE.Vector3(cx + Math.cos(ang) * rc, capa + (k / vueltas) * 0.02, cz + Math.sin(ang) * rc));
        }
      }
    }
    pts.push(pts[0]!.clone().add(new THREE.Vector3(0, 0.03, 0)));
    const curva = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);
    return new THREE.TubeGeometry(curva, Math.min(1400, vueltas * 56), 0.024, 6, false);
  }, [vueltas, semi]);
  useFrame(() => {
    const th = omega * reloj.current;
    if (grupo.current) grupo.current.rotation.x = th;
    const m = membrana.current;
    if (m) {
      const c = Math.cos(th);
      m.color.copy(c >= 0 ? C_FLUJO_POS : C_FLUJO_NEG);
      m.opacity = 0.05 + Math.abs(c) * 0.42;
    }
  });
  return (
    <group ref={grupo} position={[0, YE, 0]}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial {...COBRE} />
      </mesh>
      {/* el flujo Φ = B·A·cos θ que atraviesa la espira: se enciende y se apaga */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, semi * 2 - 0.1]} />
        <meshBasicMaterial ref={membrana} color="#34d399" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* crucetas que sujetan la bobina a la flecha */}
      {[-1.02, 1.02].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.08, 0.1, semi * 2 + 0.05]} />
          <meshPhysicalMaterial color="#3b2a1d" roughness={0.5} clearcoat={0.5} />
        </mesh>
      ))}
      {/* anillos colectores (giran con la bobina) */}
      <mesh position={[(X_ANILLO_A + X_ANILLO_B) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.62, 28]} />
        <meshStandardMaterial color="#17181b" roughness={0.6} />
      </mesh>
      {[X_ANILLO_A, X_ANILLO_B].map((x, i) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.14, 40]} />
          <meshStandardMaterial {...(i === 0 ? COBRE : LATON)} />
        </mesh>
      ))}
      {/* puntas de la bobina hacia los anillos */}
      {[[X_ANILLO_A, 0.12], [X_ANILLO_B, -0.12]].map(([x, z]) => (
        <mesh key={x} position={[(1.0 + x!) / 2, 0.23, z!]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, x! - 1.0, 6]} />
          <meshStandardMaterial {...COBRE} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Escobillas de carbón con su resorte ──────────────────────────────────── */
function Escobillas() {
  const resorte = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const a = u * Math.PI * 2 * 7;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.06, u * 0.3, Math.sin(a) * 0.06));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.012, 5, false);
  }, []);
  return (
    <group>
      {/* puente que sostiene los portaescobillas */}
      <mesh position={[(X_ANILLO_A + X_ANILLO_B) / 2, YE + 1.02, -0.3]}>
        <boxGeometry args={[0.8, 0.06, 0.12]} />
        <meshStandardMaterial {...ACERO_OSCURO} />
      </mesh>
      <mesh position={[(X_ANILLO_A + X_ANILLO_B) / 2 + 0.42, (YE + 1.02) / 2 + 0.07, -0.3]}>
        <boxGeometry args={[0.08, YE + 1.02 - 0.14, 0.12]} />
        <meshStandardMaterial {...ACERO_OSCURO} />
      </mesh>
      {[X_ANILLO_A, X_ANILLO_B].map((x) => (
        <group key={x} position={[x, YE + 0.28, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.12, 0.24, 0.16]} />
            <meshStandardMaterial {...CARBON} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.18, 0.16, 0.22]} />
            <meshStandardMaterial {...LATON} />
          </mesh>
          <mesh geometry={resorte} position={[0, 0.38, 0]}>
            <meshStandardMaterial {...ACERO} />
          </mesh>
          <mesh position={[0, 0.72, -0.15]} rotation={[0.9, 0, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.4]} />
            <meshStandardMaterial {...ACERO_OSCURO} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Corriente alterna: los electrones van y vienen ───────────────────────── */
function ElectronesAlternos({ curva, n, reloj, omega, femPico }: {
  curva: THREE.Curve<THREE.Vector3>; n: number; reloj: Reloj; omega: number; femPico: number;
}) {
  const malla = useRef<THREE.InstancedMesh>(null);
  const aux = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3() }), []);
  // amplitud del vaivén (fracción del lazo) ∝ log de la FEM: visible pero acotada
  const amp = Math.max(0.01, Math.min(0.07, Math.log10(femPico + 1) * 0.02));
  useFrame(() => {
    const m = malla.current;
    if (!m) return;
    // desplazamiento = ∫ v dt con v ∝ sen ωt  →  ∝ (1 − cos ωt)
    const d = amp * (1 - Math.cos(omega * reloj.current));
    for (let i = 0; i < n; i++) {
      const u = (((i + 0.5) / n + d) % 1 + 1) % 1;
      curva.getPointAt(u, aux.p);
      aux.o.position.copy(aux.p);
      aux.o.updateMatrix();
      m.setMatrixAt(i, aux.o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={malla} args={[undefined, undefined, n]} frustumCulled={false}>
      <sphereGeometry args={[0.032, 10, 8]} />
      <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={2.4} toneMapped={false} />
    </instancedMesh>
  );
}

function BaseFocoGen() {
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
        <mesh key={x} position={[x, 0.25, 0.2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 6]} />
          <meshStandardMaterial {...LATON} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Osciloscopio de dos canales ──────────────────────────────────────────── */
function Osciloscopio({ reloj, femPico, omega, f }: { reloj: Reloj; femPico: number; omega: number; f: number }) {
  const [pant] = useState(() => crearPantalla(512, 352));
  const vdiv = useRef<number | null>(null);
  const acum = useRef(1);
  useFrame((_, dt) => {
    acum.current += dt;
    if (acum.current < 1 / 30) return;
    acum.current = 0;
    vdiv.current = escalaVoltsDiv(femPico, vdiv.current);
    dibujarOsciloscopio(pant, {
      t: reloj.current, femPico, omega, vDiv: vdiv.current, etiquetaVDiv: fmtVDiv(vdiv.current),
      etiquetaF: fmtHz(f), barrido: (OSC_MS_DIV * OSC_DIV_X) / 1000, divX: OSC_DIV_X, divY: OSC_DIV_Y,
    });
  });
  const W = 2.5, H = 1.62, D = 1.35;
  return (
    <group position={OSC} rotation={[0, -0.5, 0]}>
      <group rotation={[-0.1, 0, 0]} position={[0, 0.12, 0]}>
        <RoundedBox args={[W, H, D]} radius={0.08} smoothness={4} position={[0, H / 2, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#cfd3d6" metalness={0.15} roughness={0.5} clearcoat={0.4} />
        </RoundedBox>
        <RoundedBox args={[W - 0.12, H - 0.12, 0.06]} radius={0.04} smoothness={3} position={[0, H / 2, D / 2]}>
          <meshPhysicalMaterial color="#23272c" roughness={0.5} clearcoat={0.3} />
        </RoundedBox>
        {/* pantalla */}
        <mesh position={[-0.36, H / 2 + 0.05, D / 2 + 0.035]}>
          <planeGeometry args={[1.56, 1.07]} />
          <meshBasicMaterial map={pant.tex} toneMapped={false} />
        </mesh>
        {/* vidrio de la pantalla */}
        <mesh position={[-0.36, H / 2 + 0.05, D / 2 + 0.045]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.06} roughness={0.05} clearcoat={1} envMapIntensity={1.5} depthWrite={false} />
        </mesh>
        {/* perillas del panel derecho */}
        {[[0.72, 1.18], [1.0, 1.18], [0.72, 0.84], [1.0, 0.84]].map(([x, y], i) => (
          <Perilla key={i} pos={[x!, y!, D / 2 + 0.02]} angulo={i * 0.7} radio={0.09} />
        ))}
        {/* conectores BNC */}
        {[0.72, 1.0].map((x, i) => (
          <group key={x} position={[x, 0.36, D / 2 + 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
              <meshStandardMaterial {...ACERO} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <torusGeometry args={[0.075, 0.016, 8, 20]} />
              <meshStandardMaterial color={i === 0 ? "#fde047" : "#22d3ee"} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
      {/* patas */}
      {[[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x!, 0.06, z!]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
