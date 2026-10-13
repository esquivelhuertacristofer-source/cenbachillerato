/**
 * Geometrías y texturas procedurales del laboratorio de Fotosíntesis.
 * Módulo de three puro (sin React): lo usan las cuatro escalas de la escena.
 *
 * Nada se descarga: las nervaduras, la terracota, la tierra, las membranas y
 * las proteínas se generan aquí, con un generador pseudoaleatorio con semilla
 * (mismo resultado en cada carga, sin `Math.random`).
 */

import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Vec3 = [number, number, number];

/* ── Azar con semilla ─────────────────────────────────────────────────── */
export function azar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash entero → [0,1): decide, sin estado, si un fotón se absorbe o rebota. */
export function hash01(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/* ══ HOJA ═════════════════════════════════════════════════════════════ */

/**
 * Lámina de hoja: base en el origen, crece hacia +Y, cara hacia +Z.
 * El contorno sale de la propia malla (no hay recorte por alfa): ancho que
 * nace en el peciolo, se abre y termina en punta. Con copa (bordes arriba),
 * arco (la punta cae) y un ondulado leve del margen.
 */
export function geometriaHoja(largo: number, ancho: number, arco = 0.22, copa = 0.16, segU = 16, segV = 36): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const w = 0.5 * ancho * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.72)), 0.9);
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const s = 2 * u - 1;
      const x = s * w;
      const y = v * largo;
      const z = -arco * largo * v * v + copa * s * s * w + 0.018 * Math.sin(v * 34) * Math.pow(Math.abs(s), 3);
      pos.push(x, y, z);
      uv.push(u, v);
    }
  }
  const fila = segU + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * fila + i;
      const b = a + 1;
      const c = a + fila;
      const d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Punto (u,v) de la lámina en coordenadas de la propia hoja (misma fórmula). */
export function puntoLamina(largo: number, ancho: number, u: number, v: number, arco = 0.22, copa = 0.16): THREE.Vector3 {
  const w = 0.5 * ancho * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.72)), 0.9);
  const s = 2 * u - 1;
  return new THREE.Vector3(s * w, v * largo, -arco * largo * v * v + copa * s * s * w);
}

export interface HojaPlanta {
  /** Nudo del tallo (en coordenadas del mundo «planta»). */
  nudo: Vec3;
  /** Matriz de la lámina (base del peciolo + orientación). */
  matriz: THREE.Matrix4;
  largo: number;
  ancho: number;
  /** Inicio de la lámina, al final del peciolo. */
  base: THREE.Vector3;
}

/** Curva del tallo principal de la planta. */
export function curvaTallo(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.2, 0),
    new THREE.Vector3(0.05, -0.2, 0.02),
    new THREE.Vector3(-0.06, 0.9, -0.03),
    new THREE.Vector3(0.04, 1.9, 0.02),
    new THREE.Vector3(0.0, 2.75, 0.0),
  ]);
}

/**
 * Disposición de las hojas: filotaxis alterna (137.5°), las de abajo más
 * grandes y abiertas, las de arriba chicas y erguidas. La hoja 2 mira de
 * frente a la cámara: es la «hoja protagonista» donde entra el zoom.
 */
