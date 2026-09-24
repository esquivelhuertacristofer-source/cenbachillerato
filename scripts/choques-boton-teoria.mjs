#!/usr/bin/env node
/**
 * ¿A QUIÉN LE PISA EL BOTÓN FLOTANTE DE «TEORÍA»?
 *
 *     node scripts/choques-boton-teoria.mjs <slug>...
 *
 * El botón se movió al pie derecho (`bottom:16 right:16`) para que dejara de
 * taparle el texto al narrador. En los laboratorios que YA tenían algo en esa
 * esquina —una etiqueta del elemento, una leyenda— ahora se pisan. Salió
 * mirando `modelos-atomicos`: la etiqueta «Carbono · Z 6», de 103×63, queda
 * debajo del botón.
 *
 * SOLO CUENTAN LOS CHOQUES QUE IMPORTAN. Comparar rectángulos a secas da
 * basura: el fondo de la expedición, el velo y la barra de estado de 940 px
 * «solapan» con cualquier cosa del pie sin taparla. Aquí solo se miran piezas
 * pequeñas —menos de 420×140— que es lo que de verdad puede quedar escondido
 * detrás de un botón de 99×44.
 */
import { chromium } from 'playwright';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const USUARIO = process.env.LAB_USUARIO || 'alumno@demo.uveg.mx';
const CLAVE = process.env.LAB_CLAVE || 'UvegDemo2026';

const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu'] });
const p = await (await nav.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 240000 });
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(USUARIO);
await p.locator('input[type="password"]').first().fill(CLAVE);
await p.locator('input[type="checkbox"]').first().check();
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 90000 });
await p.waitForTimeout(1500);

let conChoque = 0, limpios = 0, sinFab = 0;
for (const slug of process.argv.slice(2)) {
  try {
    await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
    await p.waitForLoadState('networkidle').catch(() => {});
    for (let i = 0; i < 8; i++) {
      const t = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
      const n = await t.count();
      if (n) { for (let k = 0; k < n; k++) { await t.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(140); } await p.waitForTimeout(1100); }
      let bt = null;
      for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Empezar")']) {
        const l = p.locator(sel).first();
        if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
      }
      if (!bt) break;
      await bt.click({ timeout: 8000 }).catch(() => {});
      await p.waitForTimeout(1600);
    }
    await p.waitForTimeout(2800);

    const choques = await p.evaluate(() => {
      const fab = document.querySelector('.ex-teoria-fab');
      if (!fab) return null;
      const rf = fab.getBoundingClientRect();
      return [...document.querySelectorAll('button, a, div, span')]
        .filter((e) => {
          if (e === fab || e.contains(fab) || fab.contains(e)) return false;
          const re = e.getBoundingClientRect();
          /* Piezas pequeñas: lo que de verdad puede desaparecer detrás del botón. */
          if (re.width < 28 || re.height < 20 || re.width > 420 || re.height > 140) return false;
          if (re.right < rf.left || re.left > rf.right || re.bottom < rf.top || re.top > rf.bottom) return false;
          const c = getComputedStyle(e);
          if (c.visibility === 'hidden' || c.display === 'none' || c.opacity === '0') return false;
          return true;
        })
        .map((e) => `${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)} "${(e.textContent || '').trim().slice(0, 34)}"`);
    });

    if (choques === null) { sinFab++; console.log(`sin-fab  ${slug}`); continue; }
    if (choques.length) { conChoque++; console.log(`CHOQUE   ${slug.padEnd(32)} ${choques.length}`); for (const c of choques) console.log('            ' + c); }
    else { limpios++; }
  } catch (e) {
    console.log(`FALLO    ${slug.padEnd(32)} ${String(e).slice(0, 90)}`);
  }
}
await nav.close();
console.log(`\ncon choque: ${conChoque} · limpios: ${limpios} · sin botón flotante: ${sinFab}`);
