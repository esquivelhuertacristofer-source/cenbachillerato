"use client";

/**
 * EL EXPERIMENTO DE LA LÁMINA DE ORO (Geiger y Marsden, 1909; Rutherford, 1911),
 * en tres escalas que se recorren con un zoom continuo («potencias de diez»):
 *
 *   0 · APARATO  — fuente de partículas alfa en su bloque de plomo, colimador,
 *                  lámina de oro batida y pantalla fluorescente circular de ZnS
 *                  donde cada alfa deja un destello que se queda.
 *   1 · LÁMINA   — los átomos de oro uno junto a otro: nubes de electrones casi
 *                  vacías; las alfas las atraviesan.
 *   2 · NÚCLEO   — un núcleo de oro (79 p⁺ + 118 n) y las alfas que se le acercan
 *                  con distintos parámetros de impacto: hipérbolas INTEGRADAS
 *                  con la repulsión de Coulomb, no dibujadas a mano.
 *
 * La estadística no es azar decorativo: cada alfa toma el parámetro de impacto
 * al núcleo más cercano de una lámina de grosor t y su ángulo sale de
 * θ = 2·arctan(d / 2b). Por eso casi todas pasan rectas, unas pocas se desvían
 * mucho y, muy de vez en cuando, alguna rebota.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import { Etiqueta, Halo, NucleoPBR, PROTON_COLOR } from "./modelos-atomicos-kit3d";
import {
  BINS_GRADOS,
  distanciaMinimaFm,
  muestrearDesviacion,
  prng,
  radioNuclearFm,
  trayectoriaCoulomb,
  type Metal,
} from "./modelos-atomicos-fisica";
import { normalHojaOro, texturaDestello } from "./modelos-atomicos-texturas";

export interface StatsRutherford {
  disparadas: number;
  rectas: number; // < 10°
  desviadas: number; // 10°–90°
  rebotes: number; // > 90°
  hist: number[]; // por BINS_GRADOS
}

export interface RutherfordProps {
  etapa: 0 | 1 | 2;
  metal: Metal;
  kMeV: number;
  grosorUm: number;
  disparando: boolean;
  /** Partículas por segundo. */
  ritmo: number;
  limpiarNonce: number;
  onStats: (s: StatsRutherford) => void;
  ligero: boolean;
  /** Opacidad del velo de la transición de escala (div sobre el lienzo). */
  onVelo: (opacidad: number) => void;
}

export const Y_SUELO_RUTHERFORD = -1.25;
const R_PANT = 3;
const X_FUENTE = -4.75;
const X_SALIDA = -4.2;
const T1 = 0.6; // fuente → lámina (s)
const T2 = 0.45; // lámina → pantalla (s)
const HUECO = (13 * Math.PI) / 180; // abertura de la pantalla por donde entra el haz
const ZOOM = 7; // factor de escala entre etapas
const ORO = "#e7b54c";

/* ══════════════════════ ETAPA 0 · EL APARATO ══════════════════════ */

const METAL_OSCURO = { color: "#2b323b", metalness: 0.85, roughness: 0.36 } as const;

function Pilar({ x, z = 0, alto, ancho = 0.62 }: { x: number; z?: number; alto: number; ancho?: number }) {
  return (
    <RoundedBox args={[ancho, alto, ancho]} radius={0.05} smoothness={3} position={[x, Y_SUELO_RUTHERFORD + alto / 2, z]} castShadow receiveShadow>
      <meshStandardMaterial {...METAL_OSCURO} />
    </RoundedBox>
  );
}

