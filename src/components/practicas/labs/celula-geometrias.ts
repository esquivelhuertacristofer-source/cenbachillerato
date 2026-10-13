/**
 * Geometría procedural de la célula 3D (CNEYT-VI-P02, `celula-organelos-3d`).
 *
 * Funciones PURAS de three.js (sin React): construyen una vez, en `useMemo`,
 * las formas que una primitiva no da — la membrana con relieve orgánico, el
 * corte en cuña con su canto (la «tapa» que deja ver la bicapa y la doble
 * envoltura), las crestas onduladas de la mitocondria, las cisternas curvas del
 * Golgi, la cromatina, el cromosoma circular enmarañado de la bacteria…
 *
 * Todo es determinista (semilla fija): la misma célula en cada visita y nada de
 * `Math.random` durante el render.
 */

import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Pt = [number, number, number];

/* ── Azar con semilla (mulberry32) ─────────────────────────────────────────── */
export function azar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Ruido de valor 3D suave (para relieve orgánico) ───────────────────────── */
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
const suave = (t: number) => t * t * (3 - 2 * t);
export function ruido3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = suave(x - xi), yf = suave(y - yi), zf = suave(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  const v = l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
  return v * 2 - 1;
}
export function fbm3(x: number, y: number, z: number, oct = 3): number {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * ruido3(x * f, y * f, z * f); f *= 2.03; a *= 0.5; }
  return s;
}

/* ── Formas radiales: radio de la superficie en la dirección unitaria d ─────── */
export type FormaRadial = (d: THREE.Vector3) => number;

/** Esfera con relieve suave (membrana viva, no una bola de billar). */
export function formaEsfera(R: number, relieve = 0, frec = 1.4, semilla = 0): FormaRadial {
  return (d) => R * (1 + relieve * fbm3(d.x * frec + semilla, d.y * frec + 3.1, d.z * frec - 1.7));
}

/** Superelipsoide (cubo redondeado): la célula vegetal y su vacuola. */
export function formaSuper(a: number, b: number, c: number, n: number, relieve = 0, semilla = 0): FormaRadial {
  return (d) => {
    const s = Math.pow(Math.abs(d.x / a), n) + Math.pow(Math.abs(d.y / b), n) + Math.pow(Math.abs(d.z / c), n);
    const r = Math.pow(s, -1 / n);
    return relieve ? r * (1 + relieve * fbm3(d.x * 1.3 + semilla, d.y * 1.3, d.z * 1.3)) : r;
  };
}

/** Cápsula a lo largo de X (bacilo): semilongitud del cilindro L y radio R. */
export function formaCapsulaX(L: number, R: number): FormaRadial {
  return (d) => {
    const lat = Math.hypot(d.y, d.z);
    if (lat > 1e-6) {
      const t1 = R / lat;
      if (Math.abs(t1 * d.x) <= L) return t1;
    }
    const cx = Math.sign(d.x || 1) * L;
    const dc = d.x * cx;
    return dc + Math.sqrt(Math.max(0, dc * dc - (L * L - R * R)));
  };
}

/** Desplaza una forma hacia fuera (+) o hacia dentro (−) una distancia fija. */
export function desplazar(f: FormaRadial, delta: number): FormaRadial {
  return (d) => f(d) + delta;
}

/**
 * Cáscara cerrada con la forma dada. La costura de la esfera base se gira hacia
 * atrás (−z), lejos del corte, para que no se vea.
 */
export function geoCascara(f: FormaRadial, ws = 96, hs = 64): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.rotateY(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const r = f(v);
    p.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }
  g.computeVertexNormals();
  return g;
}

/** Ejes del corte: la cuña gira alrededor de Y (célula redonda) o de X (bacilo). */
export type EjeCorte = "x" | "y";

/** Dirección unitaria en el semiplano de acimut β alrededor del eje. */
function dirCorte(eje: EjeCorte, beta: number, theta: number, out: THREE.Vector3): THREE.Vector3 {
  const s = Math.sin(theta);
  if (eje === "y") return out.set(Math.sin(beta) * s, Math.cos(theta), Math.cos(beta) * s);
  return out.set(Math.cos(theta), Math.sin(beta) * s, Math.cos(beta) * s);
}

/**
 * La TAPA del corte: la franja plana entre dos cáscaras en el plano de corte.
 * Es lo que hace que un corte se lea como corte (se ve el grosor de la pared,
 * la bicapa de la membrana, la doble envoltura del núcleo) y no como un hueco.
 */
