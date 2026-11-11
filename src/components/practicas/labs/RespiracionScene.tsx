"use client";

/**
 * Escena 3D del laboratorio "Respiración aerobia y anaerobia" (CNEYT-IV·O8).
 *
 * Cuatro modos; TODA la animación ocurre dentro de useFrame mutando refs (nunca
 * en el render — reglas del React Compiler):
 *  - glucolisis:  una glucosa (6 C) en el citoplasma se parte en 2 piruvato (3 C)
 *    conforme escena.frac; aparecen 2 ATP netos + 2 NADH (cosecha).
 *  - aerobia:     una mitocondria esquemática: el piruvato entra, gira el ciclo de
 *    Krebs, la cadena transportadora bombea H⁺, el O₂ forma H₂O y se cosechan ~38 ATP.
 *  - fermentacion: el piruvato acepta los e⁻ del NADH → lactato / etanol + CO₂,
 *    regenerando NAD⁺; solo 2 ATP.
 *  - comparar:    mitocondria (≈38 ATP) junto a citoplasma fermentando (2 ATP).
 *
 * Es un mundo microscópico: no lleva mesa. La célula es un volumen (elipsoide
 * translúcido de doble capa), la mitocondria una cápsula con crestas, y el
 * fondo tiene partículas tenues de citosol para dar profundidad.
 *
 * Esquemática (no a escala). Etiquetas con <Html> (NUNCA <Text> de drei: cuelga
 * el chunk con Turbopack).
 */

import * as THREE from "three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escena } from "./respiracion-data";
import { Escenario } from "./_escenario";
import { CurvaTubo } from "./_tablero";
import { ATOMO } from "./_vidrio";

type Pt = [number, number, number];

export interface RespiracionSceneProps {
  modo: Modo;
  escena: Escena;
  playing: boolean;
  modoColor: string;
  resetNonce: number;
  /** Oxígeno disponible 0 → 1 (solo se ve en «Comparar»). */
  o2: number;
}

const C_GLUCOSA = "#4ade80";
const C_PIRUVATO = "#fbbf24";
const C_ATP = "#fde047";
const C_CO2 = "#94a3b8";
const C_O2 = "#38bdf8";
const C_H2O = "#60a5fa";
const C_NADH = "#a78bfa";
const C_LACTATO = "#f472b6";
const C_ETANOL = "#2dd4bf";

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function pillStyle(color: string): React.CSSProperties {
  return {
    padding: "5px 12px",
    borderRadius: 999,
    background: "rgba(4,10,22,0.86)",
    border: `1px solid ${color}`,
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 18px -8px #000",
  };
}

/* Etiqueta de tamaño fijo en píxeles (sin distanceFactor). Las `ancho` se
 * ocultan en pantallas angostas: su información ya está en el panel. */
function Etiqueta({ pos, color, children, ancho = false }: { pos: Pt; color: string; children: React.ReactNode; ancho?: boolean }) {
  const w = useThree((st) => st.size.width);
  if (ancho && w < 640) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={pillStyle(color)}>{children}</div>
    </Html>
  );
}

/* Geometrías compartidas por todas las moléculas y partículas. */
const GEO_ESFERA = new THREE.SphereGeometry(1, 24, 18);
const GEO_VARILLA = new THREE.CylinderGeometry(1, 1, 1, 10);
const GEO_CELULA = new THREE.SphereGeometry(1, 48, 32);
const BLANCO = new THREE.Color("#ffffff");

/* Pseudoaleatorio determinista (sin Math.random en el render). */
function frac(x: number): number {
  return x - Math.floor(x);
}

/* Varilla de enlace entre dos puntos locales. */
function Varilla({ a, b, r = 0.05, color = "#cbd5e1" }: { a: Pt; b: Pt; r?: number; color?: string }) {
  const { pos, q, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const l = Math.max(0.0001, d.length());
    return {
      pos: va.clone().addScaledVector(d, 0.5),
      q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.multiplyScalar(1 / l)),
      len: l,
    };
  }, [a, b]);
  return (
    <mesh geometry={GEO_VARILLA} position={pos} quaternion={q} scale={[r, len, r]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} envMapIntensity={1.2} />
    </mesh>
  );
}