function Aparato({ metal }: { metal: Metal }) {
  const normal = useMemo(() => normalHojaOro(), []);
  const baseTop = Y_SUELO_RUTHERFORD + 0.12;
  const alturaPantalla = 0.45 - baseTop;
  const yPantalla = baseTop + alturaPantalla / 2;
  const colorLamina = metal.id === "Au" ? ORO : metal.id === "Ag" ? "#d9dde3" : metal.id === "Cu" ? "#d4835a" : "#c8ced6";
  return (
    <group>
      {/* Base del aparato */}
      <mesh position={[0, Y_SUELO_RUTHERFORD + 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.55, 3.62, 0.12, 96]} />
        <meshStandardMaterial {...METAL_OSCURO} />
      </mesh>

      {/* Pantalla circular de sulfuro de zinc: cara interna fosforescente */}
      <mesh position={[0, yPantalla, 0]} receiveShadow>
        <cylinderGeometry args={[R_PANT, R_PANT, alturaPantalla, 128, 1, true, (3 * Math.PI) / 2 + HUECO, Math.PI * 2 - 2 * HUECO]} />
        <meshStandardMaterial color="#3a4a42" emissive="#0f2a1e" emissiveIntensity={0.7} roughness={0.8} metalness={0} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, yPantalla, 0]} castShadow>
        <cylinderGeometry args={[R_PANT + 0.05, R_PANT + 0.05, alturaPantalla, 128, 1, true, (3 * Math.PI) / 2 + HUECO, Math.PI * 2 - 2 * HUECO]} />
        <meshStandardMaterial {...METAL_OSCURO} side={THREE.FrontSide} />
      </mesh>
      {/* Aro superior: le da canto a la pantalla */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_PANT + 0.025, 0.035, 12, 160]} />
        <meshStandardMaterial color="#8a96a6" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Fuente: bloque de plomo con una muestra radiactiva */}
      <Pilar x={X_FUENTE} alto={0.8} ancho={0.7} />
      <RoundedBox args={[1.05, 0.9, 0.9]} radius={0.07} smoothness={4} position={[X_FUENTE, Y_SUELO_RUTHERFORD + 0.8 + 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#5a616b" metalness={0.55} roughness={0.55} />
      </RoundedBox>
      <mesh position={[X_FUENTE + 0.53, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
        <meshStandardMaterial color="#05070a" roughness={1} />
      </mesh>
      <Halo position={[X_FUENTE + 0.56, 0, 0]} color="#ffd27a" escala={0.5} opacidad={0.75} />

      {/* Colimador: placa de plomo con rendija */}
      <Pilar x={-3.55} alto={0.83} ancho={0.4} />
      <RoundedBox args={[0.1, 0.8, 0.8]} radius={0.03} smoothness={3} position={[-3.55, Y_SUELO_RUTHERFORD + 0.83 + 0.4, 0]} castShadow>
        <meshStandardMaterial color="#5a616b" metalness={0.55} roughness={0.55} />
      </RoundedBox>

      {/* Haz de partículas alfa (resplandor tenue a lo largo del camino) */}
      <mesh position={[(X_SALIDA - 0.02) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, -X_SALIDA - 0.02, 12, 1, true]} />
        <meshBasicMaterial color="#ffcf6a" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Portalámina y lámina batida */}
      <mesh position={[0, (baseTop - 0.66) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, -0.66 - baseTop, 16]} />
        <meshStandardMaterial {...METAL_OSCURO} />
      </mesh>
      {[
        [0, 0.62, 0, 0.1, 0.06, 1.34],
        [0, -0.62, 0, 0.1, 0.06, 1.34],
        [0, 0, 0.62, 0.1, 1.3, 0.1],
        [0, 0, -0.62, 0.1, 1.3, 0.1],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x!, y!, z!]} castShadow>
          <boxGeometry args={[sx!, sy!, sz!]} />
          <meshStandardMaterial color="#3b434e" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.18, 1.18]} />
        <meshPhysicalMaterial
          color={colorLamina}
          metalness={1}
          roughness={0.3}
          emissive="#5a3600"
          emissiveIntensity={0.45}
          normalMap={normal}
          normalScale={[0.55, 0.55]}
          clearcoat={0.3}
          side={THREE.DoubleSide}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  );
}

