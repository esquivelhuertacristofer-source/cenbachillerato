"use client";
// =============================================================================
// Sistema Solar — piezas 3D que comparten la vitrina y la órbita de Kepler
// =============================================================================
// · Texturas: las de `_espacio.tsx` (Solar System Scope, CC BY 4.0), pero aquí
//   con la versión 4K de Marte, Júpiter, Saturno y las nubes (el kit compartido
//   no la declara y no se toca, porque lo usan otros labs).
// · Rótulos con <Html> de drei (NUNCA <Text>: cuelga Turbopack), ≥ 14 px.
// · Flecha sólida (cilindro + cono): nada de líneas de 1 px como sujeto.
// =============================================================================

import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { RUTA_ESPACIO, resolucionEspacio, texturaResplandor } from "./_espacio";

const CUATRO_K = new Set(["tierra-dia", "tierra-noche", "tierra-nubes", "via-lactea", "marte", "jupiter", "saturno"]);

/** Ruta de una textura del espacio con la mejor resolución que convenga aquí. */
export function rutaSS(base: string): string {
  const res = CUATRO_K.has(base) ? resolucionEspacio() : "2k";
  return `${RUTA_ESPACIO}/${base}-${res}.webp`;
}

/** Textura de color (sRGB) con anisotropía alta. */
export function useTexturaSS(base: string): THREE.Texture {
  return useTexture(rutaSS(base), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
}

/** Generador pseudoaleatorio con semilla (Park–Miller): la misma escena siempre. */
export function azarCon(semilla: number): () => number {
  let s = semilla;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Textura del anillo de Saturno (PNG con transparencia). */
export function useTexturaAnillo(): THREE.Texture {
  return useTexture(`${RUTA_ESPACIO}/saturno-anillo.png`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
}

/** Disco suave para que los puntos (cola del cometa, Kuiper) sean redondos. */
export function texturaPunto(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.45, "rgba(255,255,255,0.6)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ── Rótulo: texto fijo en píxeles, en la punta de lo que nombra ──────────── */
export function Rotulo({
  posicion,
  color,
  children,
  onClick,
  lado = "arriba",
  fuerte = false,
}: {
  posicion: [number, number, number];
  color: string;
  children: ReactNode;
  onClick?: () => void;
  lado?: "arriba" | "abajo" | "derecha" | "izquierda";
  fuerte?: boolean;
}) {
  const desplaza =
    lado === "arriba" ? "translate(-50%, -100%)" : lado === "abajo" ? "translate(-50%, 12px)" : lado === "derecha" ? "translate(14px, -50%)" : "translate(calc(-100% - 14px), -50%)";
  const estilo = {
    transform: desplaza,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: fuerte ? "4px 10px" : "2px 6px",
    border: fuerte ? `1px solid ${color}88` : "none",
    borderRadius: 999,
    background: fuerte ? "rgba(4,10,22,0.78)" : "transparent",
    color: "rgba(255,255,255,.95)",
    textShadow: "0 1px 3px #000, 0 0 8px rgba(0,0,0,.9)",
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "nowrap" as const,
    cursor: onClick ? "pointer" : "default",
    fontFamily: "inherit",
    pointerEvents: onClick ? ("auto" as const) : ("none" as const),
    fontVariantNumeric: "tabular-nums" as const,
  };
  return (
    <Html position={posicion} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      {onClick ? (
        <button type="button" onClick={onClick} style={estilo}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: color, boxShadow: `0 0 6px ${color}`, flex: "0 0 auto" }} />
          {children}
        </button>
      ) : (
        <span style={estilo}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: color, boxShadow: `0 0 6px ${color}`, flex: "0 0 auto" }} />
          {children}
        </span>
      )}
    </Html>
  );
}

/* ── Flecha sólida a lo largo de +Y (se orienta con el grupo padre) ───────── */
export function FlechaY({ largo, grosor, color, opacidad = 1 }: { largo: number; grosor: number; color: string; opacidad?: number }) {
  const punta = Math.min(largo * 0.45, grosor * 5);
  const cuerpo = Math.max(0.001, largo - punta);
  return (
    <group raycast={() => null}>
      <mesh position={[0, cuerpo / 2, 0]}>
        <cylinderGeometry args={[grosor, grosor, cuerpo, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.35} metalness={0.2} transparent={opacidad < 1} opacity={opacidad} />
      </mesh>
      <mesh position={[0, cuerpo + punta / 2, 0]}>
        <coneGeometry args={[grosor * 2.4, punta, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.35} metalness={0.2} transparent={opacidad < 1} opacity={opacidad} />
      </mesh>
    </group>
  );
}

/* ── El Sol: fotografía, resplandor y la luz que ilumina a todos ─────────── */
export function SolFoto({ radio, onClick, luz = 3.2 }: { radio: number; onClick?: () => void; luz?: number }) {
  const mapa = useTexturaSS("sol");
  const resplandor = useMemo(() => texturaResplandor(), []);
  const esfera = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (esfera.current) esfera.current.rotation.y += Math.min(dt, 0.1) * 0.03;
  });
  return (
    <group>
      <mesh
        ref={esfera}
        onClick={
          onClick
            ? (e) => {
                e.stopPropagation();
                onClick();
              }
            : undefined
        }
      >
        <sphereGeometry args={[radio, 96, 48]} />
        {/* Fuente de luz: brilla por encima de 1 para que el bloom la abrace. */}
        <meshBasicMaterial map={mapa} color={[2.2, 1.75, 1.2]} toneMapped={false} />
      </mesh>
      <sprite scale={radio * 7.5} raycast={() => null}>
        <spriteMaterial map={resplandor} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
      <pointLight intensity={luz} decay={0} color="#fff3e0" />
    </group>
  );
}
