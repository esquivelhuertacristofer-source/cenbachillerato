/**
 * Texturas procedurales del laboratorio de Electromagnetismo (sin red, sin
 * archivos): pantallas de 7 segmentos (fuente y multímetro), la pantalla del
 * osciloscopio, el tapete antiestático de la mesa, las rayas que hacen fluir
 * las líneas de campo, las flechas del diagrama de energía y las letras N/S
 * pintadas en el imán.
 *
 * Todo se dibuja en <canvas> 2D. Las texturas fijas se crean una sola vez
 * (caché de módulo); las pantallas son objetos `Pantalla` que la escena
 * redibuja SOLO cuando cambia el valor (o a 30 fps el osciloscopio).
 */

import * as THREE from "three";

/* ── Pantalla: un canvas con su textura ──────────────────────────────────── */
export interface Pantalla {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  /** Firma de lo último que se dibujó (para no redibujar lo mismo). */
  firma: string;
}

export function crearPantalla(w: number, h: number): Pantalla {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { canvas, ctx, tex, firma: "" };
}

/* ── Dígitos de 7 segmentos ──────────────────────────────────────────────── */
const SEG: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd",
  "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "",
};

function segmento(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, s: string) {
  const ht = t / 2;
  const hh = h / 2;
  ctx.beginPath();
  const hor = (cx: number, cy: number) => {
    ctx.moveTo(cx + ht, cy);
    ctx.lineTo(cx + ht * 2, cy - ht);
    ctx.lineTo(cx + w - ht * 2, cy - ht);
    ctx.lineTo(cx + w - ht, cy);
    ctx.lineTo(cx + w - ht * 2, cy + ht);
    ctx.lineTo(cx + ht * 2, cy + ht);
    ctx.closePath();
  };
  const ver = (cx: number, cy: number, largo: number) => {
    ctx.moveTo(cx, cy + ht);
    ctx.lineTo(cx + ht, cy + ht * 2);
    ctx.lineTo(cx + ht, cy + largo - ht * 2);
    ctx.lineTo(cx, cy + largo - ht);
    ctx.lineTo(cx - ht, cy + largo - ht * 2);
    ctx.lineTo(cx - ht, cy + ht * 2);
    ctx.closePath();
  };
  if (s === "a") hor(x, y);
  else if (s === "g") hor(x, y + hh);
  else if (s === "d") hor(x, y + h);
  else if (s === "f") ver(x, y, hh);
  else if (s === "b") ver(x + w, y, hh);
  else if (s === "e") ver(x, y + hh, hh);
  else if (s === "c") ver(x + w, y + hh, hh);
  ctx.fill();
}

/**
 * Dibuja `texto` (dígitos, «-», « » y «.») en 7 segmentos, alineado a la
 * DERECHA en `xDer`. Los segmentos apagados se ven tenues, como en una
 * pantalla real. Devuelve el ancho usado.
 */
