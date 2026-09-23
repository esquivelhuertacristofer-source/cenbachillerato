#!/usr/bin/env node
/**
 * ARRASTRAR UNA TARJETA DE VERDAD, Y FOTOGRAFIAR EL AIRE.
 *
 *     node scripts/probar-arrastre.mjs <slug>...
 *
 * `mirar-labs.mjs` retrata el laboratorio quieto. Lo que hay que comprobar
 * aquí es lo que pasa MIENTRAS la tarjeta viaja: que la de origen se vacíe y
 * que la zona de debajo se encienda. Sin soltar, no hay captura que lo enseñe.
 *
 * Playwright no arrastra HTML5 nativo con `dragTo()` de forma fiable en
 * Chromium, así que se disparan los eventos a mano sobre los dos elementos,
 * compartiendo un DataTransfer, que es exactamente lo que hace el navegador.
 * Se comprueba por DOM que los atributos aparecieron: una captura bonita no
 * demuestra nada si el atributo no está.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITIO = process.env.SITIO || 'http://localhost:3130';
const SALIDA = process.env.SALIDA || './.arrastre';
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

/** Dispara un arrastre HTML5 real entre dos elementos, y lo deja EN EL AIRE. */
const ENTRAR_EN_EL_AIRE = (origen, destino) => {
  const dt = new DataTransfer();
  /* `clientX`/`clientY` SOLO tienen lector: asignarlos despues del constructor
   * lanza. Van en el diccionario de inicializacion, que es donde el navegador
   * los pone de verdad. Sin ellos, `dragleave` leeria 0,0 —fuera de cualquier
   * rectangulo— y la zona se apagaria sola. */
  const ev = (t, el, extra = {}) =>
    el.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt, ...extra }));
  ev('dragstart', origen);
  const r = destino.getBoundingClientRect();
  const centro = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  ev('dragenter', destino, centro);
  ev('dragover', destino, centro);
};

for (const slug of process.argv.slice(2)) {
  const antes = errores.length;
  await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await p.waitForLoadState('networkidle').catch(() => {});

  /* Hasta el laboratorio, el mismo recorrido de la Expedición. */
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

  const res = await p.evaluate(({ }) => {
    const origen = document.querySelector('[draggable="true"]');
    if (!origen) return { ok: false, por: 'no hay ninguna tarjeta arrastrable' };
    /* La zona: el primer elemento con manejador de soltar que NO sea la propia
     * tarjeta. No se puede leer el manejador, así que se buscan los candidatos
     * por rol y se descarta el que contiene a la tarjeta. */
    const zonas = [...document.querySelectorAll('[role="button"]')].filter(
      (z) => !z.contains(origen) && z.getBoundingClientRect().height > 60,
    );
    const destino = zonas[0];
    if (!destino) return { ok: false, por: 'no encontré una zona de destino' };
    origen.scrollIntoView({ block: 'center' });
    return { ok: true };
  }, {});

  if (!res.ok) { console.log(`SALTA  ${slug.padEnd(28)} ${res.por}`); continue; }
  await p.waitForTimeout(400);

  const estado = await p.evaluate(ENTRAR_EN_EL_AIRE.toString() + `;
    (() => {
      const origen = document.querySelector('[draggable="true"]');
      const zonas = [...document.querySelectorAll('[role="button"]')].filter(
        (z) => !z.contains(origen) && z.getBoundingClientRect().height > 60);
      (${ENTRAR_EN_EL_AIRE.toString()})(origen, zonas[0]);
      return {
        tarjeta: origen.getAttribute('data-arrastrando'),
        zona: zonas[0].getAttribute('data-sobre'),
      };
    })()`);

  /* La zona suele caer por debajo del pliegue, y una captura que no la enseña
   * no demuestra que se haya encendido. Se acerca ANTES de fotografiar, sin
   * tocar el arrastre: `scrollIntoView` no dispara `dragleave`. */
  await p.evaluate(() => {
    const z = document.querySelector('[data-sobre="true"]');
    if (z) z.scrollIntoView({ block: 'center' });
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: join(SALIDA, `${slug}.png`) });
  const nuevos = errores.slice(antes);
  const bien = estado.tarjeta === 'true' && estado.zona === 'true';
  console.log(`${bien ? 'VIVO   ' : 'MUERTO '} ${slug.padEnd(28)} tarjeta:${estado.tarjeta} zona:${estado.zona} errores:${nuevos.length}`);
  for (const e of nuevos) console.log('          ' + e);
}
await nav.close();
console.log(`capturas en ${SALIDA}`);
