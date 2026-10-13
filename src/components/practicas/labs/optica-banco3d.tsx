"use client";

/**
 * KIT DEL BANCO ÓPTICO — piezas 3D del laboratorio de óptica (CNEYT-V-P06).
 *
 * Todo lo que tiene un banco de óptica de verdad: riel de aluminio anodizado
 * con escala grabada, jinetes que se deslizan, lente de vidrio óptico tallada
 * según su distancia focal, espejos metálicos esféricos (radio = 2f exacto),
 * una vela con llama viva, una pantalla translúcida que muestra la imagen
 * nítida SOLO en dᵢ, y los rayos como haces láser volumétricos instanciados.
 *
 * Reglas que se respetan aquí:
 *  · Nada de `new THREE.X` dentro de `useFrame` (se reutilizan refs/memos).
 *  · Haces: UNA malla instanciada por grupo de rayos, no una malla por tramo.
 *  · El vidrio con `transmission` sólo deja ver lo opaco (ver `_vidrio.tsx`):
 *    por eso los haces que cruzan la lente se dibujan sin prueba de profundidad.
 *  · Etiquetas con `<Html>` (nunca `<Text>` de drei).
 */

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { VIDRIO, VIDRIO_FINO, METAL } from "./_vidrio";

export type Pt = [number, number, number];

/* ── Escala y medidas del banco ───────────────────────────────────────────── */
/** Unidades de escena por «u» (misma escala en x y y: los círculos son círculos). */
export const S = 0.8;
export const SUELO = -3.2;
export const RIEL_Y = -2.05;      // cara superior del riel
export const X_RIEL = 8.6;        // semilargo del riel
export const PANT_H = 3.0;        // alto de la pantalla
export const PANT_W = 2.3;        // ancho de la pantalla
export const X_FIN = 8.4;         // hasta dónde se dibujan los rayos
export const Y_LIM = 3.1;

/* ── Materiales con nombre ────────────────────────────────────────────────── */
export const ANODIZADO_NEGRO = { color: "#1b2129", roughness: 0.42, metalness: 0.65, envMapIntensity: 1 } as const;
export const ALUMINIO = { color: "#b4bec9", roughness: 0.3, metalness: 0.85, envMapIntensity: 1.15 } as const;
export const LATON = { color: "#c09a5b", roughness: 0.28, metalness: 0.95, envMapIntensity: 1.2 } as const;

/* ── Texturas generadas una sola vez ──────────────────────────────────────── */
let _resplandor: THREE.CanvasTexture | null = null;
/** Mancha radial suave para brillos (llama, chispa del láser, pulsos). */
export function texturaBrillo(): THREE.CanvasTexture {
  if (_resplandor) return _resplandor;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.75)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  _resplandor = new THREE.CanvasTexture(c);
  _resplandor.colorSpace = THREE.SRGBColorSpace;
  return _resplandor;
}

let _reflejo: THREE.CanvasTexture | null = null;
/** Franjas diagonales suaves: el reflejo de una ventana en un cristal. */
function texturaReflejo(): THREE.CanvasTexture {
  if (_reflejo) return _reflejo;
  const N = 256;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  g.translate(N / 2, N / 2);
  g.rotate(-Math.PI / 4);
  const banda = (x: number, w: number, a: number) => {
    const grad = g.createLinearGradient(x - w, 0, x + w, 0);
    grad.addColorStop(0, "rgba(200,225,255,0)");
    grad.addColorStop(0.5, `rgba(220,236,255,${a})`);
    grad.addColorStop(1, "rgba(200,225,255,0)");
    g.fillStyle = grad;
    g.fillRect(x - w, -N, 2 * w, 2 * N);
  };
  banda(-38, 26, 0.32);
  banda(10, 10, 0.2);
  banda(60, 34, 0.1);
  _reflejo = new THREE.CanvasTexture(c);
  _reflejo.colorSpace = THREE.SRGBColorSpace;
  return _reflejo;
}

