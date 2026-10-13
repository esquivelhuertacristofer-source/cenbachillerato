"use client";

/**
 * Modo «Motor» (eficiencia) — un motor eléctrico EN CORTE:
 *
 *   carcasa con aletas (con una ventana de corte al frente), imanes del
 *   estator N/S, rotor de láminas de acero al silicio con el bobinado de cobre
 *   en sus ranuras, conmutador de delgas y escobillas, y la flecha que mueve un
 *   volante.
 *
 * Lo que se ve de la eficiencia η = P_mec / P_elec:
 *   · la banda AMARILLA (entrada eléctrica) se parte en una VERDE (potencia útil
 *     en la flecha) y una ROJA (calor), cada una de ancho proporcional;
 *   · el calor perdido calienta la carcasa (brillo térmico) y suelta partículas
 *     de calor: con 92 % casi no hay; con un motor de combustión (~35 %) el
 *     motor se pone al rojo y humea.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { resolverMotor, fmtKw, fmtHp, fmtPct } from "./electromagnetismo-data";
import { texturaFlechas, texturaChispa } from "./electromagnetismo-texturas";
import { type P3, Rotulo, Cable, curvaDe, COBRE, ACERO, ACERO_OSCURO, CARBON } from "./electromagnetismo-piezas3d";

const YM = 1.75;
/** Ventana de corte: se quita la carcasa entre −60° y +60° (vista al frente). */
const A0 = Math.PI / 3, A1 = (5 * Math.PI) / 3;

/** Sector de anillo en el plano (z, y), extruido a lo largo de X (longitud `largo`). */
function sectorAnillo(rIn: number, rOut: number, a0: number, a1: number, largo: number): THREE.ExtrudeGeometry {
  const sh = new THREE.Shape();
  sh.moveTo(Math.cos(a0) * rOut, Math.sin(a0) * rOut);
  sh.absarc(0, 0, rOut, a0, a1, false);
  sh.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
  sh.absarc(0, 0, rIn, a1, a0, true);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: largo, bevelEnabled: false, curveSegments: 48 });
  g.translate(0, 0, -largo / 2);
  return g;
}

/** Rota la geometría (z,y) extruida en Z para que la extrusión quede en X. */
const ROT_X: [number, number, number] = [0, -Math.PI / 2, 0];

export function EscenaMotor({ pElec, efic, playing, angosto, pocos }: {
  pElec: number; efic: number; playing: boolean; angosto: boolean; pocos: boolean;
}) {
  const m = resolverMotor(pElec, efic);
  const rapidez = Math.max(0.3, Math.min(4.5, Math.log10(m.pMec * 5 + 1)));
  const perdida = 1 - efic / 100;
  const q = Math.max(0, Math.min(1, perdida / 0.7));

  return (
    <group>
      <Motor rapidez={rapidez} playing={playing} q={q} />
      <Calor q={q} pocos={pocos} playing={playing} />
      <Sankey eta={efic / 100} playing={playing} />
      {!angosto && <Rotulo pos={[3.2, 0.75, 2.1]} color="#fde047">P_elec = {fmtKw(pElec)}</Rotulo>}
      <Rotulo pos={[-3.4, 0.75, 1.75]} color="#34d399" sub={angosto ? undefined : `≈ ${fmtHp(m.hp)} en la flecha`}>P_mec = {fmtKw(m.pMec)}</Rotulo>
      <Rotulo pos={[0.4, YM + 2.25, 0]} color="#fb7185">calor = {fmtKw(m.pPerdida)}</Rotulo>
      {!angosto && <Rotulo pos={[2.9, 0.5, 3.35]} color="#f8fafc">η = {fmtPct(efic)}</Rotulo>}
    </group>
  );
}

