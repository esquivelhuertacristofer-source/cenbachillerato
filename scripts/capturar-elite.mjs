#!/usr/bin/env node
/**
 * FOTOGRAFÍA UN LABORATORIO SUELTO, MODO POR MODO, EN COMPUTADORA Y CELULAR.
 *
 *     node scripts/capturar-elite.mjs <slug> [espera_ms]
 *     SITIO=http://localhost:3130 node scripts/capturar-elite.mjs celula-organelos-3d
 *
 * Abre /zz-prueba-lab?slug=<slug> (sin sesión ni Expedición), espera a que el
 * lienzo pinte, y por cada botón de modo (.ls-modo) guarda una captura a
 * 1440×900 y otra a 390×844 en scripts/.capturas-elite/<slug>/.
 * Imprime los errores de consola: un lab que «se ve» pero escupe errores no
 * está terminado.
 *
 * GPU de verdad (ANGLE sobre D3D11): con swiftshader las capturas salen a
 * medio pintar y se confunden con estar roto.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SITIO = process.env.SITIO || 'http://localhost:3130';
const slug = process.argv[2];
const espera = Number(process.argv[3] || 4000);
if (!slug) { console.error('uso: node scripts/capturar-elite.mjs <slug> [espera_ms]'); process.exit(1); }
const SALIDA = join(AQUI, '.capturas-elite', slug);
mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch({
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu'],
});
const errores = new Set();
for (const [nombre, vista, movil] of [['escritorio', { width: 1440, height: 900 }, false], ['celular', { width: 390, height: 844 }, true]]) {
  const ctx = await navegador.newContext({ viewport: vista, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  const pag = await ctx.newPage();
  pag.on('console', (m) => { if (m.type() === 'error') errores.add(m.text().slice(0, 300)); });
  pag.on('pageerror', (e) => errores.add('pageerror: ' + String(e).slice(0, 300)));
  await pag.goto(`${SITIO}/zz-prueba-lab?slug=${encodeURIComponent(slug)}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await pag.waitForSelector('canvas, .ls-modo', { timeout: 180000 }).catch(() => {});
  await pag.waitForTimeout(espera);
  // La compuerta de equipo de protección (química, biología) tapa el lab.
  for (const texto of [/^\s*Omitir/i, /^\s*Saltar/i]) {
    const b = pag.getByRole('button', { name: texto }).first();
    if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await pag.waitForTimeout(1500); }
  }
  const modos = await pag.locator('.ls-modo').count();
  if (!modos) {
    await pag.screenshot({ path: join(SALIDA, `${nombre}.png`) });
    console.log(`${nombre}: sin .ls-modo → ${nombre}.png`);
  }
  for (let i = 0; i < modos; i++) {
    const boton = pag.locator('.ls-modo').nth(i);
    const etiqueta = ((await boton.textContent()) || `modo${i}`).trim().replace(/\s+/g, ' ').slice(0, 30);
    await boton.click().catch(() => {});
    await pag.waitForTimeout(espera);
    const archivo = `${nombre}-${i + 1}.png`;
    await pag.screenshot({ path: join(SALIDA, archivo) });
    console.log(`${nombre} modo ${i + 1} «${etiqueta}» → ${archivo}`);
  }
  await ctx.close();
}
await navegador.close();
console.log(errores.size ? `\nERRORES DE CONSOLA (${errores.size}):\n- ${[...errores].join('\n- ')}` : '\nsin errores de consola');
console.log(`capturas en ${SALIDA}`);