let _escala: THREE.CanvasTexture | null = null;
/** La escala grabada del riel: marca cada 0.1 u, número cada 1 u desde la lente. */
function texturaEscala(): THREE.CanvasTexture {
  if (_escala) return _escala;
  const W = 4096, H = 112;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const fondo = g.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, "#2a3038");
  fondo.addColorStop(1, "#1d2229");
  g.fillStyle = fondo;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#e8edf2";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.font = "700 40px system-ui, sans-serif";
  for (let i = -105; i <= 105; i++) {
    const u = i / 10;
    const x = ((u * S + X_RIEL) / (2 * X_RIEL)) * W;
    const mayor = i % 10 === 0;
    const medio = i % 5 === 0;
    const alto = mayor ? 54 : medio ? 36 : 20;
    g.fillRect(x - (mayor ? 2.5 : 1.5), 0, mayor ? 5 : 3, alto);
    if (mayor) g.fillText(String(Math.abs(u)), x, H - 10);
  }
  _escala = new THREE.CanvasTexture(c);
  _escala.colorSpace = THREE.SRGBColorSpace;
  _escala.anisotropy = 8;
  return _escala;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * HACES LÁSER VOLUMÉTRICOS (instanciados)
 * Cilindro abierto con un sombreador de caída suave: núcleo casi blanco y halo
 * del color del láser. Mezcla aditiva: el brillo se suma como luz de verdad.
 * ═══════════════════════════════════════════════════════════════════════════ */
export interface Seg { a: Pt; b: Pt; col: string; k?: number; r?: number }

const GEO_HAZ = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);

const VERT_HAZ = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vCol;
void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  #ifdef USE_INSTANCING_COLOR
    vCol = instanceColor;
  #else
    vCol = vec3(1.0);
  #endif
  vec4 mv = modelViewMatrix * p;
  vN = normalize(normalMatrix * n);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG_HAZ = /* glsl */ `
uniform float uGanancia;
varying vec3 vN;
varying vec3 vV;
varying vec3 vCol;
void main() {
  float f = abs(dot(normalize(vN), normalize(vV)));
  float halo = pow(f, 2.4);
  float nucleo = pow(f, 22.0);
  float lum = max(max(vCol.r, vCol.g), vCol.b);
  vec3 c = vCol * halo * 1.15 + vec3(1.0, 0.98, 0.94) * nucleo * lum * 1.6;
  gl_FragColor = vec4(c * uGanancia, 1.0);
}`;

export function Haces({ segs, depthTest = true, orden = 20, ganancia = 1 }: {
  segs: Seg[]; depthTest?: boolean; orden?: number; ganancia?: number;
}) {
  const cap = Math.pow(2, Math.ceil(Math.log2(Math.max(8, segs.length))));
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT_HAZ,
    fragmentShader: FRAG_HAZ,
    uniforms: { uGanancia: { value: 1 } },
    transparent: true,
    depthWrite: false,
    depthTest,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  }), [depthTest]);
  useEffect(() => () => mat.dispose(), [mat]);

  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), up: new THREE.Vector3(0, 1, 0), d: new THREE.Vector3() }), []);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    if (!m.instanceColor) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    const { o, c, up, d } = tmp;
    let n = 0;
    for (const s of segs) {
      d.set(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]);
      const len = d.length();
      if (len < 1e-4) continue;
      o.position.set((s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2, (s.a[2] + s.b[2]) / 2);
      o.quaternion.setFromUnitVectors(up, d.multiplyScalar(1 / len));
      const r = s.r ?? 0.075;
      o.scale.set(r, len, r);
      o.updateMatrix();
      m.setMatrixAt(n, o.matrix);
      c.set(s.col).multiplyScalar((s.k ?? 1) * ganancia);
      m.setColorAt(n, c);
      n++;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [segs, cap, tmp, ganancia]);

  return <instancedMesh key={cap} ref={ref} args={[GEO_HAZ, mat, cap]} frustumCulled={false} renderOrder={orden} />;
}

/** Corta un tramo en guiones (prolongaciones virtuales). */
export function discontinuo(a: Pt, b: Pt, col: string, k = 0.5, guion = 0.17, hueco = 0.13): Seg[] {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const L = Math.hypot(dx, dy, dz);
  if (L < 1e-4) return [];
  const out: Seg[] = [];
  for (let s = 0; s < L; s += guion + hueco) {
    const e = Math.min(L, s + guion);
    out.push({ a: [a[0] + (dx * s) / L, a[1] + (dy * s) / L, a[2] + (dz * s) / L], b: [a[0] + (dx * e) / L, a[1] + (dy * e) / L, a[2] + (dz * e) / L], col, k, r: 0.05 });
  }
  return out;
}

/** Une una polilínea en tramos de haz. */
export function polilinea(pts: Pt[], col: string, k = 1, r?: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 1; i < pts.length; i++) out.push({ a: pts[i - 1]!, b: pts[i]!, col, k, r });
  return out;
}

