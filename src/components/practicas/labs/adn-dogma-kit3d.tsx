"use client";

/**
 * Piezas 3D del laboratorio del dogma central (CNEYT-VI-P04).
 *
 * Todo lo que se repite va INSTANCIADO y se escribe en cada cuadro sin pedir
 * memoria: un `Pincel` recibe nucleótidos (placa de la base + cuenta de
 * fosfato) y puentes de hidrógeno y los vuelca en tres `InstancedMesh`; un
 * `TuboDinamico` es el esqueleto azúcar-fosfato, una malla de topología fija
 * cuyos vértices se reescriben (centro, radio y color por muestra), así la
 * horquilla puede abrirse y una hebra nueva puede ir creciendo sin reconstruir
 * geometría. Las enzimas son superficies «moleculares» (icosaedro deformado con
 * ruido) cortadas por el lado que mira a la cámara, como en las animaciones de
 * divulgación: se ve el ADN pasando por dentro.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RoundedBoxGeometry, mergeVertices } from "three-stdlib";

/* ── Utilidades numéricas (sin memoria) ────────────────────────────────── */
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** smoothstep que acepta bordes invertidos (e0 > e1 → descendente). */
export function suave(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Pseudoaleatorio estable por entero (para que cada nucleótido tenga «su» origen). */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ── Escalas de cada pieza ─────────────────────────────────────────────── */
export const R_CUENTA = 0.17; // fosfato
export const R_TUBO = 0.125; // esqueleto
export const ANCHO_PLACA = 0.34;
export const GROSOR_PLACA = 0.12;

/* Scratch del módulo: nunca se crean objetos dentro de useFrame. */
const _m = new THREE.Matrix4();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _c = new THREE.Color();
const _aux = new THREE.Vector3();

/** Matriz desde una base (X = largo, Z ≈ normal de la placa), ortonormalizada. */
function matrizBase(px: number, py: number, pz: number, ux: number, uy: number, uz: number, ax: number, ay: number, az: number, sx: number, sy: number, sz: number) {
  _x.set(ux, uy, uz).normalize();
  _z.set(ax, ay, az);
  _y.crossVectors(_z, _x);
  if (_y.lengthSq() < 1e-6) {
    _aux.set(0, 1, 0);
    if (Math.abs(_x.y) > 0.9) _aux.set(1, 0, 0);
    _y.crossVectors(_aux, _x);
  }
  _y.normalize();
  _z.crossVectors(_x, _y).normalize();
  _m.makeBasis(_x, _y, _z);
  _q.setFromRotationMatrix(_m);
  _p.set(px, py, pz);
  _s.set(sx, sy, sz);
  _m.compose(_p, _q, _s);
  return _m;
}

/* ── Pincel: nucleótidos y puentes instanciados ─────────────────────────── */
export class Pincel {
  placas: THREE.InstancedMesh | null = null;
  cuentas: THREE.InstancedMesh | null = null;
  puentes: THREE.InstancedMesh | null = null;
  np = 0;
  nc = 0;
  nh = 0;
  constructor(public cap: number) {}

  /** Recibe la malla instanciada (ref de React) y le prepara los colores. */
  enganchar(tipo: "placas" | "cuentas" | "puentes", m: THREE.InstancedMesh | null) {
    this[tipo] = m;
    prepararInstancias(m, tipo === "puentes" ? this.cap * 3 : this.cap);
  }

  inicio() {
    this.np = 0;
    this.nc = 0;
    this.nh = 0;
  }

  /**
   * Un nucleótido: cuenta de fosfato en P y placa de la base que sale de P en
   * dirección u (hacia su pareja), con la cara perpendicular a `a` (eje local).
   */
  nucleotido(px: number, py: number, pz: number, ux: number, uy: number, uz: number, ax: number, ay: number, az: number, largo: number, col: THREE.Color, escala = 1, cuenta: THREE.Color | null = null) {
    if (escala <= 0.001) return;
    const L = Math.hypot(ux, uy, uz) || 1;
    const nx = ux / L, ny = uy / L, nz = uz / L;
    const off = R_CUENTA * 0.55 + largo / 2;
    if (this.placas && this.np < this.cap) {
      matrizBase(px + nx * off * escala, py + ny * off * escala, pz + nz * off * escala, nx, ny, nz, ax, ay, az, largo * escala, ANCHO_PLACA * escala, GROSOR_PLACA * escala);
      this.placas.setMatrixAt(this.np, _m);
      this.placas.setColorAt(this.np, col);
      this.np++;
    }
    if (cuenta && this.cuentas && this.nc < this.cap) {
      _p.set(px, py, pz);
      _s.setScalar(R_CUENTA * escala);
      _q.identity();
      _m.compose(_p, _q, _s);
      this.cuentas.setMatrixAt(this.nc, _m);
      this.cuentas.setColorAt(this.nc, cuenta);
      this.nc++;
    }
  }

  /** Solo una cuenta (fosfato suelto, aminoácido, etc.). */
  esfera(px: number, py: number, pz: number, radio: number, col: THREE.Color) {
    if (!this.cuentas || this.nc >= this.cap || radio <= 0.001) return;
    _p.set(px, py, pz);
    _s.setScalar(radio);
    _q.identity();
    _m.compose(_p, _q, _s);
    this.cuentas.setMatrixAt(this.nc, _m);
    this.cuentas.setColorAt(this.nc, col);
    this.nc++;
  }

  /** n puentes de hidrógeno (2 en A–T, 3 en G–C) entre las puntas de dos placas. */
  puentesH(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ax: number, ay: number, az: number, n: number, brillo: number) {
    if (!this.puentes || brillo <= 0.01) return;
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const L = Math.hypot(dx, dy, dz);
    if (L < 1e-4) return;
    // Y = enlace; X = ancho (perpendicular al enlace y al eje local)
    _aux.set(dx / L, dy / L, dz / L);
    _z.set(ax, ay, az);
    _x.crossVectors(_aux, _z);
    if (_x.lengthSq() < 1e-6) _x.set(0, 0, 1).cross(_aux);
    _x.normalize();
    _z.crossVectors(_x, _aux).normalize();
    _m.makeBasis(_x, _aux, _z);
    _q.setFromRotationMatrix(_m);
    for (let k = 0; k < n && this.nh < this.cap * 3; k++) {
      const o = (k - (n - 1) / 2) * 0.1;
      const cx = (x1 + x2) / 2 + _x.x * o;
      const cy = (y1 + y2) / 2 + _x.y * o;
      const cz = (z1 + z2) / 2 + _x.z * o;
      _p.set(cx, cy, cz);
      _s.set(0.028, L * 0.86, 0.028);
      _m.compose(_p, _q, _s);
      this.puentes.setMatrixAt(this.nh, _m);
      _c.setRGB(0.75 * brillo, 0.95 * brillo, 1.25 * brillo);
      this.puentes.setColorAt(this.nh, _c);
      this.nh++;
    }
  }

  fin() {
    for (const [m, n] of [[this.placas, this.np], [this.cuentas, this.nc], [this.puentes, this.nh]] as const) {
      if (!m) continue;
      m.count = n;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
}

function prepararInstancias(m: THREE.InstancedMesh | null, n: number) {
  if (!m || m.instanceColor) return;
  _c.set("#ffffff");
  for (let i = 0; i < n; i++) m.setColorAt(i, _c);
  m.count = 0;
}

/** Las tres mallas instanciadas que pinta un `Pincel`. */
export function Moleculas({ pincel, brilloCuentas = 0.8 }: { pincel: Pincel; brilloCuentas?: number }) {
  const geoPlaca = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.16), []);
  const geoCuenta = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);
  const geoPuente = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 8, 1), []);
  const cap = pincel.cap;
  return (
    <>
      <instancedMesh
        ref={(m) => pincel.enganchar("placas", m)}
        args={[geoPlaca, undefined, cap]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial roughness={0.36} metalness={0.02} clearcoat={0.55} clearcoatRoughness={0.28} sheen={0.4} sheenRoughness={0.6} />
      </instancedMesh>
      <instancedMesh
        ref={(m) => pincel.enganchar("cuentas", m)}
        args={[geoCuenta, undefined, cap]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial roughness={0.26} metalness={0.18} clearcoat={brilloCuentas} clearcoatRoughness={0.18} />
      </instancedMesh>
      <instancedMesh
        ref={(m) => pincel.enganchar("puentes", m)}
        args={[geoPuente, undefined, cap * 3]}
        frustumCulled={false}
      >
        <meshBasicMaterial />
      </instancedMesh>
    </>
  );
}

/* ── Tubo dinámico: el esqueleto azúcar-fosfato ─────────────────────────── */
const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();
const _prevN = new THREE.Vector3();

export class TuboDinamico {
  geometria: THREE.BufferGeometry;
  centros: Float32Array;
  radios: Float32Array;
  colores: Float32Array;
  private pos: Float32Array;
  private nor: Float32Array;
  private col: Float32Array;
  constructor(public S: number, public radial = 10) {
    const V = S * (radial + 1);
    this.centros = new Float32Array(S * 3);
    this.radios = new Float32Array(S);
    this.colores = new Float32Array(S * 3);
    this.pos = new Float32Array(V * 3);
    this.nor = new Float32Array(V * 3);
    this.col = new Float32Array(V * 3);
    const idx: number[] = [];
    for (let i = 0; i < S - 1; i++) {
      for (let k = 0; k < radial; k++) {
        const a = i * (radial + 1) + k;
        const b = a + radial + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("color", new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);
    this.geometria = g;
  }

  poner(i: number, x: number, y: number, z: number, r: number, col: THREE.Color) {
    const k = i * 3;
    this.centros[k] = x;
    this.centros[k + 1] = y;
    this.centros[k + 2] = z;
    this.radios[i] = r;
    this.colores[k] = col.r;
    this.colores[k + 1] = col.g;
    this.colores[k + 2] = col.b;
  }

  /** Recalcula los anillos con transporte paralelo (sin torsiones bruscas). */
  actualizar() {
    const { S, radial, centros: c, radios, colores, pos, nor, col } = this;
    _prevN.set(0, 0, 0);
    for (let i = 0; i < S; i++) {
      const a = Math.max(0, i - 1), b = Math.min(S - 1, i + 1);
      _t.set(c[b * 3]! - c[a * 3]!, c[b * 3 + 1]! - c[a * 3 + 1]!, c[b * 3 + 2]! - c[a * 3 + 2]!);
      if (_t.lengthSq() < 1e-10) _t.set(1, 0, 0);
      _t.normalize();
      if (_prevN.lengthSq() < 0.5) {
        _aux.set(0, 1, 0);
        if (Math.abs(_t.y) > 0.9) _aux.set(0, 0, 1);
        _n.crossVectors(_t, _aux).normalize();
      } else {
        _n.copy(_prevN).addScaledVector(_t, -_prevN.dot(_t));
        if (_n.lengthSq() < 1e-8) {
          _aux.set(0, 1, 0);
          if (Math.abs(_t.y) > 0.9) _aux.set(0, 0, 1);
          _n.crossVectors(_t, _aux);
        }
        _n.normalize();
      }
      _prevN.copy(_n);
      _b.crossVectors(_t, _n);
      const r = radios[i]!;
      const cx = c[i * 3]!, cy = c[i * 3 + 1]!, cz = c[i * 3 + 2]!;
      for (let k = 0; k <= radial; k++) {
        const ang = (k / radial) * Math.PI * 2;
        const co = Math.cos(ang), si = Math.sin(ang);
        const nx = _n.x * co + _b.x * si, ny = _n.y * co + _b.y * si, nz = _n.z * co + _b.z * si;
        const v = (i * (radial + 1) + k) * 3;
        pos[v] = cx + nx * r;
        pos[v + 1] = cy + ny * r;
        pos[v + 2] = cz + nz * r;
        nor[v] = nx;
        nor[v + 1] = ny;
        nor[v + 2] = nz;
        col[v] = colores[i * 3]!;
        col[v + 1] = colores[i * 3 + 1]!;
        col[v + 2] = colores[i * 3 + 2]!;
      }
    }
    const g = this.geometria;
    g.attributes.position!.needsUpdate = true;
    g.attributes.normal!.needsUpdate = true;
    g.attributes.color!.needsUpdate = true;
  }
}

export function Tubo({ tubo, rugosidad = 0.3, capa = 0.75 }: { tubo: TuboDinamico; rugosidad?: number; capa?: number }) {
  return (
    <mesh geometry={tubo.geometria} frustumCulled={false}>
      <meshPhysicalMaterial vertexColors roughness={rugosidad} metalness={0.12} clearcoat={capa} clearcoatRoughness={0.22} sheen={0.3} sheenRoughness={0.5} />
    </mesh>
  );
}

/* ── Letras de las bases: un grupo fijo de sprites que se reasignan ────── */
const _texLetra = new Map<string, THREE.CanvasTexture>();
export function letraTex(letra: string): THREE.CanvasTexture {
  let t = _texLetra.get(letra);
  if (!t) {
    const c = document.createElement("canvas");
    c.width = 96;
    c.height = 96;
    const g = c.getContext("2d");
    if (g) {
      g.font = `900 ${letra.length > 1 ? 38 : 70}px ui-monospace, Menlo, Consolas, monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineJoin = "round";
      g.lineWidth = 14;
      g.strokeStyle = "rgba(2,8,20,0.92)";
      g.strokeText(letra, 48, 52);
      g.fillStyle = "#ffffff";
      g.fillText(letra, 48, 52);
    }
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    _texLetra.set(letra, t);
  }
  return t;
}

export class Letras {
  sprites: THREE.Sprite[] = [];
  n = 0;
  constructor(public cap: number) {
    const base = typeof document !== "undefined" ? letraTex("A") : null;
    for (let i = 0; i < cap; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: base, transparent: true, depthWrite: false }));
      s.visible = false;
      s.renderOrder = 5;
      this.sprites.push(s);
    }
  }
  inicio() {
    this.n = 0;
  }
  poner(x: number, y: number, z: number, letra: string, escala = 0.36, opacidad = 1) {
    if (this.n >= this.cap || opacidad <= 0.02) return;
    const s = this.sprites[this.n++]!;
    s.visible = true;
    s.position.set(x, y, z);
    s.scale.set(escala, escala, 1);
    const mat = s.material;
    const tex = letraTex(letra);
    if (mat.map !== tex) mat.map = tex;
    mat.opacity = opacidad;
  }
  fin() {
    for (let i = this.n; i < this.cap; i++) this.sprites[i]!.visible = false;
  }
}

export function LetrasSprites({ letras }: { letras: Letras }) {
  return (
    <group>
      {letras.sprites.map((s, i) => (
        <primitive key={i} object={s} />
      ))}
    </group>
  );
}

/* ── Etiqueta flotante (máx. 4 a la vez; ninguna en pantallas angostas) ── */
export function Etiqueta({ children, col, dx = 0, dy = 0 }: { children: ReactNode; col?: string; dx?: number; dy?: number }) {
  const ancho = useThree((st) => st.size.width);
  if (ancho < 640) return null;
  return (
    <Html position={[dx, dy, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.84)", border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`, color: "#fff", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Superficie de proteína: icosaedro deformado con ruido suave ───────── */
export function geometriaProteina(semilla: number, detalle = 4, rugosidad = 0.16, bultos = 3, granos = 0): THREE.BufferGeometry {
  // El icosaedro de three no comparte vértices: sin fusionarlos, las normales
  // salen por cara y la proteína se ve facetada (de polígonos).
  const ico = new THREE.IcosahedronGeometry(1, detalle);
  ico.deleteAttribute("normal");
  ico.deleteAttribute("uv");
  const g = mergeVertices(ico, 1e-4);
  ico.dispose();
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  // centros de «dominios» que abultan la superficie (proteínas = varios dominios)
  const dom: THREE.Vector3[] = [];
  for (let i = 0; i < bultos; i++) {
    dom.push(new THREE.Vector3(hash(semilla + i * 3.1) - 0.5, hash(semilla + i * 5.7) - 0.5, hash(semilla + i * 9.3) - 0.5).normalize());
  }
  // «granos»: cientos de bultitos del tamaño de un residuo, como en las
  // ilustraciones de Goodsell; es lo que hace que se lea como proteína/ARNr.
  const gr: number[] = [];
  for (let i = 0; i < granos; i++) {
    const z = 1 - 2 * hash(semilla * 3 + i * 1.37);
    const a = hash(semilla * 7 + i * 2.71) * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    gr.push(s * Math.cos(a), s * Math.sin(a), z, 0.6 + hash(i * 4.1 + semilla) * 0.8);
  }
  const ANCHO_GRANO = 0.011;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let r = 1;
    for (let k = 0; k < gr.length; k += 4) {
      const d = 1 - (v.x * gr[k]! + v.y * gr[k + 1]! + v.z * gr[k + 2]!);
      if (d < ANCHO_GRANO) {
        const q = 1 - d / ANCHO_GRANO;
        r += 0.075 * gr[k + 3]! * q * q;
      }
    }
    for (const d of dom) r += 0.18 * Math.pow(Math.max(0, v.dot(d)), 3);
    // ruido de varias octavas con senos (estable, sin dependencias)
    const n1 = Math.sin(v.x * 7.1 + semilla) * Math.sin(v.y * 6.3 - semilla * 0.7) * Math.sin(v.z * 7.7 + semilla * 1.3);
    const n2 = Math.sin(v.x * 15.3 - semilla) * Math.sin(v.y * 13.9 + semilla) * Math.sin(v.z * 14.7);
    r += rugosidad * (n1 * 0.7 + n2 * 0.35);
    p.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Plano de corte que siempre mira a la cámara: quita la mitad delantera de una
 * proteína para ver lo que pasa dentro (el ADN, los ARNt).
 */
export function useCorteHaciaCamara(centro: RefObject<THREE.Object3D | null>, adelanto = 0.25): THREE.Plane {
  const plano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), []);
  const camara = useThree((s) => s.camera);
  const w = useRef(new THREE.Vector3());
  const d = useRef(new THREE.Vector3());
  useFrame(() => {
    const o = centro.current;
    if (!o) return;
    o.getWorldPosition(w.current);
    d.current.copy(w.current).sub(camara.position).normalize(); // de la cámara hacia el objeto
    // puntos del lado de la cámara (distancia negativa) se recortan
    plano.set(d.current, -d.current.dot(w.current) + adelanto);
  });
  return plano;
}

/* ── Fondo: nucleoplasma / citoplasma difuso (lienzo procedural) ───────── */
let _texFondo: THREE.CanvasTexture | null = null;
function texturaFondo(): THREE.CanvasTexture {
  if (_texFondo) return _texFondo;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#0b1a33");
  grad.addColorStop(0.5, "#0a1830");
  grad.addColorStop(1, "#050c1a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);
  // manchas difusas: cromatina y orgánulos fuera de foco
  for (let i = 0; i < 70; i++) {
    const x = hash(i * 1.7) * 1024;
    const y = 80 + hash(i * 2.3) * 360;
    const r = 30 + hash(i * 3.9) * 120;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    const tono = hash(i * 7.1);
    const col = tono < 0.5 ? "70,110,190" : tono < 0.8 ? "110,80,170" : "40,140,150";
    rg.addColorStop(0, `rgba(${col},${0.1 + hash(i * 5.3) * 0.12})`);
    rg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  _texFondo = new THREE.CanvasTexture(c);
  _texFondo.colorSpace = THREE.SRGBColorSpace;
  return _texFondo;
}

export function Fondo({ tinte = "#ffffff" }: { tinte?: string }) {
  const tex = useMemo(() => texturaFondo(), []);
  return (
    <mesh scale={90} renderOrder={-10}>
      <sphereGeometry args={[1, 48, 24]} />
      <meshBasicMaterial map={tex} color={tinte} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

/* ── Halo radial suave (asa de arrastre) ───────────────────────────────── */
let _texHalo: THREE.CanvasTexture | null = null;
export function texturaHalo(): THREE.CanvasTexture {
  if (_texHalo) return _texHalo;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,255,255,0.0)");
  rg.addColorStop(0.35, "rgba(255,255,255,0.35)");
  rg.addColorStop(0.62, "rgba(255,255,255,0.22)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  _texHalo = new THREE.CanvasTexture(c);
  _texHalo.colorSpace = THREE.SRGBColorSpace;
  return _texHalo;
}

/* ── Citoplasma lleno: muchas partículas pequeñas, apagadas, en profundidad ─ */
const _oC = new THREE.Object3D();
const _cC = new THREE.Color();
const _grisC = new THREE.Color("#6b7c93");
const _vC = new THREE.Vector3();
export function Citoplasma({ n, paleta, centro }: { n: number; paleta: readonly string[]; centro: RefObject<THREE.Vector3> }) {
  const malla = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const pintado = useRef(false);
  useFrame((s) => {
    const m = malla.current;
    if (!m) return;
    const t = s.clock.elapsedTime;
    const cx = centro.current.x;
    for (let i = 0; i < n; i++) {
      // repartidas en una caja ancha detrás y alrededor; la niebla las hunde
      const bx = (hash(i * 1.31) - 0.5) * 30;
      const x = cx + ((((bx - cx * 0.35) % 30) + 45) % 30) - 15;
      const y = (hash(i * 2.17) - 0.5) * 15 + Math.sin(t * 0.25 + i) * 0.25;
      const z = -3 - hash(i * 3.73) * 14 + Math.cos(t * 0.2 + i * 1.7) * 0.25;
      _oC.position.set(x, y, z);
      _oC.scale.setScalar(0.06 + hash(i * 5.11) * 0.08);
      _oC.updateMatrix();
      m.setMatrixAt(i, _oC.matrix);
      if (!pintado.current) {
        _cC.set(paleta[i % paleta.length] ?? "#ffffff").lerp(_grisC, 0.72).multiplyScalar(0.55);
        m.setColorAt(i, _cC);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (!pintado.current && m.instanceColor) m.instanceColor.needsUpdate = true;
    pintado.current = true;
  });
  return (
    <instancedMesh ref={malla} args={[geo, undefined, n]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.75} metalness={0} />
    </instancedMesh>
  );
}

/**
 * Superficie «de Goodsell»: la proteína (o el ARNr) como muchas esferas chicas,
 * del tamaño de un grupo de átomos, medio hundidas en una cáscara lisa y mate.
 * De lejos el contorno se lee liso; de cerca, granulado. La cáscara va más
 * oscura que las esferas: los huecos entre esferas quedan en penumbra (oclusión
 * falsa), y las esferas más hundidas también salen más oscuras.
 */
export function SuperficieGranulada({ geo, escala, color, corte, n, radio = 0.09, semilla = 1 }: { geo: THREE.BufferGeometry; escala: readonly [number, number, number]; color: string; corte?: THREE.Plane; n: number; radio?: number; semilla?: number }) {
  const esfera = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const malla = useRef<THREE.InstancedMesh>(null);
  const [ex, ey, ez] = escala;
  const datos = useMemo(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const out: number[] = [];
    const paso = p.count / n;
    for (let i = 0; i < n; i++) {
      // reparto parejo: un vértice por tramo, con algo de azar dentro del tramo
      const k = Math.min(p.count - 1, Math.floor((i + hash(i * 1.618 + semilla * 7.3)) * paso));
      const hundido = hash(i * 3.3 + semilla); // 0 = afuera, 1 = hundido
      // centradas SOBRE la cáscara: asoman por fuera y, en el corte, por dentro
      const f = 0.997 - hundido * 0.03;
      out.push(p.getX(k) * ex * f, p.getY(k) * ey * f, p.getZ(k) * ez * f, radio * (0.8 + hash(i * 5.9 + semilla) * 0.45), hundido);
    }
    return out;
  }, [geo, ex, ey, ez, n, radio, semilla]);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const fondo = useMemo(() => new THREE.Color(color).multiplyScalar(0.8), [color]);
  const pintado = useRef(false);
  useFrame(() => {
    const m = malla.current;
    if (!m) return;
    // El corte no rebana esferas (se verían aros por dentro): las que quedan
    // del lado de la cámara simplemente no se dibujan.
    m.updateWorldMatrix(true, false);
    for (let i = 0; i < n; i++) {
      const o = i * 5;
      _oC.position.set(datos[o]!, datos[o + 1]!, datos[o + 2]!);
      let r = datos[o + 3]!;
      if (corte) {
        _vC.copy(_oC.position).applyMatrix4(m.matrixWorld);
        if (corte.distanceToPoint(_vC) < 0) r = 0;
      }
      _oC.scale.setScalar(Math.max(r, 1e-4));
      _oC.updateMatrix();
      m.setMatrixAt(i, _oC.matrix);
      if (!pintado.current) {
        _cC.copy(base).multiplyScalar(1.02 - datos[o + 4]! * 0.3 + (hash(i * 8.1) - 0.5) * 0.08);
        m.setColorAt(i, _cC);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (!pintado.current && m.instanceColor) m.instanceColor.needsUpdate = true;
    pintado.current = true;
  });
  return (
    <group>
      {/* cáscara: rellena los huecos en penumbra y da el contorno liso */}
      <mesh geometry={geo} scale={[ex * 0.985, ey * 0.985, ez * 0.985]}>
        <meshStandardMaterial color={fondo} roughness={0.95} metalness={0} side={corte ? THREE.DoubleSide : THREE.FrontSide} clippingPlanes={corte ? [corte] : undefined} />
      </mesh>
      <instancedMesh ref={malla} args={[esfera, undefined, n]} frustumCulled={false}>
        <meshPhysicalMaterial roughness={0.9} metalness={0} specularIntensity={0.25} sheen={0.25} sheenRoughness={0.8} sheenColor="#ffffff" />
      </instancedMesh>
    </group>
  );
}
