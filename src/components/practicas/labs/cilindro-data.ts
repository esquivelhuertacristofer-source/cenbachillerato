/**
 * Datos para el laboratorio del volumen de un cilindro (PM-III-P04-A2).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCilindro.tsx) y la escena 3D (CilindroScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III, Geometría): el volumen de un cilindro
 * es el área de su base circular (π·r²) multiplicada por su altura (h):
 *     V = π · r² · h
 * Verlo como "apilar discos" hace evidente la fórmula, y permite calcular la
 * CAPACIDAD real de un tanque (tinaco, cisterna, tambo) en litros, porque
 * 1 m³ = 1000 L. Como el radio está al cuadrado, engorda el tanque sube el
 * volumen mucho más rápido que subir su altura.
 */

export interface Escenario {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6 (solid, free)
  contexto: string; // historia real
  porque: string; // qué representa cada medida
  r: number; // radio en metros
  h: number; // altura en metros
  liquido: string; // qué contiene
}

// Rango de los deslizadores (en metros). Pasos finos para tanques reales.
export const R_MIN = 0.2;
export const R_MAX = 2.0;
export const R_STEP = 0.1;
export const H_MIN = 0.4;
export const H_MAX = 4.0;
export const H_STEP = 0.1;

export const ESCENARIOS: Escenario[] = [
  {
    key: "tinaco",
    titulo: "El tinaco de la azotea",
    icono: "fa-house-chimney-window",
    contexto:
      "Un tinaco doméstico tiene 0.5 m de radio y 1.2 m de altura. ¿Cuántos litros de agua almacena cuando está lleno?",
    porque:
      "La tapa circular es la base: su área es π·r². Al multiplicarla por la altura obtienes el volumen; en litros, esa es la capacidad del tinaco.",
    r: 0.5,
    h: 1.2,
    liquido: "Agua",
  },
  {
    key: "cisterna",
    titulo: "La cisterna del edificio",
    icono: "fa-water",
    contexto:
      "Una cisterna cilíndrica mide 1 m de radio y 2 m de altura. ¿Qué volumen de agua cabe en ella?",
    porque:
      "Es un cilindro acostado o de pie: el agua llena un círculo de radio r en cada nivel, y hay h metros de esos círculos apilados.",
    r: 1.0,
    h: 2.0,
    liquido: "Agua",
  },
  {
    key: "tambo",
    titulo: "El tambo de 200 litros",
    icono: "fa-oil-can",
    contexto:
      "Un tambo industrial de los que se venden «de 200 litros» mide 0.28 m de radio y 0.88 m de altura. Calcula su volumen lleno al ras y compáralo con esa capacidad nominal.",
    porque:
      "Su volumen lleno hasta el borde es V·1000 ≈ 217 L: un poco más que los 200 L que anuncia el fabricante, porque el tambo nunca se llena al tope y se deja un margen libre. La capacidad nominal siempre es algo menor que el volumen geométrico.",
    r: 0.28,
    h: 0.88,
    liquido: "Combustible",
  },
  {
    key: "tanque",
    titulo: "El tanque australiano",
    icono: "fa-droplet",
    contexto:
      "Un tanque de captación de lluvia es ancho y bajo: 1.5 m de radio y 0.9 m de altura. ¿Cuánta agua de lluvia almacena?",
    porque:
      "Es bajo pero muy ancho. Como el radio está al cuadrado, ensanchar el tanque almacena mucha más agua que hacerlo más alto.",
    r: 1.5,
    h: 0.9,
    liquido: "Agua de lluvia",
  },
  {
    key: "silo",
    titulo: "El silo de grano",
    icono: "fa-warehouse",
    contexto:
      "Un silo agrícola mide 0.9 m de radio y 3.5 m de altura. ¿Qué volumen de grano cabe dentro?",
    porque:
      "Es alto y angosto. Subir la altura aumenta el volumen en proporción directa, pero nunca tan rápido como ensanchar el radio.",
    r: 0.9,
    h: 3.5,
    liquido: "Grano",
  },
];

/** Volumen del cilindro en metros cúbicos: V = π·r²·h. */
export const volumen = (r: number, h: number) => Math.PI * r * r * h;

/** Área de la base circular: A = π·r². */
export const areaBase = (r: number) => Math.PI * r * r;

/** Capacidad en litros (1 m³ = 1000 L). */
export const litros = (r: number, h: number) => volumen(r, h) * 1000;

/** Formatea un número con coma decimal es-MX, hasta `dec` decimales, y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const s = n.toLocaleString("es-MX", { maximumFractionDigits: dec });
  return s.replace("-", "−");
};