export function geoTapa(fuera: FormaRadial, dentro: FormaRadial, eje: EjeCorte, beta: number, seg = 80): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const d = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    dirCorte(eje, beta, (Math.PI * i) / seg, d);
    const ro = fuera(d), ri = dentro(d);
    pos.push(d.x * ro, d.y * ro, d.z * ro, d.x * ri, d.y * ri, d.z * ri);
    if (i < seg) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Los dos planos de recorte de la cuña (en coordenadas del MUNDO). Con
 * `clipIntersection` se quita solo lo que queda del lado negativo de AMBOS:
 * la rebanada de acimut α ± h que mira a la cámara.
 */
export function planosCuna(eje: EjeCorte, alfa: number, h: number, centro: THREE.Vector3): THREE.Plane[] {
  const A = alfa - h, B = alfa + h;
  const n1 = eje === "y" ? new THREE.Vector3(-Math.cos(A), 0, Math.sin(A)) : new THREE.Vector3(0, -Math.cos(A), Math.sin(A));
  const n2 = eje === "y" ? new THREE.Vector3(Math.cos(B), 0, -Math.sin(B)) : new THREE.Vector3(0, Math.cos(B), -Math.sin(B));
  return [
    new THREE.Plane().setFromNormalAndCoplanarPoint(n1, centro),
    new THREE.Plane().setFromNormalAndCoplanarPoint(n2, centro),
  ];
}

