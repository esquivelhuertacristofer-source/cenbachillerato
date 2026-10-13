"use client";

/**
 * Escala 3 — LA MEMBRANA DEL TILACOIDE (la maquinaria molecular).
 *
 *   Estroma (arriba) ─ ciclo de Calvin: el CO₂ entra por la RuBisCO, el
 *                      ciclo gira con ATP y NADPH y suelta glucosa.
 *   Membrana         ─ bicapa de lípidos con los complejos: fotosistema II,
 *                      citocromo b6f, fotosistema I, ferredoxina-NADP⁺
 *                      reductasa y la ATP SINTASA (su rotor gira).
 *   Lumen (abajo)    ─ el agua se rompe en el fotosistema II: sale O₂ y se
 *                      acumulan H⁺, que vuelven al estroma por la ATP sintasa.
 *
 * Todo lo que se mueve sale del mismo estado: más luz absorbida → más fotones
 * que pegan, más electrones, más H⁺, el rotor gira más rápido y el ciclo de
 * Calvin acelera; con luz verde casi todos los fotones rebotan.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { azar, geometriaBlob, geometriaCO2, geometriaO2, geometriaH2O, geometriaGlucosa, texturaColasLipido, texturaHalo } from "./fotosintesis-geometrias";
import { Flujo, Fotones, Etiqueta, useSim, escalaActiva, ponerOpacidad, curva, type RutaFoton } from "./fotosintesis-runtime";

type V3 = [number, number, number];

const X_PSII = -3.3;
const X_B6F = -0.9;
const X_PSI = 1.4;
const X_ATP = 3.9;
const ZP = 0.25; // las proteínas, un poco hacia el frente
const MEDIO_X = 6.6;
const MEDIO_Z = 2.6;
const CALVIN: V3 = [-0.4, 2.3, -0.7];
const R_CALVIN = 1.2;
const INCL_CALVIN = -0.22; // inclinación del anillo hacia la cámara

/** ATP: adenosina (azul) + tres fosfatos (naranja) en cadena. */
function geometriaATP(): THREE.BufferGeometry {
  const pinta = (g: THREE.BufferGeometry, hex: string) => {
    const c = new THREE.Color(hex);
    const n = g.attributes.position!.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    return g;
  };
  const partes = [pinta(new THREE.SphereGeometry(0.2, 14, 10), "#4f8dff")];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.SphereGeometry(0.11, 12, 8);
    s.translate(0.27 + i * 0.2, 0, 0);
    partes.push(pinta(s, "#ffa53d"));
  }
  return mergeGeometries(partes)!;
}