/* Molécula reutilizable: esfera pulida, o un pequeño racimo bola-varilla.
 *  - esfera: una sola bola (NADH, lactato, etanol, CO₂, O₂, H₂O…)
 *  - anillo: glucosa (anillo de 6 con sustituyentes)
 *  - cadena: piruvato (3 carbonos con un sustituyente) */
function Mol({ r = 0.4, color, forma = "esfera" }: { r?: number; color: string; forma?: "esfera" | "anillo" | "cadena" }) {
  const claro = useMemo(() => new THREE.Color(color).lerp(BLANCO, 0.45), [color]);
  const cuerpo = (
    <>
      <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={0.12} />
    </>
  );
  const sust = <meshPhysicalMaterial {...ATOMO} color={claro} emissive={color} emissiveIntensity={0.08} />;

  const anillo = useMemo(() => {
    const ring: Pt[] = [];
    const pend: Pt[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ring.push([Math.cos(a) * 0.78 * r, Math.sin(a) * 0.78 * r, 0]);
      pend.push([Math.cos(a) * 1.28 * r, Math.sin(a) * 1.28 * r, (i % 2 ? 0.28 : -0.28) * r]);
    }
    return { ring, pend };
  }, [r]);
  const cadena = useMemo(() => {
    const c: Pt[] = [
      [-0.85 * r, -0.25 * r, 0],
      [0, 0.25 * r, 0],
      [0.85 * r, -0.25 * r, 0],
    ];
    const p: Pt = [0, 1.0 * r, 0.2 * r];
    return { c, p };
  }, [r]);

  if (forma === "anillo") {
    return (
      <group rotation={[0.7, 0, 0]}>
        {anillo.ring.map((p, i) => (
          <React.Fragment key={i}>
            <mesh geometry={GEO_ESFERA} position={p} scale={0.27 * r} castShadow>
              {cuerpo}
            </mesh>
            <Varilla a={p} b={anillo.ring[(i + 1) % 6]!} r={0.045 * r} />
            <Varilla a={p} b={anillo.pend[i]!} r={0.04 * r} />
            <mesh geometry={GEO_ESFERA} position={anillo.pend[i]!} scale={0.17 * r}>
              {sust}
            </mesh>
          </React.Fragment>
        ))}
      </group>
    );
  }
  if (forma === "cadena") {
    return (
      <group>
        {cadena.c.map((p, i) => (
          <React.Fragment key={i}>
            <mesh geometry={GEO_ESFERA} position={p} scale={0.5 * r} castShadow>
              {cuerpo}
            </mesh>
            {i > 0 && <Varilla a={cadena.c[i - 1]!} b={p} r={0.09 * r} />}
          </React.Fragment>
        ))}
        <Varilla a={cadena.c[1]!} b={cadena.p} r={0.07 * r} />
        <mesh geometry={GEO_ESFERA} position={cadena.p} scale={0.3 * r}>
          {sust}
        </mesh>
      </group>
    );
  }
  return (
    <mesh geometry={GEO_ESFERA} scale={r} castShadow>
      {cuerpo}
    </mesh>
  );
}

/* Esfera pulida suelta (O₂, lactato, anillo de Krebs). */
function Bola({ r, color, pos, emi = 0.15 }: { r: number; color: string; pos: Pt; emi?: number }) {
  return (
    <mesh geometry={GEO_ESFERA} position={pos} scale={r} castShadow>
      <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={emi} />
    </mesh>
  );
}

/* ── Cosecha de monedas de ATP: aparecen conforme `vis` (0→1) ──────────────── */
// Una sola malla instanciada (hasta 38 monedas) en vez de 38 grupos.
const _o = new THREE.Object3D();