export function dibujar7Seg(
  ctx: CanvasRenderingContext2D,
  texto: string,
  xDer: number,
  y: number,
  alto: number,
  on: string,
  off: string,
): number {
  const w = alto * 0.5;
  const t = alto * 0.12;
  const paso = w + alto * 0.3;
  // celdas: cada dígito ocupa una; el punto se pega al dígito anterior
  const celdas: { c: string; punto: boolean }[] = [];
  for (const ch of texto) {
    if (ch === "." || ch === ",") {
      const ult = celdas[celdas.length - 1];
      if (ult) ult.punto = true;
      else celdas.push({ c: " ", punto: true });
    } else celdas.push({ c: ch, punto: false });
  }
  const ancho = celdas.length * paso;
  let x = xDer - ancho + alto * 0.12;
  ctx.save();
  for (const cel of celdas) {
    ctx.save();
    // ligera inclinación, como las pantallas de laboratorio
    ctx.transform(1, 0, -0.09, 1, (y + alto) * 0.09, 0);
    const encendidos = SEG[cel.c] ?? "";
    for (const s of "abcdefg") {
      ctx.fillStyle = encendidos.includes(s) ? on : off;
      segmento(ctx, x, y, w, alto, t, s);
    }
    ctx.fillStyle = cel.punto ? on : off;
    ctx.beginPath();
    ctx.arc(x + w + alto * 0.12, y + alto - t * 0.1, t * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    x += paso;
  }
  ctx.restore();
  return ancho;
}

/** Cuatro cifras significativas, como una pantalla de 4 dígitos. */
export function cuatroCifras(v: number): string {
  const a = Math.abs(v);
  if (a >= 1000) return Math.min(9999, Math.round(a)).toString();
  if (a >= 100) return a.toFixed(1);
  if (a >= 10) return a.toFixed(2);
  return a.toFixed(3);
}

/* ── Fuente de laboratorio: dos pantallas LED (V rojo, A verde) ──────────── */
export function dibujarFuente(p: Pantalla, V: number, I: number) {
  const firma = `${V.toFixed(2)}|${I.toFixed(4)}`;
  if (p.firma === firma) return;
  p.firma = firma;
  const { ctx, canvas } = p;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "#06080a";
  ctx.fillRect(0, 0, W, H);
  const mitad = W / 2;
  const caja = (x0: number, col: string, colOff: string, valor: string, unidad: string) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0d0f12");
    g.addColorStop(1, "#050607");
    ctx.fillStyle = g;
    ctx.fillRect(x0 + 10, 12, mitad - 20, H - 24);
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    dibujar7Seg(ctx, valor, x0 + mitad - 46, 58, 56, col, colOff);
    ctx.shadowBlur = 0;
    ctx.fillStyle = col;
    ctx.font = "900 40px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(unidad, x0 + mitad - 50, 124);
  };
  caja(0, "#ff3b2f", "rgba(255,59,47,0.07)", cuatroCifras(V), "V");
  caja(mitad, "#3dff7a", "rgba(61,255,122,0.07)", cuatroCifras(I), "A");
  p.tex.needsUpdate = true;
}

