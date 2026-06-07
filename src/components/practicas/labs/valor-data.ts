/**
 * Datos para el laboratorio de Valor posicional (PM-I-P08).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabValorPosicional.tsx) y la escena 3D (ValorPosicionalScene.tsx) sin
 * arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica: en el sistema DECIMAL, el lugar que ocupa una cifra decide
 * su valor. Cada posición vale 10 VECES MÁS que la de su derecha:
 *   unidad (1) → decena (10) → centena (100) → millar (1000).
 * Por eso el 2 de 1234 vale 200 y el 2 de 4321 vale 20. Con bloques base-10
 * (unidad = cubito, decena = barra de 10, centena = placa de 100, millar = cubo
 * de 1000) se VE por qué: diez cubitos forman una barra, diez barras una placa,
 * diez placas un cubo. El CERO es un marcador: guarda el lugar aunque no aporte.
 */

export interface Lugar {
  key: "millares" | "centenas" | "decenas" | "unidades";
  nombre: string;
  singular: string;
  valor: number; // 1000, 100, 10, 1
  exp: number; // 3, 2, 1, 0
  color: string;
  icono: string; // Font Awesome 6
}

/** De mayor a menor (como se escribe el número, de izquierda a derecha). */
export const LUGARES: Lugar[] = [
  { key: "millares", nombre: "Millares", singular: "millar", valor: 1000, exp: 3, color: "#F472B6", icono: "fa-cube" },
  { key: "centenas", nombre: "Centenas", singular: "centena", valor: 100, exp: 2, color: "#FBBF24", icono: "fa-table-cells-large" },
  { key: "decenas", nombre: "Decenas", singular: "decena", valor: 10, exp: 1, color: "#34D399", icono: "fa-grip-lines-vertical" },
  { key: "unidades", nombre: "Unidades", singular: "unidad", valor: 1, exp: 0, color: "#22D3EE", icono: "fa-square-full" },
];

export const MAX_DIGITO = 9;

export interface Digitos {
  millares: number;
  centenas: number;
  decenas: number;
  unidades: number;
}

export const NUM_DEFAULT: Digitos = { millares: 1, centenas: 2, decenas: 3, unidades: 4 };

/** Reconstruye el número a partir de sus cifras. */
export const numeroDe = (d: Digitos): number =>
  d.millares * 1000 + d.centenas * 100 + d.decenas * 10 + d.unidades;

/** Separa un número (0–9999) en sus cuatro cifras. */
export const digitosDe = (n: number): Digitos => {
  const v = Math.max(0, Math.min(9999, Math.floor(n)));
  return {
    millares: Math.floor(v / 1000) % 10,
    centenas: Math.floor(v / 100) % 10,
    decenas: Math.floor(v / 10) % 10,
    unidades: v % 10,
  };
};

/** Cifra de un lugar dado. */
export const cifraDe = (d: Digitos, key: Lugar["key"]): number => d[key];

/** ¿Hay un cero "en medio" (entre cifras significativas)? Marca el rol del 0. */
export const tieneCeroIntermedio = (d: Digitos): boolean => {
  const cifras = [d.millares, d.centenas, d.decenas, d.unidades];
  const primera = cifras.findIndex((c) => c > 0);
  const ultima = cifras.length - 1 - [...cifras].reverse().findIndex((c) => c > 0);
  if (primera < 0) return false;
  for (let i = primera + 1; i < ultima; i++) if (cifras[i] === 0) return true;
  return false;
};
