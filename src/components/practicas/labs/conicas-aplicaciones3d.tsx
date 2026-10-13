"use client";

/**
 * APLICACIONES — las cónicas trabajando.
 *
 *  · ANTENA PARABÓLICA (como el Gran Telescopio Milimétrico del INAOE): rayos
 *    paralelos al eje bajan, rebotan en el plato y TODOS pasan por el foco; los
 *    pulsos llegan a la vez porque cada camino mide lo mismo. El alumno sube o
 *    baja el receptor: solo en el foco capta toda la señal.
 *  · ÓRBITA DE KEPLER: un planeta recorre una elipse con el Sol en un foco y va
 *    más rápido cerca del Sol (la fase es la anomalía media; se resuelve la
 *    ecuación de Kepler cada cuadro).
 *  · GALERÍA DE LOS SUSURROS: lo que se dice en un foco rebota en la pared
 *    elíptica y llega junto al otro foco (todos los caminos miden 2a).
 */

import * as THREE from "three";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CurvaTubo } from "./_tablero";
import { ViaLactea, useTexturaEspacio, texturaResplandor } from "./_espacio";
import { Etiqueta, useFaseSuave, orientar, useCilindroUnitario, LATON, ACERO, FOCO_COL, D1_COL, D2_COL, RAYO_COL, type Pt } from "./conicas-museo3d";
import { SUELO_SALA } from "./conicas-apolonio3d";
import {
  R_ANTENA, R_RECEPTOR, radiosAntena, A_ORBITA, posicionOrbita, A_GALERIA, rayosGaleria, R_OYENTE, f2, f0,
} from "./conicas-museo-data";

const v3 = () => new THREE.Vector3();

/* ═══════════════════════════════════════════════════════════════════════════
 * ANTENA PARABÓLICA
 * ═══════════════════════════════════════════════════════════════════════════ */
/** Altura del vértice del plato. */
export const ANT_Y = -2.15;
const ALTO_RAYOS = 3.6; // los rayos parten de esta altura sobre el vértice

