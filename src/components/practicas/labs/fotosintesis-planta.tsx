"use client";

/**
 * Escala 0 — LA PLANTA. Una planta en maceta de terracota iluminada por el
 * Sol. Las hojas tienen nervaduras, cutícula cerosa (clearcoat), terciopelo
 * (sheen) y dejan pasar un poco de luz (transmission). La luz llega como
 * fotones del color elegido: los que la clorofila absorbe se hunden en la
 * hoja y los que no, rebotan (por eso la hoja se ve verde). Cuanto más
 * aprovecha, más burbujas de O₂ suben de las hojas.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  hojasPlanta, curvaTallo, geometriaHoja, texturasHoja, texturaTerracota, texturaTierra, texturaMancha,
  texturaHalo, texturaHaz, texturaMadera, puntosEnHojas, geometriaCO2, geometriaBlob, azar,
} from "./fotosintesis-geometrias";
import { ContactShadows } from "@react-three/drei";
import { Flujo, Fotones, Etiqueta, useSim, escalaActiva, ponerOpacidad, type RutaFoton } from "./fotosintesis-runtime";

export const SOL_PLANTA: [number, number, number] = [4.4, 3.9, -5.2];
const PISO_Y = -3.3;

export function EscalaPlanta({ etiquetas, angosto, pocos }: { etiquetas: boolean; angosto: boolean; pocos: boolean }) {
  const simRef = useSim();
  const planta = useRef<THREE.Group>(null);
  const refSol = useRef<THREE.Mesh>(null);
  const refHalo = useRef<THREE.Sprite>(null);
  const refRayos = useRef<THREE.Group>(null);

  const hojas = useMemo(() => hojasPlanta(), []);
  const geos = useMemo(() => hojas.map((h) => geometriaHoja(h.largo, h.ancho)), [hojas]);
  const tex = useMemo(() => texturasHoja(!pocos), [pocos]);
  const terracota = useMemo(() => texturaTerracota(), []);
  const tierra = useMemo(() => texturaTierra(), []);
  const piso = useMemo(() => texturaMadera(), []);
  const mancha = useMemo(() => texturaMancha(), []);
  const halo = useMemo(() => texturaHalo(), []);
  const haz = useMemo(() => texturaHaz(), []);
  useEffect(() => () => {
    geos.forEach((g) => g.dispose());
    [tex.mapa, tex.relieve, terracota, tierra, piso, mancha, halo, haz].forEach((t) => t.dispose());
  }, [geos, tex, terracota, tierra, piso, mancha, halo, haz]);

  /* Maceta y plato: perfiles de torno. */
  const geoMaceta = useMemo(() => {
    const p = [
      [0.0, -3.18], [0.92, -3.18], [0.98, -3.14], [1.3, -1.6], [1.44, -1.56], [1.47, -1.24], [1.42, -1.16],
      [1.3, -1.18], [1.24, -1.36], [0.0, -1.36],
    ].map(([x, y]) => new THREE.Vector2(x!, y!));
    return new THREE.LatheGeometry(p, 64);
  }, []);
  const geoPlato = useMemo(() => {
    const p = [[0, -3.3], [1.32, -3.3], [1.45, -3.13], [1.4, -3.1], [1.24, -3.2], [0, -3.2]].map(([x, y]) => new THREE.Vector2(x!, y!));
    return new THREE.LatheGeometry(p, 64);
  }, []);

  /* Tallo y peciolos. */
  const tallo = useMemo(() => curvaTallo(), []);
  const geoTallo = useMemo(() => new THREE.TubeGeometry(tallo, 48, 0.075, 12, false), [tallo]);
  const geoPeciolos = useMemo(
    () => hojas.map((h) => {
      const a = new THREE.Vector3(...h.nudo);
      const b = h.base;
      const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.08, 0));
      return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 10, 0.034, 8, false);
    }),
    [hojas],
  );

  /* Piedritas sobre la tierra. */
  const piedras = useMemo(() => {
    const r = azar(77);
    return Array.from({ length: 16 }, () => {
      const a = r() * Math.PI * 2;
      const d = 0.35 + r() * 0.8;
      return { p: [Math.cos(a) * d, -1.33, Math.sin(a) * d] as [number, number, number], s: 0.05 + r() * 0.07, rot: r() * 3 };
    });
  }, []);
  const geoPiedra = useMemo(() => geometriaBlob(5, 0.22, 1), []);

  /* Rutas de la luz: la luz entra en TRES haces, cada uno hacia una zona de
   * hojas que mira al Sol, y los fotones viajan dentro de esos haces. */
  const puntos = useMemo(() => puntosEnHojas(48, 11), []);
  const candidatos = useMemo(() => puntosEnHojas(260, 17), []);
  const focos = useMemo(() => {
    const sol = new THREE.Vector3(...SOL_PLANTA);
    const orden = candidatos
      .map((c) => ({ c, k: c.n.dot(sol.clone().sub(c.p).normalize()) + c.p.y * 0.08 }))
      .sort((a, b) => b.k - a.k);
    const elegidos: THREE.Vector3[] = [];
    for (const o of orden) {
      if (elegidos.length >= 3) break;
      if (elegidos.every((e) => e.distanceTo(o.c.p) > 1.5)) elegidos.push(o.c.p.clone());
    }
    return elegidos;
  }, [candidatos]);
  const rutas: RutaFoton[] = useMemo(() => {
    const r = azar(19);
    const sol = new THREE.Vector3(...SOL_PLANTA);
    const out: RutaFoton[] = [];
    focos.forEach((f) => {
      candidatos.filter((c) => c.p.distanceTo(f) < 0.75).slice(0, 12).forEach((c) => {
        out.push({
          de: sol.clone().add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.35)),
          a: c.p.clone().addScaledVector(c.n, 0.03),
          n: c.n,
        });
      });
    });
    return out;
  }, [focos, candidatos]);

  /* Bokeh cálido de invernadero, detrás de la planta. */
  const bokeh = useMemo(() => {
    const r = azar(88);
    const cols = ["#ffcf8a", "#ffe2b0", "#ffb86b", "#c9e59a"];
    return Array.from({ length: pocos ? 12 : 26 }, () => ({
      p: [(r() - 0.5) * 22, -1.5 + r() * 9, -9 - r() * 6] as [number, number, number],
      s: 0.7 + r() * 2.2,
      c: cols[Math.floor(r() * cols.length)]!,
      o: 0.1 + r() * 0.28,
    }));
  }, [pocos]);

  /* Burbujas de O₂: salen de las hojas y suben bamboleándose. */
  const curvasO2 = useMemo(() => {
    const r = azar(29);
    return puntos.slice(0, 32).map((pt) => {
      const p = pt.p.clone().addScaledVector(pt.n, 0.05);
      const a = r() * 6;
      return new THREE.CatmullRomCurve3([
        p,
        p.clone().add(new THREE.Vector3(Math.cos(a) * 0.15, 0.7, Math.sin(a) * 0.15)),
        p.clone().add(new THREE.Vector3(-Math.cos(a) * 0.2, 1.6, -Math.sin(a) * 0.2)),
        p.clone().add(new THREE.Vector3(Math.cos(a) * 0.25, 2.6, Math.sin(a) * 0.25)),
      ]);
    });
  }, [puntos]);
  const geoBurbuja = useMemo(() => new THREE.SphereGeometry(0.075, 16, 12), []);
  const matBurbuja = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#e6f7ff", emissive: "#8fd8ff", emissiveIntensity: 0.35, roughness: 0.05, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.62 }),
    [],
  );

  /* CO₂ que llega del aire a las hojas. */
  // Solo cerca de las hojas: el CO₂ se acerca a la cara inferior, donde están los estomas.
  const curvasCO2 = useMemo(() => {
    const r = azar(31);
    return puntos.slice(10, 22).map((pt) => {
      const fuera = new THREE.Vector3(pt.p.x, 0, pt.p.z).normalize();
      const ini = pt.p.clone().addScaledVector(fuera, 1.1 + r() * 0.5).add(new THREE.Vector3(0, -0.5, 0));
      const fin = pt.p.clone().addScaledVector(pt.n, -0.04);
      return new THREE.CatmullRomCurve3([ini, ini.clone().lerp(fin, 0.5).add(new THREE.Vector3(0, -0.15, 0)), fin]);
    });
  }, [puntos]);
  const geoCO2 = useMemo(() => geometriaCO2(), []);
  const matMol = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.05 }), []);

  /* Sol: color y brillo según la luz elegida. */
  const matSol = useMemo(() => new THREE.MeshBasicMaterial({ color: "#fff1d0", toneMapped: false }), []);
  const matHalo = useMemo(() => new THREE.SpriteMaterial({ map: halo, color: "#ffd890", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }), [halo]);
  const matHaz = useMemo(() => new THREE.MeshBasicMaterial({ map: haz, color: "#ffe6a8", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide, toneMapped: false, opacity: 0.2 }), [haz]);
  const rayos = useMemo(() => {
    const sol = new THREE.Vector3(...SOL_PLANTA);
    return focos.map((dst) => {
      const dir = dst.clone().sub(sol);
      const largo = dir.length();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
      const centro = sol.clone().lerp(dst, 0.5);
      return { centro, q, largo };
    });
  }, [focos]);

  useFrame(() => {
    const s = simRef.current;
    if (!escalaActiva(s, 0)) return;
    const brillo = 0.25 + s.luz * 2.6;
    if (refSol.current) (refSol.current.material as THREE.MeshBasicMaterial).color.copy(s.colorLuz).multiplyScalar(brillo);
    if (refHalo.current) refHalo.current.material.color.copy(s.colorLuz).multiplyScalar(0.35 + s.luz * 0.9);
    const rayo = refRayos.current?.children[0] as THREE.Mesh | undefined;
    if (rayo) {
      const mh = rayo.material as THREE.MeshBasicMaterial;
      mh.color.copy(s.colorLuz);
      ponerOpacidad(mh, 0.05 + s.luz * 0.2);
    }
    if (planta.current) {
      planta.current.rotation.z = Math.sin(s.t * 0.7) * 0.012;
      planta.current.rotation.x = Math.sin(s.t * 0.53 + 1) * 0.008;
    }
  });

  return (
    <group>
      {/* Mesa de madera de invernadero: se funde con el fondo, sin borde. */}
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0, PISO_Y - 0.005, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial map={piso} alphaMap={mancha} transparent depthWrite={false} roughness={0.62} metalness={0} />
      </mesh>
      {!pocos && <ContactShadows position={[0, PISO_Y + 0.01, 0]} scale={5} blur={3} opacity={0.6} far={2.2} resolution={512} frames={1} color="#1a0d05" />}

      {/* Fondo: luz cálida de ventana desenfocada (bokeh). */}
      <sprite position={[2.5, 3.5, -14]} scale={[26, 18, 1]}>
        <spriteMaterial map={halo} color="#ffb877" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {bokeh.map((b, i) => (
        <sprite key={`b${i}`} position={b.p} scale={[b.s, b.s, 1]}>
          <spriteMaterial map={halo} color={b.c} transparent opacity={b.o} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}

      {/* Plato y maceta de terracota. */}
      <mesh geometry={geoPlato} castShadow receiveShadow>
        <meshStandardMaterial map={terracota} color="#c27350" roughness={0.82} />
      </mesh>
      <mesh geometry={geoMaceta} castShadow receiveShadow>
        <meshStandardMaterial map={terracota} roughness={0.86} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]} receiveShadow>
        <circleGeometry args={[1.27, 48]} />
        <meshStandardMaterial map={tierra} roughness={1} />
      </mesh>
      {piedras.map((p, i) => (
        <mesh key={i} geometry={geoPiedra} position={p.p} scale={p.s} rotation={[p.rot, p.rot * 2, 0]} castShadow>
          <meshStandardMaterial color={i % 3 === 0 ? "#9b8f80" : "#6d6258"} roughness={0.8} />
        </mesh>
      ))}

      {/* La planta, con un vaivén apenas perceptible. */}
      <group ref={planta}>
        <mesh geometry={geoTallo} castShadow>
          <meshPhysicalMaterial color="#4c8a2a" roughness={0.45} sheen={0.6} sheenColor="#b8f08a" clearcoat={0.3} />
        </mesh>
        {geoPeciolos.map((g, i) => (
          <mesh key={i} geometry={g} castShadow>
            <meshPhysicalMaterial color="#5a9a32" roughness={0.45} sheen={0.5} sheenColor="#c8f59a" />
          </mesh>
        ))}
        {hojas.map((h, i) => (
          <mesh key={i} geometry={geos[i]} matrixAutoUpdate={false} matrix={h.matriz} castShadow receiveShadow>
            <meshPhysicalMaterial
              map={tex.mapa}
              bumpMap={tex.relieve}
              bumpScale={pocos ? 0.6 : 1.4}
              roughness={0.5}
              sheen={0.45}
              sheenRoughness={0.5}
              sheenColor="#5fae36"
              clearcoat={0.28}
              clearcoatRoughness={0.4}
              transmission={pocos ? 0 : 0.18}
              thickness={0.12}
              attenuationColor="#6fc23a"
              attenuationDistance={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* El Sol con su halo y tres haces de luz hacia la planta. */}
      <mesh ref={refSol} position={SOL_PLANTA} material={matSol}>
        <sphereGeometry args={[0.5, 32, 24]} />
      </mesh>
      <sprite ref={refHalo} position={SOL_PLANTA} scale={[4.6, 4.6, 1]} material={matHalo} />
      <group ref={refRayos}>
        {!pocos && rayos.map((r, i) => (
          <mesh key={i} position={r.centro} quaternion={r.q} material={matHaz}>
            <cylinderGeometry args={[0.35, 0.9, r.largo, 24, 1, true]} />
          </mesh>
        ))}
      </group>

      {/* Fotones: llegan del Sol, se absorben o rebotan según su color. */}
      <Fotones rutas={rutas} n={pocos ? 18 : 38} tam={1} velocidad={0.4} rebote={3.6} grosor={0.016} largo={0.34} brillo={3.2} />
      {/* O₂: burbujas que suben (caudal ∝ tasa). */}
      <Flujo curvas={curvasO2} n={pocos ? 26 : 56} geometria={geoBurbuja} material={matBurbuja} caudal={(s) => s.tasa} velocidad={0.22} tam={1} dispersion={0.06} semilla={5} />
      {/* CO₂ del aire hacia las hojas (caudal ∝ concentración). */}
      <Flujo curvas={curvasCO2} n={pocos ? 5 : 9} geometria={geoCO2} material={matMol} caudal={(s) => s.fCO2} velocidad={0.13} tam={0.18} giro={1.4} semilla={8} />

      <Etiqueta visible={etiquetas && !angosto} pos={[SOL_PLANTA[0], SOL_PLANTA[1] - 1.25, SOL_PLANTA[2]]} color="#ffd24a" icono="fa-sun" texto="Luz del Sol" />
      <Etiqueta visible={etiquetas && !angosto} pos={[-1.6, 3.3, 0.8]} color="#8fd8ff" icono="fa-arrow-up" texto="Burbujas de O₂" />
      <Etiqueta visible={etiquetas} pos={angosto ? [-1.9, 0.4, 1.2] : [-2.9, 0.5, 1.2]} color="#ff6b5e" icono="fa-arrow-right" texto="CO₂ del aire" />
    </group>
  );
}
