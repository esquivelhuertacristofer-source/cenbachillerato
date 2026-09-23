#!/usr/bin/env node
/**
 * ¿CUÁNTAS ZONAS ACABAN DE VERDAD CON ILUSTRACIÓN DE FONDO?
 *
 *     node scripts/contar-fondos.mjs <slug>...
 *
 * El codemod mete `<FondoTermino>` en la zona, pero el componente no dibuja
 * nada si ese término no tiene `.webp` —`factores-produccion` tiene imágenes,
 * pero ninguna se llama «Tierra» ni «Capital»—. Contar los sitios del codemod
 * mediría la intención; esto mide el resultado.
 *
 * Se cuenta por ESTILO CALCULADO, no por atributo: `position: absolute` con
 * `z-index: -1` es exactamente la firma de la marca de agua y de nada más. El
 * atributo `style` serializado cambia de forma entre navegadores.
 */
import { chromium } from 'playwright';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const USUARIO = process.env.LAB_USUARIO || 'alumno@demo.uveg.mx';
const CLAVE = process.env.LAB_CLAVE || 'UvegDemo2026';

const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu'] });
const p = await (await nav.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(String(e).slice(0, 150)));

await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 240000 });
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(USUARIO);
await p.locator('input[type="password"]').first().fill(CLAVE);
await p.locator('input[type="checkbox"]').first().check();
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 90000 });

let conFondo = 0, sinFondo = 0, fallos = 0;
for (const slug of process.argv.slice(2)) {
  const antes = errores.length;
  try {
    await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
    await p.waitForLoadState('networkidle').catch(() => {});
    for (let i = 0; i < 20; i++) {
      const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
      const n = await tar.count();
      if (n && i < 6) {
        for (let k = 0; k < n; k++) { await tar.nth(k).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(130); }
        await p.waitForTimeout(1000);
      }
      let bt = null;
      for (const sel of ['button:has-text("Capítulo 2")', 'button:has-text("Capítulo 3")', 'button:has-text("Empezar")']) {
        const l = p.locator(sel).first();
        if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
      }
      if (!bt) break;
      await bt.click({ timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(800);
    }
    await p.waitForTimeout(900);
    const n = await p.evaluate(() =>
      [...document.querySelectorAll('img')].filter((im) => {
        const c = getComputedStyle(im);
        return c.position === 'absolute' && c.zIndex === '-1';
      }).length,
    );
    if (n) conFondo++; else sinFondo++;
    const err = errores.slice(antes);
    console.log(`${n ? 'FONDO ' : 'nada  '} ${slug.padEnd(30)} zonas-con-ilustracion:${n} errores:${err.length}`);
    for (const e of err) console.log('          ' + e);
  } catch (e) {
    fallos++;
    console.log(`FALLO  ${slug.padEnd(30)} ${String(e).slice(0, 110)}`);
  }
}
await nav.close();
console.log(`\ncon ilustración: ${conFondo} · sin ella (se quedan con su icono): ${sinFondo} · no visitados: ${fallos}`);