function crearPaneles(): THREE.CanvasTexture {
  const W = 1024, H = 512;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#e9eef3";
  g.fillRect(0, 0, W, H);
  // paneles: anillos (v) y gajos (u), como el plato de 50 m del GTM
  g.strokeStyle = "rgba(70,90,110,0.55)";
  g.lineWidth = 3;
  for (let i = 1; i < 6; i++) { const y = (i / 6) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.lineWidth = 2;
  for (let j = 0; j < 48; j++) { const x = (j / 48) * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  let sem = 99991;
  const azar = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
  for (let k = 0; k < 140; k++) {
    g.fillStyle = `rgba(${azar() > 0.5 ? "255,255,255" : "120,135,150"},${0.05 + azar() * 0.06})`;
    g.fillRect(Math.floor(azar() * 48) * (W / 48), Math.floor(azar() * 6) * (H / 6), W / 48, H / 6);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function EscenaAntena({ f, hR, senal, fino, accent }: { f: number; hR: number; senal: number; fino: boolean; accent: string }) {
  const paneles = useMemo(() => crearPaneles(), []);
  useEffect(() => () => paneles.dispose(), [paneles]);
  const geoPlato = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 48; i++) { const r = (i / 48) * R_ANTENA; pts.push(new THREE.Vector2(Math.max(r, 0.001), (r * r) / (4 * f))); }
    return new THREE.LatheGeometry(pts, 96);
  }, [f]);
  const yBorde = (R_ANTENA * R_ANTENA) / (4 * f);

  // Rayos en anillos: radio × ángulo.
  const rayos = useMemo(() => {
    const radios = radiosAntena(fino ? 3 : 5);
    const porAnillo = fino ? 4 : 6;
    const out: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }[] = [];
    radios.forEach((r, i) => {
      for (let j = 0; j < porAnillo; j++) {
        const ang = (j / porAnillo) * Math.PI * 2 + i * 0.4;
        const x = r * Math.cos(ang), z = r * Math.sin(ang);
        out.push({ a: new THREE.Vector3(x, ALTO_RAYOS, z), b: new THREE.Vector3(x, (r * r) / (4 * f), z), c: new THREE.Vector3(0, f, 0) });
      }
    });
    return out;
  }, [f, fino]);

  const cil = useCilindroUnitario(1, 6);
  const trazos = useRef<THREE.InstancedMesh>(null);
  const pulsos = useRef<THREE.InstancedMesh>(null);
  const destello = useRef<THREE.Mesh>(null);
  const w = useMemo(() => ({ o: new THREE.Object3D(), aux: v3(), p: v3() }), []);
  const reloj = useRef(0);

  useLayoutEffect(() => {
    const im = trazos.current;
    if (!im) return;
    rayos.forEach((r, i) => {
      orientar(w.o, r.a, r.b, w.aux, 0.018); w.o.updateMatrix(); im.setMatrixAt(2 * i, w.o.matrix);
      orientar(w.o, r.b, r.c, w.aux, 0.018); w.o.updateMatrix(); im.setMatrixAt(2 * i + 1, w.o.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  }, [rayos, w]);

  useFrame((_, dt) => {
    // Desde la altura de partida, «bajar + subir al foco» mide ALTO_RAYOS + f en todos.
    reloj.current = (reloj.current + Math.min(dt, 0.05) * 0.3) % 1;
    const total = ALTO_RAYOS + f;
    const d = Math.min(total, reloj.current * total * 1.25);
    const im = pulsos.current;
    if (im) {
      rayos.forEach((r, i) => {
        const l1 = r.a.y - r.b.y;
        if (d <= l1) w.p.set(r.a.x, r.a.y - d, r.a.z);
        else w.p.lerpVectors(r.b, r.c, Math.min(1, (d - l1) / r.b.distanceTo(r.c)));
        w.o.position.copy(w.p); w.o.quaternion.identity(); w.o.scale.setScalar(1); w.o.updateMatrix();
        im.setMatrixAt(i, w.o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    }
    if (destello.current) {
      const llego = d >= total - 1e-6 ? 1 : 0;
      const s = 0.12 + llego * (0.2 + 0.12 * Math.sin(reloj.current * 60));
      destello.current.scale.setScalar(s / 0.12);
    }
  });

  const receptorCol = senal > 0.99 ? "#34D399" : senal > 0.3 ? "#fbbf24" : "#fb7185";
  // cuadrípode: patas del borde del plato al receptor
  const patas = useMemo(() => [0, 1, 2, 3].map((i) => {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const r = R_ANTENA * 0.86;
    return [[r * Math.cos(a), (r * r) / (4 * f), r * Math.sin(a)], [0, hR + 0.28, 0]] as Pt[];
  }), [f, hR]);

  return (
    <group position={[0, ANT_Y, 0]}>
      {/* montura: columna y horquilla */}
      <mesh position={[0, (SUELO_SALA - ANT_Y - 0.3) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.5, Math.abs(SUELO_SALA - ANT_Y) - 0.3, 32]} />
        <meshStandardMaterial color="#d7dde4" roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[0, SUELO_SALA - ANT_Y + 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.45, 0.24, 48]} />
        <meshStandardMaterial color="#1b2633" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.4, 0.4, 24]} />
        <meshStandardMaterial color={ACERO} roughness={0.35} metalness={0.8} />
      </mesh>
      {/* costillas por detrás del plato */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = R_ANTENA * 0.98;
        const pts: Pt[] = [[0, -0.05, 0], [r * 0.5 * Math.cos(a), -0.12 + (r * r * 0.25) / (4 * f), r * 0.5 * Math.sin(a)], [r * Math.cos(a), (r * r) / (4 * f) - 0.06, r * Math.sin(a)]];
        return <CurvaTubo key={i} puntos={pts} color="#8b97a5" grosor={0.035} brillo={0} segmentos={12} radiales={6} />;
      })}
      {/* el plato: superficie parabólica de paneles */}
      <mesh geometry={geoPlato} castShadow receiveShadow>
        <meshStandardMaterial map={paneles} roughness={0.32} metalness={0.35} side={THREE.DoubleSide} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0, yBorde, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[R_ANTENA, 0.05, 12, 120]} />
        <meshStandardMaterial color={ACERO} roughness={0.3} metalness={0.9} />
      </mesh>
      {/* cuadrípode y receptor */}
      {patas.map((p, i) => <CurvaTubo key={i} puntos={p} color="#9aa6b4" grosor={0.03} brillo={0} segmentos={4} radiales={6} />)}
      <group position={[0, hR, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.36, 24]} />
          <meshStandardMaterial color="#e5e9ee" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.13, R_RECEPTOR + 0.06, 0.16, 24, 1, true]} />
          <meshStandardMaterial color={LATON} roughness={0.3} metalness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <cylinderGeometry args={[R_RECEPTOR + 0.05, R_RECEPTOR + 0.05, 0.02, 24]} />
          <meshStandardMaterial color={receptorCol} emissive={receptorCol} emissiveIntensity={0.4 + senal * 1.8} />
        </mesh>
      </group>

      {/* el foco geométrico y su destello */}
      <mesh ref={destello} position={[0, f, 0]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color="#fff6d6" emissive={FOCO_COL} emissiveIntensity={2.4} transparent opacity={0.9} />
      </mesh>

      {/* rayos y pulsos */}
      <instancedMesh ref={trazos} args={[cil, undefined, rayos.length * 2]} key={`t-${rayos.length}-${f}`}>
        <meshStandardMaterial color={RAYO_COL} emissive={RAYO_COL} emissiveIntensity={1.5} transparent opacity={0.34} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={pulsos} args={[undefined, undefined, rayos.length]} key={`p-${rayos.length}`}>
        <sphereGeometry args={[0.075, 14, 14]} />
        <meshStandardMaterial color="#e6f8ff" emissive={RAYO_COL} emissiveIntensity={2.4} />
      </instancedMesh>

      <Etiqueta pos={[-1.2, f, 0]} color={FOCO_COL}>foco · f = {f2(f)}</Etiqueta>
      <Etiqueta pos={[1.45, hR + 0.35, 0]} color={receptorCol}>receptor · señal {f0(senal * 100)} %</Etiqueta>
      <Etiqueta pos={[0, ALTO_RAYOS + 0.55, 0]} color={accent} grande ancha>y = x² / 4f · rayos paralelos → foco</Etiqueta>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ÓRBITA DE KEPLER
 * ═══════════════════════════════════════════════════════════════════════════ */
export const ORB_Y = -0.6;

function Sol({ pos }: { pos: Pt }) {
  const mapa = useTexturaEspacio("sol");
  const halo = useMemo(() => texturaResplandor(), []);
  useEffect(() => () => halo.dispose(), [halo]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05; });
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.62, 64, 64]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveMap={mapa} emissiveIntensity={1.7} />
      </mesh>
      <sprite scale={[3.6, 3.6, 1]}>
        <spriteMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight intensity={42} decay={1.1} color="#fff1d6" />
    </group>
  );
}

