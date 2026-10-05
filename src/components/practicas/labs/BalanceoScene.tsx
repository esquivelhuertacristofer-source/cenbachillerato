"use client";

/**
 * Escena 3D — "Balanceo de ecuaciones químicas" (CNEYT-IV-P01-A2).
 *
 * El COEFICIENTE es una CANTIDAD: de cada especie se dibujan tantas copias de la
 * molécula como indica su coeficiente (reactivos a la izquierda, productos a la
 * derecha); subir un coeficiente hace brotar una molécula entera. Debajo de cada
 * lado, un registro de átomos por elemento (fichas de color contadas) y, en el
 * centro, una balanza de dos platos con los átomos de cada lado: se inclina hacia
 * el lado más pesado y queda a nivel cuando la masa se conserva.
 *
 * «Reacciona» anima la reacción: los enlaces de los reactivos se rompen y los
 * átomos viajan hasta los productos. Si la ecuación está balanceada, cada átomo
 * encuentra su sitio. Si no, los átomos que sobran (o faltan) quedan en ROJO: los
 * átomos no se crean ni se destruyen, solo se reacomodan.
 *
 * Patrón R3F: el default export solo monta <Canvas> y delega en <Contenido>.
 * React Compiler: nada de Math.random()/Date.now()/setState en render; useFrame
 * solo muta refs y objetos de three. Sin drei <Text>: rótulos con <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { ELEMS_B, MOLS_B, type Elem, type Especie } from "./balanceo-data";
import { Escenario } from "./_escenario";
import { ATOMO } from "./_vidrio";

export interface BalanceoSceneProps {
  reaccionKey: string;
  reactivos: Especie[];
  productos: Especie[];
  coefReact: number[];
  coefProd: number[];
  balanceada: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  /** true mientras dura la animación «Reacciona». */
  reaccionando?: boolean;
  /** Cambia en cada pulsación de «Reacciona» (reinicia la animación). */
  reactNonce?: number;
}

type Pt = [number, number, number];
type Dest = { pos: Pt; s: number } | null;

const BOND_COLOR = "#C4CDD8";
const OK_COL = "#34D399";   // balanceada
const NO_COL = "#FB923C";   // desbalanceada
const ROJO = "#FF2D3D";     // átomo que sobra / falta

const SIDE_X = 6.1;
const SUELO = -3.6;
const GRID_Y = 0.9;
const DUR_REACCION = 3.4;   // s

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOutBack = (t: number) => {
  if (t <= 0) return 0;
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

interface FlatAtom { key: string; el: Elem; home: Pt; s: number; delay: number; }
interface FlatBond { key: string; a: number; b: number; orden: 1 | 2 | 3; s: number; delay: number; }
interface Side { atoms: FlatAtom[]; bonds: FlatBond[]; }

/** Expande las especies según sus coeficientes y las coloca en una cuadrícula. */
function buildSide(species: Especie[], coefs: number[], centerX: number, tag: string): Side {
  const inst: { mol: string; si: number; k: number }[] = [];
  species.forEach((sp, si) => {
    const c = coefs[si] ?? 0;
    for (let k = 0; k < c; k++) inst.push({ mol: sp.mol, si, k });
  });
  const n = inst.length;
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(n / cols));
  const s = n <= 4 ? 1.15 : n <= 9 ? 0.88 : 0.68;
  const colSp = 2.75 * s;
  const rowSp = 2.15 * s;

  const atoms: FlatAtom[] = [];
  const bonds: FlatBond[] = [];
  inst.forEach((m, idx) => {
    const def = MOLS_B[m.mol]!;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const ox = centerX + (col - (cols - 1) / 2) * colSp;
    const oy = GRID_Y + ((rows - 1) / 2 - row) * rowSp;
    const base = atoms.length;
    const delay = Math.min(idx, 8) * 0.04;
    def.atoms.forEach((a, li) => atoms.push({
      key: `${tag}${m.si}-${m.k}-${li}`, el: a.el, s, delay,
      home: [a.p[0] * s + ox, a.p[1] * s + oy, a.p[2] * s],
    }));
    def.bonds.forEach((b, bi) => bonds.push({
      key: `${tag}${m.si}-${m.k}-b${bi}`, a: base + b.a, b: base + b.b, orden: b.orden, s, delay,
    }));
  });
  return { atoms, bonds };
}