function ATPStack({
  count,
  vis,
  playing,
  base = [0, 0, 0],
  cols = 4,
  color = C_ATP,
  tam = 1,
}: {
  count: number;
  vis: number;
  playing: boolean;
  base?: Pt;
  cols?: number;
  color?: string;
  tam?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const esc = useRef<Float32Array | null>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    if (!esc.current || esc.current.length !== count) esc.current = new Float32Array(count);
    const e = esc.current;
    if (playing) t.current += dt;
    const paso = 0.62 * tam;
    for (let i = 0; i < count; i++) {
      const target = clamp01(count * vis - i);
      e[i] = (e[i] ?? 0) + (target - (e[i] ?? 0)) * 0.18;
      const row = Math.floor(i / cols);
      const col = i % cols;
      _o.position.set(
        (base[0] ?? 0) + (col - (cols - 1) / 2) * paso,
        (base[1] ?? 0) + row * paso + Math.sin(t.current * 2 + i) * 0.05 * target * tam,
        base[2] ?? 0,
      );
      _o.rotation.set(Math.PI / 2, 0, 0);
      _o.scale.setScalar(Math.max(0.0001, (e[i] ?? 0) * tam));
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} castShadow>
      <cylinderGeometry args={[0.26, 0.26, 0.1, 24]} />
      <meshPhysicalMaterial {...ATOMO} color={color} emissive={color} emissiveIntensity={0.3} roughness={0.25} metalness={0.5} />
    </instancedMesh>
  );
}

/* Partículas tenues de citosol dentro de un elipsoide (posiciones deterministas). */
function Citosol({ rx, ry, rz, n = 46, color = "#9bd7f5" }: { rx: number; ry: number; rz: number; n?: number; color?: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const rr = Math.cbrt(frac((i + 1) * 0.61803)) * 0.9;
      const th = frac((i + 1) * 0.7548776662) * Math.PI * 2;
      const cp = frac((i + 1) * 0.5698402909) * 2 - 1;
      const sp = Math.sqrt(1 - cp * cp);
      o.position.set(rr * sp * Math.cos(th) * rx, rr * sp * Math.sin(th) * ry, rr * cp * rz);
      o.scale.setScalar(0.05 + (i % 3) * 0.03);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, rx, ry, rz]);
  return (
    <instancedMesh ref={mesh} args={[GEO_ESFERA, undefined, n]} frustumCulled={false}>
      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
    </instancedMesh>
  );
}

/* Polvo de fondo: partículas lejanas muy tenues que dan profundidad al vacío. */
function Polvo() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const grp = useRef<THREE.Group>(null);
  const N = 70;
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      o.position.set(
        (frac((i + 1) * 0.61803) - 0.5) * 32,
        (frac((i + 1) * 0.7548776662) - 0.5) * 16,
        -3 - frac((i + 1) * 0.5698402909) * 8,
      );
      o.scale.setScalar(0.05 + (i % 4) * 0.035);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((st) => {
    if (grp.current) grp.current.position.y = Math.sin(st.clock.elapsedTime * 0.25) * 0.25;
  });
  return (
    <group ref={grp}>
      <instancedMesh ref={mesh} args={[GEO_ESFERA, undefined, N]} frustumCulled={false}>
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.22} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/* ── GLUCÓLISIS: glucosa (6C) → 2 piruvato (3C) ───────────────────────────── */
function Glucolisis({ frac: fr, playing }: { frac: number; playing: boolean }) {
  const gluc = useRef<THREE.Group>(null);
  const pirA = useRef<THREE.Group>(null);
  const pirB = useRef<THREE.Group>(null);
  const t = useRef(0);
  // separación de piruvatos: 0 → 1 sobre la 2ª mitad de la animación
  const sep = clamp01((fr - 0.4) / 0.5);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (gluc.current) {
      gluc.current.scale.setScalar(1 - sep * 0.92);
      gluc.current.position.y = Math.sin(t.current * 1.4) * 0.1;
      gluc.current.rotation.y += dt * 0.4;
    }
    if (pirA.current) {
      pirA.current.scale.setScalar(sep);
      pirA.current.position.set(-1.6 * sep, Math.sin(t.current * 1.6) * 0.08, 0);
    }
    if (pirB.current) {
      pirB.current.scale.setScalar(sep);
      pirB.current.position.set(1.6 * sep, Math.sin(t.current * 1.6 + 1) * 0.08, 0);
    }
  });
  const atpVis = clamp01((fr - 0.6) / 0.4);
  const nadhVis = clamp01((fr - 0.55) / 0.4);
  return (
    <group>
      <Membrana label="Citoplasma" color="#38bdf8" rx={5.2} ry={3.4} />
      <group ref={gluc}>
        <Mol r={0.95} color={C_GLUCOSA} forma="anillo" />
        {sep < 0.5 && <Etiqueta pos={[0, 1.55, 0]} color={`${C_GLUCOSA}cc`}>Glucosa · C₆H₁₂O₆</Etiqueta>}
      </group>
      <group ref={pirA}>
        <Mol r={0.62} color={C_PIRUVATO} forma="cadena" />
      </group>
      <group ref={pirB}>
        <Mol r={0.62} color={C_PIRUVATO} forma="cadena" />
      </group>
      {sep > 0.5 && <Etiqueta pos={[0, -1.4, 0]} color={`${C_PIRUVATO}cc`}>2 piruvato (3 C)</Etiqueta>}
      <ATPStack count={2} vis={atpVis} playing={playing} base={[-2.6, 1.6, 0]} cols={2} />
      {atpVis > 0.5 && <Etiqueta pos={[-2.6, 2.7, 0]} color={`${C_ATP}cc`}>+2 ATP netos</Etiqueta>}
      <ATPStack count={2} vis={nadhVis} playing={playing} base={[2.6, 1.6, 0]} cols={2} color={C_NADH} />
      {nadhVis > 0.5 && <Etiqueta pos={[2.6, 2.7, 0]} color={`${C_NADH}cc`}>+2 NADH</Etiqueta>}
    </group>
  );
}

