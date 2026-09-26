#!/usr/bin/env node
/**
 * ¿QUÉ VE EL ALUMNO EN CADA LABORATORIO DOM, Y QUÉ DE ESO TIENE IMAGEN?
 *
 *     SITIO=https://… node scripts/inventario-fichas-dom.mjs [slug...]
 *
 * Nace de «el de licencias de software es solo texto». Las 2.115 viñetas
 * existentes salieron del GLOSARIO de cada ficha teórica, no de lo que se toca
 * en el laboratorio: `licencias-software` tiene «licencia-privativa», pero su
 * zona se llama «Software privativo» y sus fichas «Firefox», «GNU/Linux»… y
 * nada de eso tiene imagen. Medido desde el código se habría contado el
 * glosario y habría salido «ya tiene imágenes».
 *
 * Así que se mide EN PANTALLA: por cada modo de cada laboratorio, las fichas
 * que se arrastran o se eligen, y las zonas donde se sueltan, con su texto tal
 * como se lee, y si ya llevan una <img> dentro.
 *
 *   → scripts/.inventario-fichas-dom.json
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const SITIO = process.env.SITIO || 'https://ceneducacion.com.mx';
const USUARIO = process.env.LAB_USUARIO || 'alumno1@cenbachillerato-demo.com';
const CLAVE = process.env.LAB_CLAVE || 'Demo2026!';
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : JSON.parse(readFileSync('scripts/.labs-dom.json', 'utf8'));

const nav = await chromium.launch();
const p = await (await nav.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 180000 });
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(USUARIO);
await p.locator('input[type="password"]').first().fill(CLAVE);
const chk = p.locator('input[type="checkbox"]').first();
if (await chk.count()) await chk.check().catch(() => {});
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 120000 });

/** Lo que hay en pantalla AHORA: fichas y zonas, con su texto y si llevan imagen. */
const leer = () => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
    return r.width > 8 && r.height > 8 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const texto = (e) => (e.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean)[0] || '';
  const conImg = (e) => !!e.querySelector('img');

  const fichas = [...document.querySelectorAll('[draggable="true"], [data-sel], button[data-done]')]
    .filter(vis).map((e) => ({ t: texto(e), img: conImg(e) })).filter((f) => f.t && f.t.length < 80);

  /* Una zona se reconoce por su invitación a soltar; su nombre es la primera
   * línea del contenedor que la envuelve y que ya no es solo la invitación. */
  const zonas = [];
  for (const e of document.querySelectorAll('*')) {
    if (e.children.length) continue;
    /* «Suelta aquí…», no «Arrastra cada programa a su tipo»: la instrucción
     * general sube hasta la fila de pestañas y se leía como zona. */
    if (!/^(suelta|arrastra|coloca)\s+aqu[ií]/i.test((e.textContent || '').trim())) continue;
    let z = e.parentElement;
    for (let i = 0; i < 4 && z && texto(z) === texto(e); i++) z = z.parentElement;
    if (z && vis(z) && texto(z).length > 1 && !/^\d+$/.test(texto(z))) zonas.push({ t: texto(z), img: conImg(z) });
  }
  return { fichas, zonas };
});

/** Las pestañas de modo: el primer grupo de 2+ botones hermanos con icono y texto corto. */
const modos = () => p.evaluate(() => {
  const grupos = new Map();
  for (const b of document.querySelectorAll('main button, [class*="lab"] button, button')) {
    const t = (b.innerText || '').trim();
    if (!t || t.length > 40 || !b.querySelector('i, svg')) continue;
    const padre = b.parentElement; if (!padre) continue;
    if (!grupos.has(padre)) grupos.set(padre, []);
    grupos.get(padre).push(t);
  }
  for (const [, ts] of grupos) if (ts.length >= 2 && ts.length <= 6 && !ts.some((t) => /teor[ií]a|laboratorio|cap[ií]tulo/i.test(t))) return ts;
  return [];
});

const salida = [];
for (const slug of slugs) {
  const fila = { slug, modos: [] };
  try {
    await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForLoadState('networkidle').catch(() => {});
    for (let i = 0; i < 12; i++) {
      const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
      const n = await tar.count();
      if (n && i < 6) { for (let k = 0; k < n; k++) { await tar.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(110); } await p.waitForTimeout(800); }
      let bt = null;
      for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Empezar")', 'button:has-text("Ya lo sé, omitir")']) {
        const l = p.locator(sel).first();
        if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
      }
      if (!bt) break;
      await bt.click({ timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(900);
    }
    await p.waitForTimeout(900);
    const ms = await modos();
    if (!ms.length) fila.modos.push({ modo: '(único)', ...(await leer()) });
    for (const m of ms) {
      await p.locator(`button:has-text("${m.replace(/"/g, '\\"')}")`).first().click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(900);
      fila.modos.push({ modo: m, ...(await leer()) });
    }
    const f = fila.modos.flatMap((m) => m.fichas), z = fila.modos.flatMap((m) => m.zonas);
    const conImg = [...f, ...z].filter((x) => x.img).length;
    console.log(`${slug.padEnd(34)} modos:${fila.modos.length} fichas:${f.length} zonas:${z.length} con-imagen:${conImg}`);
  } catch (e) {
    fila.error = String(e).slice(0, 120);
    console.log(`FALLO ${slug} ${fila.error}`);
  }
  salida.push(fila);
  writeFileSync('scripts/.inventario-fichas-dom.json', JSON.stringify(salida, null, 1));
}
await nav.close();
const todo = salida.flatMap((s) => s.modos.flatMap((m) => [...m.fichas, ...m.zonas]));
console.log(`\n${salida.length} labs · ${todo.length} fichas+zonas en pantalla · con imagen: ${todo.filter((x) => x.img).length}`);
