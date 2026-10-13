/**
 * Texturas procedurales del laboratorio de Modelos atómicos (canvas, sin red).
 * Se generan una sola vez por sesión y se reutilizan (caché de módulo).
 */
import * as THREE from "three";

let destello: THREE.CanvasTexture | null = null;
/** Mancha suave y redonda (destellos, halos, resplandor de partículas). */
export function texturaDestello(): THREE.CanvasTexture {
  if (destello) return destello;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.18, "rgba(255,255,255,0.85)");
  gr.addColorStop(0.45, "rgba(255,255,255,0.22)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  destello = new THREE.CanvasTexture(c);
  destello.colorSpace = THREE.SRGBColorSpace;
  return destello;
}

/* Ruido de valor 2D periódico (para que la textura no tenga costuras). */
function ruido(semilla: number, tam: number) {
  const tabla = new Float32Array(tam * tam);
  let s = semilla;
  for (let i = 0; i < tabla.length; i++) {
    s = (s * 16807) % 2147483647;
    tabla[i] = s / 2147483647;
  }
  const at = (x: number, y: number) => tabla[((y % tam) + tam) % tam * tam + (((x % tam) + tam) % tam)]!;
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}

let hojaOro: THREE.CanvasTexture | null = null;
/**
 * Mapa de normales de una hoja de oro batida: arrugas finas y pliegues
 * suaves. Es lo que hace que la lámina se lea como METAL DELGADO y no como un
 * plano amarillo.
 */
export function normalHojaOro(): THREE.CanvasTexture {
  if (hojaOro) return hojaOro;
  const N = 256;
  const r1 = ruido(7, 8), r2 = ruido(19, 16), r3 = ruido(31, 32);
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      // pliegues: ruido con cresta (|.|) para que parezcan dobleces
      const pl = 1 - Math.abs(r1(u * 8, v * 8) * 2 - 1);
      h[y * N + x] = 0.55 * pl + 0.3 * r2(u * 16, v * 16) + 0.15 * r3(u * 32, v * 32);
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  const k = 2.6;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const hx = h[y * N + ((x + 1) % N)]! - h[y * N + ((x - 1 + N) % N)]!;
      const hy = h[((y + 1) % N) * N + x]! - h[((y - 1 + N) % N) * N + x]!;
      let nx = -hx * k, ny = -hy * k;
      const nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l;
      const i = (y * N + x) * 4;
      img.data[i] = Math.round((nx * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round((nz / l * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  hojaOro = new THREE.CanvasTexture(c);
  hojaOro.wrapS = hojaOro.wrapT = THREE.RepeatWrapping;
  return hojaOro;
}

let rugosidad: THREE.CanvasTexture | null = null;
/**
 * Variación sutil de rugosidad (huellas, pulido desigual). Un material
 * perfectamente uniforme es la firma del gráfico por computadora; esta
 * irregularidad mínima es la de un objeto que alguien tocó.
 */
export function rugosidadPulida(): THREE.CanvasTexture {
  if (rugosidad) return rugosidad;
  const N = 256;
  const r1 = ruido(3, 6), r2 = ruido(11, 24);
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      const val = 0.55 + 0.3 * r1(u * 6, v * 6) + 0.15 * r2(u * 24, v * 24);
      const i = (y * N + x) * 4;
      const b = Math.round(val * 255);
      img.data[i] = b; img.data[i + 1] = b; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  rugosidad = new THREE.CanvasTexture(c);
  rugosidad.wrapS = rugosidad.wrapT = THREE.RepeatWrapping;
  return rugosidad;
}