/* Membrana / compartimento.
 *
 * Un volumen, no un dibujo: elipsoide translúcido de doble capa (cara interior
 * y exterior, sin transmission: lo de dentro es translúcido y por eso la
 * membrana no puede refractar) más una malla muy tenue que marca la curvatura.
 * El contorno en tubo conserva la silueta, y el citosol (partículas) da la
 * sensación de medio donde flotan las moléculas. */
function Membrana({ label, color, rx, ry }: { label: string; color: string; rx: number; ry: number }) {
  const rz = Math.min(rx, ry) * 0.8;
  const pts = useMemo<Pt[]>(() => {
    const N = 96;
    const out: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      out.push([Math.cos(a) * rx, Math.sin(a) * ry, 0]);
    }
    return out;
  }, [rx, ry]);

  return (
    <group>
      <mesh geometry={GEO_CELULA} scale={[rx, ry, rz]} renderOrder={-1}>
        <meshPhysicalMaterial color={color} transparent opacity={0.1} roughness={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh geometry={GEO_CELULA} scale={[rx, ry, rz]} renderOrder={2}>
        <meshPhysicalMaterial color={color} transparent opacity={0.07} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} depthWrite={false} />
      </mesh>
      {/* borde luminoso barato: tercera capa BackSide algo mayor, tenue */}
      <mesh geometry={GEO_CELULA} scale={[rx * 1.04, ry * 1.04, rz * 1.04]} renderOrder={-2}>
        <meshBasicMaterial color={color} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Citosol rx={rx} ry={ry} rz={rz} n={label ? 46 : 22} />
      <CurvaTubo puntos={pts} color={color} grosor={0.055} brillo={0.45} />
      {label && (
        <Etiqueta pos={[0, ry + 0.45, 0]} color={`${color}aa`}>
          {label}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── AEROBIA: mitocondria con Krebs + cadena transportadora ───────────────── */
function Aerobia({ frac: fr, playing }: { frac: number; playing: boolean }) {
  const piruvato = useRef<THREE.Group>(null);
  const krebs = useRef<THREE.Group>(null);
  const agua = useRef<THREE.Group>(null);
  const t = useRef(0);

  const entra = clamp01(fr / 0.25); // piruvato entra
  const giraKrebs = clamp01((fr - 0.25) / 0.4);
  const cadena = clamp01((fr - 0.45) / 0.35);
  const aguaVis = clamp01((fr - 0.65) / 0.3);
  const atpVis = clamp01((fr - 0.7) / 0.3);

  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (piruvato.current) {
      piruvato.current.position.x = -4.5 + entra * 3.0;
      piruvato.current.scale.setScalar(clamp01(1 - giraKrebs));
    }
    if (krebs.current && playing) krebs.current.rotation.z -= dt * 1.1 * (0.2 + giraKrebs);
    if (agua.current) {
      agua.current.scale.setScalar(aguaVis);
      agua.current.position.y = Math.sin(t.current * 1.6) * 0.08;
    }
  });

  return (
    <group>
      {/* doble membrana mitocondrial con crestas */}
      <Capsula color="#34d399" w={9.2} h={4.8} />
      {/* piruvato entrando */}
      <group ref={piruvato} position={[-4.5, 0, 0]}>
        <Mol r={0.55} color={C_PIRUVATO} forma="cadena" />
        {giraKrebs < 0.3 && <Etiqueta pos={[0, 1.1, 0]} color={`${C_PIRUVATO}cc`}>piruvato</Etiqueta>}
      </group>

      {/* ciclo de Krebs: anillo de moléculas */}
      <group ref={krebs} position={[-1.6, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.0, 0.07, 12, 40]} />
          <meshPhysicalMaterial {...ATOMO} color="#34d399" emissive="#34d399" emissiveIntensity={0.25} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = i * 2.39996;
          return <Bola key={i} r={0.22} color={C_NADH} pos={[Math.cos(a), Math.sin(a), 0]} emi={0.2} />;
        })}
      </group>
      {giraKrebs > 0.3 && <Etiqueta pos={[-1.6, 1.5, 0]} color="#34d399cc">Ciclo de Krebs</Etiqueta>}

      {/* CO2 saliendo */}
      {giraKrebs > 0.4 && <Bola r={0.24} color={C_CO2} pos={[-1.6, -1.7, 0]} emi={0.1} />}

      {/* cadena transportadora: 4 complejos */}
      <group position={[1.6, -0.2, 0]}>
        {Array.from({ length: 4 }).map((_, i) => {
          const lit = cadena > i / 4;
          return (
            <mesh key={i} position={[i * 0.85, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 1.1, 0.5]} />
              <meshPhysicalMaterial {...ATOMO} color={lit ? C_O2 : "#1e3a4d"} emissive={C_O2} emissiveIntensity={lit ? 0.4 : 0.03} />
            </mesh>
          );
        })}
        {cadena > 0.2 && <Etiqueta pos={[1.3, 1.1, 0]} color={`${C_O2}cc`} ancho>Cadena transportadora</Etiqueta>}
      </group>

      {/* O2 + H2O */}
      {cadena > 0.5 && <Bola r={0.3} color={C_O2} pos={[4.4, -0.2, 0]} emi={0.15} />}
      <group ref={agua} position={[4.4, -1.6, 0]}>
        <Mol r={0.32} color={C_H2O} />
      </group>

      {/* cosecha de ATP */}
      <ATPStack count={38} vis={atpVis} playing={playing} base={[0, 2.1, 0]} cols={10} tam={0.6} />
      {atpVis > 0.4 && <Etiqueta pos={[0, 4.1, 0]} color={`${C_ATP}cc`}>≈ 38 ATP</Etiqueta>}
    </group>
  );
}