/** Empareja cada átomo de reactivo con uno de producto del mismo elemento. */
function emparejar(izq: Side, der: Side) {
  const dest: Dest[] = izq.atoms.map(() => null);
  const paired: boolean[] = der.atoms.map(() => false);
  const ordenar = (atoms: FlatAtom[], idxs: number[]) =>
    idxs.sort((x, y) => (atoms[y]!.home[1] - atoms[x]!.home[1]) || (atoms[x]!.home[0] - atoms[y]!.home[0]));
  (Object.keys(ELEMS_B) as Elem[]).forEach((el) => {
    const ri = ordenar(izq.atoms, izq.atoms.map((a, i) => (a.el === el ? i : -1)).filter((i) => i >= 0));
    const pj = ordenar(der.atoms, der.atoms.map((a, i) => (a.el === el ? i : -1)).filter((i) => i >= 0));
    const m = Math.min(ri.length, pj.length);
    for (let k = 0; k < m; k++) {
      const p = der.atoms[pj[k]!]!;
      dest[ri[k]!] = { pos: p.home, s: p.s };
      paired[pj[k]!] = true;
    }
  });
  return { dest, paired };
}

function conteo(atoms: FlatAtom[]): Partial<Record<Elem, number>> {
  const m: Partial<Record<Elem, number>> = {};
  for (const a of atoms) m[a.el] = (m[a.el] ?? 0) + 1;
  return m;
}