function Planeta({ grupo }: { grupo: React.RefObject<THREE.Group | null> }) {
  const mapa = useTexturaEspacio("tierraDia");
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.6; });
  return (
    <group ref={grupo}>
      <mesh ref={ref} rotation={[0.41, 0, 0]}>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshStandardMaterial map={mapa} roughness={0.75} metalness={0} />
      </mesh>
    </group>
  );
}

export function EscenaOrbita({ e, fase, accent, fino }: { e: number; fase: number; accent: string; fino: boolean }) {
  const a = A_ORBITA, b = a * Math.sqrt(1 - e * e), c = a * e;
  const curva = useMemo(() => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 200; i++) { const t = (i / 200) * Math.PI * 2; pts.push([a * Math.cos(t), 0, -b * Math.sin(t)]); }
    return pts;
  }, [a, b]);
  const suave = useFaseSuave(fase);
  const cil = useCilindroUnitario(1, 8);
  const planeta = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const estela = useRef<THREE.InstancedMesh>(null);
  const N_ESTELA = fino ? 10 : 24;
  const w = useMemo(() => ({ P: v3(), S: v3(), F2: v3(), aux: v3(), o: new THREE.Object3D() }), []);

  useFrame(() => {
    const p = posicionOrbita(suave.current, e, a);
    w.P.set(p.x, 0, -p.y); w.S.set(c, 0, 0); w.F2.set(-c, 0, 0);
    if (planeta.current) planeta.current.position.copy(w.P);
    if (r1.current) orientar(r1.current, w.S, w.P, w.aux, 0.02);
    if (r2.current) orientar(r2.current, w.F2, w.P, w.aux, 0.02);
    // estela: dónde estuvo el planeta en tiempos iguales hacia atrás (se aprieta lejos del Sol)
    const im = estela.current;
    if (im) {
      for (let i = 0; i < N_ESTELA; i++) {
        const q = posicionOrbita(suave.current - (i + 1) * 0.006, e, a);
        w.o.position.set(q.x, 0, -q.y);
        w.o.scale.setScalar(0.11 * (1 - i / N_ESTELA));
        w.o.updateMatrix();
        im.setMatrixAt(i, w.o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  });

  const p = posicionOrbita(fase, e, a);
  return (
    <group position={[0, ORB_Y, 0]}>
      <Suspense fallback={null}>
        <ViaLactea brillo={0.42} radio={400} />
        <Sol pos={[c, 0, 0]} />
        <Planeta grupo={planeta} />
      </Suspense>
      <CurvaTubo puntos={curva} color={accent} grosor={0.02} brillo={0.55} />
      {/* el foco vacío */}
      <mesh position={[-c, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.025, 10, 40]} />
        <meshStandardMaterial color={D2_COL} emissive={D2_COL} emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={r1} geometry={cil}>
        <meshStandardMaterial color={FOCO_COL} emissive={FOCO_COL} emissiveIntensity={0.9} transparent opacity={0.8} />
      </mesh>
      <mesh ref={r2} geometry={cil}>
        <meshStandardMaterial color={D2_COL} emissive={D2_COL} emissiveIntensity={0.9} transparent opacity={0.8} />
      </mesh>
      <instancedMesh ref={estela} args={[undefined, undefined, N_ESTELA]} key={`e-${N_ESTELA}`}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#9fd8ff" emissive="#7dd3fc" emissiveIntensity={1.4} transparent opacity={0.55} />
      </instancedMesh>

      <Etiqueta pos={[c, 1.15, 0]} color={FOCO_COL}>Sol · foco F₁</Etiqueta>
      <Etiqueta pos={[-c, 0.55, 0]} color={D2_COL}>foco vacío F₂</Etiqueta>
      <Etiqueta pos={[0, 0.2, -b - 0.9]} color={accent} grande ancha>r₁ + r₂ = {f2(p.r + p.r2)} = 2a</Etiqueta>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * GALERÍA DE LOS SUSURROS
 * ═══════════════════════════════════════════════════════════════════════════ */
/** Escala: metros de la sala → unidades de escena. */
export const GAL_U = 0.72;
const ALTURA_VOZ = 1.12;

/** Muro elíptico: alto al fondo, bajo al frente para poder ver dentro. */
function crearMuro(a: number, b: number): THREE.BufferGeometry {
  const N = 160, grosor = 0.18;
  const pos: number[] = [], idx: number[] = [];
  const alto = (s: number) => 0.42 + 1.75 * Math.min(1, Math.max(0, (-s + 0.25) / 1.1));
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const s = Math.sin(t);
    const h = alto(s);
    const xi = a * Math.cos(t), zi = b * s;
    const k = 1 + grosor / Math.max(a, b);
    pos.push(xi, 0, zi, xi, h, zi, xi * k, h, zi * k, xi * k, 0, zi * k);
  }
  for (let i = 0; i < N; i++) {
    const o = i * 4, n = (i + 1) * 4;
    for (let q = 0; q < 3; q++) idx.push(o + q, n + q, o + q + 1, o + q + 1, n + q, n + q + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Persona({ pos, color, brillo }: { pos: Pt; color: string; brillo: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.62, 8, 20]} />
        <meshPhysicalMaterial color="#e8ebf0" roughness={0.5} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, ALTURA_VOZ, 0]} castShadow>
        <sphereGeometry args={[0.15, 28, 28]} />
        <meshPhysicalMaterial color="#e8ebf0" roughness={0.45} clearcoat={0.4} emissive={color} emissiveIntensity={brillo} />
      </mesh>
    </group>
  );
}

export function EscenaGaleria({ c, xL, senal, fino }: { c: number; xL: number; senal: number; fino: boolean }) {
  const a = A_GALERIA, b = Math.sqrt(a * a - c * c);
  const muro = useMemo(() => crearMuro(a * GAL_U, b * GAL_U), [a, b]);
  const piso = useMemo(() => {
    const sh = new THREE.Shape();
    sh.absellipse(0, 0, a * GAL_U, b * GAL_U, 0, Math.PI * 2, false, 0);
    return new THREE.ShapeGeometry(sh, 96);
  }, [a, b]);
  const rayos = useMemo(() => rayosGaleria(a, c, fino ? 10 : 18), [a, c, fino]);
  // Frentes de onda: muchos caminos muy juntos; cada tramo del frente es un
  // segmento perpendicular al avance, así los puntos se unen en un arco.
  const caminos = useMemo(() => rayosGaleria(a, c, fino ? 48 : 96), [a, c, fino]);
  const FRENTES = 2;
  const largo = 2 * a * GAL_U;

  const cil = useCilindroUnitario(1, 6);
  const trazos = useRef<THREE.InstancedMesh>(null);
  const pulsos = useRef<THREE.InstancedMesh>(null);
  const frentes = useRef<THREE.InstancedMesh>(null);
  const oyente = useRef<THREE.Mesh>(null);
  const w = useMemo(() => ({ o: new THREE.Object3D(), A: v3(), B: v3(), C: v3(), aux: v3(), dir: v3(), tan: v3(), p: v3(), q1: v3(), q2: v3() }), []);
  const reloj = useRef(0);
  const P3 = (p: [number, number], out: THREE.Vector3) => out.set(p[0] * GAL_U, ALTURA_VOZ, -p[1] * GAL_U);

  useLayoutEffect(() => {
    const im = trazos.current;
    if (!im) return;
    rayos.forEach((r, i) => {
      P3(r.sale, w.A); P3(r.choca, w.B); P3(r.llega, w.C);
      orientar(w.o, w.A, w.B, w.aux, 0.02); w.o.updateMatrix(); im.setMatrixAt(2 * i, w.o.matrix);
      orientar(w.o, w.B, w.C, w.aux, 0.02); w.o.updateMatrix(); im.setMatrixAt(2 * i + 1, w.o.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  }, [rayos, w]);

  useFrame((_, dt) => {
    reloj.current = (reloj.current + Math.min(dt, 0.05) * 0.24) % 1;
    const d = Math.min(largo, reloj.current * largo * 1.25);
    const im = pulsos.current;
    if (im) {
      rayos.forEach((r, i) => {
        P3(r.sale, w.A); P3(r.choca, w.B); P3(r.llega, w.C);
        const l1 = w.A.distanceTo(w.B);
        if (d <= l1) w.o.position.lerpVectors(w.A, w.B, d / l1);
        else w.o.position.lerpVectors(w.B, w.C, Math.min(1, (d - l1) / w.B.distanceTo(w.C)));
        w.o.quaternion.identity(); w.o.scale.setScalar(1); w.o.updateMatrix();
        im.setMatrixAt(i, w.o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    }
    // frentes de onda: un arco que se abre desde F₁, rebota y se cierra sobre F₂
    const fr = frentes.current;
    if (fr) {
      for (let k = 0; k < FRENTES; k++) {
        const dk = (((reloj.current + k / FRENTES) % 1) * largo * 1.25);
        const visible = dk < largo;
        caminos.forEach((r, i) => {
          P3(r.sale, w.A); P3(r.choca, w.B); P3(r.llega, w.C);
          const l1 = w.A.distanceTo(w.B);
          let radio: number;
          if (dk <= l1) { w.p.lerpVectors(w.A, w.B, dk / l1); w.dir.subVectors(w.B, w.A); radio = dk; }
          // tras el rebote los caminos llegan menos parejos: tramos más largos para que el arco no se corte
          else { w.p.lerpVectors(w.B, w.C, Math.min(1, (dk - l1) / w.B.distanceTo(w.C))); w.dir.subVectors(w.C, w.B); radio = Math.max(0, largo - dk) * 1.6; }
          w.dir.normalize();
          w.tan.set(-w.dir.z, 0, w.dir.x);
          const l = visible ? Math.max(0.05, ((2 * Math.PI * radio) / caminos.length) * 1.1) : 0.0001;
          w.q1.copy(w.p).addScaledVector(w.tan, -l / 2); w.q2.copy(w.p).addScaledVector(w.tan, l / 2);
          orientar(w.o, w.q1, w.q2, w.aux, visible ? 0.03 : 0.0001);
          w.o.updateMatrix();
          fr.setMatrixAt(k * caminos.length + i, w.o.matrix);
        });
      }
      fr.instanceMatrix.needsUpdate = true;
    }
    if (oyente.current) {
      const llego = d >= largo - 1e-6;
      const m = oyente.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (llego ? 1.6 : 0.25) * (0.15 + senal);
    }
  });

  const oyenteCol = senal > 0.99 ? "#34D399" : senal > 0.4 ? "#fbbf24" : "#fb7185";
  return (
    <group position={[0, SUELO_SALA, 0]}>
      {/* piso de mármol de la galería y su zócalo */}
      <mesh geometry={piso} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#2a3546" roughness={0.3} metalness={0.25} />
      </mesh>
      <mesh geometry={muro} castShadow receiveShadow>
        <meshStandardMaterial color="#d8cdb8" roughness={0.62} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* placas de latón en el piso: los dos focos */}
      {[-c, c].map((x, i) => (
        <mesh key={i} position={[x * GAL_U, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 40]} />
          <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
        </mesh>
      ))}
      <Persona pos={[-c * GAL_U, 0, 0]} color={FOCO_COL} brillo={0.5} />
      <group position={[xL * GAL_U, 0, 0]}>
        <Persona pos={[0, 0, 0]} color={oyenteCol} brillo={0} />
        {/* halo del oyente: brilla cuando le llega el sonido concentrado */}
        <mesh ref={oyente} position={[0, ALTURA_VOZ, 0]}>
          <sphereGeometry args={[R_OYENTE * GAL_U, 24, 24]} />
          <meshStandardMaterial color={oyenteCol} emissive={oyenteCol} emissiveIntensity={0.3} transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>

      <instancedMesh ref={trazos} args={[cil, undefined, rayos.length * 2]} key={`gt-${rayos.length}-${c}`}>
        <meshStandardMaterial color={D1_COL} emissive={D1_COL} emissiveIntensity={0.7} transparent opacity={0.14} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={frentes} args={[cil, undefined, caminos.length * FRENTES]} key={`gf-${caminos.length}`}>
        <meshStandardMaterial color="#d9fff0" emissive={D1_COL} emissiveIntensity={1.9} />
      </instancedMesh>
      <instancedMesh ref={pulsos} args={[undefined, undefined, rayos.length]} key={`gp-${rayos.length}`}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#eafff5" emissive={D1_COL} emissiveIntensity={2.4} />
      </instancedMesh>

      <Etiqueta pos={[-c * GAL_U, ALTURA_VOZ + 0.6, 0]} color={FOCO_COL}>habla · foco F₁</Etiqueta>
      <Etiqueta pos={[xL * GAL_U, ALTURA_VOZ + 0.6, 0]} color={oyenteCol}>escucha · {f0(senal * 100)} %</Etiqueta>
      <Etiqueta pos={[0, 2.3, -b * GAL_U * 0.6]} color={D1_COL} grande ancha>todos los caminos = 2a = {f0(2 * a)} m</Etiqueta>
    </group>
  );
}