export function hojasPlanta(): HojaPlanta[] {
  const tallo = curvaTallo();
  const lista: { t: number; az: number; elev: number; largo: number; ancho: number }[] = [
    { t: 0.26, az: -2.2, elev: 0.16, largo: 3.0, ancho: 1.6 },
    { t: 0.34, az: 0.45, elev: 0.14, largo: 3.1, ancho: 1.7 },
    { t: 0.42, az: 2.4, elev: 0.2, largo: 2.9, ancho: 1.55 },
    { t: 0.5, az: 1.25, elev: 0.3, largo: 2.8, ancho: 1.5 },
    { t: 0.57, az: -0.95, elev: 0.34, largo: 2.6, ancho: 1.42 },
    { t: 0.64, az: -2.9, elev: 0.38, largo: 2.4, ancho: 1.3 },
    { t: 0.71, az: 3.0, elev: 0.44, largo: 2.2, ancho: 1.2 },
    { t: 0.79, az: 2.0, elev: 0.58, largo: 1.8, ancho: 1.0 },
    { t: 0.87, az: -1.7, elev: 0.72, largo: 1.45, ancho: 0.82 },
    { t: 0.94, az: 0.6, elev: 0.95, largo: 1.0, ancho: 0.56 },
    { t: 0.99, az: -2.6, elev: 1.15, largo: 0.7, ancho: 0.4 },
  ];
  const arriba = new THREE.Vector3(0, 1, 0);
  return lista.map((h) => {
    const nudo = tallo.getPointAt(h.t);
    const eje = new THREE.Vector3(Math.cos(h.elev) * Math.sin(h.az), Math.sin(h.elev), Math.cos(h.elev) * Math.cos(h.az)).normalize();
    const normal = arriba.clone().sub(eje.clone().multiplyScalar(arriba.dot(eje))).normalize();
    const lado = new THREE.Vector3().crossVectors(eje, normal).normalize();
    const peciolo = 0.32 + h.largo * 0.12;
    const base = nudo.clone().add(eje.clone().multiplyScalar(peciolo));
    const m = new THREE.Matrix4().makeBasis(lado, eje, normal);
    m.setPosition(base);
    return { nudo: [nudo.x, nudo.y, nudo.z], matriz: m, largo: h.largo, ancho: h.ancho, base };
  });
}

/** Índice de la hoja protagonista (la que mira a la cámara). */
export const HOJA_PROTAGONISTA = 1;

/** Punto de entrada del zoom en la planta: el centro de la hoja protagonista. */
export function pivotePlanta(): Vec3 {
  const h = hojasPlanta()[HOJA_PROTAGONISTA]!;
  const p = puntoLamina(h.largo, h.ancho, 0.62, 0.52).applyMatrix4(h.matriz);
  return [p.x, p.y, p.z];
}

/** Puntos de llegada de la luz sobre las hojas, con su normal (mundo «planta»). */
export function puntosEnHojas(n: number, semilla = 7): { p: THREE.Vector3; n: THREE.Vector3 }[] {
  const hojas = hojasPlanta();
  const r = azar(semilla);
  const out: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
  const nm = new THREE.Matrix3();
  for (let i = 0; i < n; i++) {
    const h = hojas[i % hojas.length]!;
    const u = 0.3 + r() * 0.4;
    const v = 0.25 + r() * 0.6;
    const p = puntoLamina(h.largo, h.ancho, u, v).applyMatrix4(h.matriz);
    nm.getNormalMatrix(h.matriz);
    const normal = new THREE.Vector3(0, 0, 1).applyMatrix3(nm).normalize();
    if (normal.y < 0) normal.negate();
    out.push({ p, n: normal });
  }
  return out;
}

/* ══ TEXTURAS ═════════════════════════════════════════════════════════ */