/* ── Multímetro: LCD gris verdoso con V grande y A abajo ─────────────────── */
export function dibujarMultimetro(p: Pantalla, V: number, I: number) {
  const firma = `${V.toFixed(2)}|${I.toFixed(4)}`;
  if (p.firma === firma) return;
  p.firma = firma;
  const { ctx, canvas } = p;
  const W = canvas.width, H = canvas.height;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#b7c4ad");
  g.addColorStop(1, "#97a68e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const on = "#14190f", off = "rgba(20,25,15,0.07)";
  // indicadores
  ctx.fillStyle = on;
  ctx.font = "800 26px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("AC", 18, 14);
  ctx.fillText("AUTO", 70, 14);
  dibujar7Seg(ctx, cuatroCifras(V), W - 78, 66, 76, on, off);
  ctx.font = "900 56px system-ui, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("V", W - 70, 152);
  // segunda línea: corriente
  ctx.fillRect(18, 186, W - 36, 3);
  dibujar7Seg(ctx, cuatroCifras(I), W - 80, 202, 40, on, off);
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText("A", W - 70, 244);
  p.tex.needsUpdate = true;
}

/* ── Osciloscopio de dos canales ─────────────────────────────────────────── */
export interface DatosOsciloscopio {
  /** Tiempo real (s) en el que va el haz. */
  t: number;
  femPico: number;
  omega: number;
  vDiv: number;
  etiquetaVDiv: string;
  etiquetaF: string;
  /** Duración de la pantalla completa (s). */
  barrido: number;
  divX: number;
  divY: number;
}

export function dibujarOsciloscopio(p: Pantalla, d: DatosOsciloscopio) {
  const { ctx, canvas } = p;
  const W = canvas.width, H = canvas.height;
  // fondo de fósforo
  const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, "#06241c");
  g.addColorStop(1, "#010b08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const mX = 18, mTop = 46, mBot = 46;
  const gw = W - mX * 2, gh = H - mTop - mBot;
  const dx = gw / d.divX, dy = gh / d.divY;
  // retícula
  ctx.strokeStyle = "rgba(120,220,180,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= d.divX; i++) { ctx.moveTo(mX + i * dx, mTop); ctx.lineTo(mX + i * dx, mTop + gh); }
  for (let j = 0; j <= d.divY; j++) { ctx.moveTo(mX, mTop + j * dy); ctx.lineTo(mX + gw, mTop + j * dy); }
  ctx.stroke();
  // ejes centrales con marcas finas
  ctx.strokeStyle = "rgba(140,240,200,0.38)";
  ctx.beginPath();
  const cy = mTop + gh / 2, cx = mX + gw / 2;
  ctx.moveTo(mX, cy); ctx.lineTo(mX + gw, cy);
  ctx.moveTo(cx, mTop); ctx.lineTo(cx, mTop + gh);
  for (let i = 0; i <= d.divX * 5; i++) { const x = mX + (i * dx) / 5; ctx.moveTo(x, cy - 4); ctx.lineTo(x, cy + 4); }
  for (let j = 0; j <= d.divY * 5; j++) { const y = mTop + (j * dy) / 5; ctx.moveTo(cx - 4, y); ctx.lineTo(cx + 4, y); }
  ctx.stroke();

  const T = d.barrido;
  const t0 = Math.floor(d.t / T) * T;
  const frac = (d.t - t0) / T;
  const xHaz = mX + frac * gw;
  const N = 220;
  const yFem = (t: number) => {
    const v = d.femPico * Math.sin(d.omega * t);
    return cy - Math.max(-d.divY / 2 - 0.2, Math.min(d.divY / 2 + 0.2, v / d.vDiv)) * dy;
  };
  const yFlujo = (t: number) => cy - Math.cos(d.omega * t) * 2.2 * dy;

  const trazo = (fy: (t: number) => number, desde: number, hasta: number, base: number) => {
    ctx.beginPath();
    let primero = true;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      if (u < desde || u > hasta) continue;
      const x = mX + u * gw;
      const y = fy(base + u * T);
      if (primero) { ctx.moveTo(x, y); primero = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  ctx.lineJoin = "round";
  // canal 2: flujo Φ (normalizado), cian
  ctx.strokeStyle = "rgba(34,211,238,0.30)";
  ctx.lineWidth = 2;
  trazo(yFlujo, frac + 0.03, 1, t0 - T);
  ctx.strokeStyle = "rgba(34,211,238,0.85)";
  trazo(yFlujo, 0, frac, t0);
  // canal 1: FEM, amarillo, con resplandor de fósforo
  ctx.shadowColor = "#fde047";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(253,224,71,0.32)";
  ctx.lineWidth = 3.5;
  trazo(yFem, frac + 0.03, 1, t0 - T);
  ctx.strokeStyle = "#fff59a";
  trazo(yFem, 0, frac, t0);
  // el haz
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(xHaz, yFem(d.t), 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // rótulos de canal (grandes: la pantalla se ve chica)
  ctx.font = "800 26px ui-monospace, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#fde047";
  ctx.fillText(`CH1 FEM ${d.etiquetaVDiv}`, mX, 23);
  ctx.textAlign = "right";
  ctx.fillStyle = "#67e8f9";
  ctx.fillText("CH2 Φ", W - mX, 23);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(200,255,230,0.85)";
  ctx.fillText(`${Math.round((T / d.divX) * 1000)} ms/div`, mX, H - 22);
  ctx.textAlign = "right";
  ctx.fillText(d.etiquetaF, W - mX, H - 22);
  p.tex.needsUpdate = true;
}

/* ── Texturas fijas (caché de módulo) ─────────────────────────────────────── */
let _tapete: THREE.CanvasTexture | null = null;
/** Tapete antiestático de banco de electrónica: verde azulado con cuadrícula. */
export function texturaTapete(): THREE.CanvasTexture {
  if (_tapete) return _tapete;
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1d5b57";
  x.fillRect(0, 0, S, S);
  // grano de la goma
  const img = x.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    img.data[i] = Math.max(0, Math.min(255, img.data[i]! + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1]! + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2]! + n));
  }
  x.putImageData(img, 0, 0);
  x.strokeStyle = "rgba(190,240,230,0.20)";
  x.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    x.beginPath(); x.moveTo((i * S) / 8, 0); x.lineTo((i * S) / 8, S); x.stroke();
    x.beginPath(); x.moveTo(0, (i * S) / 8); x.lineTo(S, (i * S) / 8); x.stroke();
  }
  x.strokeStyle = "rgba(190,240,230,0.07)";
  x.lineWidth = 1;
  for (let i = 0; i <= 32; i++) {
    x.beginPath(); x.moveTo((i * S) / 32, 0); x.lineTo((i * S) / 32, S); x.stroke();
    x.beginPath(); x.moveTo(0, (i * S) / 32); x.lineTo(S, (i * S) / 32); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  t.anisotropy = 8;
  _tapete = t;
  return t;
}

let _rayas: THREE.CanvasTexture | null = null;
/**
 * Rayas suaves a lo largo de un tubo (la coordenada U de TubeGeometry corre
 * a lo largo de la curva). Desplazando `offset.x` en cada cuadro el campo
 * «fluye» de N a S.
 */
export function texturaRayas(): THREE.CanvasTexture {
  if (_rayas) return _rayas;
  const c = document.createElement("canvas");
  c.width = 128; c.height = 8;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, "rgba(255,255,255,0.10)");
  g.addColorStop(0.55, "rgba(255,255,255,0.35)");
  g.addColorStop(0.85, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0.10)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  _rayas = t;
  return t;
}

