#!/usr/bin/env node
/**
 * ¿CUÁNTAS FICHAS Y ZONAS SALEN ILUSTRADAS EN CADA LABORATORIO?
 *
 *     SITIO=… node scripts/contar-vinetas.mjs [slug...]
 *
 * Cuenta en pantalla, en el primer modo de cada laboratorio: fichas con dibujo
 * (`data-vineta`), zonas con dibujo (`data-fondo`) y fichas que `enProsa()`
 * deja sin dibujo a propósito (las `display: inline` dentro de un párrafo).
 * Esa última cifra es la que hay que vigilar: si un laboratorio de bandejas
 * sale con muchas «en prosa», la regla se está comiendo fichas legítimas.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(readFileSync('scripts/.labs-dom.json', 'utf8'));
const nav = await chromium.launch();
const p = await (await nav.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 180000 });
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(process.env.LAB_USUARIO || 'alumno1@cenbachillerato-demo.com');
await p.locator('input[type="password"]').first().fill(process.env.LAB_CLAVE || 'Demo2026!');
const chk = p.locator('input[type="checkbox"]').first();
if (await chk.count()) await chk.check().catch(() => {});
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 120000 });

let tv = 0, tf = 0, tp = 0;
for (const slug of slugs) {
  await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForLoadState('networkidle').catch(() => {});
  for (let i = 0; i < 12; i++) {
    const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
    const n = await tar.count();
    if (n && i < 6) { for (let k = 0; k < n; k++) { await tar.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(100); } await p.waitForTimeout(700); }
    let bt = null;
    for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Empezar")', 'button:has-text("Ya lo sé, omitir")']) {
      const l = p.locator(sel).first();
      if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
    }
    if (!bt) break;
    await bt.click({ timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(800);
  }
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({
    v: document.querySelectorAll('[data-vineta="true"]').length,
    f: document.querySelectorAll('img[data-fondo-auto]').length,
    prosa: [...document.querySelectorAll('[draggable="true"], [data-sel], button[data-done]')]
      .filter((e) => e.parentElement && getComputedStyle(e.parentElement).display === 'inline').length,
  }));
  tv += r.v; tf += r.f; tp += r.prosa;
  console.log(`${slug.padEnd(34)} fichas:${String(r.v).padStart(3)}  zonas:${String(r.f).padStart(2)}  en-prosa:${r.prosa}`);
}
await nav.close();
console.log(`\nfichas ilustradas ${tv} · zonas ilustradas ${tf} · omitidas por prosa ${tp}`);