/* ── Superficies paramétricas ──────────────────────────────────────────────── */
export function geoParam(f: (u: number, v: number, out: THREE.Vector3) => void, su: number, sv: number): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= sv; j++) {
    for (let i = 0; i <= su; i++) {
      f(i / su, j / sv, p);
      pos.push(p.x, p.y, p.z);
      uv.push(i / su, j / sv);
    }
  }
  const fila = su + 1;
  for (let j = 0; j < sv; j++) {
    for (let i = 0; i < su; i++) {
      const a = j * fila + i, b = a + 1, c = a + fila, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Media cápsula abierta (mitocondria, cloroplasto): la mitad z ≤ 0 de un cuerpo
 * alargado en X. El lado abierto (+z) es el que se orienta a la cámara: el
 * organelo «cortado a lo largo» de los libros de texto, pero de verdad en 3D.
 * `p` redondea las puntas (2 = elipse, 3–4 = cápsula); `aplY` aplana.
 */
export function perfilCapsula(Lh: number, R: number, p: number, x: number): number {
  const t = Math.min(1, Math.abs(x / Lh));
  return R * Math.pow(Math.max(0, 1 - Math.pow(t, p)), 1 / p);
}
export function geoMediaCapsula(Lh: number, R: number, p: number, aplY = 1, ondula = 0, su = 56, sv = 28): THREE.BufferGeometry {
  return geoParam((u, v, out) => {
    const x = -Lh + 2 * Lh * u;
    const psi = Math.PI + Math.PI * v;
    const rho = perfilCapsula(Lh, R, p, x) * (1 + ondula * Math.sin(u * 17.0) * Math.sin(v * 7.0));
    out.set(x, rho * Math.cos(psi) * aplY, rho * Math.sin(psi));
  }, su, sv);
}
/** Canto del corte de una media cápsula: la franja entre la membrana externa y la interna. */
export function geoCantoCapsula(Lh: number, R: number, Lh2: number, R2: number, p: number, aplY = 1, seg = 56): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  let base = 0;
  for (const lado of [-1, 1]) {
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      const xo = -Lh + 2 * Lh * u, xi = -Lh2 + 2 * Lh2 * u;
      pos.push(xo, lado * perfilCapsula(Lh, R, p, xo) * aplY, 0, xi, lado * perfilCapsula(Lh2, R2, p, xi) * aplY, 0);
      if (i < seg) {
        const a = base + i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    base += (seg + 1) * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Crestas mitocondriales: láminas onduladas que salen de la membrana interna
 * hacia la matriz, alternando de arriba y de abajo. Devuelve la geometría
 * fusionada y, aparte, puntos sobre su superficie (donde viven las ATP sintasas).
 */
export function geoCrestas(Lh: number, Ri: number, p: number, n: number, semilla = 7): { geo: THREE.BufferGeometry; sitios: THREE.Vector3[] } {
  const rnd = azar(semilla);
  const partes: THREE.BufferGeometry[] = [];
  const sitios: THREE.Vector3[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eje = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < n; i++) {
    const x = -Lh * 0.78 + (1.56 * Lh * (i + 0.5)) / n + (rnd() - 0.5) * (Lh / n) * 0.4;
    const rho = perfilCapsula(Lh, Ri, p, x);
    if (rho < Ri * 0.35) continue;
    // ángulo dentro de la mitad que se conserva (ψ ∈ (π, 2π)): arriba-atrás, atrás, abajo-atrás
    const psi = i % 3 === 0 ? Math.PI * 1.27 : i % 3 === 1 ? Math.PI * 1.73 : Math.PI * 1.5 + (rnd() - 0.5) * 0.25;
    const alto = rho * (0.42 + rnd() * 0.12);   // semiextensión radial
    const ancho = rho * (0.52 + rnd() * 0.1);   // semiextensión tangencial
    const grosor = Ri * 0.075;
    const g = new THREE.SphereGeometry(1, 22, 14);
    const pa = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pa.count; k++) {
      const yy = pa.getY(k), zz = pa.getZ(k);
      // ondulación a lo largo de la cresta y un poco de «labio» en la punta
      const ola = Math.sin(yy * 4.2 + i) * 0.55 + Math.sin(zz * 5.1 + i * 2.0) * 0.35;
      pa.setXYZ(k, pa.getX(k) * grosor + ola * grosor * 1.6, yy * alto, zz * ancho);
    }
    g.computeVertexNormals();
    q.setFromAxisAngle(eje, psi);
    const centro = new THREE.Vector3(x, Math.cos(psi) * rho * 0.56, Math.sin(psi) * rho * 0.56);
    m.compose(centro, q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    partes.push(g);
    // sitios de ATP sintasa sobre las dos caras de la cresta
    for (let s = 0; s < 14; s++) {
      const uy = rnd() * 1.6 - 0.8, uz = rnd() * 1.6 - 0.8;
      if (uy * uy + uz * uz > 0.7) continue;
      const lado = s % 2 ? 1 : -1;
      const ux = Math.sqrt(Math.max(0, 1 - uy * uy - uz * uz));
      const ola = Math.sin(uy * 4.2 + i) * 0.55 + Math.sin(uz * 5.1 + i * 2.0) * 0.35;
      const v = new THREE.Vector3(lado * (ux + 0.6) * grosor + ola * grosor * 1.6, uy * alto, uz * ancho).applyQuaternion(q).add(centro);
      sitios.push(v);
    }
  }
  const geo = mergeGeometries(partes) ?? new THREE.BufferGeometry();
  partes.forEach((g) => g.dispose());
  return { geo, sitios };
}

/**
 * Cisterna del Golgi: un disco curvo (cuenco) con el borde hinchado, hecho por
 * torno. Se aplana en Z para que sea ovalado, como en las micrografías.
 */
export function geoCisterna(rho: number, grosor: number, curva: number): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const x = (rho * i) / n;
    pts.push(new THREE.Vector2(Math.max(0.0001, x), curva * x * x + grosor / 2));
  }
  const rr = grosor * 0.95;
  const cy = curva * rho * rho;
  for (let j = 1; j < 10; j++) {
    const a = Math.PI / 2 - (Math.PI * j) / 10;
    pts.push(new THREE.Vector2(rho + rr * Math.cos(a) * 0.9, cy + rr * Math.sin(a)));
  }
  for (let i = n; i >= 0; i--) {
    const x = (rho * i) / n;
    pts.push(new THREE.Vector2(Math.max(0.0001, x), curva * x * x - grosor / 2));
  }
  const g = new THREE.LatheGeometry(pts, 40);
  g.scale(1, 1, 0.62);
  g.computeVertexNormals();
  return g;
}

/* ── Tubos: cromatina, retículo liso, citoesqueleto, ADN bacteriano ─────────── */
export function geoTubos(curvas: THREE.Curve<THREE.Vector3>[], radio: number, segPorCurva = 80, radial = 6): THREE.BufferGeometry {
  const partes = curvas.map((c) => new THREE.TubeGeometry(c, segPorCurva, radio, radial, false));
  const geo = mergeGeometries(partes) ?? new THREE.BufferGeometry();
  partes.forEach((g) => g.dispose());
  return geo;
}

/** Paseo aleatorio suave dentro de una esfera (cromatina, retículo liso). */
export function paseo(rnd: () => number, centro: THREE.Vector3, radio: number, pasos: number, zancada: number, inicio?: THREE.Vector3): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const p = inicio ? inicio.clone() : new THREE.Vector3((rnd() - 0.5), (rnd() - 0.5), (rnd() - 0.5)).multiplyScalar(radio).add(centro);
  const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
  for (let i = 0; i < pasos; i++) {
    pts.push(p.clone());
    dir.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.1)).normalize();
    p.addScaledVector(dir, zancada);
    const rel = p.clone().sub(centro);
    if (rel.length() > radio) { rel.setLength(radio * 0.92); p.copy(centro).add(rel); dir.negate(); }
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Cromosoma circular enmarañado (nucleoide): una sola curva CERRADA. */
export function curvaNucleoide(rnd: () => number, rx: number, ry: number, rz: number, n = 70): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    // un lazo grande que da vueltas y se repliega sobre sí mismo
    const r = 0.55 + 0.45 * Math.sin(t * 5 + rnd() * 0.6);
    pts.push(new THREE.Vector3(
      Math.cos(t) * rx * r + (rnd() - 0.5) * rx * 0.35,
      Math.sin(t * 3) * ry * 0.7 + (rnd() - 0.5) * ry * 0.5,
      Math.sin(t) * rz * r + (rnd() - 0.5) * rz * 0.5,
    ));
  }
  return new THREE.CatmullRomCurve3(pts, true, "centripetal");
}