/** Motor: dispara alfas con la estadística de Coulomb, vuela una muestra y deja destellos. */
function Motor({ metal, kMeV, grosorUm, disparando, ritmo, limpiarNonce, onStats, ligero, activo }: Omit<RutherfordProps, "etapa" | "onVelo"> & { activo: boolean }) {
  const MAXV = ligero ? 28 : 48;
  const MAXD = ligero ? 700 : 1500;
  const vuelos = useRef<THREE.InstancedMesh>(null);
  const destellos = useRef<THREE.InstancedMesh>(null);
  const tex = useMemo(() => texturaDestello(), []);
  const dFm = distanciaMinimaFm(kMeV, metal.Z);

  const st = useRef({
    acc: 0, presV: 0, presD: 0, rep: 0, sucio: true,
    disparadas: 0, rectas: 0, desviadas: 0, rebotes: 0,
    hist: [0, 0, 0, 0, 0, 0],
    rnd: prng(20260913),
  });
  const slots = useRef(Array.from({ length: 64 }, () => ({ on: false, t0: 0, th: 0, s: 1, y: 0, z: 0, yo: 0 })));
  const fl = useRef({
    born: new Float32Array(1500).fill(-999),
    piso: new Float32Array(1500),
    sig: 0,
  });
  const tmp = useMemo(
    () => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), Z: new THREE.Vector3(0, 0, 1), c: new THREE.Color(), tinte: new THREE.Color("#9dffc8"), blanco: new THREE.Color("#ffffff") }),
    [],
  );

  // Cambiar el experimento (o «Limpiar») reinicia el conteo y la pantalla.
  useEffect(() => {
    const s = st.current;
    s.acc = 0; s.disparadas = 0; s.rectas = 0; s.desviadas = 0; s.rebotes = 0;
    s.hist = [0, 0, 0, 0, 0, 0];
    s.sucio = true;
    fl.current.born.fill(-999);
    for (const sl of slots.current) sl.on = false;
    const m = destellos.current;
    if (m) {
      const o = new THREE.Object3D();
      o.scale.setScalar(0);
      o.updateMatrix();
      for (let i = 0; i < MAXD; i++) m.setMatrixAt(i, o.matrix);
      m.instanceMatrix.needsUpdate = true;
    }
    onStats({ disparadas: 0, rectas: 0, desviadas: 0, rebotes: 0, hist: [0, 0, 0, 0, 0, 0] });
  }, [limpiarNonce, metal.id, kMeV, grosorUm, MAXD, onStats]);

  const ponerDestello = (th: number, s: number, yo: number, ahora: number) => {
    if (th > Math.PI - HUECO) return; // vuelve por la abertura: no toca la pantalla
    const m = destellos.current;
    if (!m) return;
    const f = fl.current;
    const i = f.sig;
    f.sig = (f.sig + 1) % MAXD;
    const r = R_PANT - 0.03;
    const { o } = tmp;
    o.position.set(r * Math.cos(th), yo, s * r * Math.sin(th));
    o.lookAt(0, yo, 0);
    const grande = th > (10 * Math.PI) / 180;
    o.scale.setScalar(grande ? 0.42 : 0.28);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    m.instanceMatrix.needsUpdate = true;
    f.born[i] = ahora;
    f.piso[i] = grande ? 0.62 : th > (2 * Math.PI) / 180 ? 0.3 : 0.07;
  };

  const lanzar = (th: number, s: number, yo: number, ahora: number, forzar: boolean): boolean => {
    let libre = slots.current.findIndex((x, i) => i < MAXV && !x.on);
    if (libre < 0 && forzar) libre = slots.current.findIndex((x, i) => i < MAXV && x.th < (10 * Math.PI) / 180);
    if (libre < 0) return false;
    const r = st.current.rnd;
    slots.current[libre] = { on: true, t0: ahora, th, s, y: (r() - 0.5) * 0.06, z: (r() - 0.5) * 0.06, yo };
    return true;
  };

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const ahora = state.clock.elapsedTime;
    const s = st.current;
    const r = s.rnd;
    if (disparando) {
      s.acc += ritmo * dt;
      const n = Math.min(Math.floor(s.acc), 6000);
      s.acc -= n;
      s.presV = Math.min(s.presV + 16 * dt, 3);
      s.presD = Math.min(s.presD + 45 * dt, 6);
      for (let k = 0; k < n; k++) {
        const th = muestrearDesviacion(r, dFm, metal, grosorUm, kMeV);
        const lado = r() < 0.5 ? 1 : -1;
        const yo = (r() - 0.5) * 0.55;
        const deg = (th * 180) / Math.PI;
        s.disparadas++;
        let b = BINS_GRADOS.length - 2;
        for (let j = 1; j < BINS_GRADOS.length; j++) if (deg < BINS_GRADOS[j]!) { b = j - 1; break; }
        s.hist[b] = (s.hist[b] ?? 0) + 1;
        if (deg < 10) s.rectas++;
        else if (deg < 90) s.desviadas++;
        else s.rebotes++;
        s.sucio = true;
        // Lo raro SIEMPRE se ve volar; de lo común, solo una muestra.
        let volo = false;
        if (activo && (deg >= 10 || s.presV >= 1)) {
          volo = lanzar(th, lado, yo, ahora, deg >= 10);
          if (volo && deg < 10) s.presV -= 1;
        }
        if (!volo && (deg >= 2 || s.presD >= 1)) {
          if (deg < 2) s.presD -= 1;
          ponerDestello(th, lado, yo, ahora);
        }
      }
    }

    // Vuelos
    const mv = vuelos.current;
    if (mv) {
      const { o, v, Z } = tmp;
      for (let i = 0; i < MAXV; i++) {
        const sl = slots.current[i]!;
        if (!sl.on) {
          o.scale.setScalar(0);
          o.updateMatrix();
          mv.setMatrixAt(i, o.matrix);
          continue;
        }
        const tt = ahora - sl.t0;
        if (tt < T1) {
          const u = tt / T1;
          o.position.set(X_SALIDA * (1 - u), sl.y, sl.z);
          v.set(1, 0, 0);
        } else if (tt < T1 + T2) {
          const dist = (R_PANT * (tt - T1)) / T2;
          v.set(Math.cos(sl.th), sl.yo / R_PANT, sl.s * Math.sin(sl.th)).normalize();
          o.position.set(v.x * dist, sl.y + v.y * dist, sl.z + v.z * dist);
        } else {
          sl.on = false;
          ponerDestello(sl.th, sl.s, sl.yo, ahora);
          o.scale.setScalar(0);
          o.updateMatrix();
          mv.setMatrixAt(i, o.matrix);
          continue;
        }
        o.quaternion.setFromUnitVectors(Z, v);
        o.scale.set(1, 1, 5);
        o.updateMatrix();
        mv.setMatrixAt(i, o.matrix);
      }
      mv.instanceMatrix.needsUpdate = true;
    }

    // Destellos: brillan blanco-verdosos al nacer y se quedan marcados
    const md = destellos.current;
    if (md) {
      const f = fl.current;
      const { c, tinte, blanco } = tmp;
      for (let i = 0; i < MAXD; i++) {
        const edad = ahora - f.born[i]!;
        if (edad > 900) { c.setRGB(0, 0, 0); md.setColorAt(i, c); continue; }
        const vivo = Math.exp(-edad / 0.45);
        const I = f.piso[i]! + (1 - f.piso[i]!) * vivo;
        c.copy(tinte).lerp(blanco, vivo * 0.7).multiplyScalar(I * 1.7);
        md.setColorAt(i, c);
      }
      if (md.instanceColor) md.instanceColor.needsUpdate = true;
    }

    // Informe al panel (4 veces por segundo)
    s.rep += dt;
    if (s.rep > 0.25 && s.sucio) {
      s.rep = 0;
      s.sucio = false;
      onStats({ disparadas: s.disparadas, rectas: s.rectas, desviadas: s.desviadas, rebotes: s.rebotes, hist: s.hist.slice() });
    }
  });

  return (
    <>
      <instancedMesh ref={vuelos} args={[undefined, undefined, MAXV]} frustumCulled={false}>
        <sphereGeometry args={[0.026, 12, 8]} />
        <meshBasicMaterial color="#ffe3a3" />
      </instancedMesh>
      <instancedMesh ref={destellos} args={[undefined, undefined, MAXD]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ═════════════════ ETAPA 1 · LA LÁMINA, ÁTOMO POR ÁTOMO ═══════════════ */

const SEP = 0.72;
function atomosLamina(): Float32Array {
  const pts: number[] = [];
  for (let capa = 0; capa < 3; capa++) {
    const off = capa % 2 === 0 ? 0 : SEP / 2;
    for (let fila = -1; fila <= 1; fila++)
      for (let col = -3; col <= 3; col++) {
        const y = fila * SEP + off * 0.5;
        const z = col * SEP + off;
        if (Math.abs(z) > 2.3) continue;
        pts.push((capa - 1) * SEP * 0.85, y, z);
      }
  }
  return new Float32Array(pts);
}

function Lamina({ activo, ligero }: { activo: boolean; ligero: boolean }) {
  const atomos = useMemo(() => atomosLamina(), []);
  const N = atomos.length / 3;
  const nubes = useRef<THREE.InstancedMesh>(null);
  const nucleos = useRef<THREE.InstancedMesh>(null);
  const alfas = useRef<THREE.InstancedMesh>(null);
  const MAX = ligero ? 22 : 40;
  const pool = useRef(Array.from({ length: 40 }, () => ({ on: false, x: 0, y: 0, z: 0, vx: 1, vy: 0, vz: 0, xd: 99, th: 0, ny: 0, nz: 0, des: false })));
  const g = useRef({ acc: 0, rnd: prng(77) });
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), Z: new THREE.Vector3(0, 0, 1) }), []);

  useEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      o.position.set(atomos[i * 3]!, atomos[i * 3 + 1]!, atomos[i * 3 + 2]!);
      o.updateMatrix();
      nubes.current?.setMatrixAt(i, o.matrix);
      nucleos.current?.setMatrixAt(i, o.matrix);
    }
    if (nubes.current) nubes.current.instanceMatrix.needsUpdate = true;
    if (nucleos.current) nucleos.current.instanceMatrix.needsUpdate = true;
  }, [atomos, N]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const m = alfas.current;
    if (!m) return;
    const rnd = g.current.rnd;
    if (activo) {
      g.current.acc += dt * 9;
      while (g.current.acc >= 1) {
        g.current.acc -= 1;
        const p = pool.current.find((q, i) => i < MAX && !q.on);
        if (!p) break;
        p.on = true; p.des = false;
        p.x = -3.4; p.y = (rnd() - 0.5) * 1.9; p.z = (rnd() - 0.5) * 4.4;
        p.vx = 1; p.vy = 0; p.vz = 0;
        // ¿pasa cerca de algún núcleo? (tamaño exagerado para que se vea)
        let mejor = 99, k = -1;
        for (let i = 0; i < N; i++) {
          const b = Math.hypot(p.y - atomos[i * 3 + 1]!, p.z - atomos[i * 3 + 2]!);
          if (b < mejor) { mejor = b; k = i; }
        }
        p.xd = 99;
        if (k >= 0 && mejor < 0.06) {
          p.xd = atomos[k * 3]!;
          p.th = 2 * Math.atan(0.012 / (2 * Math.max(mejor, 1e-4)));
          const ry = p.y - atomos[k * 3 + 1]!, rz = p.z - atomos[k * 3 + 2]!;
          const rl = Math.hypot(ry, rz) || 1;
          p.ny = ry / rl; p.nz = rz / rl;
        }
      }
    }
    const { o, v, Z } = tmp;
    const vel = 4.4;
    for (let i = 0; i < MAX; i++) {
      const p = pool.current[i]!;
      if (!p.on) { o.scale.setScalar(0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); continue; }
      p.x += p.vx * vel * dt; p.y += p.vy * vel * dt; p.z += p.vz * vel * dt;
      if (!p.des && p.x >= p.xd) {
        p.des = true;
        p.vx = Math.cos(p.th);
        p.vy = Math.sin(p.th) * p.ny;
        p.vz = Math.sin(p.th) * p.nz;
      }
      if (Math.abs(p.x) > 3.6 || Math.abs(p.y) > 3 || Math.abs(p.z) > 3.6) { p.on = false; continue; }
      o.position.set(p.x, p.y, p.z);
      v.set(p.vx, p.vy, p.vz).normalize();
      o.quaternion.setFromUnitVectors(Z, v);
      o.scale.set(1, 1, 3.2);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={nubes} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[0.35, 32, 24]} />
        <meshPhysicalMaterial color="#ffcf73" emissive="#7a4d0c" emissiveIntensity={0.35} roughness={0.25} metalness={0} transparent opacity={0.16} depthWrite={false} clearcoat={1} clearcoatRoughness={0.1} />
      </instancedMesh>
      <instancedMesh ref={nucleos} args={[undefined, undefined, N]}>
        <sphereGeometry args={[0.032, 14, 10]} />
        <meshStandardMaterial color={PROTON_COLOR} emissive="#ff4a3a" emissiveIntensity={2.2} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={alfas} args={[undefined, undefined, 40]} frustumCulled={false}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshBasicMaterial color="#ffd98a" />
      </instancedMesh>
    </group>
  );
}