/** NADPH: dos esferas lilas. */
function geometriaNADPH(): THREE.BufferGeometry {
  const a = new THREE.SphereGeometry(0.15, 12, 8);
  a.translate(-0.12, 0, 0);
  const b = new THREE.SphereGeometry(0.13, 12, 8);
  b.translate(0.13, 0.04, 0);
  const g = mergeGeometries([a, b])!;
  const n = g.attributes.position!.count;
  const arr = new Float32Array(n * 3);
  const c = new THREE.Color("#c39bff");
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

/** Posición en el anillo de Calvin (ángulo a). */
function puntoCalvin(a: number, out: THREE.Vector3, r = R_CALVIN): THREE.Vector3 {
  const x = Math.cos(a) * r;
  const y = Math.sin(a) * r;
  // anillo en el plano XY, inclinado alrededor de X
  return out.set(CALVIN[0] + x, CALVIN[1] + y * Math.cos(INCL_CALVIN), CALVIN[2] + y * Math.sin(INCL_CALVIN));
}

export function EscalaTilacoide({ etiquetas, angosto, pocos }: { etiquetas: boolean; angosto: boolean; pocos: boolean }) {
  const simRef = useSim();

  /* ── Bicapa: cabezas de lípidos instanciadas ─────────────────────── */
  const cabezas = useMemo(() => {
    const paso = pocos ? 0.27 : 0.19;
    const huecos: [number, number][] = [[X_PSII, 1.05], [X_B6F, 0.62], [X_PSI, 0.9], [X_ATP, 0.42]];
    const r = azar(1001);
    const out: { p: V3; c: number }[] = [];
    for (let x = -MEDIO_X; x <= MEDIO_X; x += paso) {
      for (let z = -MEDIO_Z; z <= MEDIO_Z; z += paso * 0.9) {
        if (huecos.some(([hx, hr]) => Math.hypot(x - hx, z - ZP) < hr)) continue;
        for (const y of [0.36, -0.36]) {
          out.push({ p: [x + (r() - 0.5) * 0.04, y + (r() - 0.5) * 0.03, z + (r() - 0.5) * 0.04], c: r() });
        }
      }
    }
    return out;
  }, [pocos]);
  const refCab = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = refCab.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const a = new THREE.Color("#a9c3dc");
    const b = new THREE.Color("#d9cbb0");
    const c = new THREE.Color();
    cabezas.forEach((h, i) => {
      o.position.set(...h.p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.copy(a).lerp(b, h.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cabezas]);
  const colas = useMemo(() => {
    const t = texturaColasLipido();
    t.repeat.set(6, 1);
    return t;
  }, []);
  const halo = useMemo(() => texturaHalo(), []);
  useEffect(() => () => { colas.dispose(); halo.dispose(); }, [colas, halo]);

  /* ── Proteínas ────────────────────────────────────────────────────── */
  const blobs = useMemo(() => ({
    psii: geometriaBlob(11, 0.14, 3),
    lhc: geometriaBlob(12, 0.18, 2),
    b6f: geometriaBlob(13, 0.15, 3),
    psi: geometriaBlob(14, 0.14, 3),
    fd: geometriaBlob(15, 0.2, 2),
    rubisco: geometriaBlob(16, 0.12, 3),
    f1: geometriaBlob(17, 0.12, 2),
  }), []);
  useEffect(() => () => { Object.values(blobs).forEach((g) => g.dispose()); }, [blobs]);

  const antenaPSII = useMemo(() => Array.from({ length: 6 }, (_, i): V3 => {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    return [X_PSII + Math.cos(a) * 0.95, 0.02, ZP + Math.sin(a) * 0.72];
  }), []);
  const antenaPSI = useMemo(() => Array.from({ length: 4 }, (_, i): V3 => {
    const a = (i / 4) * Math.PI * 2 + 0.8;
    return [X_PSI + Math.cos(a) * 0.78, 0.02, ZP + Math.sin(a) * 0.6];
  }), []);

  /* ── Rotor de la ATP sintasa, plastocianina, Calvin, brillos ──────── */
  const rotor = useRef<THREE.Group>(null);
  const refBrilloII = useRef<THREE.Sprite>(null);
  const refBrilloI = useRef<THREE.Sprite>(null);
  const refLumen = useRef<THREE.Mesh>(null);
  const pc = useRef<THREE.Mesh>(null);
  const refCalvin = useRef<THREE.InstancedMesh>(null);
  const brilloII = useMemo(() => new THREE.SpriteMaterial({ map: halo, color: "#7dffa0", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }), [halo]);
  const brilloI = useMemo(() => new THREE.SpriteMaterial({ map: halo, color: "#7dffd8", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }), [halo]);
  const matLumen = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ff7a3d", transparent: true, opacity: 0.08, depthWrite: false, side: THREE.BackSide }), []);
  const nCalvin = pocos ? 10 : 14;
  const angulo = useRef({ rotor: 0, calvin: 0 });
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), c: new THREE.Color() }), []);
  const etapas = useMemo(() => [new THREE.Color("#b07bff"), new THREE.Color("#ffb454"), new THREE.Color("#4fd68a")], []);

  useFrame(() => {
    const s = simRef.current;
    if (!escalaActiva(s, 3)) return;
    const a = angulo.current;
    // El rotor gira con el flujo de H⁺ (∝ tasa); el ciclo de Calvin, con ATP y NADPH.
    a.rotor += s.dt * (0.25 + s.tasa * 11);
    a.calvin += s.dt * (0.08 + s.tasa * 1.3);
    if (rotor.current) rotor.current.rotation.y = a.rotor;
    if (pc.current) {
      const f = 0.5 - 0.5 * Math.cos(s.t * (0.6 + s.tasa * 2.4));
      pc.current.position.set(X_B6F + (X_PSI - X_B6F) * f, -0.72 - Math.sin(f * Math.PI) * 0.25, ZP + 0.1);
    }
    const exc = s.luz * s.absorcion;
    const pulso = 0.75 + 0.25 * Math.sin(s.t * 9);
    if (refBrilloII.current) refBrilloII.current.material.color.setRGB(0.5, 1, 0.65).multiplyScalar(exc * pulso * 1.6);
    if (refBrilloI.current) refBrilloI.current.material.color.setRGB(0.5, 1, 0.85).multiplyScalar(exc * (1 - pulso + 0.75) * 1.6);
    if (refLumen.current) ponerOpacidad(refLumen.current.material as THREE.Material, 0.03 + s.tasa * 0.13);
    const m = refCalvin.current;
    if (m) {
      const { o, v, c } = tmp;
      for (let i = 0; i < nCalvin; i++) {
        const ang = a.calvin + (i / nCalvin) * Math.PI * 2;
        puntoCalvin(ang, v);
        o.position.copy(v);
        o.rotation.set(ang, ang * 0.7, 0);
        o.scale.setScalar(0.2);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        // Color por etapa: fijación (lila), reducción (ámbar), regeneración (verde).
        const t = (((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / ((Math.PI * 2) / 3);
        const e = Math.floor(t) % 3;
        c.copy(etapas[e]!).lerp(etapas[(e + 1) % 3]!, Math.max(0, (t % 1) - 0.7) / 0.3);
        m.setColorAt(i, c);
      }
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  });

  /* ── Flujos ─────────────────────────────────────────────────────── */
  const matMol = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3 }), []);
  const matHmas = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.95, 0.35), toneMapped: false }), []);
  const matElectron = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.4, 1.2), toneMapped: false }), []);
  const geo = useMemo(() => ({
    co2: geometriaCO2(), o2: geometriaO2(), h2o: geometriaH2O(), glu: geometriaGlucosa(), atp: geometriaATP(), nadph: geometriaNADPH(),
    h: new THREE.SphereGeometry(0.06, 10, 8), e: new THREE.SphereGeometry(0.085, 12, 10), pq: new THREE.SphereGeometry(0.09, 12, 8),
  }), []);
  useEffect(() => () => { Object.values(geo).forEach((g) => g.dispose()); }, [geo]);

  // La RuBisCO, en el centro del anillo: el ciclo gira a su alrededor.
  const rubisco = useMemo(() => new THREE.Vector3(...CALVIN), []);
  const salidaGlu = useMemo(() => puntoCalvin(-0.2, new THREE.Vector3()), []);
  const entradaATP = useMemo(() => puntoCalvin(-Math.PI * 0.45, new THREE.Vector3()), []);

  const c = useMemo(() => {
    const r = azar(1101);
    const j = () => (r() - 0.5) * 0.3;
    return {
      // electrones: PSII → plastoquinona → b6f → plastocianina → PSI → Fd → FNR
      e: [0, 1, 2].map((k) => curva(
        [X_PSII + 0.1, 0.05, ZP + k * 0.12], [X_PSII + 1.2, 0.0, ZP + 0.2 + j()], [X_B6F - 0.2, 0.05, ZP + 0.1],
        [X_B6F + 0.05, -0.6, ZP + 0.15], [0.2, -0.95, ZP + 0.25 + j()], [X_PSI - 0.25, -0.55, ZP + 0.1],
        [X_PSI + 0.1, 0.1, ZP], [X_PSI + 0.5, 0.75, ZP + 0.1], [2.55, 0.95, ZP + 0.05],
      )),
      // H₂O hacia el complejo que rompe el agua (lado del lumen)
      h2o: [0, 1, 2, 3, 4].map((k) => curva([X_PSII - 2.6 + k * 0.5, -2.4, ZP + 1.6 - k * 0.5], [X_PSII - 0.8 + j(), -1.5, ZP + 0.4], [X_PSII + 0.05, -0.78, ZP + 0.05])),
      // O₂ que sale del lumen
      o2: [0, 1, 2, 3].map((k) => curva([X_PSII + 0.1, -0.85, ZP + 0.1], [X_PSII - 0.4 + j(), -1.5, ZP + 0.8], [X_PSII - 1.5 - k * 0.5, -2.6, ZP + 1.9 - k * 0.3])),
      // H⁺ que deja el agua y que bombea el b6f
      hLiberado: [0, 1, 2].map((k) => curva([X_PSII + 0.1, -0.8, ZP], [X_PSII + 0.8 + k * 0.4, -1.3 + j(), ZP + 0.3 + j()], [X_PSII + 1.6 + k * 0.6, -1.7 + j(), ZP + j() * 3])),
      hBombeado: [0, 1, 2].map((k) => curva([X_B6F - 0.4 + k * 0.3, 1.3, ZP + 0.4 + j()], [X_B6F, 0, ZP], [X_B6F + j(), -1.2, ZP + 0.2], [X_B6F + 0.6 + k * 0.4, -1.8 + j(), ZP - 0.4 + j() * 3])),
      // H⁺ que regresan al estroma a través del rotor de la ATP sintasa
      hATP: [0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2;
        return curva([X_ATP - 0.9 + j(), -1.6, ZP + 0.6 + j()], [X_ATP + Math.cos(a) * 0.29, -0.4, ZP + Math.sin(a) * 0.29], [X_ATP + Math.cos(a + 1.5) * 0.29, 0.4, ZP + Math.sin(a + 1.5) * 0.29], [X_ATP + 0.7 + j(), 1.0, ZP + 0.6 + j()]);
      }),
      // ATP y NADPH hacia el ciclo de Calvin
      atp: [0, 1].map(() => curva([X_ATP - 0.2, 1.6, ZP + 0.3], [X_ATP - 1.6 + j(), 2.4 + j(), ZP - 0.1], [entradaATP.x + 0.3, entradaATP.y, entradaATP.z])),
      nadph: [0, 1].map(() => curva([2.55, 1.0, ZP + 0.1], [1.4 + j(), 1.8 + j(), ZP - 0.3], [entradaATP.x + 0.1, entradaATP.y - 0.1, entradaATP.z + 0.1])),
      // CO₂ a la RuBisCO y glucosa que sale del ciclo
      co2: [0, 1, 2, 3].map((k) => curva([-5.6 + k * 0.3, 4.6 - k * 0.4, -1.8 + k * 0.6], [-3.6 + j(), 3.4, -1.0 + j()], [rubisco.x, rubisco.y, rubisco.z])),
      glu: [0, 1, 2].map((k) => curva([salidaGlu.x, salidaGlu.y, salidaGlu.z], [salidaGlu.x + 1.0 + j(), salidaGlu.y + 0.8, salidaGlu.z + 0.3], [salidaGlu.x + 2.6 + k * 0.4, salidaGlu.y + 1.9, salidaGlu.z - 0.4 + k * 0.4])),
    };
  }, [rubisco, salidaGlu, entradaATP]);

  // H⁺ acumulados en el lumen: se mecen; hay más cuanto mayor es la tasa.
  const nH = pocos ? 50 : 110;
  const refH = useRef<THREE.InstancedMesh>(null);
  const hLumen = useMemo(() => {
    const r = azar(1201);
    return Array.from({ length: nH }, () => ({ p: [(r() - 0.5) * 11, -0.75 - r() * 1.5, (r() - 0.5) * 4.6] as V3, f: r() * 6.28, orden: r() }));
  }, [nH]);
  useFrame(() => {
    const s = simRef.current;
    const m = refH.current;
    if (!m || !escalaActiva(s, 3)) return;
    const { o } = tmp;
    for (let i = 0; i < nH; i++) {
      const h = hLumen[i]!;
      const vivo = h.orden < 0.08 + s.tasa * 0.92;
      o.position.set(h.p[0] + Math.sin(s.t * 0.7 + h.f) * 0.18, h.p[1] + Math.sin(s.t * 0.9 + h.f * 2) * 0.12, h.p[2] + Math.cos(s.t * 0.6 + h.f) * 0.18);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(vivo ? 1 : 0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  const rutas: RutaFoton[] = useMemo(() => {
    const r = azar(1301);
    const arriba = new THREE.Vector3(0, 1, 0);
    const blancos = [...antenaPSII, ...antenaPSI, [X_PSII, 0.4, ZP] as V3, [X_PSI, 0.4, ZP] as V3];
    return Array.from({ length: 30 }, (_, i) => {
      const b = blancos[i % blancos.length]!;
      const a = new THREE.Vector3(b[0], 0.42, b[2]);
      return { de: a.clone().add(new THREE.Vector3(-2.2 - r() * 1.5, 5.2, 1.6 + r())), a, n: arriba };
    });
  }, [antenaPSII, antenaPSI]);

  const verdeProt = "#3fa34d";

  return (
    <group>
      {/* Bicapa: cabezas polares arriba y abajo, colas hidrofóbicas en medio. */}
      <instancedMesh ref={refCab} args={[undefined, undefined, cabezas.length]}>
        <sphereGeometry args={[0.078, 10, 8]} />
        <meshPhysicalMaterial roughness={0.42} sheen={0.25} sheenColor="#dfefff" />
      </instancedMesh>
      <mesh>
        <boxGeometry args={[MEDIO_X * 2 + 0.1, 0.56, MEDIO_Z * 2 + 0.1]} />
        <meshStandardMaterial map={colas} color="#e8c766" roughness={0.6} />
      </mesh>

      {/* Lumen: se tiñe con los H⁺ que se acumulan. */}
      <mesh ref={refLumen} position={[0, -1.45, 0]} material={matLumen}>
        <boxGeometry args={[MEDIO_X * 2, 1.9, MEDIO_Z * 2]} />
      </mesh>

      {/* Fotosistema II con su antena y el complejo que rompe el agua. */}
      <mesh geometry={blobs.psii} position={[X_PSII - 0.3, 0.05, ZP]} scale={[0.55, 1.0, 0.52]}>
        <meshPhysicalMaterial color={verdeProt} roughness={0.5} sheen={0.6} sheenColor="#c8ffb0" clearcoat={0.2} />
      </mesh>
      <mesh geometry={blobs.psii} position={[X_PSII + 0.3, 0.02, ZP]} scale={[0.55, 0.95, 0.52]} rotation={[0, 2.2, 0]}>
        <meshPhysicalMaterial color="#47ad55" roughness={0.5} sheen={0.6} sheenColor="#c8ffb0" clearcoat={0.2} />
      </mesh>
      {antenaPSII.map((p, i) => (
        <mesh key={i} geometry={blobs.lhc} position={p} scale={[0.3, 0.62, 0.3]} rotation={[0, i, 0]}>
          <meshPhysicalMaterial color="#6cc25a" roughness={0.5} sheen={0.5} sheenColor="#d8ffc0" />
        </mesh>
      ))}
      {[[0, 0], [0.09, 0.05], [-0.08, 0.06], [0.03, -0.08], [-0.04, -0.03]].map(([dx, dz], i) => (
        <mesh key={`mn${i}`} position={[X_PSII + dx!, -0.82 + (i % 2) * 0.05, ZP + 0.35 + dz!]}>
          <sphereGeometry args={[0.065, 12, 8]} />
          <meshPhysicalMaterial color={i === 4 ? "#f2f2f2" : "#9b59d0"} roughness={0.25} metalness={0.4} clearcoat={0.6} />
        </mesh>
      ))}
      <sprite ref={refBrilloII} position={[X_PSII, 0.1, ZP + 0.5]} scale={[1.5, 1.5, 1]} material={brilloII} />

      {/* Citocromo b6f. */}
      <mesh geometry={blobs.b6f} position={[X_B6F - 0.22, 0, ZP]} scale={[0.44, 0.85, 0.44]}>
        <meshPhysicalMaterial color="#c9712f" roughness={0.5} sheen={0.5} sheenColor="#ffd2a8" />
      </mesh>
      <mesh geometry={blobs.b6f} position={[X_B6F + 0.22, 0, ZP]} scale={[0.44, 0.8, 0.44]} rotation={[0, 2.4, 0]}>
        <meshPhysicalMaterial color="#d98340" roughness={0.5} sheen={0.5} sheenColor="#ffd2a8" />
      </mesh>
      {/* Plastocianina: lleva electrones por el lumen. */}
      <mesh ref={pc} geometry={blobs.fd} scale={0.2}>
        <meshPhysicalMaterial color="#4f8dff" roughness={0.35} clearcoat={0.5} />
      </mesh>

      {/* Fotosistema I, ferredoxina y FNR. */}
      <mesh geometry={blobs.psi} position={[X_PSI, 0.05, ZP]} scale={[0.66, 0.9, 0.6]}>
        <meshPhysicalMaterial color="#2bb38a" roughness={0.5} sheen={0.6} sheenColor="#c8ffe8" clearcoat={0.2} />
      </mesh>
      {antenaPSI.map((p, i) => (
        <mesh key={`a1${i}`} geometry={blobs.lhc} position={p} scale={[0.28, 0.58, 0.28]} rotation={[0, i * 2, 0]}>
          <meshPhysicalMaterial color="#5cc79a" roughness={0.5} sheen={0.5} sheenColor="#d8fff0" />
        </mesh>
      ))}
      <sprite ref={refBrilloI} position={[X_PSI, 0.1, ZP + 0.5]} scale={[1.4, 1.4, 1]} material={brilloI} />
      <mesh geometry={blobs.fd} position={[2.05, 0.72, ZP + 0.05]} scale={0.22}>
        <meshPhysicalMaterial color="#b4452f" roughness={0.4} clearcoat={0.4} />
      </mesh>
      <mesh geometry={blobs.fd} position={[2.6, 0.82, ZP]} scale={[0.34, 0.28, 0.3]} rotation={[0.5, 1, 0]}>
        <meshPhysicalMaterial color="#e3b448" roughness={0.45} sheen={0.4} sheenColor="#fff0c0" />
      </mesh>

      {/* ATP sintasa: el rotor (anillo c + tallo γ) gira; la cabeza F1 queda fija. */}
      <group position={[X_ATP, 0, ZP]}>
        <group ref={rotor}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.29, 0, Math.sin(a) * 0.29]}>
                <capsuleGeometry args={[0.065, 0.5, 4, 10]} />
                <meshPhysicalMaterial color={i % 2 ? "#c94fa0" : "#e070b8"} roughness={0.4} clearcoat={0.4} />
              </mesh>
            );
          })}
          <mesh position={[0.04, 0.85, 0]} rotation={[0, 0, -0.06]}>
            <cylinderGeometry args={[0.07, 0.09, 1.2, 14]} />
            <meshPhysicalMaterial color="#7d5cff" roughness={0.35} clearcoat={0.5} />
          </mesh>
          {/* Leva excéntrica: delata el giro dentro de la cabeza. */}
          <mesh position={[0.17, 1.45, 0]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshPhysicalMaterial color="#9a80ff" roughness={0.3} clearcoat={0.6} />
          </mesh>
        </group>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={`f1${i}`} geometry={blobs.f1} position={[Math.cos(a) * 0.36, 1.62, Math.sin(a) * 0.36]} scale={[0.25, 0.34, 0.25]} rotation={[0, a, 0]}>
              <meshPhysicalMaterial color={i % 2 ? "#e85d5d" : "#f2c14e"} roughness={0.45} sheen={0.5} sheenColor="#fff2e0" />
            </mesh>
          );
        })}
        {/* Brazo periférico (estator). */}
        <mesh position={[0.62, 0.85, -0.1]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.05, 1.5, 4, 8]} />
          <meshPhysicalMaterial color="#8fa3b8" roughness={0.5} />
        </mesh>
        <mesh position={[0.42, 1.98, -0.05]} scale={[0.2, 0.14, 0.2]} geometry={blobs.fd}>
          <meshPhysicalMaterial color="#8fa3b8" roughness={0.5} />
        </mesh>
      </group>

      {/* Ciclo de Calvin: un anillo en tres etapas (fijación, reducción,
          regeneración) con flechas de sentido; los intermediarios giran sobre
          él alrededor de la RuBisCO, que está en el centro. */}
      <group position={CALVIN} rotation={[INCL_CALVIN, 0, 0]}>
        {["#b07bff", "#ffb454", "#4fd68a"].map((col, k) => (
          <mesh key={col} rotation={[0, 0, (k * Math.PI * 2) / 3 + 0.04]}>
            <torusGeometry args={[R_CALVIN, 0.07, 12, 48, (Math.PI * 2) / 3 - 0.1]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} roughness={0.35} transparent opacity={0.85} />
          </mesh>
        ))}
        {Array.from({ length: 6 }, (_, k) => {
          const a = (k * Math.PI) / 3 + 0.45;
          return (
            <mesh key={`fl${k}`} position={[Math.cos(a) * R_CALVIN, Math.sin(a) * R_CALVIN, 0]} rotation={[0, 0, a]}>
              <coneGeometry args={[0.09, 0.2, 14]} />
              <meshStandardMaterial color="#eafff2" emissive="#bfffd6" emissiveIntensity={0.4} roughness={0.35} />
            </mesh>
          );
        })}
        {/* Rayos tenues de la RuBisCO al anillo: es la enzima que lo alimenta. */}
        {Array.from({ length: 3 }, (_, k) => {
          const a = (k * Math.PI * 2) / 3 + Math.PI / 3;
          return (
            <mesh key={`ry${k}`} position={[Math.cos(a) * R_CALVIN * 0.5, Math.sin(a) * R_CALVIN * 0.5, 0]} rotation={[0, 0, a - Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, R_CALVIN * 0.6, 6]} />
              <meshBasicMaterial color="#cdb8ff" transparent opacity={0.35} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      <mesh geometry={blobs.rubisco} position={rubisco} scale={0.4}>
        <meshPhysicalMaterial color="#8f63e8" roughness={0.45} sheen={0.6} sheenColor="#e6d8ff" clearcoat={0.2} />
      </mesh>
      <instancedMesh ref={refCalvin} args={[blobs.fd, undefined, nCalvin]} frustumCulled={false}>
        <meshPhysicalMaterial roughness={0.35} clearcoat={0.5} />
      </instancedMesh>

      {/* H⁺ del lumen. */}
      <instancedMesh ref={refH} args={[geo.h, matHmas, nH]} frustumCulled={false} />

      <Fotones rutas={rutas} n={pocos ? 30 : 64} tam={0.8} velocidad={0.6} rebote={2.6} semilla={51} />
      <Flujo curvas={c.e} n={pocos ? 14 : 30} geometria={geo.e} material={matElectron} caudal={(s) => s.tasa} velocidad={(s) => 0.18 + s.tasa * 0.3} semilla={61} dispersion={0.03} />
      <Flujo curvas={c.h2o} n={pocos ? 8 : 16} geometria={geo.h2o} material={matMol} caudal={(s) => s.tasa} velocidad={0.16} tam={0.4} giro={1.6} semilla={62} />
      <Flujo curvas={c.o2} n={pocos ? 6 : 12} geometria={geo.o2} material={matMol} caudal={(s) => s.tasa} velocidad={0.16} tam={0.42} giro={1.4} semilla={63} />
      <Flujo curvas={c.hLiberado} n={pocos ? 8 : 16} geometria={geo.h} material={matHmas} caudal={(s) => s.tasa} velocidad={0.25} semilla={64} />
      <Flujo curvas={c.hBombeado} n={pocos ? 8 : 16} geometria={geo.h} material={matHmas} caudal={(s) => s.tasa} velocidad={0.22} semilla={65} />
      <Flujo curvas={c.hATP} n={pocos ? 10 : 22} geometria={geo.h} material={matHmas} caudal={(s) => s.tasa} velocidad={(s) => 0.15 + s.tasa * 0.35} semilla={66} />
      <Flujo curvas={c.atp} n={pocos ? 6 : 12} geometria={geo.atp} material={matMol} caudal={(s) => s.tasa} velocidad={0.17} tam={0.55} giro={1.2} semilla={67} />
      <Flujo curvas={c.nadph} n={pocos ? 5 : 10} geometria={geo.nadph} material={matMol} caudal={(s) => s.tasa} velocidad={0.16} tam={0.55} giro={1.2} semilla={68} />
      <Flujo curvas={c.co2} n={pocos ? 4 : 8} geometria={geo.co2} material={matMol} caudal={(s) => s.fCO2} velocidad={0.16} tam={0.42} giro={1.5} semilla={69} />
      <Flujo curvas={c.glu} n={pocos ? 5 : 10} geometria={geo.glu} material={matMol} caudal={(s) => s.tasa} velocidad={0.13} tam={0.9} giro={0.9} semilla={70} />

      <Etiqueta visible={etiquetas} pos={angosto ? [X_PSII + 1.4, -2.0, ZP + 1.2] : [X_PSII - 0.4, -2.35, ZP + 1.2]} color="#7dffa0" icono="fa-droplet" texto={angosto ? "PSII: H₂O → O₂" : "Fotosistema II: H₂O → O₂ + H⁺"} />
      <Etiqueta visible={etiquetas} pos={angosto ? [X_ATP - 1.3, 2.3, ZP] : [X_ATP + 0.3, 2.45, ZP]} color="#e85d5d" icono="fa-gear" texto="ATP sintasa" />
      <Etiqueta visible={etiquetas} pos={[CALVIN[0] - 1.9, CALVIN[1] - 0.9, CALVIN[2] + 0.4]} color="#b07bff" icono="fa-arrows-spin" texto={angosto ? "Ciclo de Calvin" : "Ciclo de Calvin: CO₂ → glucosa"} />
      {!angosto && <Etiqueta visible={etiquetas} pos={[X_PSI, -1.25, ZP + 1.0]} color="#7dffd8" icono="fa-bolt" texto="Fotosistema I" />}
    </group>
  );
}