/* ── Pulso de luz que recorre un camino ───────────────────────────────────── */
export function Pulso({ path, color, playing, speed = 3, depthTest = true, tam = 0.42 }: {
  path: Pt[]; color: string; playing: boolean; speed?: number; depthTest?: boolean; tam?: number;
}) {
  const ref = useRef<THREE.Sprite>(null);
  const dRef = useRef(0);
  const total = useMemo(() => {
    let t = 0;
    for (let i = 1; i < path.length; i++) t += Math.hypot(path[i]![0] - path[i - 1]![0], path[i]![1] - path[i - 1]![1], path[i]![2] - path[i - 1]![2]);
    return t;
  }, [path]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m || path.length < 2 || total < 1e-4) return;
    if (playing) dRef.current = (dRef.current + Math.min(dt, 0.05) * speed) % total;
    let d = dRef.current;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!, b = path[i]!;
      const seg = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (d <= seg) {
        const t = seg < 1e-6 ? 0 : d / seg;
        m.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
        return;
      }
      d -= seg;
    }
  });
  return (
    <sprite ref={ref} scale={[tam, tam, 1]} renderOrder={30}>
      <spriteMaterial map={texturaBrillo()} color={color} transparent depthWrite={false} depthTest={depthTest} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

/** Brillo puntual (chispa donde el haz toca algo). */
export function Chispa({ pos, color, tam = 0.5, k = 1, depthTest = true }: { pos: Pt; color: string; tam?: number; k?: number; depthTest?: boolean }) {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(k), [color, k]);
  return (
    <sprite position={pos} scale={[tam, tam, 1]} renderOrder={31}>
      <spriteMaterial map={texturaBrillo()} color={c} transparent depthWrite={false} depthTest={depthTest} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * EL RIEL Y LOS JINETES
 * ═══════════════════════════════════════════════════════════════════════════ */
export function Riel() {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.45, -0.36);
    sh.lineTo(0.45, -0.36);
    sh.lineTo(0.45, -0.05);
    sh.lineTo(0.4, 0);
    sh.lineTo(0.13, 0);
    sh.lineTo(0.07, -0.09);
    sh.lineTo(-0.07, -0.09);
    sh.lineTo(-0.13, 0);
    sh.lineTo(-0.4, 0);
    sh.lineTo(-0.45, -0.05);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 2 * X_RIEL, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 2 });
    g.rotateY(Math.PI / 2);
    g.translate(-X_RIEL, RIEL_Y, 0);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const altoPata = RIEL_Y - 0.36 - SUELO;
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      {/* Escala grabada en la cara frontal */}
      <mesh position={[0, RIEL_Y - 0.19, 0.452]}>
        <planeGeometry args={[2 * X_RIEL, 0.24]} />
        <meshStandardMaterial map={texturaEscala()} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* Patas con niveladores */}
      {[-1, 1].map((sg) => (
        <group key={sg} position={[sg * (X_RIEL - 0.8), 0, 0]}>
          <mesh position={[0, SUELO + altoPata / 2 + 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, altoPata - 0.12, 1.6]} />
            <meshStandardMaterial {...ANODIZADO_NEGRO} />
          </mesh>
          {[-0.62, 0.62].map((z) => (
            <mesh key={z} position={[0, SUELO + 0.05, z]} castShadow>
              <cylinderGeometry args={[0.13, 0.15, 0.1, 20]} />
              <meshStandardMaterial color="#0d1014" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Jinete: carro que abraza el riel, perilla de apriete, índice rojo y poste cromado hasta `tope`. */
export function Jinete({ x, tope, children }: { x: number; tope: number; children?: React.ReactNode }) {
  const y0 = RIEL_Y + 0.28;
  const alto = Math.max(0.05, tope - y0);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, RIEL_Y + 0.13, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.3, 1.02]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      {/* perilla moleteada */}
      <mesh position={[0, RIEL_Y + 0.13, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 18]} />
        <meshStandardMaterial color="#2a313b" roughness={0.55} metalness={0.4} />
      </mesh>
      {/* índice que marca la escala */}
      <mesh position={[0, RIEL_Y - 0.1, 0.475]}>
        <boxGeometry args={[0.045, 0.2, 0.02]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      {/* collarín y poste */}
      <mesh position={[0, y0 + 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.24, 20]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      <mesh position={[0, y0 + alto / 2, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, alto, 16]} />
        <meshStandardMaterial {...METAL} color="#d6dde5" roughness={0.18} />
      </mesh>
      {children}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LENTE DE VIDRIO ÓPTICO
 * Biconvexa o bicóncava, torneada con su perfil esférico real. Más curva
 * (más gruesa) cuanto más corto el foco; borde biselado que atrapa el reflejo.
 * ═══════════════════════════════════════════════════════════════════════════ */
export function perfilLente(fU: number, convergente: boolean, A: number): { pts: THREE.Vector2[]; grosor: number } {
  const R = 2.6 + (Math.abs(fU) - 1.2) * 1.6;
  const sag = R - Math.sqrt(Math.max(0, R * R - A * A));
  const e = convergente ? 0.06 : 0.07; // grosor mínimo (borde o centro)
  const N = 22;
  const sup = (r: number) => R - Math.sqrt(Math.max(0, R * R - r * r)); // hundimiento a radio r
  const media = (r: number) => (convergente ? e / 2 + (sag - sup(r)) : e / 2 + sup(r));
  const pts: THREE.Vector2[] = [];
  // cara trasera (y negativa), del eje al borde
  for (let i = 0; i <= N; i++) {
    const r = (A - 0.03) * (i / N);
    pts.push(new THREE.Vector2(r, -media(r)));
  }
  // bisel
  const yb = media(A);
  pts.push(new THREE.Vector2(A, -yb + 0.015));
  pts.push(new THREE.Vector2(A, yb - 0.015));
  for (let i = N; i >= 0; i--) {
    const r = (A - 0.03) * (i / N);
    pts.push(new THREE.Vector2(r, media(r)));
  }
  return { pts, grosor: convergente ? e + 2 * sag : e };
}

export function Lente3D({ fU, convergente, A, fino = false }: { fU: number; convergente: boolean; A: number; fino?: boolean }) {
  const { geo, grosor } = useMemo(() => {
    const p = perfilLente(fU, convergente, A);
    const g = new THREE.LatheGeometry(p.pts, 72);
    g.rotateZ(-Math.PI / 2);
    g.computeVertexNormals();
    return { geo: g, grosor: p.grosor };
  }, [fU, convergente, A]);
  useEffect(() => () => geo.dispose(), [geo]);
  const vid = fino ? VIDRIO_FINO : VIDRIO;
  return (
    <group>
      <mesh geometry={geo} renderOrder={5}>
        <meshPhysicalMaterial
          {...vid}
          ior={1.52}
          thickness={Math.max(0.2, grosor)}
          color="#eaf8ff"
          attenuationColor="#cdeffc"
          attenuationDistance={5}
          dispersion={0.4}
          iridescence={0.18}
          iridescenceIOR={1.32}
          specularIntensity={1}
          envMapIntensity={1.8}
        />
      </mesh>
      {/* Montura: aro anodizado */}
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[A + 0.05, 0.06, 14, 72]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      <mesh position={[0, -A - 0.12, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ESPEJOS: plano, cóncavo y convexo. Casquete esférico de radio R = 2f exacto.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type TipoEspejo3D = "plano" | "concavo" | "convexo";

/** Posición x de la superficie del espejo a la altura y (vértice en x = 0). */
export function superficieEspejo(tipo: TipoEspejo3D, Rs: number, y: number): number {
  if (tipo === "plano" || !isFinite(Rs)) return 0;
  const s = Rs - Math.sqrt(Math.max(0, Rs * Rs - y * y));
  return tipo === "concavo" ? -s : s;
}

export function Espejo3D({ tipo, Rs, A, envMap = null }: { tipo: TipoEspejo3D; Rs: number; A: number; envMap?: THREE.Texture | null }) {
  const geos = useMemo(() => {
    if (tipo === "plano") return null;
    const th = Math.asin(Math.min(0.999, A / Rs));
    const cara = new THREE.SphereGeometry(Rs, 72, 22, 0, Math.PI * 2, 0, th);
    const thB = Math.asin(Math.min(0.999, (A + 0.04) / (Rs + (tipo === "concavo" ? 0.07 : -0.07))));
    const dorso = new THREE.SphereGeometry(Rs + (tipo === "concavo" ? 0.07 : -0.07), 72, 22, 0, Math.PI * 2, 0, thB);
    const rot = tipo === "concavo" ? -Math.PI / 2 : Math.PI / 2;
    cara.rotateZ(rot);
    dorso.rotateZ(rot);
    const cx = tipo === "concavo" ? -Rs : Rs;
    cara.translate(cx, 0, 0);
    dorso.translate(cx, 0, 0);
    return { cara, dorso };
  }, [tipo, Rs, A]);
  useEffect(() => () => { geos?.cara.dispose(); geos?.dorso.dispose(); }, [geos]);
  const xBorde = superficieEspejo(tipo, Rs, A);
  return (
    <group>
      {geos ? (
        <>
          <mesh geometry={geos.cara}>
            <meshPhysicalMaterial color="#aebdcb" metalness={1} roughness={0.05} envMap={envMap} envMapIntensity={envMap ? 1.1 : 2} clearcoat={1} clearcoatRoughness={0.02} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={geos.dorso} castShadow>
            <meshStandardMaterial color="#252b33" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[A, A, 0.04, 72]} />
            <meshPhysicalMaterial color="#aebdcb" metalness={1} roughness={0.05} envMap={envMap} envMapIntensity={envMap ? 1.1 : 2} clearcoat={1} clearcoatRoughness={0.02} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[A + 0.03, A + 0.03, 0.08, 72]} />
            <meshStandardMaterial color="#252b33" roughness={0.6} metalness={0.3} />
          </mesh>
        </>
      )}
      {/* Brillo del cristal frontal: dos franjas diagonales tenues, lo que
          hace que el ojo lea «espejo» y no «agujero». */}
      <mesh position={[Math.min(0, xBorde) - 0.012, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={6}>
        <circleGeometry args={[A, 64]} />
        <meshBasicMaterial map={texturaReflejo()} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[xBorde + (tipo === "plano" ? 0.04 : 0), 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[A + 0.05, 0.075, 16, 72]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[xBorde + 0.04, -A - 0.12, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LA VELA (objeto). Alto total = altura del objeto H; la punta de la llama es
 * el punto del que salen los rayos principales.
 *   estilo "real"     → cera, pabilo, llama viva y su luz cálida.
 *   estilo "fantasma" → imagen virtual: holograma translúcido.
 *   estilo "aerea"    → imagen real flotando (espejo cóncavo).
 * ═══════════════════════════════════════════════════════════════════════════ */
const VERT_LLAMA = /* glsl */ `
uniform float uT;
uniform float uH;
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 p = position;
  float t = clamp(p.y / uH, 0.0, 1.0);
  float vaiven = sin(uT * 9.0 + t * 7.0) * 0.016 * t * t + sin(uT * 15.0 + 1.7) * 0.006 * t;
  p.x += vaiven;
  p.z += cos(uT * 11.0 + t * 5.0) * 0.008 * t * t;
  p.y *= 1.0 + 0.05 * sin(uT * 13.0) + 0.03 * sin(uT * 7.3 + 1.0);
  vY = t;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG_LLAMA = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uCuerpo;
uniform vec3 uPunta;
uniform float uBrillo;
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = abs(dot(normalize(vN), normalize(vV)));
  vec3 c = mix(uBase, uCuerpo, smoothstep(0.02, 0.28, vY));
  c = mix(c, uPunta, smoothstep(0.55, 1.0, vY));
  float a = pow(f, 1.6) * (1.0 - smoothstep(0.82, 1.0, vY) * 0.6);
  gl_FragColor = vec4(c * a * uBrillo, 1.0);
}`;

function perfilLlama(h: number, rmax: number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const N = 24;
  const gmax = Math.pow(0.379, 0.55) * Math.pow(1 - 0.379, 0.9);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const g = Math.pow(t, 0.55) * Math.pow(1 - t, 0.9);
    pts.push(new THREE.Vector2(Math.max(0.0005, (rmax * g) / gmax), t * h));
  }
  return pts;
}

export function Vela({ H, estilo = "real", playing = true, luz = true }: { H: number; estilo?: "real" | "fantasma" | "aerea"; playing?: boolean; luz?: boolean }) {
  const ceraAlto = 0.6 * H;
  const llamaBase = 0.62 * H;
  const llamaAlto = H - llamaBase;
  const rCera = 0.13;

  const geoCera = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0), new THREE.Vector2(rCera - 0.006, 0), new THREE.Vector2(rCera, 0.012),
      new THREE.Vector2(rCera, ceraAlto - 0.012), new THREE.Vector2(rCera - 0.012, ceraAlto),
      new THREE.Vector2(rCera * 0.55, ceraAlto - 0.018), new THREE.Vector2(0, ceraAlto - 0.024),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, [ceraAlto]);
  const geoLlama = useMemo(() => new THREE.LatheGeometry(perfilLlama(llamaAlto, 0.068), 28), [llamaAlto]);
  const geoNucleo = useMemo(() => new THREE.LatheGeometry(perfilLlama(llamaAlto * 0.62, 0.036), 20), [llamaAlto]);
  useEffect(() => () => { geoCera.dispose(); geoLlama.dispose(); geoNucleo.dispose(); }, [geoCera, geoLlama, geoNucleo]);

  const fantasma = estilo === "fantasma";
  const matLlama = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT_LLAMA, fragmentShader: FRAG_LLAMA,
    uniforms: {
      uT: { value: 0 }, uH: { value: llamaAlto },
      uBase: { value: new THREE.Color(fantasma ? "#3a7bd5" : "#2f5cff") },
      uCuerpo: { value: new THREE.Color(fantasma ? "#9fe8ff" : "#ffb347") },
      uPunta: { value: new THREE.Color(fantasma ? "#5fd0ff" : "#ff6a12") },
      uBrillo: { value: fantasma ? 0.9 : 2.2 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), [llamaAlto, fantasma]);
  const matNucleo = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT_LLAMA, fragmentShader: FRAG_LLAMA,
    uniforms: {
      uT: { value: 0 }, uH: { value: llamaAlto * 0.62 },
      uBase: { value: new THREE.Color(fantasma ? "#6aa8ff" : "#4466ff") },
      uCuerpo: { value: new THREE.Color(fantasma ? "#e6fbff" : "#fff3c4") },
      uPunta: { value: new THREE.Color(fantasma ? "#c6f4ff" : "#ffd27a") },
      uBrillo: { value: fantasma ? 1 : 2.6 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), [llamaAlto, fantasma]);
  useEffect(() => () => { matLlama.dispose(); matNucleo.dispose(); }, [matLlama, matNucleo]);

  const luzRef = useRef<THREE.PointLight>(null);
  const llamaRef = useRef<THREE.Mesh>(null);
  const nucleoRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);
  useFrame((_, dt) => {
    if (playing) tRef.current += Math.min(dt, 0.05);
    const t = tRef.current;
    for (const m of [llamaRef.current, nucleoRef.current]) {
      const u = (m?.material as THREE.ShaderMaterial | undefined)?.uniforms;
      if (u?.uT) u.uT.value = t;
    }
    if (luzRef.current) luzRef.current.intensity = 2.4 * (1 + 0.12 * Math.sin(t * 13) + 0.08 * Math.sin(t * 7.3 + 1));
  });

  return (
    <group>
      {estilo === "real" && (
        <mesh geometry={geoCera} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f4e8d4" roughness={0.48} sheen={0.6} sheenColor="#ffd3a1" emissive="#ff8a3d" emissiveIntensity={0.07} clearcoat={0.2} />
        </mesh>
      )}
      {estilo === "aerea" && (
        <mesh geometry={geoCera}>
          <meshStandardMaterial color="#f4e8d4" emissive="#ffb070" emissiveIntensity={0.35} roughness={0.6} transparent opacity={0.8} />
        </mesh>
      )}
      {fantasma && (
        <mesh geometry={geoCera} renderOrder={8}>
          <meshBasicMaterial color="#7fd6ff" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      )}
      {/* pabilo */}
      <mesh position={[0, ceraAlto + 0.02, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.06, 6]} />
        <meshStandardMaterial color={fantasma ? "#5fb8e0" : "#1b1410"} roughness={0.9} transparent={fantasma} opacity={fantasma ? 0.4 : 1} />
      </mesh>
      <group position={[0, llamaBase, 0]}>
        <mesh ref={llamaRef} geometry={geoLlama} material={matLlama} renderOrder={9} />
        <mesh ref={nucleoRef} geometry={geoNucleo} material={matNucleo} renderOrder={10} position={[0, 0.005, 0]} />
        <sprite position={[0, llamaAlto * 0.42, 0]} scale={[0.75, 0.95, 1]} renderOrder={11}>
          <spriteMaterial map={texturaBrillo()} color={fantasma ? "#3aa0ff" : "#ff9a3c"} transparent opacity={fantasma ? 0.35 : 0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      </group>
      {estilo === "real" && luz && (
        <pointLight ref={luzRef} position={[0, llamaBase + llamaAlto * 0.4, 0.05]} color="#ffb46b" intensity={2.4} distance={4.5} decay={2} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PANTALLA TRANSLÚCIDA
 * El sombreador dibuja la vela tal como la deja la lente en la pantalla:
 * escalada por −dₚ/dₒ (invertida) y emborronada con el círculo de desenfoque
 * A·|1 − dₚ/dᵢ|. En dₚ = dᵢ el desenfoque es cero y la llama sale nítida.
 * ═══════════════════════════════════════════════════════════════════════════ */
const VERT_PANT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const FRAG_PANT = /* glsl */ `
uniform float uEscala;
uniform float uBlur;
uniform float uH;
uniform float uT;
uniform vec2 uTam;
varying vec2 vUv;
float sdCaja(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float azar(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 p = (vUv - 0.5) * uTam;
  float s = uEscala;
  float as = max(abs(s), 1e-3);
  vec2 q = p / s;
  float H = uH;
  float parpadeo = 1.0 + 0.05 * sin(uT * 13.0) + 0.03 * sin(uT * 7.3 + 1.0);
  float dC = sdCaja(q - vec2(0.0, 0.3 * H), vec2(0.148, 0.3 * H)) * as;
  vec2 f = q - vec2(0.0, 0.73 * H);
  float ry = f.y > 0.0 ? 0.27 * H * parpadeo : 0.11 * H;
  float kx = f.y > 0.0 ? mix(1.0, 2.4, clamp(f.y / (0.27 * H), 0.0, 1.0)) : 1.0;
  float rx = 0.078;
  float dF = (length(vec2(f.x * kx / rx, f.y / ry)) - 1.0) * min(rx, ry) * as;
  float e = 0.004 + uBlur;
  float cC = smoothstep(e, -e, dC);
  float cF = smoothstep(e, -e, dF);
  float wC = 0.148 * as, hC = 0.3 * H * as, wF = rx * as, hF = 0.19 * H * as;
  // Energía repartida en la mancha; raíz = cómo la percibe el ojo (se adapta).
  float kC = sqrt((wC / (wC + uBlur)) * (hC / (hC + uBlur)));
  float kF = sqrt((wF / (wF + uBlur)) * (hF / (hF + uBlur)));
  float nucleo = smoothstep(0.0, -0.55 * min(rx, ry) * as - uBlur, dF);
  vec3 colF = mix(vec3(1.0, 0.42, 0.06), vec3(1.0, 0.93, 0.7), nucleo);
  float dist = length(p - vec2(0.0, 0.76 * H * s));
  float halo = exp(-dist * dist / (0.06 * as * as + 2.0 * uBlur * uBlur + 0.002)) * 0.22 * min(1.0, as + 0.2);
  vec3 papel = vec3(0.86, 0.84, 0.79) * (0.085 + 0.02 * azar(floor(vUv * vec2(230.0, 300.0))));
  vec2 b = abs(vUv - 0.5) * 2.0;
  float vig = 1.0 - 0.35 * pow(max(b.x, b.y), 6.0);
  vec3 c = papel * vig + vec3(0.95, 0.78, 0.55) * 0.42 * cC * kC + colF * 3.4 * cF * kF + vec3(1.0, 0.6, 0.25) * halo;
  gl_FragColor = vec4(c, 1.0);
}`;

export function Pantalla({ escala, blur, H, playing }: { escala: number; blur: number; H: number; playing: boolean }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT_PANT, fragmentShader: FRAG_PANT,
    uniforms: { uEscala: { value: -1 }, uBlur: { value: 0 }, uH: { value: H }, uT: { value: 0 }, uTam: { value: new THREE.Vector2(PANT_W, PANT_H) } },
    side: THREE.DoubleSide, toneMapped: false,
  }), [H]);
  useEffect(() => () => mat.dispose(), [mat]);
  // Transición suave del desenfoque (como girar la perilla del jinete).
  const blurRef = useRef(blur);
  const tRef = useRef(0);
  const planoRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (playing) tRef.current += d;
    blurRef.current = THREE.MathUtils.damp(blurRef.current, blur, 10, d);
    const u = (planoRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
    if (!u) return;
    u.uBlur!.value = blurRef.current;
    u.uEscala!.value = escala;
    u.uT!.value = tRef.current;
  });
  const marco = 0.07;
  return (
    <group>
      <mesh ref={planoRef} rotation={[0, -Math.PI / 2, 0]} material={mat}>
        <planeGeometry args={[PANT_W, PANT_H]} />
      </mesh>
      {/* marco */}
      {[PANT_H / 2 + marco / 2, -PANT_H / 2 - marco / 2].map((y, i) => (
        <mesh key={`h${i}`} position={[0.02, y, 0]} castShadow>
          <boxGeometry args={[0.1, marco, PANT_W + 2 * marco]} />
          <meshStandardMaterial {...ANODIZADO_NEGRO} />
        </mesh>
      ))}
      {[-1, 1].map((sg) => (
        <mesh key={`v${sg}`} position={[0.02, 0, sg * (PANT_W / 2 + marco / 2)]} castShadow>
          <boxGeometry args={[0.1, PANT_H + 2 * marco, marco]} />
          <meshStandardMaterial {...ANODIZADO_NEGRO} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Cuenta de foco sobre el eje ──────────────────────────────────────────── */
export function MarcaFoco({ x, color = "#fbbf24", tenue = false }: { x: number; color?: string; tenue?: boolean }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <sphereGeometry args={[tenue ? 0.05 : 0.075, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={tenue ? 0.6 : 1.4} roughness={0.3} />
      </mesh>
      {/* marca en la escala del riel */}
      <mesh position={[0, RIEL_Y + 0.004, 0.27]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 0.26]} />
        <meshBasicMaterial color={color} transparent opacity={tenue ? 0.5 : 0.9} />
      </mesh>
    </group>
  );
}

/* ── Etiqueta HTML: tamaño fijo (≥ 14 px); `ancha` se oculta en celular ──── */
export function Etiqueta({ pos, color, children, ancha = false, borde = true }: {
  pos: Pt; color: string; children: React.ReactNode; ancha?: boolean; borde?: boolean;
}) {
  const ancho = useThree((st) => st.size.width);
  if (ancha && ancho < 640) return null;
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{
        whiteSpace: "nowrap", textAlign: "center", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.86)",
        border: borde ? `1.5px solid ${color}` : "1.5px solid rgba(255,255,255,0.12)", color, fontWeight: 900, fontSize: 14,
        fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      }}>
        {children}
      </div>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CÁMARA GUIADA
 * Viaja con suavidad hacia el encuadre de cada modo y sigue la acción cuando
 * el alumno mueve algo; en cuanto el alumno arrastra la escena, le cede el
 * control (OrbitControls) hasta el siguiente cambio.
 * ═══════════════════════════════════════════════════════════════════════════ */
export const FOV = 38;
const TAN_V = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

export function encuadrar(xmin: number, xmax: number, ymin: number, ymax: number, aspect: number, z = 0): { objetivo: Pt; distancia: number } {
  const mx = (xmax - xmin) / 2, my = (ymax - ymin) / 2;
  const estrecho = aspect < 1;
  const d = Math.max(my / (TAN_V * (estrecho ? 0.5 : 0.66)), mx / (TAN_V * 0.94 * aspect));
  // Corrimiento: el contenido queda entre la barra de arriba y la misión de abajo.
  // En celular la leyenda tapa la franja de arriba: el contenido baja un poco.
  const corr = (estrecho ? -0.03 : 0.085) * 2 * d * TAN_V;
  return { objetivo: [(xmin + xmax) / 2, (ymin + ymax) / 2 - corr, z], distancia: d };
}

export function Guia({ objetivo, distancia, dir, claveVista }: { objetivo: Pt; distancia: number; dir: Pt; claveVista: string }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const resta = useRef(0);
  const clave = useRef("");
  const vista = useRef("");
  const reorientar = useRef(false);
  const iniciada = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const meta = useMemo(() => new THREE.Vector3(), []);
  const haciaDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!controls) return undefined;
    const soltar = () => { resta.current = 0; reorientar.current = false; };
    controls.addEventListener("start", soltar);
    return () => controls.removeEventListener("start", soltar);
  }, [controls]);

  useFrame((_, dtRaw) => {
    if (!controls) return;
    const dt = Math.min(dtRaw, 0.1);
    if (!iniciada.current) {
      // Entrada: la cámara llega desde más lejos y más alto.
      iniciada.current = true;
      tmp.set(dir[0] * 1.6, dir[1] + 0.5, dir[2]).normalize().multiplyScalar(distancia * 1.7);
      controls.target.set(...objetivo);
      camera.position.copy(controls.target).add(tmp);
    }
    if (claveVista !== vista.current) { vista.current = claveVista; reorientar.current = true; resta.current = 2.4; }
    const k = `${objetivo.map((x) => x.toFixed(2)).join()}|${distancia.toFixed(2)}`;
    if (k !== clave.current) { clave.current = k; resta.current = Math.max(resta.current, 1.6); }
    if (resta.current <= 0) return;
    resta.current -= dt;
    meta.set(...objetivo);
    tmp.copy(camera.position).sub(controls.target);
    controls.target.lerp(meta, 1 - Math.exp(-dt * 3.2));
    const largo = THREE.MathUtils.damp(tmp.length(), distancia, 3, dt);
    if (reorientar.current) {
      haciaDir.set(...dir).normalize();
      tmp.normalize().lerp(haciaDir, 1 - Math.exp(-dt * 2.6)).normalize();
      if (resta.current <= 0.05) reorientar.current = false;
    }
    tmp.setLength(largo);
    camera.position.copy(controls.target).add(tmp);
    controls.update();
  });
  return null;
}