function lienzo(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function aTextura(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/**
 * Nervaduras de la hoja: color y relieve. Coordenadas de textura: u a lo
 * ancho (0 = margen izquierdo), v a lo largo (0 = peciolo, 1 = punta).
 */
export function texturasHoja(alta: boolean): { mapa: THREE.CanvasTexture; relieve: THREE.CanvasTexture } {
  const W = alta ? 1024 : 512;
  const H = alta ? 2048 : 1024;
  const [c, g] = lienzo(W, H);
  const [cb, gb] = lienzo(W, H);
  const r = azar(41);
  const X = (u: number) => u * W;
  const Y = (v: number) => (1 - v) * H;

  // Base: más oscura en el margen, clara en el centro.
  const grad = g.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#1c4f1a");
  grad.addColorStop(0.22, "#2f7a26");
  grad.addColorStop(0.5, "#3f9233");
  grad.addColorStop(0.78, "#2f7a26");
  grad.addColorStop(1, "#1c4f1a");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  gb.fillStyle = "#808080";
  gb.fillRect(0, 0, W, H);

  // Moteado de las células (no un verde plano).
  for (let i = 0; i < (alta ? 9000 : 4000); i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = (0.6 + r() * 2.2) * (W / 512);
    g.fillStyle = r() < 0.5 ? `rgba(120,190,70,${0.05 + r() * 0.07})` : `rgba(10,50,15,${0.05 + r() * 0.08})`;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }

  const k = W / 512;
  const trazo = (ctx: CanvasRenderingContext2D, color: string, ancho: number, f: () => void) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = ancho;
    ctx.lineCap = "round";
    ctx.beginPath();
    f();
    ctx.stroke();
  };

  // Retícula terciaria: venitas cortas entre las secundarias.
  for (let i = 0; i < (alta ? 2600 : 1300); i++) {
    const x0 = r() * W;
    const y0 = r() * H;
    const a = r() * Math.PI * 2;
    const l = (6 + r() * 16) * k;
    const x1 = x0 + Math.cos(a) * l;
    const y1 = y0 + Math.sin(a) * l;
    trazo(g, "rgba(150,205,95,0.22)", 0.9 * k, () => { g.moveTo(x0, y0); g.lineTo(x1, y1); });
    trazo(gb, "rgba(70,70,70,0.5)", 1 * k, () => { gb.moveTo(x0, y0); gb.lineTo(x1, y1); });
  }

  // Secundarias: salen de la nervadura central y se curvan hacia la punta.
  for (let lado = -1; lado <= 1; lado += 2) {
    for (let s = 0; s < 10; s++) {
      const v0 = 0.06 + s * 0.085 + (r() - 0.5) * 0.02;
      const v1 = Math.min(0.99, v0 + 0.16 + r() * 0.05);
      const ux = 0.5 + lado * (0.44 - s * 0.012);
      const camino = (ctx: CanvasRenderingContext2D) => {
        ctx.moveTo(X(0.5), Y(v0));
        ctx.quadraticCurveTo(X(0.5 + lado * 0.2), Y(v0 + 0.035), X(ux), Y(v1));
      };
      trazo(g, "rgba(196,232,128,0.85)", 4.2 * k, () => camino(g));
      trazo(g, "rgba(230,250,170,0.5)", 1.6 * k, () => camino(g));
      trazo(gb, "rgba(40,40,40,0.9)", 5 * k, () => camino(gb));
    }
  }

  // Nervadura central: gruesa en la base, fina en la punta.
  for (let j = 0; j < 60; j++) {
    const v0 = j / 60;
    const v1 = (j + 1) / 60;
    const a = (12 - 9 * v0) * k;
    trazo(g, "rgba(214,240,150,0.95)", a, () => { g.moveTo(X(0.5), Y(v0)); g.lineTo(X(0.5), Y(v1)); });
    trazo(gb, "rgba(20,20,20,1)", a * 1.2, () => { gb.moveTo(X(0.5), Y(v0)); gb.lineTo(X(0.5), Y(v1)); });
  }

  return { mapa: aTextura(c), relieve: aTextura(cb, false) };
}

/** Terracota de la maceta: grano, manchas y vetas horizontales del torno. */
export function texturaTerracota(): THREE.CanvasTexture {
  const [c, g] = lienzo(512, 256);
  const r = azar(9);
  g.fillStyle = "#a9552f";
  g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 40; i++) {
    const y = r() * 256;
    g.fillStyle = `rgba(${r() < 0.5 ? "70,25,10" : "220,140,90"},${0.04 + r() * 0.05})`;
    g.fillRect(0, y, 512, 1 + r() * 4);
  }
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = r() < 0.5 ? `rgba(60,20,8,${r() * 0.18})` : `rgba(240,170,120,${r() * 0.15})`;
    g.fillRect(r() * 512, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  for (let i = 0; i < 18; i++) {
    const x = r() * 512;
    const y = r() * 256;
    const rg = g.createRadialGradient(x, y, 0, x, y, 20 + r() * 40);
    rg.addColorStop(0, "rgba(235,225,200,0.16)");
    rg.addColorStop(1, "rgba(235,225,200,0)");
    g.fillStyle = rg;
    g.fillRect(x - 60, y - 60, 120, 120);
  }
  const t = aTextura(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Tierra húmeda con grumos. */
export function texturaTierra(): THREE.CanvasTexture {
  const [c, g] = lienzo(512, 512);
  const r = azar(13);
  g.fillStyle = "#2b1a10";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const x = r() * 512;
    const y = r() * 512;
    const s = 1 + r() * 4;
    const l = 10 + r() * 40;
    g.fillStyle = `hsla(${22 + r() * 14},${30 + r() * 30}%,${l}%,${0.35 + r() * 0.4})`;
    g.beginPath();
    g.arc(x, y, s, 0, Math.PI * 2);
    g.fill();
  }
  return aTextura(c);
}

/** Piso: degradado radial que se funde con el fondo (sin borde duro). */
export function texturaPiso(centro: string, borde: string): THREE.CanvasTexture {
  const [c, g] = lienzo(512, 512);
  const rg = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  rg.addColorStop(0, centro);
  rg.addColorStop(0.18, centro);
  rg.addColorStop(0.6, borde);
  rg.addColorStop(1, borde);
  g.fillStyle = rg;
  g.fillRect(0, 0, 512, 512);
  const r = azar(5);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(255,255,255,${r() * 0.025})`;
    g.fillRect(r() * 512, r() * 512, 1, 1);
  }
  return aTextura(c);
}

/** Madera cálida de mesa de invernadero: vetas largas y nudos suaves. */
export function texturaMadera(): THREE.CanvasTexture {
  const [c, g] = lienzo(1024, 1024);
  const r = azar(71);
  g.fillStyle = "#6b4528";
  g.fillRect(0, 0, 1024, 1024);
  // tablones
  for (let t = 0; t < 6; t++) {
    const y0 = (t * 1024) / 6;
    g.fillStyle = `rgba(${90 + r() * 40},${55 + r() * 25},${30 + r() * 15},0.35)`;
    g.fillRect(0, y0, 1024, 1024 / 6);
    g.fillStyle = "rgba(25,12,5,0.55)";
    g.fillRect(0, y0, 1024, 3);
  }
  // vetas
  for (let i = 0; i < 520; i++) {
    const y = r() * 1024;
    const a = 2 + r() * 6;
    const fase = r() * 6;
    g.strokeStyle = r() < 0.5 ? `rgba(40,20,8,${0.1 + r() * 0.18})` : `rgba(190,140,90,${0.06 + r() * 0.1})`;
    g.lineWidth = 0.6 + r() * 1.8;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const yy = y + Math.sin(x / (60 + a * 20) + fase) * a;
      if (x === 0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = r() * 1024;
    const y = r() * 1024;
    const rg = g.createRadialGradient(x, y, 0, x, y, 14 + r() * 16);
    rg.addColorStop(0, "rgba(35,16,6,0.7)");
    rg.addColorStop(1, "rgba(35,16,6,0)");
    g.fillStyle = rg;
    g.fillRect(x - 40, y - 40, 80, 80);
  }
  return aTextura(c);
}

/** Mancha radial blanca → negra: máscara de opacidad para un piso sin borde. */
export function texturaMancha(): THREE.CanvasTexture {
  const [c, g] = lienzo(256, 256);
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, "#ffffff");
  rg.addColorStop(0.3, "#ffffff");
  rg.addColorStop(1, "#000000");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  return aTextura(c, false);
}

/** Resplandor radial (sprites del Sol, de los fotosistemas excitados). */
export function texturaHalo(): THREE.CanvasTexture {
  const [c, g] = lienzo(128, 128);
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,255,255,1)");
  rg.addColorStop(0.2, "rgba(255,255,255,0.55)");
  rg.addColorStop(0.5, "rgba(255,255,255,0.12)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  return aTextura(c);
}

/** Haz de luz: brillante arriba, se desvanece hacia abajo y hacia los bordes. */
export function texturaHaz(): THREE.CanvasTexture {
  const [c, g] = lienzo(64, 256);
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "rgba(255,255,255,0.9)");
  v.addColorStop(0.6, "rgba(255,255,255,0.35)");
  v.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = "destination-in";
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.5, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 256);
  return aTextura(c);
}

/** Colas de los lípidos: el interior hidrofóbico de la membrana. */
export function texturaColasLipido(): THREE.CanvasTexture {
  const [c, g] = lienzo(512, 128);
  const r = azar(23);
  g.fillStyle = "#c9a640";
  g.fillRect(0, 0, 512, 128);
  for (let x = 0; x < 512; x += 5) {
    const ox = (r() - 0.5) * 3;
    g.strokeStyle = `rgba(${150 + r() * 60},${115 + r() * 50},${30 + r() * 20},0.9)`;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + ox * 2, 40, x - ox * 2, 80, x + ox, 128);
    g.stroke();
  }
  const t = aTextura(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ══ FORMAS ═══════════════════════════════════════════════════════════ */

/**
 * «Superficie molecular»: una esfera deformada por ondas suaves con semilla.
 * Es lo que hace que una proteína se lea como proteína y no como canica.
 */
export function geometriaBlob(semilla: number, rugosidad = 0.16, detalle = 4): THREE.BufferGeometry {
  // El icosaedro de three no comparte vértices: sin fundirlos, la superficie
  // sale facetada («low poly») en vez de suave.
  const base = new THREE.IcosahedronGeometry(1, detalle);
  base.deleteAttribute("normal");
  base.deleteAttribute("uv");
  const g = mergeVertices(base);
  base.dispose();
  const r = azar(semilla);
  const ondas = Array.from({ length: 6 }, () => ({
    d: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    f: 2 + r() * 5,
    a: (0.3 + r() * 0.7) * rugosidad,
    fase: r() * Math.PI * 2,
  }));
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let k = 1;
    for (const o of ondas) k += o.a * Math.sin(v.dot(o.d) * o.f + o.fase);
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Disco de tilacoide: canto redondeado (torno de un perfil de cápsula plana). */
export function geometriaDisco(radio: number, grosor: number, seg = 36): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const h = grosor / 2;
  pts.push(new THREE.Vector2(0, -h));
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI;
    pts.push(new THREE.Vector2(radio - h + Math.cos(a) * h, Math.sin(a) * h));
  }
  pts.push(new THREE.Vector2(0, h));
  return new THREE.LatheGeometry(pts, seg);
}

/** Pinta una geometría con un color de vértice uniforme. */
function colorear(g: THREE.BufferGeometry, color: string): THREE.BufferGeometry {
  const c = new THREE.Color(color);
  const n = g.attributes.position!.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

function atomo(r: number, x: number, y: number, z: number, color: string): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(r, 16, 12);
  g.translate(x, y, z);
  return colorear(g, color);
}

/* Colores CPK: oxígeno rojo, carbono gris oscuro, hidrógeno blanco. */
export const CPK = { O: "#ff3b30", C: "#3a3f44", H: "#f4f6f8" } as const;

/** Molécula de CO₂ (lineal) con colores por vértice. Longitud ≈ 1. */
export function geometriaCO2(): THREE.BufferGeometry {
  return mergeGeometries([atomo(0.22, 0, 0, 0, CPK.C), atomo(0.2, -0.36, 0, 0, CPK.O), atomo(0.2, 0.36, 0, 0, CPK.O)])!;
}

/** Molécula de H₂O (angular, 104.5°). */
export function geometriaH2O(): THREE.BufferGeometry {
  const a = (104.5 / 2) * (Math.PI / 180);
  const d = 0.27;
  return mergeGeometries([
    atomo(0.22, 0, 0, 0, CPK.O),
    atomo(0.13, Math.sin(a) * d, -Math.cos(a) * d, 0, CPK.H),
    atomo(0.13, -Math.sin(a) * d, -Math.cos(a) * d, 0, CPK.H),
  ])!;
}

/** Molécula de O₂. */
export function geometriaO2(): THREE.BufferGeometry {
  return mergeGeometries([atomo(0.2, -0.16, 0, 0, CPK.O), atomo(0.2, 0.16, 0, 0, CPK.O)])!;
}

/** Glucosa estilizada: anillo de seis carbonos (prisma hexagonal ámbar). */
export function geometriaGlucosa(): THREE.BufferGeometry {
  const anillo = new THREE.TorusGeometry(0.22, 0.07, 8, 6);
  return colorear(anillo, "#ffb454");
}

/** Fotón: una estela alargada a lo largo de +Z. */
export function geometriaFoton(): THREE.BufferGeometry {
  const g = new THREE.CapsuleGeometry(0.05, 0.5, 4, 8);
  g.rotateX(Math.PI / 2);
  return g;
}