/* ── El motor en corte ────────────────────────────────────────────────────── */
function Motor({ rapidez, playing, q }: { rapidez: number; playing: boolean; q: number }) {
  const rotor = useRef<THREE.Group>(null);
  const laminas = useRef<THREE.InstancedMesh>(null);
  const geos = useMemo(() => {
    const carcasa = sectorAnillo(1.3, 1.45, A0, A1, 3.2);
    const imanN = sectorAnillo(1.0, 1.28, A0, (145 * Math.PI) / 180, 2.0);
    const imanS = sectorAnillo(1.0, 1.28, (215 * Math.PI) / 180, A1, 2.0);
    // lámina del rotor: engrane de 12 ranuras con agujero para la flecha
    const sh = new THREE.Shape();
    const nR = 12, rO = 0.92, rI = 0.62, dO = 0.085, dI = 0.1;
    for (let j = 0; j < nR; j++) {
      const f0 = (j / nR) * Math.PI * 2, f1 = ((j + 1) / nR) * Math.PI * 2;
      const p = (r: number, a: number) => [Math.cos(a) * r, Math.sin(a) * r] as const;
      const ini = p(rO, f0 + dO);
      if (j === 0) sh.moveTo(ini[0], ini[1]); else sh.lineTo(ini[0], ini[1]);
      sh.absarc(0, 0, rO, f0 + dO, f1 - dO, false);
      const a = p(rI, f1 - dI), b = p(rI, f1 + dI), c = p(rO, f1 + dO);
      sh.lineTo(a[0], a[1]);
      sh.lineTo(b[0], b[1]);
      sh.lineTo(c[0], c[1]);
    }
    const hueco = new THREE.Path();
    hueco.absarc(0, 0, 0.13, 0, Math.PI * 2, true);
    sh.holes.push(hueco);
    const lamina = new THREE.ExtrudeGeometry(sh, { depth: 0.115, bevelEnabled: false, curveSegments: 6 });
    lamina.translate(0, 0, -0.0575);
    return { carcasa, imanN, imanS, lamina };
  }, []);

  const nLam = 15;
  const aux = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const lm = laminas.current;
    if (lm && lm.userData.listo !== true) {
      for (let i = 0; i < nLam; i++) {
        aux.position.set(0, 0, -0.95 + (i + 0.5) * (1.9 / nLam));
        aux.updateMatrix();
        lm.setMatrixAt(i, aux.matrix);
      }
      lm.instanceMatrix.needsUpdate = true;
      lm.userData.listo = true;
    }
    if (rotor.current && playing) rotor.current.rotation.x -= Math.min(dt, 0.05) * rapidez;
  });

  const calor = q * q;
  const pintura = { color: "#36536f", metalness: 0.55, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 };
  return (
    <group>
      {/* patas y base */}
      {[-1.0, 1.0].map((x) => (
        <RoundedBox key={x} args={[0.5, 0.32, 2.3]} radius={0.04} smoothness={2} position={[x, 0.16, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial {...pintura} />
        </RoundedBox>
      ))}
      <group position={[0, YM, 0]}>
        {/* carcasa con aletas, con brillo térmico */}
        <group rotation={ROT_X}>
          <mesh geometry={geos.carcasa} castShadow receiveShadow>
            <meshPhysicalMaterial {...pintura} emissive="#ff3300" emissiveIntensity={calor * 0.55} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 13 }, (_, i) => {
            const a = A0 + 0.12 + (i / 12) * (A1 - A0 - 0.24);
            return (
              <mesh key={i} position={[Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0]} rotation={[0, 0, a]} castShadow>
                <boxGeometry args={[0.22, 0.06, 2.9]} />
                <meshPhysicalMaterial {...pintura} emissive="#ff3300" emissiveIntensity={calor * 0.75} />
              </mesh>
            );
          })}
          {/* cantos del corte, en rojo como las maquetas de corte */}
          {[A0, A1].map((a) => (
            <mesh key={a} position={[Math.cos(a) * 1.375, Math.sin(a) * 1.375, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.16, 0.012, 3.2]} />
              <meshStandardMaterial color="#e2483d" roughness={0.6} />
            </mesh>
          ))}
          {/* imanes del estator */}
          <mesh geometry={geos.imanN} castShadow>
            <meshPhysicalMaterial color="#c81e28" metalness={0.4} roughness={0.32} clearcoat={1} clearcoatRoughness={0.15} />
          </mesh>
          <mesh geometry={geos.imanS} castShadow>
            <meshPhysicalMaterial color="#1f4fc8" metalness={0.4} roughness={0.32} clearcoat={1} clearcoatRoughness={0.15} />
          </mesh>
        </group>
        {/* tapa trasera (lado del conmutador) en corte */}
        <mesh position={[1.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[1.45, 1.45, 0.1, 48, 1, false, A0, A1 - A0]} />
          <meshPhysicalMaterial {...pintura} side={THREE.DoubleSide} />
        </mesh>
        {/* caja de conexiones */}
        <RoundedBox args={[0.7, 0.4, 0.7]} radius={0.05} smoothness={2} position={[0.9, 1.55, -0.35]} castShadow>
          <meshPhysicalMaterial {...pintura} />
        </RoundedBox>

        {/* rotor */}
        <group ref={rotor}>
          <instancedMesh ref={laminas} args={[geos.lamina, undefined, nLam]} rotation={ROT_X} castShadow>
            <meshPhysicalMaterial color="#9aa3ac" metalness={0.85} roughness={0.34} clearcoat={0.3} />
          </instancedMesh>
          {/* bobinado en las ranuras */}
          {Array.from({ length: 12 }, (_, j) => {
            const a = ((j + 1) / 12) * Math.PI * 2;
            return (
              <mesh key={j} position={[0, Math.sin(a) * 0.74, Math.cos(a) * 0.74]} rotation={[-a, 0, 0]}>
                <boxGeometry args={[1.98, 0.12, 0.26]} />
                <meshPhysicalMaterial {...COBRE} emissive="#ff3a0a" emissiveIntensity={calor * 1.2} />
              </mesh>
            );
          })}
          {/* cabezas de bobina */}
          {[-1.08, 1.08].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.66, 0.14, 14, 40]} />
              <meshPhysicalMaterial {...COBRE} emissive="#ff3a0a" emissiveIntensity={calor * 1.2} />
            </mesh>
          ))}
          {/* conmutador: delgas de cobre separadas por mica */}
          <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.27, 0.27, 0.4, 24]} />
            <meshStandardMaterial color="#2a1a12" roughness={0.7} />
          </mesh>
          {Array.from({ length: 12 }, (_, j) => {
            const a = (j / 12) * Math.PI * 2;
            return (
              <mesh key={j} position={[1.4, Math.sin(a) * 0.3, Math.cos(a) * 0.3]} rotation={[-a, 0, 0]}>
                <boxGeometry args={[0.38, 0.13, 0.06]} />
                <meshStandardMaterial {...COBRE} />
              </mesh>
            );
          })}
          {/* flecha */}
          <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 4.6, 20]} />
            <meshStandardMaterial {...ACERO} />
          </mesh>
          {/* volante en la salida: aquí está la potencia útil */}
          <group position={[-2.55, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.95, 0.95, 0.22, 56]} />
              <meshStandardMaterial {...ACERO} roughness={0.25} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.7, 0.7, 0.26, 48]} />
              <meshStandardMaterial {...ACERO_OSCURO} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <mesh key={k} position={[0.14, Math.sin((k * Math.PI) / 3) * 0.42, Math.cos((k * Math.PI) / 3) * 0.42]}>
                <cylinderGeometry args={[0.1, 0.1, 0.04, 18]} />
                <meshStandardMaterial color="#0e1013" roughness={0.6} />
              </mesh>
            ))}
            <mesh position={[0.13, 0.82, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.08]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </group>

        {/* escobillas de carbón sobre el conmutador (fijas) */}
        {[0.7, 0.7 + Math.PI].map((a) => (
          <group key={a} position={[1.4, Math.sin(a) * 0.45, Math.cos(a) * 0.45]} rotation={[-a + Math.PI / 2, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.26, 0.16]} />
              <meshStandardMaterial {...CARBON} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.26, 0.16, 0.22]} />
              <meshStandardMaterial color="#c9a44a" metalness={1} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* chumacera de salida */}
        <mesh position={[-1.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 32]} />
          <meshPhysicalMaterial {...pintura} />
        </mesh>
      </group>
      <CableEntrada />
    </group>
  );
}

