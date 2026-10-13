"use client";

/**
 * Escala 2 — EL CLOROPLASTO, abierto en corte como en un atlas: se ve la
 * DOBLE membrana en el borde del corte, el estroma con sus ribosomas, granos
 * de almidón y plastoglóbulos, y las pilas de tilacoides (GRANAS) unidas por
 * LAMELAS. Los tilacoides se encienden con la luz que de verdad se absorbe.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { azar, geometriaDisco, geometriaCO2, geometriaO2, geometriaGlucosa } from "./fotosintesis-geometrias";
import { Flujo, Fotones, Etiqueta, useSim, escalaActiva, curva, type RutaFoton } from "./fotosintesis-runtime";
import { PIVOTE_CLOROPLASTO } from "./fotosintesis-zoom";

type V3 = [number, number, number];

const almidon: V3 = [-1.7, -0.55, -0.25];

const EJE: V3 = [3.0, 1.45, 1.45];
const INTERIOR = 0.94;
/* Cuña que se quita para ver adentro: ángulo medido en el plano YZ desde +Y hacia +Z. */
const CORTE_INI = (2 * Math.PI) / 180;
const CORTE_FIN = (112 * Math.PI) / 180;

/** Casquete del elipsoide sin la cuña (eje polar = X). */
function geometriaCascara(radio: number): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(radio, 96, 56, CORTE_FIN, 2 * Math.PI - (CORTE_FIN - CORTE_INI));
  g.rotateZ(-Math.PI / 2);
  g.scale(EJE[0], EJE[1], EJE[2]);
  g.computeVertexNormals();
  return g;
}

/** Punto de la superficie (radio r) en el ángulo de corte φ y latitud θ. */
function puntoCorte(r: number, phi: number, theta: number): THREE.Vector3 {
  // Esfera de three: x = −cosφ·senθ, y = cosθ, z = senφ·senθ; luego rotZ(−90°): (y, −x, z).
  const x0 = -Math.cos(phi) * Math.sin(theta);
  const y0 = Math.cos(theta);
  const z0 = Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(y0 * r * EJE[0], -x0 * r * EJE[1], z0 * r * EJE[2]);
}