/* ── Átomo (esfera CPK) con entrada, vuelo y resalte rojo ─────────────────── */
interface AtomoProps {
  a: FlatAtom;
  lado: "R" | "P";
  dest: Dest;          // solo reactivos
  paired: boolean;     // solo productos
  fase: MutableRefObject<number>;
  boost: number;
}
function Atomo({ a, lado, dest, paired, fase, boost }: AtomoProps) {
  const e = ELEMS_B[a.el];
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const cur = useRef({ x: a.home[0], y: a.home[1], z: a.home[2], s: a.s, born: -1 });
  const rojoCol = useMemo(() => new THREE.Color(ROJO), []);
  const baseCol = useMemo(() => new THREE.Color(e.color), [e.color]);

  useFrame(({ clock }, dt) => {
    const grp = g.current;
    const m = mat.current;
    if (!grp || !m) return;
    const c = cur.current;
    const t = clock.elapsedTime;
    if (c.born < 0) c.born = t + a.delay;
    const k = easeOutBack(clamp01((t - c.born) / 0.4));
    const q = Math.min(1, dt * 9);
    c.x += (a.home[0] - c.x) * q; c.y += (a.home[1] - c.y) * q; c.z += (a.home[2] - c.z) * q;
    c.s += (a.s - c.s) * q;

    const f = fase.current;
    let x = c.x, y = c.y, z = c.z, s = c.s, vis = true;
    let rojo = false;
    if (lado === "R") {
      if (dest) {
        if (f >= 1) vis = false;
        else if (f > 0) {
          const ee = easeInOut(clamp01((f - 0.2) / 0.7));
          const arco = Math.sin(Math.PI * ee);
          x = c.x + (dest.pos[0] - c.x) * ee;
          y = c.y + (dest.pos[1] - c.y) * ee + arco * 1.5;
          z = c.z + (dest.pos[2] - c.z) * ee + arco * 0.8;
          s = c.s + (dest.s - c.s) * ee;
        }
      } else if (f > 0) rojo = true;     // reactivo que no encontró sitio
    } else if (paired) {
      vis = f <= 0 || f >= 1;
    } else if (f > 0) {
      rojo = f > 0.2;                    // producto sin átomo de origen
    }
    grp.visible = vis && k > 0.001;
    grp.position.set(x, y, z);
    const pulso = rojo ? 1 + Math.sin(t * 9) * 0.12 : 1;
    grp.scale.setScalar(Math.max(0.0001, s * k * pulso));
    m.color.copy(rojo ? rojoCol : baseCol);
    m.emissive.copy(rojo ? rojoCol : baseCol);
    m.emissiveIntensity = rojo ? 0.9 : 0.1 + boost;
  });

  return (
    <group ref={g} scale={0.0001}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[e.radio, 28, 28]} />
        <meshPhysicalMaterial ref={mat} {...ATOMO} color={e.color} emissive={e.color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

/* ── Enlace (cilindros; nº de barras = orden) ────────────────────────────── */
function Bond({ b, atoms, lado, fase }: { b: FlatBond; atoms: FlatAtom[]; lado: "R" | "P"; fase: MutableRefObject<number> }) {
  const A = atoms[b.a]!.home;
  const B = atoms[b.b]!.home;
  const { mid, quat, len } = useMemo(() => {
    const s = new THREE.Vector3(...A);
    const e = new THREE.Vector3(...B);
    const dir = new THREE.Vector3().subVectors(e, s);
    return {
      len: dir.length(),
      mid: new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
    };
  }, [A, B]);
  const g = useRef<THREE.Group>(null);
  const born = useRef(-1);
  const gap = 0.12 * b.s;
  const offsets = b.orden === 1 ? [0] : b.orden === 2 ? [-gap, gap] : [-gap, 0, gap];
  const radio = (b.orden === 1 ? 0.06 : 0.045) * b.s;

  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    const t = clock.elapsedTime;
    if (born.current < 0) born.current = t + b.delay + 0.1;
    const k = clamp01((t - born.current) / 0.35);
    const f = fase.current;
    let thick = 1;
    if (lado === "R") thick = f <= 0 ? 1 : Math.max(0, 1 - f / 0.22);
    else thick = f <= 0 || f >= 1 ? 1 : 0;
    const v = thick * k;
    grp.visible = v > 0.01;
    grp.scale.set(v, 1, v);
  });

  return (
    <group ref={g} position={mid} quaternion={quat} scale={[0.0001, 1, 0.0001]}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[o, 0, 0]}>
          <cylinderGeometry args={[radio, radio, len, 14]} />
          <meshStandardMaterial color={BOND_COLOR} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Un lado completo (reactivos o productos) ────────────────────────────── */
function LadoMesh({ side, lado, dest, paired, fase, boost }: {
  side: Side; lado: "R" | "P"; dest: Dest[]; paired: boolean[];
  fase: MutableRefObject<number>; boost: number;
}) {
  return (
    <>
      {side.atoms.map((a, i) => (
        <Atomo key={a.key} a={a} lado={lado} dest={dest[i] ?? null} paired={paired[i] ?? false} fase={fase} boost={boost} />
      ))}
      {side.bonds.map((b) => <Bond key={b.key} b={b} atoms={side.atoms} lado={lado} fase={fase} />)}
    </>
  );
}

/* ── Registro de átomos de un lado (fichas de color contadas) ────────────── */
function Registro({ x, titulo, cuenta, otra }: {
  x: number; titulo: string;
  cuenta: Partial<Record<Elem, number>>; otra: Partial<Record<Elem, number>>;
}) {
  const els = (Object.keys(ELEMS_B) as Elem[]).filter((el) => (cuenta[el] ?? 0) > 0 || (otra[el] ?? 0) > 0);
  return (
    <Html position={[x, SUELO + 0.75, 0]} center zIndexRange={[1, 0]} pointerEvents="none">
      <div style={{
        width: 236, padding: "9px 12px", borderRadius: 14, background: "rgba(4,10,22,0.84)",
        border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontFamily: "system-ui, sans-serif",
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.3, marginBottom: 5, color: "#cfe3ff" }}>{titulo}</div>
        {els.map((el) => {
          const n = cuenta[el] ?? 0;
          const ok = n === (otra[el] ?? 0);
          const col = ELEMS_B[el].color;
          return (
            <div key={el} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
              <strong style={{ width: 24, fontSize: 15, fontWeight: 900 }}>{el}</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, flex: 1, minWidth: 0 }}>
                {Array.from({ length: Math.min(n, 24) }, (_, i) => (
                  <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: col, border: "1px solid rgba(255,255,255,0.4)" }} />
                ))}
                {n > 24 && <span style={{ fontSize: 14, fontWeight: 800 }}>+{n - 24}</span>}
              </div>
              <strong style={{ fontSize: 16, fontWeight: 900, fontFamily: "ui-monospace, monospace", color: ok ? OK_COL : NO_COL, minWidth: 22, textAlign: "right" }}>{n}</strong>
            </div>
          );
        })}
      </div>
    </Html>
  );
}

/* ── Balanza de dos platos ───────────────────────────────────────────────── */
const PIV_Y = 1.3;
const BRAZO = 2.35;
const CUELGA = 1.25;