/* Mitocondria: cápsula translúcida de doble membrana con crestas internas.
 * Los contornos en tubo marcan la silueta; las crestas son opacas (dentro de
 * una membrana sin transmission, así que se ven). */
function Capsula({ color, w, h }: { color: string; w: number; h: number }) {
  const pts = useMemo<Pt[]>(() => {
    const out: Pt[] = [];
    const N = 80;
    const r = h / 2;
    const sx = w / 2 - r;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const cx = a < Math.PI ? sx : -sx;
      out.push([Math.cos(a) * r + cx, Math.sin(a) * r, 0]);
    }
    return out;
  }, [w, h]);
  const geoExt = useMemo(() => new THREE.CapsuleGeometry(h / 2, Math.max(0.01, w - h), 12, 40), [w, h]);
  const nCrestas = Math.max(3, Math.floor(w / 1.1));
  const yCresta = (h / 2) * 0.88 - 0.25;
  const crestas = useMemo(
    () =>
      Array.from({ length: nCrestas }).map((_, i) => ({
        x: (i - (nCrestas - 1) / 2) * ((w - h * 0.6) / nCrestas),
        y: i % 2 ? -yCresta : yCresta,
      })),
    [nCrestas, w, h, yCresta],
  );
  return (
    <group>
      {/* membrana externa: cara interior + cara exterior */}
      <mesh geometry={geoExt} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]} renderOrder={-1}>
        <meshPhysicalMaterial color={color} transparent opacity={0.1} roughness={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh geometry={geoExt} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]} renderOrder={2}>
        <meshPhysicalMaterial color={color} transparent opacity={0.07} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} depthWrite={false} />
      </mesh>
      {/* membrana interna */}
      <mesh geometry={geoExt} rotation={[0, 0, Math.PI / 2]} scale={[0.9, 0.88, 0.7]} renderOrder={1}>
        <meshPhysicalMaterial color={color} transparent opacity={0.07} roughness={0.2} depthWrite={false} />
      </mesh>
      {/* crestas: pliegues de la membrana interna, alternando arriba/abajo */}
      {crestas.map((c, i) => (
        <mesh key={i} geometry={GEO_ESFERA} position={[c.x, c.y, 0]} scale={[0.1, 0.32, h * 0.2]}>
          <meshStandardMaterial color="#2f9f7a" roughness={0.45} metalness={0.1} envMapIntensity={0.9} />
        </mesh>
      ))}
      <CurvaTubo puntos={pts} color={color} grosor={0.05} brillo={0.4} />
    </group>
  );
}

