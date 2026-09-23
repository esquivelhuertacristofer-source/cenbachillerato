/**
 * Abrir la FICHA TEÓRICA de un laboratorio y fotografiarla.
 *
 * `mirar-labs.mjs` retrata el laboratorio, pero la ficha vive detrás del botón
 * «Teoría» y nunca sale en esas capturas. Como el cambio de las viñetas es
 * justo ahí dentro, sin esto no hay forma de saber si se ven.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const SALIDA = process.env.SALIDA || './.ficha';
const USUARIO = process.env.LAB_USUARIO || 'alumno@demo.uveg.mx';
const CLAVE = process.env.LAB_CLAVE || 'UvegDemo2026';
mkdirSync(SALIDA, { recursive: true });

const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu'] });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(String(e).slice(0, 180)));

await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 240000 });
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(USUARIO);
await p.locator('input[type="password"]').first().fill(CLAVE);
await p.locator('input[type="checkbox"]').first().check();
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 90000 });

for (const slug of process.argv.slice(2)) {
  const antes = errores.length;
  await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await p.waitForLoadState('networkidle').catch(() => {});

  /* Hasta el laboratorio, como un alumno: el mismo recorrido de la Expedición. */
  for (let i = 0; i < 20; i++) {
    const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
    const n = await tar.count();
    if (n && i < 6) {
      for (let k = 0; k < n; k++) { await tar.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(150); }
      await p.waitForTimeout(1200);
    }
    let bt = null;
    for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Capítulo 3")', 'button:has-text("Empezar")']) {
      const l = p.locator(sel).first();
      if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
    }
    if (!bt) break;
    await bt.click({ timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(1000);
  }
  const om = p.locator('a:has-text("omitir"), button:has-text("omitir")').first();
  if (await om.count()) await om.click({ timeout: 3000 }).catch(() => {});
  const ent = p.locator('button:has-text("Entrar al laboratorio")').first();
  if (await ent.count()) await ent.click({ timeout: 3000 }).catch(() => {});
  await p.waitForTimeout(800);

  /* La ficha.
   *
   * En los laboratorios 3D vive detrás de un botón flotante; en los de
   * arrastrar va EN LÍNEA y PLEGADA dentro de la expedición, con su cabecera
   * rotulada por accesibilidad («Ver ficha teórica»). Apuntar al texto
   * «Teoría» abría cualquier otra cosa, así que se busca por ese rótulo. */
  const abrir = p.locator('[aria-label="Ver ficha teórica"]').first();
  if (await abrir.count()) { await abrir.click({ timeout: 6000 }).catch(() => {}); await p.waitForTimeout(700); }
  else {
    const fab = p.locator('.ex-teoria-fab, button[title="Teoría"]').first();
    if (await fab.count()) { await fab.click({ timeout: 6000 }).catch(() => {}); await p.waitForTimeout(900); }
  }
  const tab = p.locator('button:has-text("Conceptos centrales"), button:has-text("Glosario")').first();
  if ((await tab.count()) && (await tab.isVisible().catch(() => false))) { await tab.click({ timeout: 4000 }).catch(() => {}); }
  await p.waitForTimeout(1200);
  /* Sin esto la captura sale donde quedó el desplazamiento, no en la ficha. */
  await p.locator('[aria-label="Ocultar ficha teórica"]').first().scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
  await p.waitForTimeout(600);

  await p.screenshot({ path: join(SALIDA, `${slug}.png`) });
  const nuevos = errores.slice(antes);
  console.log(`${nuevos.length ? 'ERROR  ' : 'ok     '} ${slug.padEnd(30)} errores:${nuevos.length}`);
  for (const e of nuevos) console.log('          ' + e);
}
await nav.close();
console.log(`capturas en ${SALIDA}`);