function CableEntrada() {
  const c = useMemo(() => curvaDe([[0.9, YM + 1.6, -0.35], [1.6, YM + 1.7, -0.9], [3.0, 1.2, -1.4], [3.9, 0.12, -0.9], [4.4, 0.08, 1.2]]), []);
  return <Cable curva={c} color="#1d1e22" radio={0.09} opacidad={0.95} segmentos={80} />;
}

/* ── Partículas de calor ──────────────────────────────────────────────────── */
function Calor({ q, pocos, playing }: { q: number; pocos: boolean; playing: boolean }) {
  const N = pocos ? 70 : 170;
  const puntos = useRef<THREE.Points>(null);
  const datos = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const sem = Array.from({ length: N }, (_, i) => ({
      x: ((i * 0.618034) % 1) * 3.0 - 1.5,
      a: Math.PI / 2 + (((i * 0.7548) % 1) - 0.5) * 1.9,
      fase: (i * 0.3819) % 1,
      vel: 0.75 + ((i * 0.5698) % 1) * 0.6,
    }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geo, pos, col, sem };
  }, [N]);
  const reloj = useRef(0);
  const activos = Math.round(N * Math.min(1, 0.04 + q));
  useFrame((_, dt) => {
    const p = puntos.current;
    if (!p) return;
    if (playing) reloj.current += Math.min(dt, 0.05);
    const t = reloj.current;
    const pa = p.geometry.attributes.position as THREE.BufferAttribute;
    const ca = p.geometry.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const s = datos.sem[i]!;
      const vida = (s.fase + t * 0.35 * s.vel) % 1;
      const r = 1.55 + vida * 1.6;
      const x = s.x + Math.sin(t * 2 + i) * 0.08 * vida;
      pa.setXYZ(i, x, YM + Math.sin(s.a) * 1.55 + vida * 2.0, Math.cos(s.a) * r * 0.55);
      const brillo = Math.sin(vida * Math.PI) * (0.55 + q * 0.6);
      ca.setXYZ(i, brillo, brillo * 0.36, brillo * 0.12);
    }
    pa.needsUpdate = true;
    ca.needsUpdate = true;
    p.geometry.setDrawRange(0, activos);
  });
  const tex = texturaChispa();
  return (
    <points ref={puntos} geometry={datos.geo} frustumCulled={false}>
      <pointsMaterial map={tex} size={0.55} sizeAttenuation vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/* ── Diagrama de energía (Sankey) sobre la mesa ───────────────────────────── */
/** Cinta plana sobre la mesa a lo largo de una curva en XZ, con U a lo largo. */
function cinta(curva: THREE.Curve<THREE.Vector3>, ancho: number, n = 80): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const p = new THREE.Vector3(), tg = new THREE.Vector3();
  const largo = curva.getLength();
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    curva.getPointAt(u, p);
    curva.getTangentAt(u, tg);
    const nx = -tg.z, nz = tg.x;
    const l = Math.hypot(nx, nz) || 1;
    for (const s of [-1, 1]) {
      pos.push(p.x + (s * nx * ancho) / 2 / l, p.y, p.z + (s * nz * ancho) / 2 / l);
      uv.push((u * largo) / 0.55, s < 0 ? 0 : 1);
    }
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Sankey({ eta, playing }: { eta: number; playing: boolean }) {
  const W = 1.0;
  const zc = 2.45;
  const wU = Math.max(0.02, W * eta), wC = Math.max(0.02, W * (1 - eta));
  const geos = useMemo(() => {
    const y = 0.035;
    const entrada = curvaDe([[4.4, y, zc], [2.6, y, zc], [1.3, y, zc]]);
    const zU = zc - W / 2 + wU / 2;
    const util = curvaDe([[1.3, y, zU], [-0.5, y, zU], [-3.6, y, zU]]);
    const zC = zc + W / 2 - wC / 2;
    const calor = curvaDe([[1.3, y + 0.002, zC], [0.6, y + 0.002, zC + 0.05], [0.1, y + 0.002, zC + 0.6], [0.0, y + 0.002, zC + 1.3]]);
    return { entrada: cinta(entrada, W), util: cinta(util, wU), calor: cinta(calor, wC, 60) };
  }, [wU, wC]);
  const tex = useMemo(() => {
    const t = texturaFlechas().clone();
    t.needsUpdate = true;
    return t;
  }, []);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    const mp = matRef.current?.map;
    if (mp && playing) mp.offset.x -= Math.min(dt, 0.05) * 0.9;
  });
  const mat = (col: string, conRef = false) => (
    <meshStandardMaterial ref={conRef ? matRef : undefined} color={col} emissive={col} emissiveIntensity={0.55} map={tex} transparent opacity={0.9} roughness={0.5} depthWrite={false} side={THREE.DoubleSide} />
  );
  return (
    <group>
      <mesh geometry={geos.entrada} receiveShadow>{mat("#facc15", true)}</mesh>
      <mesh geometry={geos.util} receiveShadow>{mat("#34d399")}</mesh>
      <mesh geometry={geos.calor} receiveShadow>{mat("#fb7185")}</mesh>
    </group>
  );
}

export type { P3 };
