"use client";

/**
 * «Zoom al interior» de la mitocondria (CNEYT-VI-P02, `celula-organelos-3d`).
 *
 * Una sola mitocondria, unas 20 veces más cerca, abierta a lo largo: membrana
 * externa lisa, espacio intermembranal, membrana interna plegada en CRESTAS,
 * la matriz con su ADN circular propio y ribosomas. Sobre las crestas, las ATP
 * sintasas sueltan chispas de ATP: el alumno pliega más la membrana (más
 * crestas) y VE que salen más. Es un modelo cualitativo, no a escala.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { azar, curvaNucleoide, geoTubos, perfilCapsula, type Pt } from "./celula-geometrias";
import { geoMitocondria, MitoCuerpo, Instancias, Puntos, type Calidad } from "./celula-organelos";
import { texturaMoteada } from "./celula-geometrias";

const GEO_ATP = new THREE.IcosahedronGeometry(1, 1);
const GEO_SINTASA = new THREE.SphereGeometry(1, 12, 9);

/** Medidas del modelo grande (unidades de escena). */
export const MITO_GRANDE = { Lh: 4.4, R: 2.0 };

/** Dónde poner los rótulos del interior (coordenadas locales). */
export const MITO_PARTES: Record<"externa" | "crestas" | "matriz" | "adn", Pt> = {
  externa: [-1.6, 1.95, 0.0],
  crestas: [0.6, -0.95, -0.7],
  matriz: [2.6, 0.35, -1.0],
  adn: [-2.3, -0.2, -1.05],
};

export function MitocondriaInterior({ crestas, playing, calidad }: { crestas: number; playing: boolean; calidad: Calidad }) {
  const g = useMemo(() => geoMitocondria(MITO_GRANDE.Lh, MITO_GRANDE.R, crestas, 13), [crestas]);
  const tex = useMemo(() => texturaMoteada("#5a1d08", "#f59e0b", 29, 512, 256), []);

  // Matriz: gránulos y ribosomas 70S dentro de la mitad que se conserva.
  const matriz = useMemo(() => {
    const rnd = azar(5);
    const gran: THREE.Vector3[] = [];
    const ribo: THREE.Vector3[] = [];
    const n = calidad === "baja" ? 90 : 220;
    while (gran.length + ribo.length < n) {
      const x = (rnd() * 2 - 1) * g.Lh2 * 0.9;
      const rho = perfilCapsula(g.Lh2, g.R2, g.p, x) * Math.sqrt(rnd()) * 0.86;
      const psi = Math.PI + rnd() * Math.PI;
      const v = new THREE.Vector3(x, Math.cos(psi) * rho, Math.sin(psi) * rho);
      (gran.length < n * 0.55 ? gran : ribo).push(v);
    }
    const adn = [
      curvaNucleoide(azar(3), 0.42, 0.18, 0.2, 26),
      curvaNucleoide(azar(9), 0.36, 0.16, 0.18, 24),
    ];
    return { gran, ribo, adn: geoTubos(adn, 0.03, 160, 6) };
  }, [g, calidad]);

  // ATP: chispas que nacen en las sintasas y se alejan hacia la matriz.
  const sitios = g.sitios;
  const nAtp = Math.min(calidad === "baja" ? 120 : 260, sitios.length * 2);
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const deriva = useMemo(() => {
    const r = azar(17);
    return Array.from({ length: 260 }, () => ({ fase: r(), vel: 0.35 + r() * 0.4, d: new THREE.Vector3(r() - 0.5, r() - 0.5, r() * 0.6 + 0.2).normalize() }));
  }, []);
  const t = useRef(0);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m || !sitios.length) return;
    if (playing) t.current += dt;
    for (let i = 0; i < nAtp; i++) {
      const k = deriva[i]!;
      const f = (t.current * k.vel + k.fase) % 1;
      const s = sitios[i % sitios.length]!;
      o.position.copy(s).addScaledVector(k.d, f * 0.75);
      o.scale.setScalar(0.05 * Math.sin(Math.PI * Math.min(1, f * 1.15)));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.count = nAtp;
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <MitoCuerpo g={g} matriz={tex} />
      <Instancias puntos={sitios} geo={GEO_SINTASA} escala={0.045}>
        <meshStandardMaterial color="#fde68a" roughness={0.4} emissive="#f59e0b" emissiveIntensity={0.25} />
      </Instancias>
      <instancedMesh ref={ref} args={[GEO_ATP, undefined, 260]} frustumCulled={false}>
        <meshStandardMaterial color="#fff3a3" emissive="#facc15" emissiveIntensity={2.6} roughness={0.3} />
      </instancedMesh>
      <Puntos puntos={matriz.gran} tam={0.05} color="#f8b46a" corte={null} />
      <Puntos puntos={matriz.ribo} tam={0.035} color="#f1f5f9" corte={null} />
      <group>
        <mesh geometry={matriz.adn} position={MITO_PARTES.adn}>
          <meshPhysicalMaterial color="#c99cff" roughness={0.4} clearcoat={0.5} emissive="#7e22ce" emissiveIntensity={0.3} />
        </mesh>
        <mesh geometry={matriz.adn} position={[2.2, 0.45, -0.95]} rotation={[0.4, 1.2, 0.2]}>
          <meshPhysicalMaterial color="#c99cff" roughness={0.4} clearcoat={0.5} emissive="#7e22ce" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