/* ── FERMENTACIÓN: piruvato → lactato / etanol + CO₂, regenera NAD⁺ ─────────── */
function Fermentacion({ frac: fr, playing }: { frac: number; playing: boolean }) {
  const nadh = useRef<THREE.Group>(null);
  const prod = useRef<THREE.Group>(null);
  const t = useRef(0);
  const conv = clamp01((fr - 0.4) / 0.5);
  useFrame((_, dt) => {
    if (playing) t.current += dt;
    if (nadh.current) {
      // el NADH viaja del piruvato y vuelve como NAD+ (bucle)
      const a = t.current * 1.2;
      nadh.current.position.set(Math.cos(a) * 1.4, Math.sin(a) * 0.9 + 0.2, 0);
    }
    if (prod.current) {
      prod.current.scale.setScalar(conv);
      prod.current.position.y = -1.4 + Math.sin(t.current * 1.5) * 0.06 * conv;
    }
  });
  return (
    <group>
      <Membrana label="Citoplasma sin O₂" color="#a78bfa" rx={5.2} ry={3.4} />
      {/* piruvato origen */}
      <group position={[-1.6, 0.4, 0]}>
        <Mol r={0.58} color={C_PIRUVATO} forma="cadena" />
        <Etiqueta pos={[0, 1.1, 0]} color={`${C_PIRUVATO}cc`}>piruvato</Etiqueta>
      </group>
      {/* bucle de NADH ↔ NAD+ */}
      <group ref={nadh}>
        <Mol r={0.28} color={C_NADH} />
      </group>
      <Etiqueta pos={[0, 1.9, 0]} color={`${C_NADH}cc`} ancho>NADH → NAD⁺ (se regenera)</Etiqueta>
      {/* productos */}
      <group ref={prod} position={[1.8, -1.4, 0]}>
        <Mol r={0.42} color={C_LACTATO} />
        <group position={[1.0, 0, 0]}>
          <Mol r={0.42} color={C_ETANOL} />
        </group>
        <group position={[1.9, 0.4, 0]}>
          <Mol r={0.22} color={C_CO2} />
        </group>
      </group>
      {conv > 0.4 && <Etiqueta pos={[2.4, -2.4, 0]} color={`${C_LACTATO}cc`} ancho>lactato · etanol + CO₂</Etiqueta>}
      {/* solo 2 ATP */}
      <ATPStack count={2} vis={1} playing={playing} base={[-3.2, 1.7, 0]} cols={2} />
      <Etiqueta pos={[-3.2, 2.7, 0]} color={`${C_ATP}cc`}>solo 2 ATP</Etiqueta>
    </group>
  );
}

