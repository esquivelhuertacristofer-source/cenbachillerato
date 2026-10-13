"use client";

/**
 * Escala 1 — CORTE DE HOJA. Un bloque de hoja cortado de frente:
 *   cutícula · epidermis superior · parénquima en empalizada (células altas
 *   y transparentes, llenas de cloroplastos que circulan: ciclosis) ·
 *   parénquima esponjoso con espacios de aire · nervadura (xilema con su
 *   engrosamiento en espiral y floema) · epidermis inferior con un ESTOMA.
 * Las células oclusivas del estoma se separan con la luz y se cierran con el
 * calor; por el poro entra el CO₂ y sale el O₂ (caudales ∝ factores y tasa).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three-stdlib";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { azar, geometriaBlob, geometriaCO2, geometriaO2, geometriaH2O, geometriaGlucosa, texturaHaz } from "./fotosintesis-geometrias";
import { Flujo, Fotones, Etiqueta, useSim, escalaActiva, ponerOpacidad, curva, type RutaFoton } from "./fotosintesis-runtime";
import { PIVOTE_HOJA } from "./fotosintesis-zoom";

const ANCHO = 7.2;
const FONDO = 3.2;
const ESTOMA: [number, number, number] = [-1.7, -1.42, 1.2];
const NERVIO: [number, number] = [1.45, -0.52]; // x, y (corre a lo largo de z)

type V3 = [number, number, number];

export function EscalaHoja({ etiquetas, angosto, pocos }: { etiquetas: boolean; angosto: boolean; pocos: boolean }) {
  const simRef = useSim();

  /* ── Células ─────────────────────────────────────────────────────── */
  const celdas = useMemo(() => {
    const r = azar(101);
    const nx = pocos ? 11 : 14;
    const nz = pocos ? 5 : 6;
    const dx = ANCHO / nx;
    const dz = FONDO / nz;
    const emp: V3[] = [];
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        emp.push([-ANCHO / 2 + dx * (i + 0.5) + (r() - 0.5) * 0.05, 0.66 + (r() - 0.5) * 0.06, -FONDO / 2 + dz * (j + 0.5) + (r() - 0.5) * 0.05]);
      }
    }
    const epi: V3[] = [];
    const epiInf: V3[] = [];
    const ex = 11;
    const ez = 5;
    for (let i = 0; i < ex; i++) {
      for (let j = 0; j < ez; j++) {
        const x = -ANCHO / 2 + (ANCHO / ex) * (i + 0.5);
        const z = -FONDO / 2 + (FONDO / ez) * (j + 0.5);
        epi.push([x, 1.5, z]);
        // La epidermis inferior se abre donde está el estoma.
        if (Math.hypot(x - ESTOMA[0], (z - ESTOMA[2]) * 0.8) > 0.62) epiInf.push([x, -1.45, z]);
      }
    }
    const esp: { p: V3; s: V3 }[] = [];
    let intentos = 0;
    while (esp.length < (pocos ? 26 : 40) && intentos < 900) {
      intentos++;
      const p: V3 = [(r() - 0.5) * (ANCHO - 0.4), -0.95 + r() * 0.75, (r() - 0.5) * (FONDO - 0.3)];
      if (Math.hypot(p[0] - NERVIO[0], p[1] - NERVIO[1]) < 0.78) continue;
      if (Math.hypot(p[0] - ESTOMA[0], p[1] - (ESTOMA[1] + 0.55), p[2] - ESTOMA[2]) < 0.6) continue;
      if (esp.some((q) => Math.hypot(q.p[0] - p[0], q.p[1] - p[1], q.p[2] - p[2]) < 0.5)) continue;
      const k = 0.22 + r() * 0.1;
      esp.push({ p, s: [k * (1 + r() * 0.3), k * 0.85, k * (1 + r() * 0.3)] });
    }
    return { emp, epi, epiInf, esp };
  }, [pocos]);

  const geoEpi = useMemo(() => new RoundedBoxGeometry(ANCHO / 11 - 0.04, 0.3, FONDO / 5 - 0.04, 2, 0.08), []);
  const geoEmp = useMemo(() => new THREE.CapsuleGeometry(0.2, 0.82, 6, 18), []);
  const geoEsp = useMemo(() => geometriaBlob(61, 0.12, 2), []);
  const geoClo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 14, 10);
    g.scale(0.062, 0.04, 0.095);
    return g;
  }, []);

  const refEpi = useRef<THREE.InstancedMesh>(null);
  const refEpiInf = useRef<THREE.InstancedMesh>(null);
  const refEmp = useRef<THREE.InstancedMesh>(null);
  const refEsp = useRef<THREE.InstancedMesh>(null);
  const refClo = useRef<THREE.InstancedMesh>(null);

  // Cloroplastos: pegados a la pared de cada célula, dan vueltas (ciclosis).
  const clo = useMemo(() => {
    const r = azar(202);
    const lista: { c: V3; ang: number; h: number; rad: number; vel: number; esp: boolean }[] = [];
    // Células en empalizada repletas: cloroplastos por todo el volumen, más
    // cerca de la pared (como en la micrografía), y no un anillo ordenado.
    const porEmp = pocos ? 10 : 17;
    for (const c of celdas.emp) {
      for (let i = 0; i < porEmp; i++) {
        lista.push({ c, ang: (i / porEmp) * Math.PI * 2 * 2.3 + r(), h: -0.56 + r() * 1.12, rad: 0.06 + Math.sqrt(r()) * 0.1, vel: 0.12 + r() * 0.14, esp: false });
      }
    }
    for (const e of celdas.esp) {
      for (let i = 0; i < 6; i++) {
        lista.push({ c: e.p, ang: r() * 6.28, h: (r() - 0.5) * 0.22, rad: e.s[0] * (0.35 + r() * 0.4), vel: 0.12 + r() * 0.1, esp: true });
      }
    }
    return lista;
  }, [celdas, pocos]);

  useEffect(() => {
    const o = new THREE.Object3D();
    const grupos: [THREE.InstancedMesh | null, V3[], number][] = [
      [refEpi.current, celdas.epi, 0], [refEpiInf.current, celdas.epiInf, 0], [refEmp.current, celdas.emp, 0.7],
    ];
    for (const [im, lista, rot] of grupos) {
      if (!im) continue;
      for (let i = 0; i < lista.length; i++) {
        o.position.set(...lista[i]!);
        o.rotation.set(0, rot * i, 0);
        o.updateMatrix();
        im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
    const m = refEsp.current;
    if (m) {
      celdas.esp.forEach((e, i) => {
        o.position.set(...e.p);
        o.rotation.set(i * 0.7, i * 1.3, 0);
        o.scale.set(...e.s);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
  }, [celdas]);

  const tmp = useMemo(() => new THREE.Object3D(), []);
  const matClo = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f9a34", emissive: "#3dff6a", emissiveIntensity: 0.15, roughness: 0.4 }), []);
  const matOclusiva = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#58b545", roughness: 0.3, sheen: 0.7, sheenColor: "#e0ffc0", clearcoat: 0.5 }), []);
  const refIzq = useRef<THREE.Mesh>(null);
  const refDer = useRef<THREE.Mesh>(null);
  // Célula oclusiva: tubo arqueado (riñón) a lo largo de z, panza hacia afuera
  // (+x), con las puntas redondeadas. Dos espejadas dejan un poro en rendija.
  const geoOclusiva = useMemo(() => {
    const L = 0.46;
    const pts = Array.from({ length: 13 }, (_, i) => {
      const t = i / 12;
      return new THREE.Vector3(0.17 * Math.sin(Math.PI * t), 0, -L + 2 * L * t);
    });
    const tubo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.13, 16, false);
    const tapa = (z: number) => {
      const g = new THREE.SphereGeometry(0.13, 16, 12);
      g.translate(0, 0, z);
      return g;
    };
    const g = mergeGeometries([tubo.toNonIndexed(), tapa(-L).toNonIndexed(), tapa(L).toNonIndexed()].map((x) => {
      x.deleteAttribute("uv");
      return x;
    }))!;
    g.scale(1, 0.75, 1);
    return g;
  }, []);
  const refRayos = useRef<THREE.Group>(null);

  /* Haces de luz desde arriba. */
  const haz = useMemo(() => texturaHaz(), []);
  const matHaz = useMemo(() => new THREE.MeshBasicMaterial({ map: haz, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide, toneMapped: false, opacity: 0.2 }), [haz]);
  useEffect(() => () => { haz.dispose(); }, [haz]);

  useFrame(() => {
    const s = simRef.current;
    if (!escalaActiva(s, 1)) return;
    const m = refClo.current;
    if (m) {
      for (let i = 0; i < clo.length; i++) {
        const c = clo[i]!;
        const a = c.ang + s.t * c.vel;
        tmp.position.set(c.c[0] + Math.cos(a) * c.rad, c.c[1] + c.h, c.c[2] + Math.sin(a) * c.rad);
        tmp.rotation.set(0, -a, 0.3);
        tmp.updateMatrix();
        m.setMatrixAt(i, tmp.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    // La clorofila «se enciende» con la luz que de verdad absorbe.
    if (m) (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.02 + s.luz * s.absorcion * 0.45;
    const rayo = refRayos.current?.children[0] as THREE.Mesh | undefined;
    if (rayo) {
      const mh = rayo.material as THREE.MeshBasicMaterial;
      mh.color.copy(s.colorLuz);
      ponerOpacidad(mh, 0.015 + s.luz * 0.07);
    }
    // Estoma: las oclusivas se hinchan y se arquean: el poro se abre.
    // Con turgencia se separan y el poro (la rendija entre ellas) se abre.
    const sep = -0.02 + s.apertura * 0.11;
    if (refIzq.current) refIzq.current.position.x = ESTOMA[0] - sep;
    if (refDer.current) refDer.current.position.x = ESTOMA[0] + sep;
  });

  /* ── Nervadura: vaina, xilema (anillos en espiral) y floema ─────── */
  const nervio = useMemo(() => {
    const vaina: V3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      vaina.push([NERVIO[0] + Math.cos(a) * 0.5, NERVIO[1] + Math.sin(a) * 0.42, 0]);
    }
    const xilema: V3[] = [[-0.16, 0.13, 0], [0.0, 0.17, 0], [0.16, 0.12, 0], [-0.06, 0.0, 0]].map(([x, y]) => [NERVIO[0] + x!, NERVIO[1] + y!, 0]);
    const floema: V3[] = [[-0.12, -0.17, 0], [0.04, -0.2, 0], [0.18, -0.14, 0], [0.12, -0.02, 0]].map(([x, y]) => [NERVIO[0] + x!, NERVIO[1] + y!, 0]);
    return { vaina, xilema, floema };
  }, []);
  const geoVaina = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.12, FONDO - 0.3, 4, 12);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const geoAnillo = useMemo(() => {
    const g = new THREE.TorusGeometry(0.075, 0.016, 6, 16);
    return g;
  }, []);
  const refVaina = useRef<THREE.InstancedMesh>(null);
  const refAnillo = useRef<THREE.InstancedMesh>(null);
  const anillosPorTubo = pocos ? 14 : 22;
  useEffect(() => {
    const o = new THREE.Object3D();
    const v = refVaina.current;
    if (v) {
      nervio.vaina.forEach((p, i) => { o.position.set(...p); o.rotation.set(0, 0, 0); o.updateMatrix(); v.setMatrixAt(i, o.matrix); });
      v.instanceMatrix.needsUpdate = true;
    }
    const a = refAnillo.current;
    if (a) {
      let k = 0;
      nervio.xilema.forEach((p) => {
        for (let j = 0; j < anillosPorTubo; j++) {
          o.position.set(p[0], p[1], -FONDO / 2 + 0.15 + (j / (anillosPorTubo - 1)) * (FONDO - 0.3));
          o.rotation.set(0.12, 0, 0);
          o.updateMatrix();
          a.setMatrixAt(k++, o.matrix);
        }
      });
      a.instanceMatrix.needsUpdate = true;
    }
  }, [nervio, anillosPorTubo]);

  /* ── Flujos ─────────────────────────────────────────────────────── */
  const geoH2O = useMemo(() => geometriaH2O(), []);
  const geoCO2 = useMemo(() => geometriaCO2(), []);
  const geoO2 = useMemo(() => geometriaO2(), []);
  const geoGlu = useMemo(() => geometriaGlucosa(), []);
  const matMol = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.05 }), []);

  const curvasAgua = useMemo(() => nervio.xilema.map((p) => curva([p[0], p[1], -FONDO / 2], [p[0], p[1], FONDO / 2])), [nervio]);
  const curvasAzucar = useMemo(() => nervio.floema.map((p) => curva([p[0], p[1], FONDO / 2], [p[0], p[1], -FONDO / 2])), [nervio]);

  // CO₂: entra por el poro desde abajo y se reparte a las células.
  const destinos = useMemo(() => {
    const r = azar(303);
    return Array.from({ length: 14 }, (): V3 => [ESTOMA[0] + (r() - 0.3) * 2.6, -0.4 + r() * 1.1, ESTOMA[2] - r() * 1.6]);
  }, []);
  const curvasCO2 = useMemo(() => destinos.map((d, i) => curva(
    [ESTOMA[0] + (i % 3 - 1) * 0.5, -3.4, ESTOMA[2] + 0.9],
    [ESTOMA[0], -1.95, ESTOMA[2] + 0.2],
    [ESTOMA[0], -1.42, ESTOMA[2]],
    [ESTOMA[0], -0.9, ESTOMA[2] - 0.1],
    d,
  )), [destinos]);
  const curvasO2 = useMemo(() => destinos.map((d, i) => curva(
    d,
    [ESTOMA[0] + 0.05, -0.85, ESTOMA[2] - 0.05],
    [ESTOMA[0], -1.42, ESTOMA[2]],
    [ESTOMA[0] - 0.2, -2.0, ESTOMA[2] + 0.3],
    [ESTOMA[0] - 0.9 + (i % 3) * 0.6, -3.5, ESTOMA[2] + 1.2],
  )), [destinos]);

  // Fotones desde arriba hacia el interior de las células en empalizada.
  const rutas: RutaFoton[] = useMemo(() => {
    const r = azar(404);
    const arriba = new THREE.Vector3(0, 1, 0);
    return Array.from({ length: 40 }, () => {
      const x = (r() - 0.5) * (ANCHO - 0.8);
      const z = (r() - 0.5) * (FONDO - 0.5);
      return { de: new THREE.Vector3(x - 1.2, 5.2, z - 0.6), a: new THREE.Vector3(x, 1.05 + r() * 0.5, z), n: arriba };
    });
  }, []);

  const rayos = useMemo(() => [[-2.3, -0.6], [0.2, 0.3], [2.4, -0.2]].map(([x, z]) => ({ x: x!, z: z! })), []);

  return (
    <group>
      {/* Cutícula: capa cerosa y brillante. */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[ANCHO + 0.02, 0.07, FONDO + 0.02]} />
        <meshPhysicalMaterial color="#e3f7cf" roughness={0.08} clearcoat={1} transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* Epidermis superior e inferior. */}
      <instancedMesh ref={refEpi} args={[geoEpi, undefined, celdas.epi.length]}>
        <meshPhysicalMaterial color="#9fd07e" roughness={0.45} clearcoat={0.25} clearcoatRoughness={0.5} transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={refEpiInf} args={[geoEpi, undefined, celdas.epiInf.length]}>
        <meshPhysicalMaterial color="#98c978" roughness={0.45} clearcoat={0.25} transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>

      {/* Empalizada: células altas, casi transparentes; se ven sus cloroplastos. */}
      <instancedMesh ref={refEmp} args={[geoEmp, undefined, celdas.emp.length]}>
        <meshPhysicalMaterial color="#cdeeb4" roughness={0.12} clearcoat={1} clearcoatRoughness={0.15} transparent opacity={0.2} depthWrite={false} sheen={0.6} sheenColor="#f0ffe0" />
      </instancedMesh>
      <instancedMesh ref={refEsp} args={[geoEsp, undefined, celdas.esp.length]}>
        <meshPhysicalMaterial color="#c3e6a3" roughness={0.15} clearcoat={1} transparent opacity={0.26} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={refClo} args={[geoClo, matClo, clo.length]} frustumCulled={false} />
      {/* El cloroplasto donde entra el zoom, un poco más grande. */}
      <mesh position={PIVOTE_HOJA} rotation={[0.2, 0.4, 0.3]} scale={1.5} material={matClo}>
        <sphereGeometry args={[0.07, 20, 14]} />
      </mesh>

      {/* Nervadura. */}
      <instancedMesh ref={refVaina} args={[geoVaina, undefined, nervio.vaina.length]}>
        <meshPhysicalMaterial color="#b9dc8e" roughness={0.2} clearcoat={1} transparent opacity={0.4} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={refAnillo} args={[geoAnillo, undefined, nervio.xilema.length * anillosPorTubo]}>
        <meshStandardMaterial color="#d9c48f" roughness={0.55} />
      </instancedMesh>
      {nervio.xilema.map((p, i) => (
        <mesh key={`x${i}`} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.072, 0.072, FONDO - 0.3, 16, 1, true]} />
          <meshPhysicalMaterial color="#e8dcb4" roughness={0.3} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {nervio.floema.map((p, i) => (
        <mesh key={`f${i}`} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, FONDO - 0.3, 12, 1, true]} />
          <meshPhysicalMaterial color="#f1c27a" roughness={0.35} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* Estoma: dos células oclusivas en forma de riñón. */}
<mesh ref={refIzq} geometry={geoOclusiva} material={matOclusiva} position={ESTOMA} rotation={[0, Math.PI, 0]} />
      <mesh ref={refDer} geometry={geoOclusiva} material={matOclusiva} position={ESTOMA} />

      {/* Luz que entra desde arriba. */}
      <group ref={refRayos}>
        {!pocos && rayos.map((r, i) => (
          <mesh key={i} position={[r.x - 0.6, 3.3, r.z - 0.3]} rotation={[0.16, 0, 0.3]} material={matHaz}>
            <cylinderGeometry args={[0.45, 0.8, 3.2, 20, 1, true]} />
          </mesh>
        ))}
      </group>

      <Fotones rutas={rutas} n={pocos ? 36 : 70} tam={1.1} velocidad={0.5} rebote={2.6} semilla={13} />
      <Flujo curvas={curvasAgua} n={pocos ? 16 : 32} geometria={geoH2O} material={matMol} caudal={() => 0.85} velocidad={0.18} tam={0.24} giro={2} semilla={21} />
      <Flujo curvas={curvasAzucar} n={pocos ? 12 : 24} geometria={geoGlu} material={matMol} caudal={(s) => s.tasa} velocidad={0.14} tam={0.28} giro={1.2} semilla={22} />
      <Flujo curvas={curvasCO2} n={pocos ? 10 : 20} geometria={geoCO2} material={matMol} caudal={(s) => s.fCO2 * (0.25 + 0.75 * s.apertura)} velocidad={0.16} tam={0.24} giro={1.6} semilla={23} />
      <Flujo curvas={curvasO2} n={pocos ? 10 : 20} geometria={geoO2} material={matMol} caudal={(s) => s.tasa * (0.3 + 0.7 * s.apertura)} velocidad={0.17} tam={0.26} giro={1.6} semilla={24} />

      <Etiqueta visible={etiquetas && !angosto} pos={[2.9, 2.15, 0.2]} color="#d6efbf" icono="fa-layer-group" texto="Epidermis" />
      <Etiqueta visible={etiquetas} pos={[0.6, 1.25, 1.95]} color="#3ddc6a" icono="fa-seedling" texto={angosto ? "Empalizada" : "Empalizada: cloroplastos"} />
      <Etiqueta visible={etiquetas} pos={[ESTOMA[0], -2.1, ESTOMA[2] + 0.5]} color="#ff6b5e" icono="fa-wind" texto={angosto ? "Estoma" : "Estoma: entra CO₂, sale O₂"} />
      {!angosto && <Etiqueta visible={etiquetas} pos={[NERVIO[0] + 0.9, NERVIO[1] - 0.6, 1.8]} color="#67e8f9" icono="fa-droplet" texto="Nervadura: agua y azúcar" />}
    </group>
  );
}