let _flechas: THREE.CanvasTexture | null = null;
/** Chevrones para las bandas del diagrama de energía (Sankey). */
export function texturaFlechas(): THREE.CanvasTexture {
  if (_flechas) return _flechas;
  const c = document.createElement("canvas");
  c.width = 128; c.height = 64;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(255,255,255,0.55)";
  x.fillRect(0, 0, 128, 64);
  x.fillStyle = "rgba(255,255,255,1)";
  x.beginPath();
  x.moveTo(40, 8); x.lineTo(80, 32); x.lineTo(40, 56); x.lineTo(56, 32);
  x.closePath();
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  _flechas = t;
  return t;
}

const _letras = new Map<string, THREE.CanvasTexture>();
/** Letra pintada (N o S) para estampar en el imán. */
export function texturaLetra(letra: string): THREE.CanvasTexture {
  const ya = _letras.get(letra);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 128, 128);
  x.fillStyle = "#f8fafc";
  x.font = "900 112px system-ui, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(letra, 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _letras.set(letra, t);
  return t;
}

let _chispa: THREE.CanvasTexture | null = null;
/** Mancha radial suave (calor, resplandores). */
export function texturaChispa(): THREE.CanvasTexture {
  if (_chispa) return _chispa;
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  _chispa = t;
  return t;
}

let _cepillado: THREE.CanvasTexture | null = null;
/** Aluminio cepillado (rugosidad) para paneles frontales. */
export function texturaCepillado(): THREE.CanvasTexture {
  if (_cepillado) return _cepillado;
  const W = 256, H = 256;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#8a8a8a";
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * H;
    const v = 110 + Math.floor(Math.random() * 60);
    x.strokeStyle = `rgba(${v},${v},${v},0.5)`;
    x.lineWidth = Math.random() * 1.4;
    x.beginPath();
    const x0 = Math.random() * W;
    x.moveTo(x0, y);
    x.lineTo(x0 + 40 + Math.random() * 160, y);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  _cepillado = t;
  return t;
}
