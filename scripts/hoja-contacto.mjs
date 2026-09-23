#!/usr/bin/env node
/**
 * HOJA DE CONTACTO DE LOS LABORATORIOS
 *
 *     node scripts/hoja-contacto.mjs
 *
 * `mirar-labs.mjs` deja una captura por laboratorio. Revisarlas de una en una
 * no escala: son más de cien. Esto las pega en láminas de nueve, como la hoja
 * de contacto de un carrete, para poder juzgar de un vistazo cuáles se ven
 * bien y cuáles parecen un diagrama flotando.
 *
 * Cada viñeta lleva su slug debajo, porque una lámina sin nombres obliga a
 * volver a abrir los archivos para saber qué se está mirando.
 *
 *   → scripts/.capturas-labs/hoja-01.png, hoja-02.png, …
 */
import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = process.env.SALIDA || join(AQUI, '.capturas-labs');

const COL = 3;
const FIL = 3;
const ANCHO = 420; // por viñeta
const ALTO = 270;
const PIE = 26; // franja del nombre

const fotos = readdirSync(DIR)
  .filter((f) => f.endsWith('.png') && !f.startsWith('hoja-'))
  .sort();

if (!fotos.length) {
  console.log('no hay capturas todavia; corre antes scripts/mirar-labs.mjs');
  process.exit(0);
}

/** Etiqueta en SVG: sharp no escribe texto, pero sí compone un SVG. */
function etiqueta(texto) {
  const limpio = texto.replace(/[<>&]/g, '');
  return Buffer.from(
    `<svg width="${ANCHO}" height="${PIE}"><rect width="100%" height="100%" fill="#0a1220"/>` +
      `<text x="8" y="18" font-family="monospace" font-size="15" fill="#7fd4ff">${limpio}</text></svg>`,
  );
}

const porHoja = COL * FIL;
const hojas = Math.ceil(fotos.length / porHoja);

for (let h = 0; h < hojas; h++) {
  const trozo = fotos.slice(h * porHoja, (h + 1) * porHoja);
  const capas = [];
  for (let i = 0; i < trozo.length; i++) {
    const cx = (i % COL) * ANCHO;
    const cy = Math.floor(i / COL) * (ALTO + PIE);
    /* `fit: contain` y no `cover`: recortar una escena 3D para que cuadre
     * puede esconder justo la pieza que se quiere juzgar. */
    const img = await sharp(join(DIR, trozo[i]))
      .resize(ANCHO, ALTO, { fit: 'contain', background: '#050e1c' })
      .toBuffer();
    capas.push({ input: img, left: cx, top: cy });
    capas.push({ input: etiqueta(trozo[i].replace('.png', '')), left: cx, top: cy + ALTO });
  }

  const salida = join(DIR, `hoja-${String(h + 1).padStart(2, '0')}.png`);
  await sharp({
    create: {
      width: COL * ANCHO,
      height: FIL * (ALTO + PIE),
      channels: 3,
      background: '#050e1c',
    },
  })
    .composite(capas)
    .png()
    .toFile(salida);
  console.log(`${salida}  (${trozo.length})`);
}

writeFileSync(join(DIR, 'orden.txt'), fotos.join('\n'), 'utf8');
console.log(`\n${fotos.length} capturas en ${hojas} hojas`);