/** Banda plana en el borde del corte, entre dos radios: el grosor de una membrana. */
function geometriaBanda(phi: number, r0: number, r1: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI;
    const a = puntoCorte(r0, phi, th);
    const b = puntoCorte(r1, phi, th);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    if (i < N) {
      const k = i * 2;
      idx.push(k, k + 1, k + 3, k, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** ¿El punto cae dentro del elipsoide interior (con margen)? */
function dentro(p: V3, margen: number): boolean {
  const k = INTERIOR - margen;
  return (p[0] / (EJE[0] * k)) ** 2 + (p[1] / (EJE[1] * k)) ** 2 + (p[2] / (EJE[2] * k)) ** 2 < 1;
}

export function EscalaCloroplasto({ etiquetas, angosto, pocos }: { etiquetas: boolean; angosto: boolean; pocos: boolean }) {
  const simRef = useSim();

  const geos = useMemo(() => ({
    exterior: geometriaCascara(1),
    interior: geometriaCascara(INTERIOR),
    bandas: [
      geometriaBanda(CORTE_INI, 0.972, 1.0), geometriaBanda(CORTE_FIN, 0.972, 1.0),
      geometriaBanda(CORTE_INI, INTERIOR - 0.028, INTERIOR), geometriaBanda(CORTE_FIN, INTERIOR - 0.028, INTERIOR),
    ],
    espacio: [geometriaBanda(CORTE_INI, INTERIOR, 0.972), geometriaBanda(CORTE_FIN, INTERIOR, 0.972)],
    disco: geometriaDisco(0.34, 0.062),
  }), []);
  useEffect(() => () => {
    geos.exterior.dispose(); geos.interior.dispose(); geos.disco.dispose();
    geos.bandas.forEach((g) => g.dispose()); geos.espacio.forEach((g) => g.dispose());
  }, [geos]);

  /* ── Granas: pilas de discos ──────────────────────────────────────── */
  const granas = useMemo(() => {
    const r = azar(505);
    const lista: { c: V3; n: number }[] = [{ c: [PIVOTE_CLOROPLASTO[0], -0.05, PIVOTE_CLOROPLASTO[2]], n: 8 }];
    let intentos = 0;
    while (lista.length < (pocos ? 9 : 14) && intentos < 3000) {
      intentos++;
      const c: V3 = [(r() - 0.5) * 4.8, (r() - 0.5) * 0.7, (r() - 0.5) * 1.8];
      const n = 5 + Math.floor(r() * 6);
      const alto = n * 0.085;
      if (!dentro([c[0] + Math.sign(c[0]) * 0.34, c[1] + alto / 2, c[2] + Math.sign(c[2]) * 0.34], 0.04)) continue;
      if (!dentro([c[0], c[1] - alto / 2, c[2]], 0.04)) continue;
      if (lista.some((g) => Math.hypot(g.c[0] - c[0], g.c[2] - c[2]) < 0.76)) continue;
      lista.push({ c, n });
    }
    return lista;
  }, [pocos]);

  const discos = useMemo(() => {
    const out: { p: V3; rot: number }[] = [];
    granas.forEach((g, gi) => {
      for (let i = 0; i < g.n; i++) {
        out.push({ p: [g.c[0], g.c[1] + (i - (g.n - 1) / 2) * 0.085, g.c[2]], rot: gi * 0.9 + i * 0.15 });
      }
    });
    return out;
  }, [granas]);

  /* Lamelas: cada grana se une con sus dos vecinas más cercanas. */
  const lamelas = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion; l: number }[] = [];
    const visto = new Set<string>();
    const x = new THREE.Vector3(1, 0, 0);
    granas.forEach((a, i) => {
      const vecinas = granas.map((b, j) => ({ j, d: Math.hypot(a.c[0] - b.c[0], a.c[2] - b.c[2]) })).filter((v) => v.j !== i).sort((u, v) => u.d - v.d).slice(0, 2);
      for (const v of vecinas) {
        const clave = i < v.j ? `${i}-${v.j}` : `${v.j}-${i}`;
        if (visto.has(clave)) continue;
        visto.add(clave);
        const b = granas[v.j]!;
        for (const nivel of [-0.12, 0.1]) {
          const pa = new THREE.Vector3(a.c[0], a.c[1] + nivel, a.c[2]);
          const pb = new THREE.Vector3(b.c[0], b.c[1] + nivel * 0.8, b.c[2]);
          const d = pb.clone().sub(pa);
          const l = d.length();
          out.push({ p: pa.clone().add(pb).multiplyScalar(0.5), q: new THREE.Quaternion().setFromUnitVectors(x, d.normalize()), l });
        }
      }
    });
    return out;
  }, [granas]);

  const refDisco = useRef<THREE.InstancedMesh>(null);
  const refLamela = useRef<THREE.InstancedMesh>(null);
  const refRibo = useRef<THREE.InstancedMesh>(null);
  const ribosomas = useMemo(() => {
    const r = azar(606);
    const out: V3[] = [];
    while (out.length < (pocos ? 140 : 320)) {
      const p: V3 = [(r() - 0.5) * 5.6, (r() - 0.5) * 2.6, (r() - 0.5) * 2.6];
      if (dentro(p, 0.06)) out.push(p);
    }
    return out;
  }, [pocos]);

  useEffect(() => {
    const o = new THREE.Object3D();
    const d = refDisco.current;
    if (d) {
      discos.forEach((x, i) => { o.position.set(...x.p); o.rotation.set(0, x.rot, 0); o.scale.setScalar(1); o.updateMatrix(); d.setMatrixAt(i, o.matrix); });
      d.instanceMatrix.needsUpdate = true;
    }
    const l = refLamela.current;
    if (l) {
      lamelas.forEach((x, i) => { o.position.copy(x.p); o.quaternion.copy(x.q); o.scale.set(x.l, 1, 1); o.updateMatrix(); l.setMatrixAt(i, o.matrix); });
      l.instanceMatrix.needsUpdate = true;
    }
    const rb = refRibo.current;
    if (rb) {
      o.quaternion.identity();
      ribosomas.forEach((p, i) => { o.position.set(...p); o.scale.setScalar(1); o.updateMatrix(); rb.setMatrixAt(i, o.matrix); });
      rb.instanceMatrix.needsUpdate = true;
    }
  }, [discos, lamelas, ribosomas]);

  const matDisco = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#237f31", emissive: "#3dff6a", emissiveIntensity: 0.1, roughness: 0.32, sheen: 0.8, sheenColor: "#c8ffb0", sheenRoughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.3,
  }), []);
  useFrame(() => {
    const s = simRef.current;
    if (!escalaActiva(s, 2)) return;
    const d = refDisco.current;
    if (d) (d.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.015 + s.luz * s.absorcion * 0.32;
  });

  /* ── Flujos ─────────────────────────────────────────────────────── */
  const matMol = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3 }), []);
  const geoCO2 = useMemo(() => geometriaCO2(), []);
  const geoO2 = useMemo(() => geometriaO2(), []);
  const geoGlu = useMemo(() => geometriaGlucosa(), []);

  const curvasCO2 = useMemo(() => {
    const r = azar(707);
    return granas.slice(0, 10).map((g, i) => {
      const a = 0.4 + r() * 1.4;
      return curva([-4.8 + i * 0.9, 3.4 * Math.cos(a), 2.6 * Math.sin(a) + 1.2], [g.c[0] * 0.7, 1.0, g.c[2] + 0.5], [g.c[0] + 0.45, g.c[1] + 0.25, g.c[2] + 0.2]);
    });
  }, [granas]);
  const curvasO2 = useMemo(() => {
    const r = azar(808);
    return granas.slice(0, 10).map((g) => {
      const a = 0.5 + r() * 1.2;
      return curva([g.c[0], g.c[1] + 0.4, g.c[2]], [g.c[0] * 1.1, 1.1, g.c[2] + 0.6], [g.c[0] * 1.3 + 0.5, 3.2 * Math.cos(a) + 0.6, 3.0 * Math.sin(a) + 0.8]);
    });
  }, [granas]);
  const curvasGlu = useMemo(() => granas.slice(0, 8).map((g) => curva([g.c[0] + 0.4, g.c[1] - 0.1, g.c[2] - 0.3], [(g.c[0] + almidon[0]) / 2, -0.75, -0.1], [almidon[0] + 0.25, almidon[1] + 0.1, almidon[2] + 0.2])), [granas]);

  const rutas: RutaFoton[] = useMemo(() => {
    const r = azar(909);
    const arriba = new THREE.Vector3(0, 1, 0);
    return Array.from({ length: 36 }, (_, i) => {
      const g = granas[i % granas.length]!;
      const top = g.c[1] + (g.n * 0.085) / 2;
      const a = new THREE.Vector3(g.c[0] + (r() - 0.5) * 0.4, top, g.c[2] + (r() - 0.5) * 0.4);
      return { de: a.clone().add(new THREE.Vector3(-2.4 - r() * 1.2, 4.2, 2.2 + r())), a, n: arriba };
    });
  }, [granas]);

  // Punto medio del corte, para la etiqueta de la doble membrana.
  const bordeCorte = useMemo(() => puntoCorte(1.0, CORTE_INI, Math.PI * 0.3), []);

  return (
    <group>
      {/* Membrana externa (translúcida, cerosa) e interna. */}
      <mesh geometry={geos.exterior}>
        <meshPhysicalMaterial color="#6cc35c" roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.25} transmission={pocos ? 0 : 0.35} thickness={0.4} sheen={0.5} sheenColor="#d8ffc0" side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={geos.exterior}>
        <meshStandardMaterial color="#1b4a26" roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geos.interior}>
        <meshStandardMaterial color="#173f22" roughness={0.75} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geos.interior}>
        <meshStandardMaterial color="#4aa54a" roughness={0.5} side={THREE.FrontSide} />
      </mesh>
      {/* El grosor del corte: dos membranas claras y el espacio entre ellas. */}
      {geos.bandas.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#c9f2a2" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {geos.espacio.map((g, i) => (
        <mesh key={`e${i}`} geometry={g}>
          <meshStandardMaterial color="#2d5f34" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Granas y lamelas. */}
      <instancedMesh ref={refDisco} args={[geos.disco, matDisco, discos.length]} />
      <instancedMesh ref={refLamela} args={[undefined, undefined, lamelas.length]}>
        <boxGeometry args={[1, 0.024, 0.13]} />
        <meshPhysicalMaterial color="#3fae4a" emissive="#3dff6a" emissiveIntensity={0.08} roughness={0.4} sheen={0.4} sheenColor="#c8ffb0" />
      </instancedMesh>

      {/* Estroma: ribosomas, almidón, plastoglóbulos y el ADN del cloroplasto. */}
      <instancedMesh ref={refRibo} args={[undefined, undefined, ribosomas.length]}>
        <sphereGeometry args={[0.022, 6, 5]} />
        <meshStandardMaterial color="#d9efc4" roughness={0.6} />
      </instancedMesh>
      <mesh position={almidon} scale={[0.42, 0.26, 0.3]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshPhysicalMaterial color="#f3ecd8" roughness={0.45} clearcoat={0.5} />
      </mesh>
      <mesh position={[1.9, -0.5, -0.4]} scale={[0.3, 0.2, 0.24]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshPhysicalMaterial color="#efe6cf" roughness={0.45} clearcoat={0.5} />
      </mesh>
      {[[-0.9, 0.62, -0.5], [1.2, 0.55, -0.6], [2.35, 0.1, 0.2], [-2.3, 0.25, 0.1], [0.1, -0.75, -0.6]].map((p, i) => (
        <mesh key={i} position={p as V3}>
          <sphereGeometry args={[0.07 + (i % 2) * 0.03, 16, 12]} />
          <meshPhysicalMaterial color="#ffd36b" roughness={0.25} clearcoat={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.6, -0.55, -0.55]} rotation={[1.1, 0.3, 0]}>
        <torusKnotGeometry args={[0.16, 0.012, 96, 6, 3, 7]} />
        <meshStandardMaterial color="#9fd8ff" roughness={0.5} />
      </mesh>

      <Fotones rutas={rutas} n={pocos ? 30 : 64} tam={1.0} velocidad={0.55} rebote={2.4} semilla={31} />
      <Flujo curvas={curvasCO2} n={pocos ? 8 : 16} geometria={geoCO2} material={matMol} caudal={(s) => s.fCO2} velocidad={0.15} tam={0.22} giro={1.5} semilla={41} />
      <Flujo curvas={curvasO2} n={pocos ? 8 : 16} geometria={geoO2} material={matMol} caudal={(s) => s.tasa} velocidad={0.18} tam={0.24} giro={1.5} semilla={42} />
      <Flujo curvas={curvasGlu} n={pocos ? 8 : 18} geometria={geoGlu} material={matMol} caudal={(s) => s.tasa} velocidad={0.12} tam={0.24} giro={1} semilla={43} />

      <Etiqueta visible={etiquetas} pos={[bordeCorte.x - 0.4, bordeCorte.y + 0.35, bordeCorte.z + 0.1]} color="#c9f2a2" icono="fa-circle-half-stroke" texto="Doble membrana" />
      <Etiqueta visible={etiquetas} pos={[PIVOTE_CLOROPLASTO[0] + 0.2, 0.75, PIVOTE_CLOROPLASTO[2] + 0.3]} color="#3ddc6a" icono="fa-layer-group" texto={angosto ? "Grana" : "Grana: tilacoides apilados"} />
      <Etiqueta visible={etiquetas} pos={[almidon[0], almidon[1] - 0.55, almidon[2] + 0.9]} color="#ffd36b" icono="fa-water" texto={angosto ? "Estroma" : "Estroma (almidón)"} />
      {!angosto && lamelas[0] && <Etiqueta visible={etiquetas} pos={[2.4, -1.15, 0.9]} color="#3fae4a" icono="fa-grip-lines" texto="Lamela" />}
    </group>
  );
}