/* ── COMPARAR: la variable es el oxígeno disponible ───────────────────────────
 * Aerobia: con O₂ = 100 % → 38 ATP; con 0 % → 2 ATP y se acumula lactato.
 * Modelo simplificado: la fracción f de la glucosa que se oxida con O₂ rinde
 * 38 ATP y el resto 2 ATP. Anaerobia (derecha): siempre 2 ATP. */
function ComparaLado({ aerobia, playing, o2 }: { aerobia: boolean; playing: boolean; o2: number }) {
  const giro = useRef<THREE.Group>(null);
  const lac = useRef<THREE.Group>(null);
  const oxi = useRef<THREE.Group>(null);
  useFrame((st, dt) => {
    if (giro.current && playing) giro.current.rotation.y += dt * (aerobia ? 0.5 : 0.2);
    if (aerobia && lac.current) lac.current.scale.setScalar(0.0001 + (1 - o2));
    if (aerobia && oxi.current) {
      oxi.current.scale.setScalar(0.0001 + o2);
      oxi.current.rotation.z = st.clock.elapsedTime * 0.3;
    }
  });
  const atp = aerobia ? 2 + 36 * o2 : 2;
  return (
    <group>
      {aerobia ? <Capsula color="#34d399" w={4.6} h={3.0} /> : <Membrana label="" color="#a78bfa" rx={2.3} ry={1.6} />}
      <group ref={giro}>
        {aerobia ? <Mol r={0.55} color={C_GLUCOSA} forma="anillo" /> : <Mol r={0.42} color={C_PIRUVATO} forma="cadena" />}
      </group>
      {aerobia && (
        <>
          {/* O₂ disponible: esferas azules que se encogen al bajar el oxígeno */}
          <group ref={oxi}>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return <Bola key={i} r={0.2} color={C_O2} pos={[Math.cos(a) * 1.5, Math.sin(a) * 0.95, 0.2]} emi={0.15} />;
            })}
          </group>
          {/* lactato que se acumula cuando falta O₂ */}
          <group ref={lac} position={[0, -1.15, 0.3]}>
            {[-0.5, 0, 0.5].map((x) => (
              <Bola key={x} r={0.2} color={C_LACTATO} pos={[x, 0, 0]} emi={0.15} />
            ))}
          </group>
        </>
      )}
      <ATPStack count={aerobia ? 38 : 2} vis={atp / (aerobia ? 38 : 2)} playing={playing} base={[0, -3.5, 0]} cols={aerobia ? 10 : 2} tam={0.6} />
    </group>
  );
}

function Contenido({ modo, escena, playing, modoColor, resetNonce, o2 }: RespiracionSceneProps) {
  return (
    <>
      {/* Luz de tres puntos y entorno que reflejar; sin mesa: es un mundo microscópico. */}
      <Escenario acento="#38bdf8" mesa={false} niebla={false} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Polvo />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "glucolisis" && <Glucolisis frac={escena.frac} playing={playing} />}
        {modo === "aerobia" && <Aerobia frac={escena.frac} playing={playing} />}
        {modo === "fermentacion" && <Fermentacion frac={escena.frac} playing={playing} />}

        {modo === "comparar" && (
          <>
            <group position={[-4.2, 0.4, 0]}>
              <ComparaLado aerobia playing={playing} o2={o2} />
            </group>
            <Etiqueta pos={[-4.2, 2.7, 0]} color="#34d399cc">Aerobia · {Math.round(2 + 36 * o2)} ATP</Etiqueta>
            <group position={[4.2, 0.4, 0]}>
              <ComparaLado aerobia={false} playing={playing} o2={o2} />
            </group>
            <Etiqueta pos={[4.2, 2.7, 0]} color="#a78bfacc">Anaerobia · 2 ATP</Etiqueta>
          </>
        )}
      </group>

      <OrbitControls enablePan={false} minDistance={7} maxDistance={44} autoRotate={false} target={[0, -0.8, 0]} />
      <EffectComposer>
        <Bloom intensity={0.45} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export default function RespiracionScene(props: RespiracionSceneProps) {
  const cam: Pt =
    props.modo === "comparar" ? [0, 0, 14.5] : props.modo === "aerobia" ? [0, 0, 13.5] : [0, 0, 13];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 50 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