/** Hélice (flagelo bacteriano) a lo largo de −X desde `x0`. */
export function curvaHelice(x0: number, largo: number, amp: number, vueltas: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const a = s * vueltas * Math.PI * 2;
    const am = amp * Math.min(1, s * 4);
    pts.push(new THREE.Vector3(x0 - s * largo, Math.sin(a) * am, Math.cos(a) * am - am * (1 - Math.min(1, s * 4))));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Puntos repartidos en una esfera (Fibonacci): poros nucleares. */
export function puntosFibonacci(n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const oro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = oro * i;
    out.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return out;
}

/** Superficie con relieve: desplaza los vértices de una geometría por ruido. */
export function conRelieve(g0: THREE.BufferGeometry, amp: number, frec: number, semilla = 0): THREE.BufferGeometry {
  // Soldar vértices primero: el icosaedro trae caras sueltas y saldría facetado.
  g0.deleteAttribute("normal");
  g0.deleteAttribute("uv");
  const g = mergeVertices(g0);
  g0.dispose();
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const k = 1 + amp * fbm3(v.x * frec + semilla, v.y * frec, v.z * frec);
    p.setXYZ(i, n.x * v.length() * k, n.y * v.length() * k, n.z * v.length() * k);
  }
  g.computeVertexNormals();
  return g;
}

/* ── Texturas de lienzo (procedurales, sin red) ─────────────────────────────── */

/** Moteado orgánico (interior del citoplasma, nucleoplasma). */
export function texturaMoteada(c1: string, c2: string, semilla = 1, w = 512, h = 256): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, w, h);
  const rnd = azar(semilla);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 260; i++) {
    const x = rnd() * w, y = rnd() * h, r = 6 + rnd() * 38;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, c2);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.18 + rnd() * 0.25;
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Microfibrillas de celulosa cruzadas: la pared vegetal. Sirve de mapa y de relieve. */
export function texturaCelulosa(base: string, fibra: string, semilla = 3, tam = 512): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = tam; cv.height = tam;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, tam, tam);
  const rnd = azar(semilla);
  ctx.lineCap = "round";
  for (let capa = 0; capa < 3; capa++) {
    const ang = (capa - 1) * 0.75 + (rnd() - 0.5) * 0.2;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    for (let i = 0; i < 70; i++) {
      const off = (i / 70) * tam * 1.6 - tam * 0.3;
      ctx.strokeStyle = fibra;
      ctx.globalAlpha = 0.18 + rnd() * 0.35;
      ctx.lineWidth = 1.5 + rnd() * 3.5;
      ctx.beginPath();
      ctx.moveTo(-dy * off - dx * tam, dx * off - dy * tam);
      ctx.lineTo(-dy * off + dx * tam * 2, dx * off + dy * tam * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  t.anisotropy = 4;
  return t;
}