/* ═════════════════ ETAPA 2 · UN NÚCLEO Y SUS HIPÉRBOLAS ═══════════════ */

const FM_POR_U = 16; // 1 unidad de escena = 16 fm
/* Parámetros de impacto (fm): de casi de frente a lejos. Los lejanos apenas
 * se desvían; los cercanos se doblan mucho; el de frente regresa. */
const BS_FM = [2, 7, 15, 30, 55, 95, -4, -11, -22, -42, -75];

function colorPorAngulo(thDeg: number): string {
  if (thDeg > 90) return "#ff6b5a";
  if (thDeg > 30) return "#ffb347";
  if (thDeg > 10) return "#ffe08a";
  return "#9fd8ff";
}

function NucleoZoom({ metal, kMeV, activo, ligero }: { metal: Metal; kMeV: number; activo: boolean; ligero: boolean }) {
  const dU = distanciaMinimaFm(kMeV, metal.Z) / FM_POR_U;
  const rNuc = radioNuclearFm(metal.A) / FM_POR_U;
  const rNucleon = (rNuc / Math.cbrt(metal.A)) * 1.08;

  const caminos = useMemo(() => {
    const out: { pts: THREE.Vector3[]; arr: Float32Array; col: string }[] = [];
    for (const bf of BS_FM) {
      const b = bf / FM_POR_U;
      const arr = trayectoriaCoulomb(b, dU, 11, 0.04);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < arr.length; i += 2) pts.push(new THREE.Vector3(arr[i]!, 0, arr[i + 1]!));
      const thDeg = (2 * Math.atan(dU / (2 * Math.abs(b))) * 180) / Math.PI;
      out.push({ pts, arr, col: colorPorAngulo(thDeg) });
    }
    return out;
  }, [dU]);

  const alfaP = useRef<THREE.InstancedMesh>(null);
  const alfaN = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ o: new THREE.Object3D() }), []);
  const NA = caminos.length;
  const rA = 0.07;
  const tetra = useMemo(
    () => [
      [rA, rA, rA], [-rA, -rA, rA], [-rA, rA, -rA], [rA, -rA, -rA],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(0.62)),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mp = alfaP.current, mn = alfaN.current;
    if (!mp || !mn) return;
    const { o } = tmp;
    const ritmoPts = 70; // puntos de trayectoria por segundo (tiempo físico a escala)
    for (let i = 0; i < NA; i++) {
      const c = caminos[i]!;
      const n = c.arr.length / 2;
      const ciclo = n + 40;
      const f = activo ? (t * ritmoPts + ((i * 0.618) % 1) * ciclo) % ciclo : 0;
      const k = Math.min(n - 1, Math.floor(f));
      const visible = activo && f < n;
      const x = c.arr[k * 2] ?? 0, z = c.arr[k * 2 + 1] ?? 0;
      for (let j = 0; j < 4; j++) {
        const q = tetra[j]!;
        o.position.set(x + q.x, q.y, z + q.z);
        o.scale.setScalar(visible ? 1 : 0);
        o.updateMatrix();
        (j < 2 ? mp : mn).setMatrixAt(i * 2 + (j % 2), o.matrix);
      }
    }
    mp.instanceMatrix.needsUpdate = true;
    mn.instanceMatrix.needsUpdate = true;
  });

  const nombre = metal.nombre.toLowerCase();
  return (
    <group>
      <NucleoPBR protones={metal.Z} neutrones={metal.A - metal.Z} rNucleon={rNucleon} giro={0.15} />
      {/* Distancia mínima de acercamiento: el círculo que ninguna alfa cruza */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[dU, 0.018, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {caminos.map((c, i) => (
        <Line key={`${dU}-${i}`} points={c.pts} color={c.col} lineWidth={ligero ? 2 : 2.6} transparent opacity={0.55} />
      ))}
      <instancedMesh ref={alfaP} args={[undefined, undefined, NA * 2]} frustumCulled={false}>
        <sphereGeometry args={[rA, 16, 12]} />
        <meshPhysicalMaterial color={PROTON_COLOR} emissive="#ff8a3a" emissiveIntensity={0.9} roughness={0.3} clearcoat={1} />
      </instancedMesh>
      <instancedMesh ref={alfaN} args={[undefined, undefined, NA * 2]} frustumCulled={false}>
        <sphereGeometry args={[rA, 16, 12]} />
        <meshPhysicalMaterial color="#d7dee8" emissive="#ffcf8a" emissiveIntensity={0.5} roughness={0.35} clearcoat={1} />
      </instancedMesh>
      {activo && (
        <>
          <Etiqueta pos={[0, rNuc + 0.35, 0]} color={PROTON_COLOR}>
            Núcleo de {nombre}: {metal.Z} p⁺ y {metal.A - metal.Z} n
          </Etiqueta>
          <Etiqueta pos={[0, 0.1, -dU]} color="#ffffff" lado="up">
            Distancia mínima d = {(dU * FM_POR_U).toLocaleString("es-MX", { maximumFractionDigits: 1 })} fm
          </Etiqueta>
        </>
      )}
    </group>
  );
}

/* ══════════════════════ EL CONJUNTO, CON ZOOM ═══════════════════════ */

export default function ExperimentoRutherford(props: RutherfordProps) {
  const { etapa, onVelo, metal } = props;
  const L = useRef<number>(etapa);
  const g0 = useRef<THREE.Group>(null);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);

  useEffect(() => () => onVelo(0), [onVelo]);

  useFrame((_, dt) => {
    L.current = THREE.MathUtils.damp(L.current, etapa, 2.4, Math.min(dt, 0.1));
    if (Math.abs(L.current - etapa) < 0.003) L.current = etapa;
    const grupos = [g0.current, g1.current, g2.current];
    grupos.forEach((g, i) => {
      if (!g) return;
      const d = L.current - i;
      g.visible = Math.abs(d) < 0.97;
      g.scale.setScalar(Math.pow(ZOOM, d));
    });
    const f = L.current - Math.floor(L.current);
    onVelo(Math.pow(Math.sin(Math.PI * f), 2) * 0.96);
  });

  const nombre = metal.nombre.toLowerCase();
  return (
    <group>
      <group ref={g0}>
        <Aparato metal={metal} />
        <Motor {...props} activo={etapa === 0} />
        {etapa === 0 && (
          <>
            <Etiqueta pos={[X_FUENTE, 0.75, 0]} color="#ffd27a">Fuente de partículas alfa</Etiqueta>
            <Etiqueta pos={[0, 0.8, 0]} color={ORO}>Lámina de {nombre}</Etiqueta>
            <Etiqueta pos={[0.6, 0.62, -R_PANT]} color="#9dffc8">Pantalla fluorescente</Etiqueta>
          </>
        )}
      </group>
      <group ref={g1} visible={false}>
        <Lamina activo={etapa === 1} ligero={props.ligero} />
        {etapa === 1 && (
          <>
            <Etiqueta pos={[0, SEP + 0.45, 0]} color="#ffcf73">Átomo de {nombre}: casi todo vacío</Etiqueta>
            <Etiqueta pos={[SEP * 0.85, 0, 0]} color={PROTON_COLOR} lado="right">Núcleo (aquí ~2 000× más grande)</Etiqueta>
          </>
        )}
      </group>
      <group ref={g2} visible={false}>
        <NucleoZoom metal={metal} kMeV={props.kMeV} activo={etapa === 2} ligero={props.ligero} />
      </group>
    </group>
  );
}
