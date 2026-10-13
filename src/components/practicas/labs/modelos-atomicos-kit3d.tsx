"use client";

/**
 * Piezas 3D compartidas por las escenas de Modelos atómicos: etiquetas
 * legibles, halos de luz, el núcleo empaquetado de verdad (no una nube de
 * bolitas al azar) y los colores de las partículas.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { prng } from "./modelos-atomicos-fisica";
import { texturaDestello } from "./modelos-atomicos-texturas";

export const PROTON_COLOR = "#FF6B6B";
export const NEUTRON_COLOR = "#9AA7B5";
export const ELECTRON_COLOR = "#5BC8FF";

/** Etiqueta fija en px (nunca <Text>: cuelga Turbopack). Se oculta en pantallas angostas. */
export function Etiqueta({
  pos,
  color,
  children,
  lado = "up",
}: {
  pos: [number, number, number];
  color: string;
  children: ReactNode;
  lado?: "up" | "right" | "left" | "down";
}) {
  const ancho = useThree((st) => st.size.width);
  if (ancho < 640) return null;
  const tr = { up: "translate(0,-80%)", right: "translate(58%,0)", left: "translate(-58%,0)", down: "translate(0,80%)" }[lado];
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: tr }}>
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "4px 11px",
            borderRadius: 9,
            background: "rgba(4,10,22,0.86)",
            border: `1.5px solid ${color}`,
            color: "#f1f6ff",
            fontWeight: 800,
            fontSize: 15,
            fontFamily: "system-ui, sans-serif",
            boxShadow: `0 6px 20px rgba(0,0,0,0.5), 0 0 14px -6px ${color}`,
            backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: color, marginRight: 8, verticalAlign: "middle" }} />
          {children}
        </div>
      </div>
    </Html>
  );
}

/** Resplandor (sprite aditivo). No es un sólido: es la luz alrededor de algo. */
export function Halo({ color, escala = 1, opacidad = 0.6, position }: { color: string; escala?: number; opacidad?: number; position?: [number, number, number] }) {
  const tex = useMemo(() => texturaDestello(), []);
  return (
    <sprite position={position} scale={[escala, escala, escala]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacidad} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/**
 * Posiciones de A nucleones empaquetados como esferas duras (red cúbica
 * centrada en las caras, la más compacta), los A más cercanos al centro. Así
 * el núcleo se ve como un racimo apretado, que es lo que es.
 */
export function posicionesNucleo(A: number, rNucleon: number, semilla = 5): Float32Array {
  const s = (2 * rNucleon) / Math.SQRT2;
  const m = Math.ceil(Math.cbrt(A)) + 2;
  const pts: [number, number, number, number][] = [];
  const rnd = prng(semilla);
  for (let i = -m; i <= m; i++)
    for (let j = -m; j <= m; j++)
      for (let k = -m; k <= m; k++) {
        if ((i + j + k) % 2 !== 0) continue;
        const x = i * s, y = j * s, z = k * s;
        // pequeño desorden: un núcleo no es un cristal
        pts.push([x, y, z, Math.hypot(x, y, z) + rnd() * rNucleon * 0.35]);
      }
  pts.sort((a, b) => a[3] - b[3]);
  const out = new Float32Array(A * 3);
  for (let n = 0; n < A && n < pts.length; n++) {
    out[n * 3] = pts[n]![0] + (rnd() - 0.5) * rNucleon * 0.18;
    out[n * 3 + 1] = pts[n]![1] + (rnd() - 0.5) * rNucleon * 0.18;
    out[n * 3 + 2] = pts[n]![2] + (rnd() - 0.5) * rNucleon * 0.18;
  }
  return out;
}

/** Orden barajado (determinista) para repartir protones y neutrones en el racimo. */
function barajar(n: number, semilla: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rnd = prng(semilla);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx;
}

/**
 * Núcleo con materiales de verdad: protones rojos y neutrones gris perla,
 * barniz (clearcoat) para que reflejen el estudio. Gira despacio.
 */
export function NucleoPBR({
  protones,
  neutrones,
  rNucleon,
  giro = 0.25,
  halo = true,
}: {
  protones: number;
  neutrones: number;
  rNucleon: number;
  giro?: number;
  halo?: boolean;
}) {
  const pRef = useRef<THREE.InstancedMesh>(null);
  const nRef = useRef<THREE.InstancedMesh>(null);
  const grupo = useRef<THREE.Group>(null);
  const A = protones + neutrones;

  const { pp, nn, radio } = useMemo(() => {
    const pos = posicionesNucleo(Math.max(A, 1), rNucleon);
    const orden = barajar(A, 17 + A);
    const pp: number[] = [];
    const nn: number[] = [];
    let radio = rNucleon;
    for (let k = 0; k < A; k++) {
      const i = orden[k]!;
      const t = [pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!] as const;
      radio = Math.max(radio, Math.hypot(t[0], t[1], t[2]) + rNucleon);
      if (k < protones) pp.push(...t);
      else nn.push(...t);
    }
    return { pp, nn, radio };
  }, [A, protones, rNucleon]);

  useEffect(() => {
    const d = new THREE.Object3D();
    if (pRef.current) {
      for (let i = 0; i < protones; i++) {
        d.position.set(pp[i * 3]!, pp[i * 3 + 1]!, pp[i * 3 + 2]!);
        d.updateMatrix();
        pRef.current.setMatrixAt(i, d.matrix);
      }
      pRef.current.instanceMatrix.needsUpdate = true;
    }
    if (nRef.current) {
      for (let i = 0; i < neutrones; i++) {
        d.position.set(nn[i * 3]!, nn[i * 3 + 1]!, nn[i * 3 + 2]!);
        d.updateMatrix();
        nRef.current.setMatrixAt(i, d.matrix);
      }
      nRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [pp, nn, protones, neutrones]);

  useFrame((_, dt) => {
    if (grupo.current && giro) grupo.current.rotation.y += dt * giro;
  });

  if (A === 0) return null;
  return (
    <group ref={grupo}>
      {protones > 0 && (
        <instancedMesh ref={pRef} args={[undefined, undefined, protones]} castShadow>
          <sphereGeometry args={[rNucleon, 22, 16]} />
          <meshPhysicalMaterial color={PROTON_COLOR} emissive="#7a1010" emissiveIntensity={0.35} roughness={0.32} metalness={0.05} clearcoat={0.9} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#ffb3b3" />
        </instancedMesh>
      )}
      {neutrones > 0 && (
        <instancedMesh ref={nRef} args={[undefined, undefined, neutrones]} castShadow>
          <sphereGeometry args={[rNucleon, 22, 16]} />
          <meshPhysicalMaterial color="#c3ccd8" roughness={0.38} metalness={0.15} clearcoat={0.8} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#e8f0ff" />
        </instancedMesh>
      )}
      {halo && <Halo color="#ff7a5c" escala={radio * 4.2} opacidad={0.32} />}
    </group>
  );
}