function FichasPlato({ atoms }: { atoms: FlatAtom[] }) {
  const lista = atoms.slice(0, 30);
  return (
    <>
      {lista.map((a, i) => {
        const e = ELEMS_B[a.el];
        const capa = Math.floor(i / 10);
        const j = i % 10;
        const ang = (j / 10) * Math.PI * 2 + capa * 0.6;
        const rr = capa === 2 ? 0 : 0.42 - capa * 0.14;
        return (
          <mesh key={i} position={[Math.cos(ang) * rr, 0.15 + capa * 0.2, Math.sin(ang) * rr]}>
            <sphereGeometry args={[0.15, 14, 14]} />
            <meshStandardMaterial color={e.color} roughness={0.4} metalness={0.1} emissive={e.color} emissiveIntensity={0.12} />
          </mesh>
        );
      })}
    </>
  );
}

function Balanza({ masaIzq, masaDer, balanceada, atomsIzq, atomsDer }: {
  masaIzq: number; masaDer: number; balanceada: boolean; atomsIzq: FlatAtom[]; atomsDer: FlatAtom[];
}) {
  const col = balanceada ? OK_COL : NO_COL;
  const viga = useRef<THREE.Group>(null);
  const colgL = useRef<THREE.Group>(null);
  const colgR = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  const ang = useRef(0);
  const diff = (masaIzq - masaDer) / Math.max(masaIzq, masaDer, 1);
  const meta = balanceada ? 0 : Math.max(-0.42, Math.min(0.42, diff * 1.3));

  useFrame(({ clock }, dt) => {
    ang.current += (meta - ang.current) * Math.min(1, dt * 4);
    const a = ang.current;
    if (viga.current) viga.current.rotation.z = a;
    // el extremo izquierdo baja cuando el lado izquierdo pesa más (a > 0)
    colgL.current?.position.set(-BRAZO * Math.cos(a), PIV_Y - BRAZO * Math.sin(a), 0);
    colgR.current?.position.set(BRAZO * Math.cos(a), PIV_Y + BRAZO * Math.sin(a), 0);
    if (aro.current) {
      const p = balanceada ? 1 + Math.sin(clock.elapsedTime * 4) * 0.06 : 1;
      aro.current.scale.set(p, p, 1);
    }
  });

  const colgante = (ref: MutableRefObject<THREE.Group | null>, atoms: FlatAtom[]) => (
    <group ref={ref}>
      <mesh position={[0, -CUELGA / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, CUELGA, 8]} />
        <meshStandardMaterial color="#9fb0c4" metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[0, -CUELGA, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.7, 0.1, 32]} />
          <meshStandardMaterial color="#b8c4d4" metalness={0.7} roughness={0.28} />
        </mesh>
        <FichasPlato atoms={atoms} />
      </group>
    </group>
  );

  return (
    <group>
      <mesh position={[0, SUELO + 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.2, 32]} />
        <meshStandardMaterial color="#25364d" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, (SUELO + PIV_Y) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, PIV_Y - SUELO, 16]} />
        <meshStandardMaterial color="#9fb0c4" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={viga} position={[0, PIV_Y, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, BRAZO * 2, 16]} />
          <meshStandardMaterial color="#c7d2e0" metalness={0.75} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, PIV_Y, 0]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={balanceada ? 1.1 : 0.35} />
      </mesh>
      {colgante(colgL, atomsIzq)}
      {colgante(colgR, atomsDer)}
      {/* celebración: aro verde en el piso cuando la masa se conserva */}
      {balanceada && (
        <mesh ref={aro} position={[0, SUELO + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.7, 2.85, 64]} />
          <meshBasicMaterial color={OK_COL} toneMapped={false} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

/* ── Flecha de reacción ──────────────────────────────────────────────────── */
function Flecha({ balanceada }: { balanceada: boolean }) {
  const col = balanceada ? OK_COL : NO_COL;
  return (
    <group position={[0, 3.55, 0]}>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.9, 12]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.55, 18]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Director de la animación «Reacciona» ────────────────────────────────── */
function Director({ reaccionando, nonce, faseRef }: { reaccionando: boolean; nonce: number; faseRef: MutableRefObject<number> }) {
  const st = useRef({ last: -1, start: 0 });
  useFrame(({ clock }) => {
    const s = st.current;
    if (!reaccionando) { faseRef.current = 0; s.last = -1; return; }
    if (s.last !== nonce) { s.last = nonce; s.start = clock.elapsedTime; }
    faseRef.current = Math.min(1, Math.max(0.0001, (clock.elapsedTime - s.start) / DUR_REACCION));
  });
  return null;
}

/* ── Contenido (descendiente del Canvas) ─────────────────────────────────── */
function Contenido({ reactivos, productos, coefReact, coefProd, balanceada, accent, autoRotate, resetNonce, reaccionKey, reaccionando = false, reactNonce = 0 }: BalanceoSceneProps) {
  const izq = useMemo(() => buildSide(reactivos, coefReact, -SIDE_X, "R"), [reactivos, coefReact]);
  const der = useMemo(() => buildSide(productos, coefProd, SIDE_X, "P"), [productos, coefProd]);
  const { dest, paired } = useMemo(() => emparejar(izq, der), [izq, der]);
  const cuentaI = useMemo(() => conteo(izq.atoms), [izq]);
  const cuentaD = useMemo(() => conteo(der.atoms), [der]);
  const masaI = useMemo(() => izq.atoms.reduce((m, a) => m + ELEMS_B[a.el].masa, 0), [izq]);
  const masaD = useMemo(() => der.atoms.reduce((m, a) => m + ELEMS_B[a.el].masa, 0), [der]);
  const boost = balanceada ? 0.35 : 0;
  const fase = useRef(0);
  const { size } = useThree();
  // En pantallas angostas el contenido se encoge para no salirse del cuadro.
  const k = Math.min(1, (6.7 * (size.width / Math.max(1, size.height))) / 10.4);

  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      <Escenario acento={accent} suelo={SUELO} />
      <Director reaccionando={reaccionando} nonce={reactNonce} faseRef={fase} />

      <group key={`${reaccionKey}-${resetNonce}`} scale={k}>
        <LadoMesh side={izq} lado="R" dest={dest} paired={[]} fase={fase} boost={boost} />
        <LadoMesh side={der} lado="P" dest={[]} paired={paired} fase={fase} boost={boost} />
        <Flecha balanceada={balanceada} />
        <Balanza masaIzq={masaI} masaDer={masaD} balanceada={balanceada} atomsIzq={izq.atoms} atomsDer={der.atoms} />
        {/* En pantallas angostas no caben: la misma tabla está en el panel. */}
        {size.width >= 640 && (
          <>
            <Registro x={-SIDE_X} titulo="Átomos de los reactivos" cuenta={cuentaI} otra={cuentaD} />
            <Registro x={SIDE_X} titulo="Átomos de los productos" cuenta={cuentaD} otra={cuentaI} />
          </>
        )}

        <Html position={[0, SUELO + 0.75, 0]} center zIndexRange={[1, 0]} pointerEvents="none">
          <style>{`@keyframes bal-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
          {reaccionando ? (
            <div key={`m${reactNonce}`} style={{
              width: 250, textAlign: "center", padding: "8px 12px", borderRadius: 14, color: "#fff", fontWeight: 800,
              fontSize: 14, lineHeight: 1.35, fontFamily: "system-ui, sans-serif", opacity: 0,
              animation: "bal-in .4s ease 2.6s forwards",
              background: balanceada ? "rgba(6,30,22,0.92)" : "rgba(50,8,14,0.92)",
              border: `1px solid ${balanceada ? OK_COL : ROJO}`,
            }}>
              {balanceada
                ? "✓ Cada átomo encontró su lugar: solo se reacomodaron"
                : "✗ Átomos en rojo: sobran o faltan. Los átomos no se crean ni se destruyen"}
            </div>
          ) : (
            <div style={{
              whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 999, color: "#fff", fontWeight: 900, fontSize: 15,
              fontFamily: "system-ui, sans-serif", background: balanceada ? "rgba(6,30,22,0.92)" : "rgba(34,18,6,0.92)",
              border: `1px solid ${balanceada ? OK_COL : NO_COL}`, boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            }}>
              {balanceada ? "✓ Balanceada: la masa se conserva" : "✗ Desbalanceada: la balanza se inclina"}
            </div>
          )}
        </Html>
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={9}
        maxDistance={26}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, -0.8, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={balanceada ? 0.7 : 0.4} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.42} />
      </EffectComposer>
    </>
  );
}

export default function BalanceoScene(props: BalanceoSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.4, 15.5], fov: 48 }}>
      <Contenido {...props} />
    </Canvas>
  );
}
