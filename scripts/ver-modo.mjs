#!/usr/bin/env node
/**
 * ABRIR UN MODO CONCRETO DEL LABORATORIO Y FOTOGRAFIARLO.
 *
 *     MODO="Escribe el término" node scripts/ver-modo.mjs <slug>...
 *
 * `mirar-labs.mjs` retrata el laboratorio como se abre, que es siempre el
 * primer modo. Los otros —«Escribe el término», «Completa el texto»— no salen
 * en ninguna captura, así que un cambio hecho ahí dentro no se puede mirar.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const SALIDA = process.env.SALIDA || './.modo';
const MODO = process.env.MODO || 'Escribe el término';
const USUARIO = process.env.LAB_USUARIO || 'alumno@demo.uveg.mx';
const CLAVE = process.env.LAB_CLAVE || 'UvegDemo2026';
mkdirSync(SALIDA, { recursive: true });

const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu'] });
const ctx = await nav.newContext({ viewport: { width: 1360, height: 900 } });
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

  for (let i = 0; i < 20; i++) {
    const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
    const n = await tar.count();
    if (n && i < 6) {
      for (let k = 0; k < n; k++) { await tar.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(140); }
      await p.waitForTimeout(1100);
    }
    let bt = null;
    for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Capítulo 3")', 'button:has-text("Empezar")']) {
      const l = p.locator(sel).first();
      if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
    }
    if (!bt) break;
    await bt.click({ timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(900);
  }
  const om = p.locator('a:has-text("omitir"), button:has-text("omitir")').first();
  if (await om.count()) await om.click({ timeout: 3000 }).catch(() => {});
  await p.waitForTimeout(700);

  const pest = p.locator(`button:has-text("${MODO}")`).first();
  if (!(await pest.count())) { console.log(`SIN MODO  ${slug.padEnd(30)} «${MODO}»`); continue; }
  await pest.click({ timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(1400);
  /* Las viñetas van con `loading="lazy"`: si no se baja hasta ellas, el
   * navegador no las pide y la captura enseña huecos que en realidad existen. */
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(900);

  await p.screenshot({ path: join(SALIDA, `${slug}.png`) });
  const nuevos = errores.slice(antes);
  console.log(`${nuevos.length ? 'ERROR  ' : 'ok     '} ${slug.padEnd(30)} errores:${nuevos.length}`);
  for (const e of nuevos) console.log('          ' + e);
}
await nav.close();
console.log(`capturas en ${SALIDA}`);
